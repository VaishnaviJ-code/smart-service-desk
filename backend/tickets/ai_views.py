from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .ai_service import categorize_ticket


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suggest_category(request):
    """AI-powered category suggestion for tickets."""
    subject = request.data.get('subject', '')
    description = request.data.get('description', '')
    
    if not subject and not description:
        return Response(
            {'error': 'Subject or description is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        suggestion = categorize_ticket(subject, description)
        return Response(suggestion, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"AI Error: {e}")
        return Response(
            {
                'category': 4,
                'confidence': 'low',
                'reasoning': 'Error analyzing ticket'
            },
            status=status.HTTP_200_OK
        )
