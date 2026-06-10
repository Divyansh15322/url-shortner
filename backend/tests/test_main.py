import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data


def test_register_and_login():
    r = client.post("/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()

    r2 = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert r2.status_code == 200
    assert "access_token" in r2.json()


def test_shorten_url():
    r = client.post("/shorten", json={"original_url": "https://www.google.com"})
    assert r.status_code == 200
    data = r.json()
    assert "short_code" in data
    assert "short_url" in data
    assert data["clicks"] == 0


def test_duplicate_custom_code():
    client.post("/shorten", json={"original_url": "https://google.com", "custom_code": "mycode"})
    r = client.post("/shorten", json={"original_url": "https://bing.com", "custom_code": "mycode"})
    assert r.status_code == 400
