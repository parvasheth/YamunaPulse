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
    assert len(data["insights"]) >= 5
    assert any(ins["category"] == "Seasonal Baseline Comparison" for ins in data["insights"])
    assert any(ins["category"] == "Algae Cross-Check Safeguard" for ins in data["insights"])

    res_g = client.get("/api/analytics/insights?river=ganga")
    assert res_g.status_code == 200
    data_g = res_g.json()
    assert len(data_g["insights"]) >= 5

def test_dynamic_water_masking_and_clean_geometry():
    """Validates Dynamic Water Masking (MNDWI/NDWI) and Clean Geometry Selection."""
    res = client.get("/api/nodes?river=yamuna")
    assert res.status_code == 200
    data = res.json()
    assert len(data["features"]) == 18
    palla = data["features"][0]
    assert "clean_geometry" in palla["properties"]
    assert palla["properties"]["clean_geometry"]["channel_clearance"] == "unobstructed_mid_channel"

    # Profile verification
    prof_res = client.get("/api/profile?river=yamuna")
    assert prof_res.status_code == 200
    pdata = prof_res.json()
    first_node = pdata["profile"][0]
    assert "water_mask" in first_node
    assert first_node["water_mask"]["active_water_pixels"] > 0
    assert first_node["water_mask"]["mask_applied"] == "MNDWI_and_NDWI"
    assert "clean_geometry" in first_node

def test_seasonal_baseline_comparison_and_algae_cross_check():
    """Validates Seasonal Baseline Deltas (ΔNDTI) and Algae (NDCI) Cross-Check."""
    # 1. Profile response includes seasonal deltas and Z-scores
    prof_res = client.get("/api/profile?river=yamuna")
    assert prof_res.status_code == 200
    pdata = prof_res.json()
    node = pdata["profile"][4] # Najafgarh
    assert "seasonal_baseline_mean" in node
    assert "seasonal_delta_ndti" in node
    assert "seasonal_z_score" in node
    assert "algae_cross_check" in node
    assert node["algae_cross_check"]["status"] in [
        "ALGAE_MASKED", "MINERAL_SEDIMENT", "COMBINED_SEWAGE", "PRISTINE_BASEFLOW", "MODERATE_CHANNEL"
    ]

    # 2. Algae cross check classifier function directly
    from backend.analytics import classify_algae_cross_check
    # Case A: Eutrophic bloom with B04 red dip (NDCI high, NDTI depressed)
    res_masked = classify_algae_cross_check(ndti=0.22, ndci=0.35, dom_ratio=1.45)
    assert res_masked["status"] == "ALGAE_MASKED"

    # Case B: Mineral rock flour (high NDTI, zero chlorophyll)
    res_mineral = classify_algae_cross_check(ndti=0.48, ndci=-0.05, dom_ratio=0.95)
    assert res_mineral["status"] == "MINERAL_SEDIMENT"

    # Case C: Combined domestic sewage
    res_sewage = classify_algae_cross_check(ndti=0.42, ndci=0.22, dom_ratio=1.55)
    assert res_sewage["status"] == "COMBINED_SEWAGE"

    # 3. Dedicated Seasonal Anomalies API endpoint
    anom_res = client.get("/api/analytics/seasonal-anomalies?river=yamuna&z_threshold=1.5")
    assert anom_res.status_code == 200
    anom_data = anom_res.json()
    assert "anomalies" in anom_data
    assert anom_data["river"] == "yamuna"
    if len(anom_data["anomalies"]) > 0:
        a0 = anom_data["anomalies"][0]
        assert "seasonal_delta" in a0
        assert "seasonal_z_score" in a0
        assert "algae_cross_check" in a0
        assert "water_mask" in a0
