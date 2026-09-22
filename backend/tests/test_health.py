import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "MoodTune AI API"}

def test_get_all_songs():
    response = client.get("/api/songs")
    assert response.status_code == 200
    songs = response.json()
    assert isinstance(songs, list)
    assert len(songs) > 0

def test_get_songs_by_emotion_valid():
    response = client.get("/api/songs/happy")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_get_songs_by_emotion_invalid():
    response = client.get("/api/songs/nonexistent")
    assert response.status_code == 404

def test_recommendations():
    payload = {"emotion": "happy"}
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["emotion"] == "happy"
    assert len(data["recommendations"]) > 0

def test_supported_emotions():
    response = client.get("/api/emotion/supported")
    assert response.status_code == 200
    data = response.json()
    assert "emotions" in data
    assert len(data["emotions"]) >= 5
