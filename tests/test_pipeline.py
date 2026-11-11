"""
YamunaPulse End-to-End Test Suite
Tests:
1. Geospatial schema & 18 monitoring nodes
2. Spectral formula zero-division & NaN immunity
3. Seasonal baseline computations
4. Cyclical Kruskal-Wallis & Z-score rules
5. Longitudinal breakpoint step changepoints
6. API endpoint status and response schemas
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
    nodes = get_all_nodes(DB_PATH)
    assert len(nodes) == 18, f"Expected 18 nodes, got {len(nodes)}"
    assert nodes[0]["node_id"] == 1
    assert nodes[0]["river_km"] == 0.0
    assert "Palla" in nodes[0]["name"]
    assert nodes[-1]["node_id"] == 18
    assert nodes[-1]["river_km"] == 48.0
    assert "Asgarpur" in nodes[-1]["name"]

def test_spectral_safe_divide():
    # Test zero denominator
    zero_arr = np.array([0.0, 0.0])
    res = ingest.safe_divide(np.array([10.0, 5.0]), zero_arr, default=0.0)
    assert not np.isnan(res).any(), "Found NaN in safe_divide"
    assert not np.isinf(res).any(), "Found Inf in safe_divide"
    assert np.all(res == 0.0)

    # Test normal division
    normal = ingest.safe_divide(np.array([4.0, 6.0]), np.array([2.0, 3.0]))
    assert np.allclose(normal, [2.0, 2.0])

def test_temporal_tag_calculation():
    from datetime import datetime
    dt1 = datetime(2024, 7, 15) # July is Monsoon, 3rd Monday
    tags1 = ingest.compute_temporal_tags(dt1)
    assert tags1["season"] == "Monsoon"
    assert tags1["day_of_week"] == "Monday"
    assert tags1["nth_weekday_of_month"] == "3rd Monday"

    dt2 = datetime(2024, 1, 12) # Jan 12 is Winter, 2nd Friday
    tags2 = ingest.compute_temporal_tags(dt2)
    assert tags2["season"] == "Winter"
    assert tags2["day_of_week"] == "Friday"
    assert tags2["nth_weekday_of_month"] == "2nd Friday"

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["nodes_count"] == 18
    assert data["satellite_passes_count"] > 0
    assert data["observations_count"] > 0

def test_api_nodes_geojson():
    res = client.get("/api/nodes")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 18
    # Validate 150m bbox geometry is a polygon
    f1 = data["features"][0]
    assert f1["geometry"]["type"] == "Polygon"
    coords = f1["geometry"]["coordinates"][0]
    assert len(coords) == 5 # closed polygon

def test_api_passes():
    res = client.get("/api/passes?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert len(data["passes"]) == 10
    first_pass = data["passes"][0]
    assert "pass_id" in first_pass
    assert "timestamp" in first_pass
    assert first_pass["season"] in ["Pre-Monsoon", "Monsoon", "Post-Monsoon", "Winter"]

def test_api_profile_synchronization():
    res = client.get("/api/profile")
    assert res.status_code == 200
    data = res.json()
    assert "pass_info" in data
    assert len(data["profile"]) == 18
    palla = data["profile"][0]
    assert palla["node_id"] == 1
    assert palla["ndti_mean"] >= 0.0

def test_api_spatial_breakpoints():
    res = client.get("/api/analytics/breakpoints")
    assert res.status_code == 200
    data = res.json()
    assert len(data["breakpoints"]) > 0
    # Top breakpoint should be Najafgarh Drain Outfall at km 16.5
    top_bp = data["breakpoints"][0]
    assert top_bp["location_name"] == "Najafgarh Drain Outfall"
    assert top_bp["river_km"] == 16.5
    assert top_bp["severity"] == "critical"

def test_api_cyclical_rules():
    res = client.get("/api/analytics/cyclical?metric=ndti_mean")
    assert res.status_code == 200
    data = res.json()
    assert len(data["consolidated_rules"]) > 0
    rule_titles = [r["title"] for r in data["consolidated_rules"]]
    assert any("2nd Friday" in r["condition"] for r in data["consolidated_rules"])

def test_api_seasonal_engine():
    res = client.get("/api/analytics/seasonal")
    assert res.status_code == 200
    data = res.json()
    assert "Pre-Monsoon" in data["seasons"]
    assert "Monsoon" in data["seasons"]
    assert len(data["nodes"]) == 18

def test_api_insights():
    res = client.get("/api/analytics/insights")
    assert res.status_code == 200
    data = res.json()
    assert len(data["insights"]) >= 4
    categories = [i["category"] for i in data["insights"]]
    assert "Spatial Changepoint" in categories
    assert "Anthropogenic Cyclical Pattern" in categories
