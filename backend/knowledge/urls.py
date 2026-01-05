from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FAQViewSet, KnowledgeBaseViewSet, KBArticleViewSet

router = DefaultRouter()
router.register(r'faq', FAQViewSet, basename='faq')
router.register(r'kb', KnowledgeBaseViewSet, basename='knowledgebase')
router.register(r'articles', KBArticleViewSet, basename='kb-article')

urlpatterns = [
    path('', include(router.urls)),
]
