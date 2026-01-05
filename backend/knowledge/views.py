from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import FAQ, KBArticle, KnowledgeBase
from .serializers import FAQSerializer, KBArticleSerializer, KnowledgeBaseSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """Public can read, only admin can write"""
    def has_permission(self, request, view):
        # Allow read operations for everyone (no authentication required)
        if request.method in permissions.SAFE_METHODS:
            return True  # Changed from request.user.is_authenticated
        # Write operations require admin
        return request.user.is_authenticated and request.user.role == 1


class KBArticleViewSet(viewsets.ModelViewSet):
    """ViewSet for Knowledge Base Articles - PUBLIC READ ACCESS"""
    queryset = KBArticle.objects.filter(is_published=True)
    serializer_class = KBArticleSerializer
    permission_classes = [IsAdminOrReadOnly]  # Now allows public read
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Search in title and content
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def increment_view(self, request, pk=None):
        """Increment view count - public access (no auth required)"""
        article = self.get_object()
        article.views_count += 1
        article.save()
        return Response({'views_count': article.views_count})


class FAQViewSet(viewsets.ModelViewSet):
    """ViewSet for FAQ operations - PUBLIC READ ACCESS"""
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    
    def get_permissions(self):
        # Public can read, authenticated users can write
        if self.action in ['list', 'retrieve', 'search']:
            return [permissions.AllowAny()]  # Changed from IsAuthenticated
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search FAQs by keyword - public access"""
        query = request.query_params.get('q', '')
        
        if query:
            faqs = FAQ.objects.filter(
                Q(question__icontains=query) |
                Q(answer__icontains=query) |
                Q(tags__icontains=query)
            )
        else:
            faqs = FAQ.objects.all()
        
        serializer = self.get_serializer(faqs, many=True)
        return Response(serializer.data)


class KnowledgeBaseViewSet(viewsets.ModelViewSet):
    """ViewSet for Knowledge Base (RAG - Phase 2) - ADMIN ONLY"""
    queryset = KnowledgeBase.objects.all()
    serializer_class = KnowledgeBaseSerializer
    permission_classes = [permissions.IsAdminUser]  # Keep this admin-only
