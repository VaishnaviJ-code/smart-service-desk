from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Ticket, Comment, Attachment
from .serializers import (
    TicketSerializer,
    TicketCreateSerializer,
    TicketUpdateSerializer,
    CommentSerializer,
    AttachmentSerializer
)

class TicketViewSet(viewsets.ModelViewSet):
    """ViewSet for ticket CRUD operations."""
    queryset = Ticket.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TicketCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TicketUpdateSerializer
        return TicketSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.all()
        
        # Filter based on role
        if user.role == 2:  # Regular user
            queryset = queryset.filter(created_by=user)
        elif user.role == 3:  # Agent
            # Agents see unassigned tickets + their assigned tickets
            queryset = queryset.filter(
                Q(assigned_to=user) | Q(assigned_to__isnull=True)
            )
        # Admins see all tickets
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category=category_filter)
        
        # Filter by priority
        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Override create to return full ticket details."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save(created_by=request.user)
        
        # Return full ticket details using TicketSerializer
        response_serializer = TicketSerializer(ticket)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign ticket to an agent."""
        ticket = self.get_object()
        agent_id = request.data.get('agent_id')
        
        if not agent_id:
            return Response(
                {'error': 'agent_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from accounts.models import User
            agent = User.objects.get(id=agent_id, role=3)
            ticket.assigned_to = agent
            ticket.save()
            return Response(TicketSerializer(ticket).data)
        except User.DoesNotExist:
            return Response(
                {'error': 'Agent not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a ticket."""
        ticket = self.get_object()
        ticket.status = 2  # Closed
        ticket.save()
        return Response(TicketSerializer(ticket).data)
    
    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        """Reopen a ticket."""
        ticket = self.get_object()
        ticket.status = 1  # Open
        ticket.save()
        return Response(TicketSerializer(ticket).data)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to a ticket."""
        ticket = self.get_object()
        serializer = CommentSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(ticket=ticket, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing comments."""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        ticket_id = self.request.query_params.get('ticket_id')
        if ticket_id:
            return Comment.objects.filter(ticket_id=ticket_id)
        return Comment.objects.all()
