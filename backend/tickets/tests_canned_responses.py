from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import CannedResponse

User = get_user_model()

class CannedResponseTestCase(TestCase):
    def setUp(self):
        """Create test users and templates."""
        self.client = APIClient()
        
        # Create users
        self.admin = User.objects.create_user(
            email='admin@test.com',
            password='admin123',
            role=1,
            first_name='Admin',
            last_name='User'
        )
        self.agent = User.objects.create_user(
            email='agent@test.com',
            password='agent123',
            role=3,
            first_name='Agent',
            last_name='User'
        )
        self.user = User.objects.create_user(
            email='user@test.com',
            password='user123',
            role=2,
            first_name='Regular',
            last_name='User'
        )
        
        # Create test template
        self.template = CannedResponse.objects.create(
            title='Password Reset',
            content='Hello {customer_name}, please reset your password at {link}',
            category=2,  # IT
            created_by=self.admin
        )
    
    def test_agent_can_list_templates(self):
        """Agents should see active templates."""
        self.client.force_authenticate(user=self.agent)
        response = self.client.get('/api/canned-responses/')  # ✅ FIXED URL
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle both list and paginated responses
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 1)
    
    def test_user_cannot_access(self):
        """Regular users should not access canned responses."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/canned-responses/')  # ✅ FIXED URL
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_create(self):
        """Admins can create templates."""
        self.client.force_authenticate(user=self.admin)
        data = {
            'title': 'Welcome Message',
            'content': 'Welcome {customer_name}!',
            'category': 4,
            'is_active': True
        }
        response = self.client.post('/api/canned-responses/', data)  # ✅ FIXED URL
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CannedResponse.objects.filter(is_deleted=False).count(), 2)
    
    def test_agent_cannot_create(self):
        """Agents cannot create templates."""
        self.client.force_authenticate(user=self.agent)
        data = {'title': 'Test', 'content': 'Test', 'category': 4}
        response = self.client.post('/api/canned-responses/', data)  # ✅ FIXED URL
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_category_filtering(self):
        """Test category filtering with universal templates."""
        # Create universal template
        CannedResponse.objects.create(
            title='Universal',
            content='This applies to all',
            category=0,
            created_by=self.admin
        )
        
        self.client.force_authenticate(user=self.agent)
        
        # IT tickets should see IT + Universal
        response = self.client.get('/api/canned-responses/?category=2')  # ✅ FIXED URL
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 2)
        
        # HR tickets should see only Universal
        response = self.client.get('/api/canned-responses/?category=1')  # ✅ FIXED URL
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 1)
    
    def test_search_functionality(self):
        """Test search in title and content."""
        self.client.force_authenticate(user=self.agent)
        response = self.client.get('/api/canned-responses/?search=password')  # ✅ FIXED URL
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Password Reset')
    
    def test_usage_tracking(self):
        """Test atomic usage increment."""
        self.client.force_authenticate(user=self.agent)
        
        initial_count = self.template.usage_count
        
        # Use template twice
        response1 = self.client.post(f'/api/canned-responses/{self.template.id}/use/')  # ✅ FIXED URL
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        response2 = self.client.post(f'/api/canned-responses/{self.template.id}/use/')  # ✅ FIXED URL
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        self.template.refresh_from_db()
        self.assertEqual(self.template.usage_count, initial_count + 2)
    
    def test_soft_delete(self):
        """Test soft delete preserves template."""
        self.client.force_authenticate(user=self.admin)
        
        # Delete template
        response = self.client.delete(f'/api/canned-responses/{self.template.id}/')  # ✅ FIXED URL
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Template still exists in database
        self.assertTrue(CannedResponse.objects.filter(id=self.template.id).exists())
        
        # But marked as deleted
        self.template.refresh_from_db()
        self.assertTrue(self.template.is_deleted)
        
        # And not visible in list
        response = self.client.get('/api/canned-responses/')  # ✅ FIXED URL
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 0)
    
    def test_restore_deleted(self):
        """Test restoring soft-deleted template."""
        self.client.force_authenticate(user=self.admin)
        
        # Soft delete
        self.template.is_deleted = True
        self.template.is_active = False
        self.template.save()
        
        # Restore
        response = self.client.post(f'/api/canned-responses/{self.template.id}/restore/')  # ✅ FIXED URL
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.template.refresh_from_db()
        self.assertFalse(self.template.is_deleted)
        self.assertTrue(self.template.is_active)
    
    def test_permissions_enforcement(self):
        """Test all permission combinations."""
        test_data = {'title': 'Test', 'content': 'Test', 'category': 4}
        
        # Test GET (agents can read)
        self.client.force_authenticate(user=self.agent)
        response = self.client.get('/api/canned-responses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test POST as regular user (should fail)
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/canned-responses/', test_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Test POST as agent (should fail)
        self.client.force_authenticate(user=self.agent)
        response = self.client.post('/api/canned-responses/', test_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Test POST as admin (should succeed)
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/canned-responses/', test_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
