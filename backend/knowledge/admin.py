from django.contrib import admin
from .models import FAQ, KnowledgeBase, KBArticle


@admin.register(KBArticle)
class KBArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'category_display', 'created_by', 'is_published', 'views_count', 'created_at')
    list_filter = ('category', 'is_published', 'created_at')
    search_fields = ('title', 'content')
    readonly_fields = ('views_count', 'created_at', 'updated_at', 'created_by')
    
    fieldsets = (
        ('Article Content', {
            'fields': ('title', 'content', 'category')
        }),
        ('Publishing', {
            'fields': ('is_published',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'views_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def category_display(self, obj):
        return obj.get_category_display()
    category_display.short_description = 'Category Label'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'tags', 'created_at')
    search_fields = ('question', 'answer', 'tags')


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'content_preview', 'created_at')
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'
