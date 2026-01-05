
import requests
import json

url = "http://localhost:8000/api/auth/login/"
payload = {
    "email": "admin@servicedesk.com",
    "password": "admin123"
}
headers = {
    "Content-Type": "application/json"
}

print(f"POST {url}")
print(f"Payload: {payload}")

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
