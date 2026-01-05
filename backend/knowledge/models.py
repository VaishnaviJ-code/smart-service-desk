from django.db import models
from accounts.models import User


# Phase 1.5 - Structured FAQ System (keep this)
class FAQ(models.Model):
    question = models.CharField(max_length=500)
    answer = models.TextField()
    tags = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'faqs'
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
    
    def __str__(self):
        return self.question


# Phase 1.5 - Knowledge Base Articles (NEW - add this)
class KBArticle(models.Model):
    CATEGORY_CHOICES = [
        (1, 'HR'),
        (2, 'IT'),
        (3, 'Facilities'),
        (4, 'General'),
    ]
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.IntegerField(choices=CATEGORY_CHOICES, default=4)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='kb_articles'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    views_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'kb_articles'
        ordering = ['-created_at']
        verbose_name = 'Knowledge Base Article'
        verbose_name_plural = 'Knowledge Base Articles'
    
    def __str__(self):
        return self.title


# Phase 2 - RAG Knowledge Base (keep for future - embeddings)
class KnowledgeBase(models.Model):
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # embedding field will be added in Phase 2
    
    class Meta:
        db_table = 'knowledge_base'
    
    def __str__(self):
        return self.content[:50]
