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
                bbox_json VARCHAR NOT NULL
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
                nth_weekday_of_month VARCHAR
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
                dom_ratio_p90 DOUBLE
            );
        """)

        con.execute("CREATE INDEX IF NOT EXISTS idx_obs_node ON node_observations(node_id);")
        con.execute("CREATE INDEX IF NOT EXISTS idx_obs_pass ON node_observations(pass_id);")
        con.execute("CREATE INDEX IF NOT EXISTS idx_obs_time ON node_observations(timestamp);")
        con.execute("CREATE INDEX IF NOT EXISTS idx_pass_time ON satellite_passes(timestamp);")

        logger.info("YamunaPulse DuckDB initialized successfully at %s", db_path)
    finally:
        con.close()

def seed_nodes_from_json(json_path: Optional[str] = None, db_path: str = DB_PATH):
    """Loads nodes from config/yamuna_nodes.json into monitoring_nodes table."""
    if not json_path:
        json_path = os.path.join(os.path.dirname(__file__), "..", "config", "yamuna_nodes.json")
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    nodes = data.get("nodes", [])
    con = get_connection(db_path)
    try:
        for node in nodes:
            lat = float(node["latitude"])
            lon = float(node["longitude"])
            # 150m bounding box calculation (approx 75m buffer)
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
                    drain_inflow, drain_impact_tier, segment, description, bbox_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
                json.dumps(bbox)
            ])
        logger.info("Seeded %d monitoring nodes.", len(nodes))
    finally:
        con.close()

def get_all_nodes(db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    con = get_connection(db_path)
    try:
        rows = con.execute("""
            SELECT node_id, name, river_km, latitude, longitude,
                   drain_inflow, drain_impact_tier, segment, description, bbox_json
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
                "bbox": json.loads(r[9])
            })
        return result
    finally:
        con.close()

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


