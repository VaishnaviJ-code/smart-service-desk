from django.core.management.base import BaseCommand
from accounts.models import User
from tickets.models import Ticket, Comment, SLAConfig
from knowledge.models import FAQ
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        # Create Admin
        admin, _ = User.objects.get_or_create(
            email='admin@servicedesk.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 1,
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin.set_password('admin123')
        admin.save()
        
        # Create Agents
        agent1, _ = User.objects.get_or_create(
            email='agent1@servicedesk.com',
            defaults={'first_name': 'John', 'last_name': 'Agent', 'role': 3}
        )
        agent1.set_password('agent123')
        agent1.save()
        
        agent2, _ = User.objects.get_or_create(
            email='agent2@servicedesk.com',
            defaults={'first_name': 'Sarah', 'last_name': 'Support', 'role': 3}
        )
        agent2.set_password('agent123')
        agent2.save()
        
        # Create Users
        user1, _ = User.objects.get_or_create(
            email='user1@example.com',
            defaults={'first_name': 'Alice', 'last_name': 'Customer', 'role': 2}
        )
        user1.set_password('user123')
        user1.save()
        
        user2, _ = User.objects.get_or_create(
            email='user2@example.com',
            defaults={'first_name': 'Bob', 'last_name': 'Employee', 'role': 2}
        )
        user2.set_password('user123')
        user2.save()
        
        # SLA Config
        SLAConfig.objects.get_or_create(priority=1, defaults={'sla_hours': 4})
        SLAConfig.objects.get_or_create(priority=2, defaults={'sla_hours': 24})
        SLAConfig.objects.get_or_create(priority=3, defaults={'sla_hours': 72})
        
        # Sample Tickets
        tickets_data = [
            {
                'subject': 'Laptop not turning on',
                'description': 'My laptop stopped working this morning. Cannot boot.',
                'category': 2, 'priority': 1, 'status': 1,
                'created_by': user1, 'assigned_to': agent1
            },
            {
                'subject': 'Need access to HR portal',
                'description': 'Cannot login to HR portal for leave application.',
                'category': 1, 'priority': 2, 'status': 1,
                'created_by': user2, 'assigned_to': None
            },
            {
                'subject': 'Office AC not working',
                'description': 'The AC in Room 301 is not cooling properly.',
                'category': 3, 'priority': 3, 'status': 1,
                'created_by': user1, 'assigned_to': agent2
            },
            {
                'subject': 'Password reset request',
                'description': 'Forgot my email password. Need reset.',
                'category': 2, 'priority': 2, 'status': 2,
                'created_by': user2, 'assigned_to': agent1
            },
            {
                'subject': 'Payroll query',
                'description': 'Have questions about last month salary slip.',
                'category': 1, 'priority': 3, 'status': 2,
                'created_by': user1, 'assigned_to': agent2
            },
        ]
        
        for ticket_data in tickets_data:
            ticket, created = Ticket.objects.get_or_create(
                subject=ticket_data['subject'],
                defaults=ticket_data
            )
            if created and ticket.status == 2:
                Comment.objects.create(
                    ticket=ticket,
                    user=ticket.assigned_to,
                    comment_text='Issue resolved. Closing ticket.'
                )
        
        # Sample FAQs
        faqs_data = [
            {
                'question': 'How do I reset my password?',
                'answer': 'Click on "Forgot Password" on the login page and follow the instructions.',
                'tags': 'password, login, account'
            },
            {
                'question': 'Who do I contact for laptop issues?',
                'answer': 'Create an IT ticket and our support team will assist you.',
                'tags': 'IT, laptop, hardware'
            },
            {
                'question': 'How to apply for leave?',
                'answer': 'Login to HR portal and navigate to Leave Management section.',
                'tags': 'HR, leave, vacation'
            },
            {
                'question': 'What are the office timings?',
                'answer': 'Office hours are 9:00 AM to 6:00 PM, Monday to Friday.',
                'tags': 'facilities, timing, office'
            },
        ]
        
        for faq_data in faqs_data:
            FAQ.objects.get_or_create(
                question=faq_data['question'],
                defaults=faq_data
            )
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
        self.stdout.write(f'Admin: admin@servicedesk.com / admin123')
        self.stdout.write(f'Agent: agent1@servicedesk.com / agent123')
        self.stdout.write(f'User: user1@example.com / user123')
