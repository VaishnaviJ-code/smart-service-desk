import os
import django
from django.conf import settings

# Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from knowledge.views import FAQViewSet
from accounts.models import User
from knowledge.models import FAQ

def test_faq_permissions():
    print("--- Testing FAQ Permissions ---")
    
    # 1. Setup Users
    admin_email = "faq_admin@test.com"
    user_email = "faq_user@test.com"
    
    User.objects.filter(email__in=[admin_email, user_email]).delete()
    
    admin = User.objects.create_superuser(admin_email, "pass", first_name="Admin", last_name="User")
    user = User.objects.create_user(user_email, "pass", first_name="Minion", last_name="User")
    
    # 2. Setup View
    factory = APIRequestFactory()
    view_list = FAQViewSet.as_view({'get': 'list', 'post': 'create'})
    
    # Test 1: Public Read
    req = factory.get('/api/kb/faqs/')
    res = view_list(req)
    if res.status_code == 200:
        print("✅ Public Read: OK")
    else:
        print(f"❌ Public Read Failed: {res.status_code}")

    # Test 2: User Write (Should Fail)
    data = {'question': 'Test Q?', 'answer': 'Test A'}
    req = factory.post('/api/kb/faqs/', data)
    force_authenticate(req, user=user)
    res = view_list(req)
    if res.status_code in [403, 401]:
        print("✅ Regular User Write: Blocked (OK)")
    else:
        print(f"❌ Regular User Write Allowed! Code: {res.status_code}")

    # Test 3: Admin Write (Should Pass)
    req = factory.post('/api/kb/faqs/', data)
    force_authenticate(req, user=admin)
    res = view_list(req)
    if res.status_code == 201:
        print("✅ Admin Write: OK")
    else:
        print(f"❌ Admin Write Failed: {res.status_code} - {res.data}")

if __name__ == "__main__":
    test_faq_permissions()
