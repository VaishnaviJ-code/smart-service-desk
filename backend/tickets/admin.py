from django.contrib import admin
from django.utils.html import format_html
from .models import Ticket, Comment, Attachment, SLAConfig, CannedResponse

# ✅ ADD THIS: Force unregister if already registered
try:
    admin.site.unregister(Ticket)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(Comment)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(Attachment)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(SLAConfig)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(CannedResponse)
except admin.sites.NotRegistered:
    pass

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'category', 'priority', 'status', 'created_by', 'assigned_to', 'created_at')
    list_filter = ('category', 'priority', 'status', 'created_at')
    search_fields = ('subject', 'description')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'user', 'created_at')
    list_filter = ('created_at',)

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'filename', 'ticket', 'comment', 'uploaded_at')

@admin.register(SLAConfig)
class SLAConfigAdmin(admin.ModelAdmin):
    list_display = ('priority', 'sla_hours')

@admin.register(CannedResponse)
class CannedResponseAdmin(admin.ModelAdmin):
    list_display = ('search_tags', 'response_preview', 'status_badge', 'usage_count', 'created_by', 'created_at')
    list_filter = ('is_active', 'created_at', 'created_by')
    search_fields = ('search_tags', 'canned_response')
    readonly_fields = ('usage_count', 'created_by', 'created_at', 'updated_at')
    actions = ['activate_selected', 'deactivate_selected']
    
    fieldsets = (
        ('Template Details', {
            'fields': ('search_tags', 'canned_response')
        }),
        ('Settings', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'usage_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def response_preview(self, obj):
        """Show first 50 characters of the response."""
        preview = obj.canned_response[:50]
        if len(obj.canned_response) > 50:
            preview += '...'
        return preview
    response_preview.short_description = 'Response Preview'
    
    def status_badge(self, obj):
        """Visual status indicator."""
        if obj.is_active:
            return format_html('<span style="color: green;">✓ Active</span>')
        else:
            return format_html('<span style="color: orange;">⏸ Inactive</span>')
    status_badge.short_description = 'Status'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    # Bulk Actions
    def activate_selected(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} template(s) activated.')
    activate_selected.short_description = 'Activate selected templates'
    
    def deactivate_selected(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} template(s) deactivated.')
    deactivate_selected.short_description = 'Deactivate selected templates'