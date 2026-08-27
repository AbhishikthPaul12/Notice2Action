from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_success():
    response = client.post(
        "/api/auth/login",
        json={"email": "xyz@gmail.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == "xyz@gmail.com"
    assert data["user"]["name"] == "XYZ"


def test_register_success():
    response = client.post(
        "/api/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "securepassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["name"] == "Alice"
    assert data["user"]["email"] == "alice@example.com"
