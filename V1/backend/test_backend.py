import requests
import json

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get('http://localhost:8000/health')
        if response.status_code == 200:
            print("OK: Backend is running!")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"ERR: Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("ERR: Cannot connect to backend. Make sure it's running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"ERR: {e}")
        return False

def test_registration():
    """Test registration endpoint"""
    url = 'http://localhost:8000/api/v1/auth/register'
    
    # Test data
    test_user = {
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    try:
        response = requests.post(url, json=test_user)
        
        if response.status_code == 201:
            print("OK: Registration successful!")
            data = response.json()
            print(f"User created: {data['user']['email']}")
            print(f"Token received: {data['access_token'][:20]}...")
            return True
        elif response.status_code == 400:
            print("WARN: User already exists (expected if you've run this test before)")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"ERR: Registration failed with status code: {response.status_code}")
            print(f"Response: {response.json()}")
            return False
    except requests.exceptions.ConnectionError:
        print("ERR: Cannot connect to backend. Make sure it's running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"ERR: {e}")
        return False

def test_database_connection():
    """Test database connection by checking if tables exist"""
    try:
        from sqlalchemy import create_engine, inspect
        from app.core.config import settings
        
        engine = create_engine(settings.DATABASE_URL)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if 'users' in tables:
            print("OK: Database connection successful!")
            print(f"Tables found: {', '.join(tables)}")
            return True
        else:
            print("WARN: Database connected but 'users' table not found")
            print(f"Tables found: {', '.join(tables)}")
            return False
    except Exception as e:
        print(f"ERR: Database connection error: {e}")
        print("\nMake sure:")
        print("1. MySQL is running")
        print("2. Database 'contentking_db' exists")
        print("3. Credentials in .env are correct")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("BACKEND TESTING SCRIPT")
    print("=" * 60)
    print()
    
    print("1. Testing Backend Health...")
    print("-" * 60)
    backend_ok = test_backend_health()
    print()
    
    if backend_ok:
        print("2. Testing Database Connection...")
        print("-" * 60)
        db_ok = test_database_connection()
        print()
        
        if db_ok:
            print("3. Testing Registration Endpoint...")
            print("-" * 60)
            test_registration()
            print()
    
    print("=" * 60)
    print("TESTING COMPLETE")
    print("=" * 60)
