from django.contrib import admin
from .models import FAQ, KnowledgeBase

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'tags', 'created_at')
    search_fields = ('question', 'answer', 'tags')

@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'content', 'created_at')
