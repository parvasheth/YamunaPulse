"""
YamunaPulse Database Layer
Provides local DuckDB (with automatic SQLite fallback if needed) storage for:
- 18 Yamuna monitoring nodes
- Satellite pass metadata & temporal categorizations
- Node spectral observations & statistics
"""

import os
import json
import logging
import threading
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
import duckdb

logger = logging.getLogger("yamunapulse.db")
_db_write_lock = threading.Lock()

DB_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DB_PATH = os.path.join(DB_DIR, "yamunapulse.duckdb")

def get_connection(db_path: str = DB_PATH) -> duckdb.DuckDBPyConnection:
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    con = duckdb.connect(db_path)
    return con

def init_db(db_path: str = DB_PATH):
    """Initializes tables and indexes in DuckDB."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    con = get_connection(db_path)
    try:
        con.execute("""
            CREATE TABLE IF NOT EXISTS monitoring_nodes (
                node_id INTEGER PRIMARY KEY,
                name VARCHAR NOT NULL,
                river_km DOUBLE NOT NULL,
                latitude DOUBLE NOT NULL,
                longitude DOUBLE NOT NULL,
                drain_inflow VARCHAR,
                drain_impact_tier VARCHAR,
                segment VARCHAR,
                description VARCHAR,
                bbox_json VARCHAR NOT NULL,
                river VARCHAR DEFAULT 'yamuna'
            );
        """)

        con.execute("""
            CREATE TABLE IF NOT EXISTS visitor_stats (
                stat_key VARCHAR PRIMARY KEY,
                stat_val BIGINT NOT NULL,
                last_visited_at TIMESTAMP NOT NULL
            );
        """)

        con.execute("""
            CREATE TABLE IF NOT EXISTS satellite_passes (
                pass_id VARCHAR PRIMARY KEY,
                satellite VARCHAR NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                cloud_cover_percent DOUBLE,
                scene_id VARCHAR,
                year INTEGER,
                month INTEGER,
                season VARCHAR,
                day_of_week VARCHAR,
                day_of_week_int INTEGER,
                nth_weekday_of_month VARCHAR,
                river VARCHAR DEFAULT 'yamuna'
            );
        """)

        con.execute("""
            CREATE TABLE IF NOT EXISTS node_observations (
                id VARCHAR PRIMARY KEY,
                pass_id VARCHAR NOT NULL,
                node_id INTEGER NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                cloud_shadow_fraction DOUBLE,
                is_valid_pass BOOLEAN DEFAULT TRUE,
                active_water_pixels INTEGER,
                total_pixels INTEGER,
                ndwi_mean DOUBLE,
                ndwi_median DOUBLE,
                ndwi_p90 DOUBLE,
                ndti_mean DOUBLE,
                ndti_median DOUBLE,
                ndti_p90 DOUBLE,
                ndci_mean DOUBLE,
                ndci_median DOUBLE,
                ndci_p90 DOUBLE,
                dom_ratio_mean DOUBLE,
                dom_ratio_median DOUBLE,
                dom_ratio_p90 DOUBLE,
                river VARCHAR DEFAULT 'yamuna'
            );
        """)

        # Migration: Ensure river column exists on all tables
        for table in ["monitoring_nodes", "satellite_passes", "node_observations"]:
            try:
                con.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS river VARCHAR DEFAULT 'yamuna';")
                con.execute(f"UPDATE {table} SET river = 'yamuna' WHERE river IS NULL;")
            except Exception as mig_err:
                logger.debug("Migration check for %s: %s", table, mig_err)

        con.execute("CREATE INDEX IF NOT EXISTS idx_obs_node ON node_observations(node_id);")
        con.execute("CREATE INDEX IF NOT EXISTS idx_obs_pass ON node_observations(pass_id);")
        con.execute("CREATE INDEX IF NOT EXISTS idx_obs_time ON node_observations(timestamp);")
        con.execute("CREATE INDEX IF NOT EXISTS idx_obs_river ON node_observations(river);")
        con.execute("CREATE INDEX IF NOT EXISTS idx_pass_time ON satellite_passes(timestamp);")
        con.execute("CREATE INDEX IF NOT EXISTS idx_pass_river ON satellite_passes(river);")
        con.execute("CREATE INDEX IF NOT EXISTS idx_nodes_river ON monitoring_nodes(river);")

        logger.info("YamunaPulse DuckDB initialized successfully at %s", db_path)
    finally:
        con.close()

def seed_nodes_from_json(json_path: Optional[str] = None, river: Optional[str] = None, db_path: str = DB_PATH):
    """Loads nodes from config json files into monitoring_nodes table."""
    config_dir = os.path.join(os.path.dirname(__file__), "..", "config")
    
    files_to_load = []
    if json_path:
        files_to_load.append((json_path, river or "yamuna"))
    else:
        yamuna_path = os.path.join(config_dir, "yamuna_nodes.json")
        ganga_path = os.path.join(config_dir, "ganga_nodes.json")
        if os.path.exists(yamuna_path):
            files_to_load.append((yamuna_path, "yamuna"))
        if os.path.exists(ganga_path):
            files_to_load.append((ganga_path, "ganga"))
            
    con = get_connection(db_path)
    try:
        total_seeded = 0
        for fpath, default_riv in files_to_load:
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            riv_id = str(data.get("river_id", default_riv)).lower()
            nodes = data.get("nodes", [])
            for node in nodes:
                lat = float(node["latitude"])
                lon = float(node["longitude"])
                delta_lat = 0.000677
                delta_lon = 0.000767
                bbox = [
                    round(lon - delta_lon, 6),
                    round(lat - delta_lat, 6),
                    round(lon + delta_lon, 6),
                    round(lat + delta_lat, 6)
                ]
                
                con.execute("""
                    INSERT OR REPLACE INTO monitoring_nodes (
                        node_id, name, river_km, latitude, longitude,
                        drain_inflow, drain_impact_tier, segment, description, bbox_json, river
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, [
                    int(node["node_id"]),
                    str(node["name"]),
                    float(node["river_km"]),
                    lat,
                    lon,
                    node.get("drain_inflow"),
                    str(node.get("drain_impact_tier", "low")),
                    str(node.get("segment", "Urban")),
                    str(node.get("description", "")),
                    json.dumps(bbox),
                    riv_id
                ])
                total_seeded += 1
            logger.info("Seeded %d nodes for river '%s' from %s", len(nodes), riv_id, fpath)
    finally:
        con.close()

