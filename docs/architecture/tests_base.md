# Tests de base - Application Comptable

## 1. Configuration pytest

### pytest.ini
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

### conftest.py
```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User
from app.core.security import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    yield db
    db.close()


@pytest.fixture
def admin_user(db_session):
    user = User(
        email="admin@test.com",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def regular_user(db_session):
    user = User(
        email="user@test.com",
        username="user",
        hashed_password=get_password_hash("user123"),
        role="user",
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_token(client, admin_user):
    r = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "admin123"})
    return r.json()["access_token"]


@pytest.fixture
def user_token(client, regular_user):
    r = client.post("/api/auth/login", json={"email": "user@test.com", "password": "user123"})
    return r.json()["access_token"]
```

## 2. Tests d'authentification

```python
# tests/test_auth.py
def test_login_success(client):
    r = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "admin123"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_invalid_credentials(client):
    r = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "wrong"})
    assert r.status_code == 401


def test_register(client):
    r = client.post("/api/auth/register", json={
        "email": "new@test.com", "username": "new", "password": "newpass123"
    })
    assert r.status_code == 201


def test_refresh_token(client, admin_token):
    r = client.post("/api/auth/refresh", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_2fa_setup(client, admin_token):
    r = client.post("/api/auth/2fa/setup", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert "secret" in r.json()


def test_rate_limiting(client):
    for _ in range(6):
        r = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "wrong"})
    assert r.status_code == 429
```

## 3. Tests de transactions

```python
# tests/test_transactions.py
def test_create_transaction(client, user_token):
    r = client.post("/api/transactions/", json={
        "amount": 100.50,
        "category": "food",
        "description": "Lunch",
        "type": "expense",
    }, headers={"Authorization": f"Bearer {user_token}"})
    assert r.status_code == 201
    assert r.json()["amount"] == 100.50


def test_list_transactions(client, user_token):
    r = client.get("/api/transactions/", headers={"Authorization": f"Bearer {user_token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_categorize_transaction(client, user_token):
    r = client.post("/api/transactions/categorize", json={
        "description": "Uber trip",
        "auto_category": True,
    }, headers={"Authorization": f"Bearer {user_token}"})
    assert r.status_code == 200
    assert r.json()["category"] == "transport"


def test_search_transactions(client, user_token):
    r = client.get("/api/transactions/?search=Uber", headers={"Authorization": f"Bearer {user_token}"})
    assert r.status_code == 200
```

## 4. Tests de RBAC

```python
# tests/test_rbac.py
def test_admin_can_access_admin_routes(client, admin_token):
    r = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200


def test_regular_user_cannot_access_admin_routes(client, user_token):
    r = client.get("/api/admin/users", headers={"Authorization": f"Bearer {user_token}"})
    assert r.status_code == 403


def test_unauthenticated_access_denied(client):
    r = client.get("/api/transactions/")
    assert r.status_code == 401
```

## 5. Lancer les tests

```bash
pytest -v
```