from rest_framework import serializers
from .models import FAQ, KnowledgeBase

class FAQSerializer(serializers.ModelSerializer):
    """Serializer for FAQ."""
    
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'tags', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    """Serializer for Knowledge Base (RAG - Phase 2)."""
    
    class Meta:
        model = KnowledgeBase
        fields = ['id', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
