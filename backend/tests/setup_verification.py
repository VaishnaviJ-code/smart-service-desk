import os
import django

# Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

def setup_data():
    # Admin
    admin, _ = User.objects.get_or_create(email="admin@example.com")
    admin.set_password("admin123")
    admin.role = 1
    admin.first_name = "Admin"
    admin.last_name = "User"
    admin.is_superuser = True
    admin.is_staff = True
    admin.save()
    print("✅ Admin configured: admin@example.com / admin123")

    # Regular User
    user, _ = User.objects.get_or_create(email="user@example.com")
    user.set_password("user123")
    user.role = 2
    user.first_name = "Regular"
    user.last_name = "User"
    user.save()
    print("✅ User configured: user@example.com / user123")

if __name__ == "__main__":
    setup_data()
