
import os
import django
import sys

# Set up Django environment
sys.path.append(r'c:\Users\Vaishnavi J\OneDrive\Desktop\FAITH\smart-service-desk\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import authenticate
from accounts.models import User

def test_login(email, password):
    print(f"Testing login for: {email}")
    try:
        user = User.objects.get(email=email)
        print(f"User found: {user.email}, Role: {user.role}, Active: {user.is_active}")
        print(f"Stored password hash: {user.password}")
    except User.DoesNotExist:
        print("User does not exist in database.")
        return

    authenticated_user = authenticate(username=email, password=password)
    if authenticated_user:
        print("✅ Authentication successful!")
    else:
        print("❌ Authentication failed. Checking password match manually...")
        if user.check_password(password):
             print("⚠️ Password matches manually but authenticate() failed. Check backend configuration.")
        else:
             print("❌ Password mismatch.")

if __name__ == "__main__":
    print(f"{'ID':<5} {'Email':<30} {'Role':<10} {'Active':<10}")
    print("-" * 60)
    for u in User.objects.all():
        role_name = "Admin" if u.role == 1 else "Agent" if u.role == 3 else "User"
        print(f"{u.id:<5} {u.email:<30} {u.role} ({role_name}) {u.is_active}")
