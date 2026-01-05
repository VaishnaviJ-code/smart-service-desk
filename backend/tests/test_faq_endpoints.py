import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIClient
from accounts.models import User

client = APIClient()

# Login as admin
admin = User.objects.get(email="admin@example.com")
client.force_authenticate(user=admin)

print("Testing FAQ endpoints...")

# Test 1: List FAQs (GET /api/kb/faq/)
print("\n1. Testing GET /api/kb/faq/")
response = client.get('/api/kb/faq/')
print(f"   Status: {response.status_code}")
print(f"   Data: {response.data[:100] if response.data else 'None'}...")

# Test 2: Create FAQ (POST /api/kb/faq/)
print("\n2. Testing POST /api/kb/faq/")
faq_data = {
    'question': 'How to reset password?',
    'answer': 'Click on forgot password link.',
    'tags': 'password,reset,security'
}
response = client.post('/api/kb/faq/', faq_data, format='json')
print(f"   Status: {response.status_code}")
print(f"   Data: {response.data}")

if response.status_code == 201:
    faq_id = response.data['id']
    
    # Test 3: Get single FAQ
    print(f"\n3. Testing GET /api/kb/faq/{faq_id}/")
    response = client.get(f'/api/kb/faq/{faq_id}/')
    print(f"   Status: {response.status_code}")
    print(f"   Data: {response.data}")
    
    # Test 4: Update FAQ
    print(f"\n4. Testing PUT /api/kb/faq/{faq_id}/")
    updated_data = {
        'question': 'How to reset password? (Updated)',
        'answer': 'Click on forgot password link in login page.',
        'tags': 'password,reset,security,updated'
    }
    response = client.put(f'/api/kb/faq/{faq_id}/', updated_data, format='json')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Data: {response.data}")
    else:
        print(f"   Error: {getattr(response, 'data', response.content)}")
    
    # Test 5: Delete FAQ
    print(f"\n5. Testing DELETE /api/kb/faq/{faq_id}/")
    response = client.delete(f'/api/kb/faq/{faq_id}/')
    print(f"   Status: {response.status_code}")

print("\n✅ All FAQ endpoint tests completed!")
