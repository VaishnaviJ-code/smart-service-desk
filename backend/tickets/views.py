from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q, Count
from .rag_service import get_rag_service
from knowledge.models import KBArticle
from .models import Ticket, Comment, Attachment, CannedResponse
from .serializers import (
    TicketSerializer,
    TicketCreateSerializer,
    TicketUpdateSerializer,
    CommentSerializer,
    AttachmentSerializer,
    CannedResponseSerializer, 
    CannedResponseCreateSerializer
)

from django.contrib.auth import get_user_model
from datetime import timedelta
from django.utils import timezone
try:
    from .ai_service import categorize_ticket
except ImportError:
    categorize_ticket = None

User = get_user_model()

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

        # Search in subject, description, and ID
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(subject__icontains=search) | 
                Q(description__icontains=search) |
                Q(id__icontains=search)
            )

        # Filter: "My Tickets Only" for agents
        if user.role == 3:  # Agent
            assigned_to_me = self.request.query_params.get('assigned_to_me', '').lower() == 'true'
            if assigned_to_me:
                queryset = queryset.filter(assigned_to=user)

        # Sorting
        sort_by = self.request.query_params.get('sort', '-created_at')
        if sort_by == 'priority':
            queryset = queryset.order_by('priority', '-created_at')
        elif sort_by == '-priority':
            queryset = queryset.order_by('-priority', '-created_at')
        else:
            queryset = queryset.order_by(sort_by)

        return queryset

    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Override create to return full ticket details."""
        # ✅ Get data and ensure category/priority are included
        data = request.data.copy()
        
        # ✅ Convert string values to integers if needed
        if 'category' in data:
            data['category'] = int(data['category'])
        else:
            data['category'] = 4
            
        if 'priority' in data:
            data['priority'] = int(data['priority'])
        else:
            data['priority'] = 3
        
        print(f"🔍 Creating ticket with data: {data}")  # ✅ DEBUG
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save(created_by=request.user)
        
        print(f"✅ Ticket created: category={ticket.category}, priority={ticket.priority}")  # ✅ DEBUG
        
        # Return full ticket details using TicketSerializer
        response_serializer = TicketSerializer(ticket)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


    
    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        ticket = self.get_object()

        # Optional: prevent reassignment in Phase 1
        if ticket.assigned_to_id:
            return Response(
                {"error": "Ticket already assigned."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Core: assign to the logged‑in user (agent)
        ticket.assigned_to = request.user
        ticket.save(update_fields=["assigned_to"])

        return Response(
            {"message": "Ticket assigned to you."},
            status=status.HTTP_200_OK,
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
        comment_text = request.data.get('comment_text', '').strip()
        
        if not comment_text:
            return Response(
                {'error': 'Comment text is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create comment
        comment = Comment.objects.create(
            ticket=ticket,
            user=request.user,
            comment_text=comment_text
        )
        
        # Serialize and return
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_status(self, request, pk=None):
        """Change ticket status (agents/admins only)"""
        ticket = self.get_object()
        new_status = request.data.get('status')
        
        # Validate status value
        valid_statuses = [1, 2, 3, 4]  # Open, In Progress, Resolved, Closed
        if not new_status or int(new_status) not in valid_statuses:
            return Response(
                {'error': 'Invalid status value'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        ticket.status = int(new_status)
        ticket.save(update_fields=['status'])
        
        # Return updated ticket
        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

class IsAgentOrAdmin(permissions.BasePermission):
    """Only agents and admins can access canned responses."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [1, 3]

