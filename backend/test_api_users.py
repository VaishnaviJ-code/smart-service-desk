
import requests
import json

# First login to get token
login_url = "http://localhost:8000/api/auth/login/"
login_payload = {
    "email": "admin@servicedesk.com",
    "password": "admin123"
}
response = requests.post(login_url, json=login_payload)
token = response.json().get('tokens', {}).get('access')

if not token:
    print("Failed to login")
    exit(1)

# Now fetch users
users_url = "http://localhost:8000/api/auth/users/"
headers = {
    "Authorization": f"Bearer {token}"
}

print(f"GET {users_url}")
try:
    response = requests.get(users_url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
