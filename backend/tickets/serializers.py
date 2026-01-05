from rest_framework import serializers
from .models import Ticket, Comment, Attachment, SLAConfig
from accounts.serializers import UserSerializer
from .models import CannedResponse

class AttachmentSerializer(serializers.ModelSerializer):
    """Serializer for file attachments."""
    
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'filename', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for ticket comments."""
    user = UserSerializer(read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'user', 'comment_text', 'created_at', 'attachments']
        read_only_fields = ['id', 'created_at', 'user']


class TicketSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    comments = CommentSerializer(many=True, read_only=True) 
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'subject', 'description', 'status', 'priority', 'category',  # ✅ Add category
            'created_by', 'created_by_name', 'assigned_to', 'assigned_to_name',
            'created_at', 'updated_at', 'status_display', 'priority_display', 
            'category_display',  # ✅ Add category_display
            "comments"
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class TicketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tickets."""
    
    class Meta:
        model = Ticket
        fields = ['subject', 'description', 'category', 'priority']


class TicketUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating ticket status/assignment."""
    
    class Meta:
        model = Ticket
        fields = ['status', 'assigned_to', 'category', 'priority']


class SLAConfigSerializer(serializers.ModelSerializer):
    """Serializer for SLA configuration."""
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = SLAConfig
        fields = ['id', 'priority', 'priority_display', 'sla_hours']

class CannedResponseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = CannedResponse
        fields = [
            'id', 'search_tags', 'canned_response',
            'created_by', 'created_by_name', 
            'created_at', 'updated_at', 'is_active', 'usage_count'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'usage_count']

class CannedResponseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CannedResponse
        fields = ['search_tags', 'canned_response', 'is_active']
    
    def validate_search_tags(self, value):
        """Ensure search_tags is clean."""
        value = value.lower().strip()
        if not value:
            raise serializers.ValidationError("Search tags cannot be empty")
        return value
