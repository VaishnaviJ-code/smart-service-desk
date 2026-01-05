from rest_framework import serializers
from .models import FAQ, KnowledgeBase, KBArticle

class KBArticleSerializer(serializers.ModelSerializer):
    """Serializer for KB Articles (Phase 1.5)"""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    category_label = serializers.SerializerMethodField()
    
    class Meta:
        model = KBArticle
        fields = [
            'id', 'title', 'content', 'category', 'category_label',
            'created_by', 'created_by_name', 'created_at', 
            'updated_at', 'is_published', 'views_count'
        ]
        read_only_fields = ['created_by', 'views_count', 'created_at', 'updated_at']
    
    def get_category_label(self, obj):
        return obj.get_category_display()
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
