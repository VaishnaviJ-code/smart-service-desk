from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from tickets.models import Ticket

class DashboardStatsView(APIView):
    """Dashboard statistics for agents/admins."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Base queryset based on role
        if user.role == 3:  # Agent
            tickets = Ticket.objects.filter(assigned_to=user)
        else:  # Admin
            tickets = Ticket.objects.all()
        
        # Overall stats
        total_tickets = tickets.count()
        open_tickets = tickets.filter(status=1).count()
        closed_tickets = tickets.filter(status=2).count()
        
        # Today's queue
        today = timezone.now().date()
        todays_tickets = tickets.filter(created_at__date=today).count()
        
        # By category
        category_stats = tickets.values('category').annotate(
            count=Count('id')
        )
        
        category_breakdown = {
            'HR': 0,
            'IT': 0,
            'Facilities': 0,
            'Others': 0
        }
        
        for stat in category_stats:
            category_name = dict(Ticket.CATEGORY_CHOICES).get(stat['category'])
            category_breakdown[category_name] = stat['count']
        
        # By priority
        priority_stats = tickets.values('priority').annotate(
            count=Count('id')
        )
        
        priority_breakdown = {
            'High': 0,
            'Medium': 0,
            'Low': 0
        }
        
        for stat in priority_stats:
            priority_name = dict(Ticket.PRIORITY_CHOICES).get(stat['priority'])
            priority_breakdown[priority_name] = stat['count']
        
        # Assigned vs Unassigned (for agents)
        if user.role == 3:
            my_assigned = tickets.filter(assigned_to=user).count()
            unassigned = Ticket.objects.filter(assigned_to__isnull=True).count()
        else:
            my_assigned = 0
            unassigned = Ticket.objects.filter(assigned_to__isnull=True).count()
        
        return Response({
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'closed_tickets': closed_tickets,
            'todays_queue': todays_tickets,
            'my_assigned_tickets': my_assigned,
            'unassigned_tickets': unassigned,
            'category_breakdown': category_breakdown,
            'priority_breakdown': priority_breakdown,
        })
