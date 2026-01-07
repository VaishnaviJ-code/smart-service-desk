from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FAQViewSet, KnowledgeBaseViewSet, KBArticleViewSet, kb_stats
from . import ai_views 

router = DefaultRouter()
router.register(r'faq', FAQViewSet, basename='faq')
router.register(r'kb', KnowledgeBaseViewSet, basename='knowledgebase')
router.register(r'articles', KBArticleViewSet, basename='kb-article')

urlpatterns = [
    path('', include(router.urls)),
    path('kb-search/', ai_views.kb_search_view, name='kb-search'),
    path('kb-rebuild-index/', ai_views.kb_rebuild_index_view, name='kb-rebuild-index'),
    path('stats/', kb_stats, name='kb-stats'),  # Add this line
]
