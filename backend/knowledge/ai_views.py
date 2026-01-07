from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .ai_service import search_articles_with_rag, rebuild_rag_index


@api_view(['POST'])
@permission_classes([AllowAny])
def kb_search_view(request):
    """AI-powered search endpoint"""
    query = request.data.get('query', '').strip()
    
    if not query:
        return Response(
            {'error': 'Query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(query) < 3:
        return Response(
            {'error': 'Query must be at least 3 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        results = search_articles_with_rag(query)
        return Response(results, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"AI Search Error: {str(e)}")  # Debug log
        return Response(
            {'error': f'Search failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def kb_rebuild_index_view(request):
    """Rebuild the RAG index (admin only)"""
    try:
        result = rebuild_rag_index()
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Rebuild Index Error: {str(e)}")  # Debug log
        return Response(
            {'error': f'Rebuild failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
