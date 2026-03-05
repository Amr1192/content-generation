import requests
import json

def test_specific_registration():
    """Test registration with your specific data"""
    url = 'http://localhost:8000/api/v1/auth/register'
    
    # Your exact data
    test_user = {
        "email": "amr@gmail.com",
        "username": "amr",  # Generated from email prefix
        "password": "12345678",
        "full_name": "amr"
    }
    
    print("=" * 60)
    print("TESTING REGISTRATION WITH YOUR DATA")
    print("=" * 60)
    print(f"\nSending request to: {url}")
    print(f"Data: {json.dumps(test_user, indent=2)}")
    print("\n" + "-" * 60)
    
    try:
        response = requests.post(url, json=test_user)
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"\nResponse Body:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code == 201:
            print("\n✅ SUCCESS! Registration worked!")
        elif response.status_code == 400:
            print("\n⚠️  BAD REQUEST - Check the error message above")
        else:
            print(f"\n❌ FAILED with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ CONNECTION ERROR!")
        print("Cannot connect to backend at http://localhost:8000")
        print("\nMake sure:")
        print("1. Backend is running (python -m uvicorn app.main:app --reload)")
        print("2. It's running on port 8000")
        print("3. Check the backend terminal for errors")
        
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        print(f"Error type: {type(e).__name__}")

if __name__ == "__main__":
    test_specific_registration()