class CannedResponseViewSet(viewsets.ModelViewSet):
    """
    Agents create/manage their own canned responses.
    Admins can see and manage all responses.
    """
    
    permission_classes = [IsAgentOrAdmin]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CannedResponseCreateSerializer
        return CannedResponseSerializer
    
    def get_queryset(self):
        """
        Agents see: their own + admin-created templates
        Admins see: all templates
        """
        user = self.request.user
        
        queryset = CannedResponse.objects.filter(is_active=True)
        
        if user.role == 3:  # Agent
            # See own templates + admin-created ones
            queryset = queryset.filter(
                Q(created_by=user) | Q(created_by__role=1)
            )
        # Admins see everything (no filter needed)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(search_tags__icontains=search) | 
                Q(canned_response__icontains=search)
            )
        
        return queryset.order_by('-usage_count', 'search_tags')
    
    def perform_create(self, serializer):
        """Set created_by to current user."""
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """Only allow editing own templates (or admin can edit all)."""
        instance = self.get_object()
        
        # Admin can edit anything
        if self.request.user.role == 1:
            serializer.save()
            return
        
        # Agents can only edit their own templates
        if instance.created_by_id != self.request.user.id:
            raise PermissionDenied("You can only edit your own templates")
        
        serializer.save()

    
    def perform_destroy(self, instance):
        """Soft delete. Only allow deleting own templates (or admin can delete all)."""
        # Admin can delete anything
        if self.request.user.role == 1:
            instance.is_active = False
            instance.save(update_fields=['is_active'])
            return
        
        # Agents can only delete their own templates
        if instance.created_by_id != self.request.user.id:
            raise PermissionDenied("You can only delete your own templates")
        
        instance.is_active = False
        instance.save(update_fields=['is_active'])

    
    @action(detail=True, methods=['post'])
    def use(self, request, pk=None):
        """Track usage when agent uses this template."""
        template = self.get_object()
        template.increment_usage()
        return Response({
            'message': 'Usage tracked',
            'usage_count': template.usage_count
        })
    
    @action(detail=False, methods=['get'])
    def autocomplete(self, request):
        """
        Auto-suggest templates based on typed shortcut.
        GET /api/canned-responses/autocomplete/?q=hi
        """
        query = request.query_params.get('q', '').lower().strip()
        
        if not query:
            return Response([])
        
        queryset = self.get_queryset()
        
        # Match search_tags that start with the query
        matches = queryset.filter(search_tags__istartswith=query)[:5]
        
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)
    
