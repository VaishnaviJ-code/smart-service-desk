from rest_framework import serializers
from .models import Ticket, Comment, Attachment, SLAConfig
from accounts.serializers import UserSerializer

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
    """Serializer for tickets."""
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'subject', 'description', 'category', 'category_display',
            'priority', 'priority_display', 'status', 'status_display',
            'created_at', 'updated_at', 'created_by', 'assigned_to',
            'comments', 'attachments'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class TicketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tickets."""
    
    class Meta:
        model = Ticket
        fields = ['subject', 'description']


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
