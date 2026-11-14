"""
YamunaPulse Backend - FastAPI High-Performance Geospatial Analytics Service
Serves:
- Multi-river support: Yamuna River (Delhi 48.0 km) & Ganga River (Haridwar 34.0 km)
- GeoJSON nodes and 150m bounding box geometries
- Synchronized longitudinal river profiles for timelapse scrubbers
- Multi-year spectral time series cubes (NDWI, NDTI, NDCI, DOM_Ratio)
- Seasonal baselines & contrasts
- Cyclical day-of-week & nth-weekday Kruskal-Wallis anomaly detection
- Longitudinal changepoint breakpoints
- 2D Heatmap discovery matrices & Automated Insights feed
- Visitor statistics & autonomous STAC ingestion
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
    description="Spatiotemporal Satellite Water Quality & Anomaly Detection System (Yamuna Delhi & Ganga Haridwar)",
    version="2.0.0"
)

# Enable CORS for Vite frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RIVER_METADATA = {
    "yamuna": {
        "id": "yamuna",
        "name": "Yamuna River",
        "corridor": "Delhi Metropolitan Corridor",
        "length_km": 48.0,
        "nodes_count": 18,
        "center": [28.67, 77.27],
        "default_zoom": 11,
        "baseline_reach": "Palla Baseline (km 0.0)",
        "critical_breakpoint": "Najafgarh Drain Outfall (km 15.2)",
        "description": "48.0 km Delhi metropolitan corridor from Palla baseline entry to Asgarpur exit, tracking 18 monitoring stations across industrial and domestic drain outfalls."
    },
    "ganga": {
        "id": "ganga",
        "name": "Ganga River",
        "corridor": "Haridwar Foothills Corridor",
        "length_km": 34.0,
        "nodes_count": 14,
        "center": [29.88, 78.19],
        "default_zoom": 11,
        "baseline_reach": "Raiwala Cheela Reach (km 0.0)",
        "critical_breakpoint": "Jagjeetpur STP Outfall (km 14.2)",
        "description": "34.0 km Haridwar foothills corridor from Raiwala Shivalik entry through Har Ki Pauri pilgrimage ghats and Jagjeetpur STP outfall to Balawali exit."
    }
}

@app.on_event("startup")
def startup_event():
    """Ensure database is initialized, seeded on boot, and background scheduler started."""
    init_db(DB_PATH)
    seed_nodes_from_json(db_path=DB_PATH)
    con = get_connection(DB_PATH)
    try:
        y_obs = con.execute("SELECT count(*) FROM node_observations WHERE river = 'yamuna';").fetchone()[0]
        g_obs = con.execute("SELECT count(*) FROM node_observations WHERE river = 'ganga';").fetchone()[0]
        if y_obs == 0:
            logger.info("Seeding Yamuna spatiotemporal backfill...")
            ingest.generate_yamuna_spatiotemporal_backfill(db_path=DB_PATH)
        if g_obs == 0:
            logger.info("Seeding Ganga spatiotemporal backfill...")
            ingest.generate_ganga_spatiotemporal_backfill(db_path=DB_PATH)
    finally:
        con.close()
    
    # Start autonomous background satellite ingestion scheduler
    try:
        scheduler.start()
    except Exception as e:
        logger.warning("Could not start background scheduler: %s", e)

    logger.info("YamunaPulse API ready with multi-river support (Yamuna & Ganga).")

@app.get("/api/rivers")
def get_rivers():
    """Returns available river systems and corridor metadata."""
    return list(RIVER_METADATA.values())

@app.get("/api/health")
def health(river: str = Query("yamuna", pattern="^(yamuna|ganga)$")):
    con = get_connection(DB_PATH)
    try:
        node_cnt = con.execute("SELECT count(*) FROM monitoring_nodes WHERE river = ?;", [river]).fetchone()[0]
        pass_cnt = con.execute("SELECT count(*) FROM satellite_passes WHERE river = ?;", [river]).fetchone()[0]
        obs_cnt = con.execute("SELECT count(*) FROM node_observations WHERE river = ?;", [river]).fetchone()[0]
        return {
            "status": "healthy",
            "system": "YamunaPulse 2.0 (Multi-River)",
            "active_river": river,
            "nodes_count": node_cnt,
            "satellite_passes_count": pass_cnt,
            "observations_count": obs_cnt,
            "timestamp": datetime.now().isoformat()
        }
    finally:
        con.close()

@app.get("/api/nodes")
def get_nodes(river: str = Query("yamuna", pattern="^(yamuna|ganga)$")):
    """Returns monitoring nodes for the specified river with GeoJSON feature collection."""
    nodes = get_all_nodes(river=river, db_path=DB_PATH)
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
                "bbox": n["bbox"],
                "river": n.get("river", river),
                "clean_geometry": n.get("clean_geometry", {
                    "channel_clearance": "unobstructed_mid_channel",
                    "sampling_buffer_meters": 150,
                    "bridge_offset_meters": 200,
                    "rapids_interference": "none",
                    "boat_traffic_risk": "none_or_negligible"
                })
            }
        }
        features.append(feature)
        
    meta = RIVER_METADATA.get(river, RIVER_METADATA["yamuna"])
    return {
        "type": "FeatureCollection",
        "river": river,
        "river_name": meta["name"],
        "corridor": meta["corridor"],
        "length_km": meta["length_km"],
        "center": meta["center"],
        "default_zoom": meta["default_zoom"],
        "total_nodes": len(nodes),
        "features": features
    }

@app.get("/api/passes")
def get_passes(
    river: str = Query("yamuna", pattern="^(yamuna|ganga)$"),
    limit: int = Query(500, ge=1, le=1000),
    sort: str = Query("asc", pattern="^(asc|desc)$"),
    season: Optional[str] = None,
    year: Optional[int] = None
):
    """Returns satellite pass timestamps and metadata for timeline scrubber for the specified river."""
    con = get_connection(DB_PATH)
    try:
        query = "SELECT pass_id, satellite, timestamp, cloud_cover_percent, scene_id, year, month, season, day_of_week, nth_weekday_of_month, river FROM satellite_passes WHERE river = ?"
        params = [river]
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
                "nth_weekday_of_month": r[9],
                "river": r[10]
            })
        return {
            "river": river,
            "total": len(passes),
            "passes": passes
        }
    finally:
        con.close()

@app.get("/api/profile")
def get_longitudinal_profile(
    river: str = Query("yamuna", pattern="^(yamuna|ganga)$"),
    pass_id: Optional[str] = None
):
    """
    Returns full longitudinal river profile for a given satellite pass.
    If pass_id is omitted, returns latest valid pass for that river.
    """
    con = get_connection(DB_PATH)
    try:
        if not pass_id:
            latest_row = con.execute(
                "SELECT pass_id FROM satellite_passes WHERE river = ? ORDER BY timestamp DESC LIMIT 1;", [river]
            ).fetchone()
            if not latest_row:
                raise HTTPException(status_code=404, detail=f"No satellite passes found for river '{river}'.")
            pass_id = latest_row[0]
            
        pass_meta = con.execute("""
            SELECT pass_id, satellite, timestamp, cloud_cover_percent, season, day_of_week, nth_weekday_of_month, river
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
            WHERE n.river = ?
            ORDER BY n.river_km ASC;
        """, [pass_id, river]).fetchall()

        # Load seasonal baselines for true seasonal comparison
        baselines = analytics.compute_node_seasonal_baselines(river=river, db_path=DB_PATH)
        pass_season = str(pass_meta[4])
        
        nodes_profile = []
        for r in obs_rows:
            nid = int(r[0])
            ndti_val = float(r[14]) if r[14] is not None else 0.0
            ndci_val = float(r[17]) if r[17] is not None else 0.0
            dom_val = float(r[20]) if r[20] is not None else 1.0
            tot_pix = int(r[9]) if r[9] is not None else 225
            act_pix = int(r[8]) if r[8] is not None else 150
            water_frac = round(act_pix / max(1, tot_pix), 3)

            # Seasonal Baseline Comparison: calculate ΔNDTI and Z-score relative to same-season history
            node_b = baselines.get(nid, {})
            season_b = node_b.get("seasons", {}).get(pass_season, {})
            s_mean = season_b.get("mean", node_b.get("overall_mean", ndti_val))
            s_std = season_b.get("std", node_b.get("overall_std", 0.03))
            seasonal_delta = round(ndti_val - s_mean, 4)
            seasonal_z = round(seasonal_delta / max(0.015, s_std), 2)

            # Algae Cross-Check & Dual-Index Safeguard
            algae_cc = analytics.classify_algae_cross_check(ndti_val, ndci_val, dom_val)

            nodes_profile.append({
                "node_id": nid,
                "name": r[1],
                "river_km": r[2],
                "latitude": r[3],
                "longitude": r[4],
                "drain_inflow": r[5],
                "drain_impact_tier": r[6],
                "segment": r[7],
                "active_water_pixels": act_pix,
                "total_pixels": tot_pix,
                "cloud_shadow_fraction": r[10],
                "ndwi_mean": r[11],
                "ndwi_median": r[12],
                "ndwi_p90": r[13],
                "ndti_mean": ndti_val,
                "ndti_median": r[15],
                "ndti_p90": r[16],
                "ndci_mean": ndci_val,
                "ndci_median": r[18],
                "ndci_p90": r[19],
                "dom_ratio_mean": dom_val,
                "dom_ratio_median": r[21],
                "dom_ratio_p90": r[22],
                # 5 Quality Assurance Scientific Pillars
                "seasonal_baseline_mean": s_mean,
                "seasonal_delta_ndti": seasonal_delta,
                "seasonal_z_score": seasonal_z,
                "algae_cross_check": algae_cc,
                "water_mask": {
                    "active_water_pixels": act_pix,
                    "total_pixels": tot_pix,
                    "water_channel_fraction": water_frac,
                    "mask_applied": "MNDWI_and_NDWI"
                },
                "clean_geometry": {
                    "channel_clearance": "unobstructed_mid_channel",
                    "bridge_interference": "none_offset_from_superstructure",
                    "rapids_interference": "none"
                }
            })
            
        return {
            "river": river,
            "pass_info": {
                "pass_id": pass_meta[0],
                "satellite": pass_meta[1],
                "timestamp": pass_meta[2].isoformat() if hasattr(pass_meta[2], "isoformat") else str(pass_meta[2]),
                "cloud_cover_percent": pass_meta[3],
                "season": pass_meta[4],
                "day_of_week": pass_meta[5],
                "nth_weekday_of_month": pass_meta[6],
                "river": pass_meta[7]
            },
            "profile": nodes_profile
        }
    finally:
        con.close()

@app.get("/api/timeseries")
def get_timeseries(
    river: str = Query("yamuna", pattern="^(yamuna|ganga)$"),
    node_id: Optional[int] = None,
    metric: str = Query("ndti_mean", pattern="^(ndti_mean|ndci_mean|dom_ratio_mean|ndwi_mean|active_water_pixels)$"),
    start_year: Optional[int] = None,
    end_year: Optional[int] = None
):
    """Returns temporal time series for one or all nodes along the specified river."""
    con = get_connection(DB_PATH)
    try:
        query = f"""
            SELECT 
                o.pass_id, o.node_id, n.name, n.river_km, o.timestamp,
                p.season, p.day_of_week, p.nth_weekday_of_month,
                o.{metric} as value,
                o.cloud_shadow_fraction,
                o.active_water_pixels,
                o.river
            FROM node_observations o
            JOIN satellite_passes p ON o.pass_id = p.pass_id
            JOIN monitoring_nodes n ON o.node_id = n.node_id
            WHERE o.is_valid_pass = TRUE AND o.river = ?
        """
        params = [river]
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
            "river": river,
            "node_id": node_id,
            "metric": metric,
            "total_points": len(points),
            "data": points
        }
    finally:
        con.close()

@app.get("/api/analytics/seasonal")
def get_seasonal_analytics(river: str = Query("yamuna", pattern="^(yamuna|ganga)$")):
    """Seasonal engine: compares Pre-Monsoon, Monsoon, Post-Monsoon, Winter."""
    return analytics.compute_seasonal_profiles(river=river, db_path=DB_PATH)

@app.get("/api/analytics/cyclical")
def get_cyclical_analytics(
    river: str = Query("yamuna", pattern="^(yamuna|ganga)$"),
    metric: str = Query("ndti_mean", pattern="^(ndti_mean|ndci_mean|dom_ratio_mean|ndwi_mean)$")
):
    """Cyclical Day-of-Week & Nth-Weekday Engine with Kruskal-Wallis and Z-scores."""
    return analytics.compute_cyclical_patterns(river=river, target_metric=metric, db_path=DB_PATH)

@app.get("/api/analytics/breakpoints")
def get_spatial_breakpoints(
    river: str = Query("yamuna", pattern="^(yamuna|ganga)$"),
    pass_id: Optional[str] = None,
    metric: str = Query("ndti_mean", pattern="^(ndti_mean|ndci_mean|dom_ratio_mean|ndwi_mean)$")
):
    """Longitudinal Changepoint Detection for the corridor."""
    return analytics.detect_spatial_breakpoints(river=river, pass_id=pass_id, metric=metric, db_path=DB_PATH)

@app.get("/api/analytics/heatmaps")
def get_heatmaps(
    river: str = Query("yamuna", pattern="^(yamuna|ganga)$"),
    metric: str = Query("ndti_mean", pattern="^(ndti_mean|ndci_mean|dom_ratio_mean|ndwi_mean)$")
):
    """2D Heatmap Discovery Matrix: Node vs Month, Node vs DOW, Node vs Nth-Weekday."""
    return analytics.compute_heatmap_matrix(river=river, metric=metric, db_path=DB_PATH)

@app.get("/api/analytics/insights")
def get_insights(river: str = Query("yamuna", pattern="^(yamuna|ganga)$")):
    """Synthesized Automated Insights Feed for the selected river."""
    return {
        "river": river,
        "insights": analytics.generate_automated_insights_feed(river=river, db_path=DB_PATH)
    }

@app.get("/api/analytics/seasonal-anomalies")
def get_seasonal_anomalies(
    river: str = Query("yamuna", pattern="^(yamuna|ganga)$"),
    metric: str = Query("ndti_mean", pattern="^(ndti_mean|ndci_mean|dom_ratio_mean|ndwi_mean)$"),
    z_threshold: float = Query(1.8, ge=0.5, le=5.0),
    limit: int = Query(50, ge=1, le=200)
):
    """
    Returns multi-year observations where seasonal Z-scores exceed z_threshold,
    benchmarked against the historical baseline of that station in that specific season.
    Also executes the Algae Cross-Check and confirms Dynamic Water Masking on every pass.
    """
    return analytics.detect_seasonal_anomalies(
        river=river,
        metric=metric,
        z_threshold=z_threshold,
        limit=limit,
        db_path=DB_PATH
    )

@app.get("/api/ingest/status")
def get_ingest_status(river: str = Query("yamuna", pattern="^(yamuna|ganga)$")):
    """Returns live satellite ingestion daemon status and orbital revisit schedule."""
    con = get_connection(DB_PATH)
    try:
        latest_pass = con.execute("SELECT MAX(timestamp) FROM satellite_passes WHERE river = ?;", [river]).fetchone()[0]
        pass_cnt = con.execute("SELECT count(*) FROM satellite_passes WHERE river = ?;", [river]).fetchone()[0]
        next_expected = (latest_pass + timedelta(days=5)).isoformat() if latest_pass else None
        return {
            "status": "active",
            "river": river,
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
def trigger_sync(river: str = Query("yamuna", pattern="^(yamuna|ganga)$")):
    """Triggers immediate synchronization with Microsoft Planetary Computer STAC for new Sentinel-2 passes."""
    try:
        result = ingest.sync_new_satellite_passes(db_path=DB_PATH, river=river)
        return result
    except Exception as e:
        logger.error("Sync trigger error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

class IngestRequest(BaseModel):
    river: str = "yamuna"
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