def get_all_nodes(river: Optional[str] = None, db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    con = get_connection(db_path)
    try:
        if river:
            rows = con.execute("""
                SELECT node_id, name, river_km, latitude, longitude,
                       drain_inflow, drain_impact_tier, segment, description, bbox_json, river
                FROM monitoring_nodes
                WHERE LOWER(river) = LOWER(?)
                ORDER BY river_km ASC;
            """, [river]).fetchall()
        else:
            rows = con.execute("""
                SELECT node_id, name, river_km, latitude, longitude,
                       drain_inflow, drain_impact_tier, segment, description, bbox_json, river
                FROM monitoring_nodes
                ORDER BY river_km ASC;
            """).fetchall()

        result = []
        for r in rows:
            result.append({
                "node_id": r[0],
                "name": r[1],
                "river_km": r[2],
                "latitude": r[3],
                "longitude": r[4],
                "drain_inflow": r[5],
                "drain_impact_tier": r[6],
                "segment": r[7],
                "description": r[8],
                "bbox": json.loads(r[9]),
                "river": r[10] if len(r) > 10 else "yamuna"
            })
        return result
    finally:
        con.close()

def get_available_rivers(db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    """Returns metadata for all available monitored river corridors."""
    return [
        {
            "id": "yamuna",
            "name": "Yamuna River",
            "stretch": "Delhi Corridor (Palla to Asgarpur)",
            "short_name": "Yamuna (Delhi)",
            "km": 48.0,
            "center": [28.67, 77.27],
            "default_zoom": 11,
            "description": "48 km urban corridor through the National Capital Territory of Delhi, tracking sewage inflows from Najafgarh and Barapullah drains to Okhla Barrage.",
            "baseline_location": "Palla Entry (km 0.0)",
            "primary_pollution_source": "Najafgarh Drain Outfall (km 16.5)"
        },
        {
            "id": "ganga",
            "name": "Ganga River",
            "stretch": "Haridwar Corridor (Raiwala to Balawali)",
            "short_name": "Ganga (Haridwar)",
            "km": 34.0,
            "center": [29.88, 78.19],
            "default_zoom": 11,
            "description": "34 km corridor where sacred river emerges from the Himalayan Shivalik foothills onto the northern plains, tracking Har Ki Pauri ghats, Jagjeetpur STP, and SIIDCUL industrial outfalls.",
            "baseline_location": "Raiwala / Cheela Reach (km 0.0)",
            "primary_pollution_source": "Jagjeetpur STP Outfall & Kassaban Nullah (km 8.1 - 14.2)"
        }
    ]

def record_visit(db_path: str = DB_PATH) -> int:
    """Increments and returns the total visitor count in a thread-safe manner."""
    with _db_write_lock:
        for attempt in range(5):
            try:
                con = get_connection(db_path)
                try:
                    con.execute("""
                        CREATE TABLE IF NOT EXISTS visitor_stats (
                            stat_key VARCHAR PRIMARY KEY,
                            stat_val BIGINT NOT NULL,
                            last_visited_at TIMESTAMP NOT NULL
                        );
                    """)
                    row = con.execute("SELECT stat_val FROM visitor_stats WHERE stat_key = 'total_visits'").fetchone()
                    if row is None:
                        con.execute("INSERT INTO visitor_stats VALUES ('total_visits', 1, CURRENT_TIMESTAMP)")
                        return 1
                    else:
                        con.execute("UPDATE visitor_stats SET stat_val = stat_val + 1, last_visited_at = CURRENT_TIMESTAMP WHERE stat_key = 'total_visits'")
                        new_val = con.execute("SELECT stat_val FROM visitor_stats WHERE stat_key = 'total_visits'").fetchone()[0]
                        return new_val
                finally:
                    con.close()
            except Exception as e:
                logger.warning("Visit counter retry %d/5: %s", attempt + 1, e)
                time.sleep(0.05)
                if attempt == 4:
                    return get_visit_count(db_path)
        return get_visit_count(db_path)

def get_visit_count(db_path: str = DB_PATH) -> int:
    """Returns current total visitor count without incrementing."""
    con = get_connection(db_path)
    try:
        con.execute("""
            CREATE TABLE IF NOT EXISTS visitor_stats (
                stat_key VARCHAR PRIMARY KEY,
                stat_val BIGINT NOT NULL,
                last_visited_at TIMESTAMP NOT NULL
            );
        """)
        row = con.execute("SELECT stat_val FROM visitor_stats WHERE stat_key = 'total_visits'").fetchone()
        return row[0] if row else 0
    finally:
        con.close()


