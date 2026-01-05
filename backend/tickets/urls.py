from django.urls import path, include
from .ai_views import suggest_category
from rest_framework.routers import DefaultRouter
from .views import (
    TicketViewSet, 
    CommentViewSet, 
    CannedResponseViewSet,
    recent_tickets_admin, 
    admin_stats, 
    ticket_stats,
    my_tickets,
    my_ticket_stats,
    admin_dashboard_stats,
    list_agents,
    reassign_ticket,
    ticket_analytics,
)

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'canned-responses', CannedResponseViewSet, basename='canned-response')

urlpatterns = [
    # Agent actions
    path('tickets/<int:pk>/assign/', TicketViewSet.as_view({'post': 'assign'}), name='ticket-assign'),
    path('tickets/<int:pk>/add_comment/', TicketViewSet.as_view({'post': 'add_comment'}), name='ticket-add-comment'),
    path('tickets/<int:pk>/change_status/', TicketViewSet.as_view({'post': 'change_status'}), name='ticket-change-status'),

    path('', include(router.urls)),

    # Ai endpoints
    path('suggest-category/', suggest_category, name='suggest-category'),
    
    # Admin endpoints
    path('admin/recent/', recent_tickets_admin, name='recent_tickets_admin'),
    path('admin/stats/', admin_stats, name='admin_stats'),
    path('admin/dashboard-stats/', admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/agents/', list_agents, name='list_agents'),
    path('admin/analytics/', ticket_analytics, name='ticket_analytics'),
    
    # Ticket endpoints
    path('tickets/<int:pk>/reassign/', reassign_ticket, name='reassign_ticket'),
    path('tickets-stats/', ticket_stats, name='ticket_stats'),
    
    # User endpoints
    path('my-tickets/', my_tickets, name='my_tickets'),
    path('my-tickets/stats/', my_ticket_stats, name='my_ticket_stats'),


]
