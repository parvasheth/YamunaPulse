"""
YamunaPulse End-to-End Test Suite
Tests:
1. Geospatial schema & monitoring nodes (Yamuna 18 nodes & Ganga 14 nodes)
2. Spectral formula zero-division & NaN immunity
3. Seasonal baseline computations
4. Cyclical Kruskal-Wallis & Z-score rules
5. Longitudinal breakpoint step changepoints
6. API endpoint status and multi-river support
"""

import os
import sys
import math
import numpy as np
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

from backend.main import app
from backend.db import DB_PATH, get_all_nodes, get_connection
import backend.analytics as analytics
import backend.ingest_stac as ingest

client = TestClient(app)

def test_database_and_nodes_count():
    y_nodes = get_all_nodes(river="yamuna", db_path=DB_PATH)
    assert len(y_nodes) == 18, f"Expected 18 Yamuna nodes, got {len(y_nodes)}"
    assert y_nodes[0]["node_id"] == 1
    assert y_nodes[0]["river_km"] == 0.0
    assert "Palla" in y_nodes[0]["name"]
    assert y_nodes[-1]["node_id"] == 18
    assert y_nodes[-1]["river_km"] == 48.0
    assert "Asgarpur" in y_nodes[-1]["name"]

    g_nodes = get_all_nodes(river="ganga", db_path=DB_PATH)
    assert len(g_nodes) == 14, f"Expected 14 Ganga nodes, got {len(g_nodes)}"
    assert g_nodes[0]["node_id"] == 101
    assert g_nodes[0]["river_km"] == 0.0
    assert "Raiwala" in g_nodes[0]["name"]
    assert g_nodes[-1]["node_id"] == 114
    assert g_nodes[-1]["river_km"] == 34.0
    assert "Balawali" in g_nodes[-1]["name"]

def test_spectral_safe_divide():
    zero_arr = np.array([0.0, 0.0])
    res = ingest.safe_divide(np.array([10.0, 5.0]), zero_arr, default=0.0)
    assert not np.isnan(res).any(), "Found NaN in safe_divide"
    assert not np.isinf(res).any(), "Found Inf in safe_divide"
    assert np.all(res == 0.0)

    normal = ingest.safe_divide(np.array([4.0, 6.0]), np.array([2.0, 3.0]))
    assert np.allclose(normal, [2.0, 2.0])

def test_temporal_tag_calculation():
    from datetime import datetime
    dt1 = datetime(2024, 7, 15)
    tags1 = ingest.compute_temporal_tags(dt1)
    assert tags1["season"] == "Monsoon"
    assert tags1["day_of_week"] == "Monday"
    assert tags1["nth_weekday_of_month"] == "3rd Monday"

    dt2 = datetime(2024, 1, 12)
    tags2 = ingest.compute_temporal_tags(dt2)
    assert tags2["season"] == "Winter"
    assert tags2["day_of_week"] == "Friday"
    assert tags2["nth_weekday_of_month"] == "2nd Friday"

def test_api_rivers():
    res = client.get("/api/rivers")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    r_ids = [r["id"] for r in data]
    assert "yamuna" in r_ids
    assert "ganga" in r_ids

def test_api_health():
    res = client.get("/api/health?river=yamuna")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["nodes_count"] == 18
    assert data["satellite_passes_count"] > 0
    assert data["observations_count"] > 0

    res_g = client.get("/api/health?river=ganga")
    assert res_g.status_code == 200
    data_g = res_g.json()
    assert data_g["status"] == "healthy"
    assert data_g["nodes_count"] == 14

def test_api_nodes_geojson():
    # Yamuna
    res = client.get("/api/nodes?river=yamuna")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 18
    f1 = data["features"][0]
    assert f1["geometry"]["type"] == "Polygon"
    assert len(f1["geometry"]["coordinates"][0]) == 5

    # Ganga
    res_g = client.get("/api/nodes?river=ganga")
    assert res_g.status_code == 200
    data_g = res_g.json()
    assert data_g["type"] == "FeatureCollection"
    assert len(data_g["features"]) == 14
    fg1 = data_g["features"][0]
    assert fg1["geometry"]["type"] == "Polygon"

def test_api_passes():
    res = client.get("/api/passes?river=yamuna&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert len(data["passes"]) == 10
    first_pass = data["passes"][0]
    assert "pass_id" in first_pass
    assert "timestamp" in first_pass
    assert first_pass["season"] in ["Pre-Monsoon", "Monsoon", "Post-Monsoon", "Winter"]

    res_g = client.get("/api/passes?river=ganga&limit=10")
    assert res_g.status_code == 200
    data_g = res_g.json()
    assert len(data_g["passes"]) == 10

def test_api_profile_synchronization():
    res = client.get("/api/profile?river=yamuna")
    assert res.status_code == 200
    data = res.json()
    assert "pass_info" in data
    assert len(data["profile"]) == 18
    palla = data["profile"][0]
    assert palla["node_id"] == 1
    assert palla["ndti_mean"] >= 0.0

    res_g = client.get("/api/profile?river=ganga")
    assert res_g.status_code == 200
    data_g = res_g.json()
    assert len(data_g["profile"]) == 14
    raiwala = data_g["profile"][0]
    assert raiwala["node_id"] == 101

def test_api_spatial_breakpoints():
    res = client.get("/api/analytics/breakpoints?river=yamuna")
    assert res.status_code == 200
    data = res.json()
    assert len(data["breakpoints"]) > 0
    top_bp = data["breakpoints"][0]
    assert top_bp["location_name"] == "Najafgarh Drain Outfall"
    assert top_bp["river_km"] == 16.5
    assert top_bp["severity"] == "critical"

    res_g = client.get("/api/analytics/breakpoints?river=ganga")
    assert res_g.status_code == 200
    data_g = res_g.json()
    assert len(data_g["breakpoints"]) > 0
    top_g_bp = data_g["breakpoints"][0]
    assert "Jagjeetpur" in top_g_bp["location_name"]
    assert top_g_bp["river_km"] == 14.2

def test_api_cyclical_rules():
    res = client.get("/api/analytics/cyclical?river=yamuna&metric=ndti_mean")
    assert res.status_code == 200
    data = res.json()
    assert len(data["consolidated_rules"]) > 0
    assert any("2nd Friday" in r["condition"] for r in data["consolidated_rules"])

    res_g = client.get("/api/analytics/cyclical?river=ganga&metric=ndti_mean")
    assert res_g.status_code == 200
    data_g = res_g.json()
    assert len(data_g["consolidated_rules"]) > 0
    assert any("SIIDCUL" in r["title"] or "Pilgrimage" in r["title"] for r in data_g["consolidated_rules"])

def test_api_seasonal_engine():
    res = client.get("/api/analytics/seasonal?river=yamuna")
    assert res.status_code == 200
    data = res.json()
    assert "Pre-Monsoon" in data["seasons"]
    assert "Monsoon" in data["seasons"]
    assert len(data["nodes"]) == 18

    res_g = client.get("/api/analytics/seasonal?river=ganga")
    assert res_g.status_code == 200
    data_g = res_g.json()
    assert len(data_g["nodes"]) == 14

def test_api_insights():
    res = client.get("/api/analytics/insights?river=yamuna")
    assert res.status_code == 200
    data = res.json()
    assert len(data["insights"]) >= 4

    res_g = client.get("/api/analytics/insights?river=ganga")
    assert res_g.status_code == 200
    data_g = res_g.json()
    assert len(data_g["insights"]) >= 4
