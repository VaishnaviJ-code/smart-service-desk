from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import FAQ, KnowledgeBase
from .serializers import FAQSerializer, KnowledgeBaseSerializer

class FAQViewSet(viewsets.ModelViewSet):
    """ViewSet for FAQ operations."""
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search FAQs by keyword."""
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
    """ViewSet for Knowledge Base (RAG - Phase 2)."""
    queryset = KnowledgeBase.objects.all()
    serializer_class = KnowledgeBaseSerializer
    permission_classes = [permissions.IsAuthenticated]

