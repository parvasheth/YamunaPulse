"""
YamunaPulse Backend - FastAPI High-Performance Geospatial Analytics Service
Serves:
- GeoJSON nodes and 150m bounding box geometries
- Synchronized longitudinal river profiles for timelapse scrubbers
- Multi-year spectral time series cubes (NDWI, NDTI, NDCI, DOM_Ratio)
- Seasonal baselines & contrasts
- Cyclical day-of-week & nth-weekday Kruskal-Wallis anomaly detection
- Longitudinal changepoint breakpoints
- 2D Heatmap discovery matrices & Automated Insights feed
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend.db import get_connection, DB_PATH, get_all_nodes, init_db, seed_nodes_from_json, record_visit, get_visit_count
import backend.analytics as analytics
import backend.ingest_stac as ingest
from backend.scheduler import scheduler

logger = logging.getLogger("yamunapulse.api")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="YamunaPulse API",
    description="Spatiotemporal Satellite Water Quality & Anomaly Detection System (Delhi Yamuna)",
    version="1.0.0"
)

# Enable CORS for Vite frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    """Ensure database is initialized, seeded on boot, and background scheduler started."""
    init_db(DB_PATH)
    nodes = get_all_nodes(DB_PATH)
    if not nodes:
        seed_nodes_from_json(db_path=DB_PATH)
        ingest.generate_realistic_spatiotemporal_backfill(start_year=2021, end_year=2026, db_path=DB_PATH)
    
    # Start autonomous background satellite ingestion scheduler
    try:
        scheduler.start()
    except Exception as e:
        logger.warning("Could not start background scheduler: %s", e)

    logger.info("YamunaPulse API ready. Connected to database with %d nodes.", len(nodes) if nodes else 18)

@app.get("/api/health")
def health():
    con = get_connection(DB_PATH)
    try:
        node_cnt = con.execute("SELECT count(*) FROM monitoring_nodes;").fetchone()[0]
        pass_cnt = con.execute("SELECT count(*) FROM satellite_passes;").fetchone()[0]
        obs_cnt = con.execute("SELECT count(*) FROM node_observations;").fetchone()[0]
        return {
            "status": "healthy",
            "system": "YamunaPulse 1.0",
            "nodes_count": node_cnt,
            "satellite_passes_count": pass_cnt,
            "observations_count": obs_cnt,
            "timestamp": datetime.now().isoformat()
        }
    finally:
        con.close()

@app.get("/api/nodes")
def get_nodes():
    """Returns all 18 monitoring nodes with GeoJSON feature collection."""
    nodes = get_all_nodes(DB_PATH)
    features = []
    for n in nodes:
        min_lon, min_lat, max_lon, max_lat = n["bbox"]
        polygon_coords = [
            [
                [min_lon, min_lat],
                [max_lon, min_lat],
                [max_lon, max_lat],
                [min_lon, max_lat],
                [min_lon, min_lat]
            ]
        ]
        
        feature = {
            "type": "Feature",
            "id": n["node_id"],
            "geometry": {
                "type": "Polygon",
                "coordinates": polygon_coords
            },
            "properties": {
                "node_id": n["node_id"],
                "name": n["name"],
                "river_km": n["river_km"],
                "latitude": n["latitude"],
                "longitude": n["longitude"],
                "drain_inflow": n["drain_inflow"],
                "drain_impact_tier": n["drain_impact_tier"],
                "segment": n["segment"],
                "description": n["description"],
                "bbox": n["bbox"]
            }
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "total_nodes": len(nodes),
        "river": "Yamuna River (Delhi Reach)",
        "features": features
    }

@app.get("/api/passes")
def get_passes(
    limit: int = Query(500, ge=1, le=1000),
    sort: str = Query("asc", pattern="^(asc|desc)$"),
    season: Optional[str] = None,
    year: Optional[int] = None
):
    """Returns satellite pass timestamps and metadata for timeline scrubber."""
    con = get_connection(DB_PATH)
    try:
        query = "SELECT pass_id, satellite, timestamp, cloud_cover_percent, scene_id, year, month, season, day_of_week, nth_weekday_of_month FROM satellite_passes WHERE 1=1"
        params = []
        if season:
            query += " AND season = ?"
            params.append(season)
        if year:
            query += " AND year = ?"
            params.append(year)
            
        query += f" ORDER BY timestamp {sort.upper()} LIMIT ?;"
        params.append(limit)
        
        rows = con.execute(query, params).fetchall()
        passes = []
        for r in rows:
            passes.append({
                "pass_id": r[0],
                "satellite": r[1],
                "timestamp": r[2].isoformat() if hasattr(r[2], "isoformat") else str(r[2]),
                "cloud_cover_percent": r[3],
                "scene_id": r[4],
                "year": r[5],
                "month": r[6],
                "season": r[7],
                "day_of_week": r[8],
                "nth_weekday_of_month": r[9]
            })
        return {
            "total": len(passes),
            "passes": passes
        }
    finally:
        con.close()

@app.get("/api/profile")
def get_longitudinal_profile(
    pass_id: Optional[str] = None
):
    """
    Returns full longitudinal river profile (Nodes 1 to 18) for a given satellite pass.
    If pass_id is omitted, returns latest valid pass.
    """
    con = get_connection(DB_PATH)
    try:
        if not pass_id:
            # Pick latest pass
            latest_row = con.execute("SELECT pass_id FROM satellite_passes ORDER BY timestamp DESC LIMIT 1;").fetchone()
            if not latest_row:
                raise HTTPException(status_code=404, detail="No satellite passes found.")
            pass_id = latest_row[0]
            
        pass_meta = con.execute("""
            SELECT pass_id, satellite, timestamp, cloud_cover_percent, season, day_of_week, nth_weekday_of_month
            FROM satellite_passes WHERE pass_id = ?;
        """, [pass_id]).fetchone()
        
        if not pass_meta:
            raise HTTPException(status_code=404, detail=f"Pass {pass_id} not found.")
            
        obs_rows = con.execute("""
            SELECT 
                n.node_id, n.name, n.river_km, n.latitude, n.longitude,
                n.drain_inflow, n.drain_impact_tier, n.segment,
                o.active_water_pixels, o.total_pixels, o.cloud_shadow_fraction,
                o.ndwi_mean, o.ndwi_median, o.ndwi_p90,
                o.ndti_mean, o.ndti_median, o.ndti_p90,
                o.ndci_mean, o.ndci_median, o.ndci_p90,
                o.dom_ratio_mean, o.dom_ratio_median, o.dom_ratio_p90
            FROM monitoring_nodes n
            LEFT JOIN node_observations o ON n.node_id = o.node_id AND o.pass_id = ?
            ORDER BY n.river_km ASC;
        """, [pass_id]).fetchall()
        
        nodes_profile = []
        for r in obs_rows:
            nodes_profile.append({
                "node_id": r[0],
                "name": r[1],
                "river_km": r[2],
                "latitude": r[3],
                "longitude": r[4],
                "drain_inflow": r[5],
                "drain_impact_tier": r[6],
                "segment": r[7],
                "active_water_pixels": r[8],
                "total_pixels": r[9],
                "cloud_shadow_fraction": r[10],
                "ndwi_mean": r[11],
                "ndwi_median": r[12],
                "ndwi_p90": r[13],
                "ndti_mean": r[14],
                "ndti_median": r[15],
                "ndti_p90": r[16],
                "ndci_mean": r[17],
                "ndci_median": r[18],
                "ndci_p90": r[19],
                "dom_ratio_mean": r[20],
                "dom_ratio_median": r[21],
                "dom_ratio_p90": r[22]
            })
            
        return {
            "pass_info": {
                "pass_id": pass_meta[0],
                "satellite": pass_meta[1],
                "timestamp": pass_meta[2].isoformat() if hasattr(pass_meta[2], "isoformat") else str(pass_meta[2]),
                "cloud_cover_percent": pass_meta[3],
                "season": pass_meta[4],
                "day_of_week": pass_meta[5],
                "nth_weekday_of_month": pass_meta[6]
            },
            "profile": nodes_profile
        }
    finally:
        con.close()

@app.get("/api/timeseries")
def get_timeseries(
    node_id: Optional[int] = None,
    metric: str = Query("ndti_mean", pattern="^(ndti_mean|ndci_mean|dom_ratio_mean|ndwi_mean|active_water_pixels)$"),
    start_year: Optional[int] = None,
    end_year: Optional[int] = None
):
    """Returns temporal time series for one or all nodes."""
    con = get_connection(DB_PATH)
    try:
        query = f"""
            SELECT 
                o.pass_id, o.node_id, n.name, n.river_km, o.timestamp,
                p.season, p.day_of_week, p.nth_weekday_of_month,
                o.{metric} as value,
                o.cloud_shadow_fraction,
                o.active_water_pixels
            FROM node_observations o
            JOIN satellite_passes p ON o.pass_id = p.pass_id
            JOIN monitoring_nodes n ON o.node_id = n.node_id
            WHERE o.is_valid_pass = TRUE
        """
        params = []
        if node_id is not None:
            query += " AND o.node_id = ?"
            params.append(node_id)
        if start_year is not None:
            query += " AND p.year >= ?"
            params.append(start_year)
        if end_year is not None:
            query += " AND p.year <= ?"
            params.append(end_year)
            
        query += " ORDER BY o.timestamp ASC;"
        
        rows = con.execute(query, params).fetchall()
        points = []
        for r in rows:
            points.append({
                "pass_id": r[0],
                "node_id": r[1],
                "node_name": r[2],
                "river_km": r[3],
                "timestamp": r[4].isoformat() if hasattr(r[4], "isoformat") else str(r[4]),
                "season": r[5],
                "day_of_week": r[6],
                "nth_weekday_of_month": r[7],
                "value": r[8],
                "cloud_shadow_fraction": r[9],
                "active_water_pixels": r[10]
            })
            
        return {
            "node_id": node_id,
            "metric": metric,
            "total_points": len(points),
            "data": points
        }
    finally:
        con.close()

@app.get("/api/analytics/seasonal")
def get_seasonal_analytics():
    """Seasonal engine: compares Pre-Monsoon, Monsoon, Post-Monsoon, Winter."""
    return analytics.compute_seasonal_profiles(db_path=DB_PATH)

@app.get("/api/analytics/cyclical")
def get_cyclical_analytics(
    metric: str = Query("ndti_mean", pattern="^(ndti_mean|ndci_mean|dom_ratio_mean|ndwi_mean)$")
):
    """Cyclical Day-of-Week & Nth-Weekday Engine with Kruskal-Wallis and Z-scores."""
    return analytics.compute_cyclical_patterns(db_path=DB_PATH, target_metric=metric)

@app.get("/api/analytics/breakpoints")
def get_spatial_breakpoints(
    pass_id: Optional[str] = None,
    metric: str = Query("ndti_mean", pattern="^(ndti_mean|ndci_mean|dom_ratio_mean|ndwi_mean)$")
):
    """Longitudinal Changepoint Detection from Node 1 to Node 18."""
    return analytics.detect_spatial_breakpoints(db_path=DB_PATH, pass_id=pass_id, metric=metric)

@app.get("/api/analytics/heatmaps")
def get_heatmaps(
    metric: str = Query("ndti_mean", pattern="^(ndti_mean|ndci_mean|dom_ratio_mean|ndwi_mean)$")
):
    """2D Heatmap Discovery Matrix: Node vs Month, Node vs DOW, Node vs Nth-Weekday."""
    return analytics.compute_heatmap_matrix(db_path=DB_PATH, metric=metric)

@app.get("/api/analytics/insights")
def get_insights():
    """Synthesized Automated Insights Feed."""
    return {
        "insights": analytics.generate_automated_insights_feed(db_path=DB_PATH)
    }

@app.get("/api/ingest/status")
def get_ingest_status():
    """Returns live satellite ingestion daemon status and orbital revisit schedule."""
    con = get_connection(DB_PATH)
    try:
        latest_pass = con.execute("SELECT MAX(timestamp) FROM satellite_passes;").fetchone()[0]
        pass_cnt = con.execute("SELECT count(*) FROM satellite_passes;").fetchone()[0]
        next_expected = (latest_pass + timedelta(days=5)).isoformat() if latest_pass else None
        return {
            "status": "active",
            "scheduler_running": scheduler._thread.is_alive() if scheduler._thread else False,
            "orbit_frequency": "Every 5 days (Sentinel-2A/2B Twin Constellation)",
            "total_satellite_passes": pass_cnt,
            "latest_pass_timestamp": latest_pass.isoformat() if hasattr(latest_pass, "isoformat") else str(latest_pass),
            "next_expected_pass": next_expected,
            "last_sync_time": scheduler.last_sync_time.isoformat() if scheduler.last_sync_time else None,
            "last_sync_result": scheduler.last_sync_result
        }
    finally:
        con.close()

@app.post("/api/ingest/sync")
def trigger_sync():
    """Triggers immediate synchronization with Microsoft Planetary Computer STAC for new Sentinel-2 passes."""
    try:
        result = scheduler.trigger_sync()
        return result
    except Exception as e:
        logger.error("Sync trigger error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

class IngestRequest(BaseModel):
    start_date: str = "2024-01-01"
    end_date: str = "2024-03-31"
    max_cloud_cover: float = 30.0
    limit: int = 5

@app.get("/api/stats/visit")
def get_visits():
    """Returns current total visitor count."""
    return {"total_visits": get_visit_count(DB_PATH)}

@app.post("/api/stats/visit")
def register_visit():
    """Increments and returns updated visitor count."""
    count = record_visit(DB_PATH)
    return {"total_visits": count}

# Serve React frontend in production / unified mode
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        target_file = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        index_html = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_html):
            return FileResponse(index_html)
        raise HTTPException(status_code=404, detail="Frontend build not found")

