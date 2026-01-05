import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from accounts.views import ChangeUserRoleView

def test_role_switch():
    # 1. Create a test admin and a test user
    admin_email = "testadmin_switch@example.com"
    user_email = "testuser_switch@example.com"
    
    # Clean up previous run
    User.objects.filter(email=admin_email).delete()
    User.objects.filter(email=user_email).delete()
    
    admin = User.objects.create_superuser(email=admin_email, password="password123", first_name="Admin", last_name="User")
    user = User.objects.create_user(email=user_email, password="password123", first_name="Normal", last_name="User")
    
    print(f"Initial State - Admin Role: {admin.role}, User Role: {user.role}")
    
    # 2. Try to switch User to Agent (Role 3) using the View
    factory = APIRequestFactory()
    view = ChangeUserRoleView.as_view()
    
    # Correct payload structure based on frontend code: { role: 3 }
    request = factory.patch(f'/api/auth/users/{user.id}/role/', {'role': 3}, format='json')
    force_authenticate(request, user=admin)
    
    response = view(request, pk=user.id)
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Data: {response.data}")
    
    # 3. Verify in DB
    user.refresh_from_db()
    print(f"Final State - User Role: {user.role}")
    
    if user.role == 3:
        print("SUCCESS: User logic switched to Agent successfully.")
    else:
        print("FAILURE: User role did not update.")

if __name__ == "__main__":
    test_role_switch()