# 👇 Function-based view - OUTSIDE the class, at module level
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_tickets_admin(request):
    """Get recent tickets for admin overview (admin only)."""
    if request.user.role != 1:
        return Response(
            {"error": "Admin access required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    tickets = Ticket.objects.select_related('assigned_to', 'created_by').order_by('-created_at')[:10]
    
    data = [{
        'id': t.id,
        'subject': t.subject,
        'category': t.category,
        'status': t.status,
        'assigned_to_name': t.assigned_to.full_name if t.assigned_to else None,
        'created_at': t.created_at,
    } for t in tickets]
    
    return Response(data)

@api_view(['GET'])
def admin_stats(request):
    """Admin dashboard stats."""
    stats = {
        'open_tickets': Ticket.objects.filter(status='open').count(),
        'closed_tickets': Ticket.objects.filter(status='closed').count(),
        'total_tickets': Ticket.objects.count(),
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ticket_stats(request):
    """
    Get ticket statistics for dashboard
    Returns counts by status for current user's visible tickets
    """
    user = request.user
    
    # Base query - same logic as TicketViewSet
    if user.role == 2:  # Regular user
        base_query = Ticket.objects.filter(created_by=user)
        my_tickets = base_query
    elif user.role == 3:  # Agent
        # All tickets agent can see (unassigned + assigned to them)
        base_query = Ticket.objects.filter(
            Q(assigned_to=user) | Q(assigned_to__isnull=True)
        )
        # Only tickets assigned to this agent
        my_tickets = Ticket.objects.filter(assigned_to=user)
    else:  # Admin (role == 1)
        base_query = Ticket.objects.all()
        my_tickets = base_query
    
    stats = {
        'total': base_query.count(),
        'open': base_query.filter(status=1).count(),
        'in_progress': base_query.filter(status=2).count(),
        'resolved': base_query.filter(status=3).count(),
        'closed': base_query.filter(status=4).count(),
        'my_tickets': my_tickets.count(),
        'my_open': my_tickets.filter(status__in=[1, 2]).count(),  # Open + In Progress
        'high_priority': base_query.filter(priority=1, status__in=[1, 2]).count(),
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_tickets(request):
    """
    Get all tickets created by the logged-in user
    Supports filtering and searching
    """
    user = request.user
    
    # Base query - only tickets created by this user
    queryset = Ticket.objects.filter(created_by=user)
    
    # Filter by status
    status_filter = request.query_params.get('status')
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    # Filter by priority
    priority_filter = request.query_params.get('priority')
    if priority_filter:
        queryset = queryset.filter(priority=priority_filter)
    
    # Search
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(subject__icontains=search) | 
            Q(description__icontains=search) |
            Q(id__icontains=search)
        )
    
    # Sort
    sort_by = request.query_params.get('sort', '-created_at')
    queryset = queryset.order_by(sort_by)
    
    # Serialize
    serializer = TicketSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_ticket_stats(request):
    """
    Get ticket statistics for logged-in user
    """
    user = request.user
    tickets = Ticket.objects.filter(created_by=user)
    
    stats = {
        'total': tickets.count(),
        'open': tickets.filter(status=1).count(),
        'in_progress': tickets.filter(status=2).count(),
        'resolved': tickets.filter(status=3).count(),
        'closed': tickets.filter(status=4).count(),
        'high_priority': tickets.filter(priority=1).count(),
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_dashboard_stats(request):
    """
    Get comprehensive admin statistics
    """
    if request.user.role != 1:
        return Response(
            {"error": "Admin access required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Total tickets by status
    total_tickets = Ticket.objects.count()
    open_tickets = Ticket.objects.filter(status=1).count()
    in_progress = Ticket.objects.filter(status=2).count()
    resolved = Ticket.objects.filter(status=3).count()
    closed = Ticket.objects.filter(status=4).count()
    
    # Unassigned tickets
    unassigned = Ticket.objects.filter(assigned_to__isnull=True).count()
    
    # High priority open tickets
    high_priority = Ticket.objects.filter(priority=1, status__in=[1, 2]).count()
    
    # Tickets created in last 24 hours
    last_24h = timezone.now() - timedelta(hours=24)
    recent_tickets = Ticket.objects.filter(created_at__gte=last_24h).count()
    
    # Average resolution time (for resolved tickets)
    resolved_tickets = Ticket.objects.filter(status=3)
    avg_resolution_time = None
    if resolved_tickets.exists():
        total_time = sum([
            (t.updated_at - t.created_at).total_seconds() / 3600  # Convert to hours
            for t in resolved_tickets
        ])
        avg_resolution_time = round(total_time / resolved_tickets.count(), 1)
    
    stats = {
        'total_tickets': total_tickets,
        'open': open_tickets,
        'in_progress': in_progress,
        'resolved': resolved,
        'closed': closed,
        'unassigned': unassigned,
        'high_priority': high_priority,
        'recent_24h': recent_tickets,
        'avg_resolution_hours': avg_resolution_time,
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_agents(request):
    """
    Get all agents with their ticket counts
    """
    if request.user.role != 1:
        return Response(
            {"error": "Admin access required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all agents (role = 3)
    agents = User.objects.filter(role=3).annotate(
        total_tickets=Count('assigned_tickets', distinct=True),
        open_tickets=Count(
            'assigned_tickets', 
            filter=Q(assigned_tickets__status=1),
            distinct=True
        ),
        in_progress_tickets=Count(
            'assigned_tickets', 
            filter=Q(assigned_tickets__status=2),
            distinct=True
        ),
        resolved_tickets=Count(
            'assigned_tickets', 
            filter=Q(assigned_tickets__status=3),
            distinct=True
        )
    )
    
    data = [{
        'id': agent.id,
        'full_name': agent.full_name,
        'email': agent.email,  # Removed username
        'total_tickets': agent.total_tickets,
        'open_tickets': agent.open_tickets,
        'in_progress_tickets': agent.in_progress_tickets,
        'resolved_tickets': agent.resolved_tickets,
    } for agent in agents]
    
    return Response(data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reassign_ticket(request, pk):
    """
    Reassign a ticket to a different agent (admin only)
    """
    if request.user.role != 1:
        return Response(
            {"error": "Admin access required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist:
        return Response(
            {"error": "Ticket not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    new_agent_id = request.data.get('agent_id')
    
    if not new_agent_id:
        return Response(
            {"error": "agent_id is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        new_agent = User.objects.get(id=new_agent_id, role=3)
    except User.DoesNotExist:
        return Response(
            {"error": "Agent not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Reassign
    ticket.assigned_to = new_agent
    ticket.save(update_fields=['assigned_to'])
    
    serializer = TicketSerializer(ticket)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ticket_analytics(request):
    """
    Get ticket analytics for admin dashboard
    - Tickets created per day (last 7 days)
    - Tickets by category
    - Tickets by priority
    """
    if request.user.role != 1:
        return Response(
            {"error": "Admin access required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Last 7 days ticket creation
    last_7_days = timezone.now() - timedelta(days=7)
    tickets_by_day = []
    
    for i in range(7):
        day = last_7_days + timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        count = Ticket.objects.filter(
            created_at__gte=day_start,
            created_at__lt=day_end
        ).count()
        
        tickets_by_day.append({
            'date': day_start.strftime('%Y-%m-%d'),
            'count': count
        })
    
    # Tickets by category
    tickets_by_category = {
        'HR': Ticket.objects.filter(category=1).count(),
        'IT': Ticket.objects.filter(category=2).count(),
        'Facilities': Ticket.objects.filter(category=3).count(),
        'Others': Ticket.objects.filter(category=4).count(),
    }
    
    # Tickets by priority
    tickets_by_priority = {
        'High': Ticket.objects.filter(priority=1).count(),
        'Medium': Ticket.objects.filter(priority=2).count(),
        'Low': Ticket.objects.filter(priority=3).count(),
    }
    
    analytics = {
        'tickets_by_day': tickets_by_day,
        'tickets_by_category': tickets_by_category,
        'tickets_by_priority': tickets_by_priority,
    }
    
    return Response(analytics)

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow non-authenticated users to search
def search_kb_with_ai(request):
    """
    Search KB using RAG and generate AI answer.
    POST /api/tickets/kb-search/
    Body: { "query": "How do I reset my password?" }
    """
    query = request.data.get('query', '').strip()
    
    if not query:
        return Response({'error': 'Query is required'}, status=400)
    
    if len(query) < 3:
        return Response({
            'query': query,
            'ai_answer': 'Please enter at least 3 characters to search.',
            'articles': [],
            'found_count': 0
        })
    
    try:
        from .rag_service import get_rag_service
        from knowledge.models import KBArticle  # ✅ Import from knowledge app
        rag = get_rag_service()
        
        # Search for similar articles
        similar_articles = rag.search_similar_articles(query, top_k=5)
        
        if not similar_articles:
            return Response({
                'query': query,
                'ai_answer': 'No relevant articles found. Please create a support ticket for assistance.',
                'articles': [],
                'found_count': 0
            })
        
        # Get full article details
        article_ids = [a['article_id'] for a in similar_articles]
        articles = KBArticle.objects.filter(
            id__in=article_ids,
            is_published=True  # ✅ Use is_published instead of status
        ).values('id', 'title', 'content', 'category')
        
        # Map articles to maintain order
        articles_dict = {a['id']: a for a in articles}
        ordered_articles = []
        
        for i, sim_article in enumerate(similar_articles):
            aid = sim_article['article_id']
            if aid in articles_dict:
                ordered_articles.append({
                    'id': articles_dict[aid]['id'],
                    'title': articles_dict[aid]['title'],
                    'content': articles_dict[aid]['content'],
                    'category': articles_dict[aid]['category'],
                    'snippet': sim_article['snippet'],
                    'relevance_score': sim_article['relevance_score']  # ✅ Use pre-calculated score
                })

        
        # Generate AI answer
        ai_answer = rag.generate_answer(query, ordered_articles[:3])
        
        return Response({
            'query': query,
            'ai_answer': ai_answer,
            'articles': ordered_articles,
            'found_count': len(ordered_articles)
        })
    
    except Exception as e:
        print(f"RAG search error: {e}")
        return Response({
            'error': f'Search failed: {str(e)}'
        }, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def rebuild_rag_index(request):
    """
    Rebuild the entire RAG index from scratch.
    POST /api/tickets/kb-rebuild-index/
    """
    try:
        from .rag_service import get_rag_service
        from knowledge.models import KBArticle  # ✅ Import from knowledge app

        rag = get_rag_service()
        
        # Get all published articles
        articles = KBArticle.objects.filter(
            is_published=True  # ✅ Use is_published
        ).values('id', 'title', 'content', 'category')
        
        # Rebuild index
        count = rag.rebuild_index(list(articles))
        
        return Response({
            'message': f'Successfully rebuilt index with {count} articles',
            'count': count
        })
    
    except Exception as e:
        print(f"Index rebuild error: {e}")
        return Response({
            'error': f'Index rebuild failed: {str(e)}'
        }, status=500)