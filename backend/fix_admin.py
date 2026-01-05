
import os
import django
import sys

# Set up Django environment
sys.path.append(r'c:\Users\Vaishnavi J\OneDrive\Desktop\FAITH\smart-service-desk\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

email = "admin@servicedesk.com"
password = "admin123"

try:
    user, created = User.objects.get_or_create(email=email)
    user.set_password(password)
    user.role = 1  # Ensure Admin Role
    user.is_active = True
    user.first_name = "System"
    user.last_name = "Admin"
    user.save()
    
    action = "Created" if created else "Updated"
    print(f"✅ {action} Admin user: {email}")
    print(f"✅ Password reset to: {password}")
    print(f"✅ Role set to: 1 (Admin)")

except Exception as e:
    print(f"❌ Failed to fix admin: {e}")
