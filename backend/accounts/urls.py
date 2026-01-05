from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    UserProfileView,
    UserListView,
    AgentListView,
    CreateAgentView,
    ChangeUserRoleView,
    admin_stats,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('agents/', AgentListView.as_view(), name='agent-list'),
    path('agents/create/', CreateAgentView.as_view(), name='agent-create'),
    path('users/<int:pk>/role/', ChangeUserRoleView.as_view(), name='change-user-role'),
    path('admin/stats/', admin_stats, name='admin-stats'),
]
