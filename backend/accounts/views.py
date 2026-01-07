from rest_framework import status, generics, permissions, viewsets  # 👈 ADD viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    LoginSerializer,
    UserUpdateSerializer  # 👈 ADD THIS (we'll create it)
)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """List all users (admin only)."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 1:  # Admin
            return User.objects.all()
        elif user.role == 3:  # Agent
            return User.objects.filter(role=3)  # Only agents
        return User.objects.filter(id=user.id)


class AgentListView(generics.ListAPIView):
    """List all agents (admin only)."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only admins can view agents
        if self.request.user.role != 1:
            return User.objects.none()
        
        # Return only users with role=3 (agents)
        return User.objects.filter(role=3)


class CreateAgentView(generics.CreateAPIView):
    """Create a new agent (admin only)."""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Only admins can create agents
        if request.user.role != 1:
            return Response(
                {"error": "Only admins can create agents."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Force role to be agent
        data = request.data.copy()
        data['role'] = 3  # Agent role
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_stats(request):
    """Get system statistics (admin only)."""
    if request.user.role != 1:
        return Response(
            {"error": "Admin access required."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from tickets.models import Ticket
    
    return Response({
        'total_users': User.objects.filter(role=2).count(),
        'total_agents': User.objects.filter(role=3).count(),
        'total_tickets': Ticket.objects.count(),
    })


class ChangeUserRoleView(generics.UpdateAPIView):
    """Change user role (admin only)."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 1:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        instance = self.get_object()
        new_role = request.data.get('role')
        
        if not new_role or int(new_role) not in [1, 2, 3]:
            return Response(
                {"error": "Invalid role. 1=Admin, 2=User, 3=Agent"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        instance.role = int(new_role)
        instance.save(update_fields=['role'])
        
        return Response(UserSerializer(instance).data)


# 👇 ADD THIS NEW VIEWSET
class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Full CRUD operations for user management (Admin only)
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_queryset(self):
        if self.request.user.role == 1:
            return User.objects.all().order_by('-date_joined')
        return User.objects.none()
    
    def list(self, request):
        """Get all users - Admin only"""
        if request.user.role != 1:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        users = self.get_queryset()
        data = [{
            'id': u.id,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'full_name': f"{u.first_name} {u.last_name}".strip(),
            'email': u.email,
            'role': u.role,
            'role_display': u.get_role_display(),
            'is_active': u.is_active,
            'date_joined': u.date_joined,
        } for u in users]
        
        return Response(data)
    
    def retrieve(self, request, pk=None):
        """Get single user - Admin only"""
        if request.user.role != 1:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user = User.objects.get(pk=pk)
            data = {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}".strip(),
                'email': user.email,
                'role': user.role,
                'is_active': user.is_active,
                'date_joined': user.date_joined,
            }
            return Response(data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def update(self, request, pk=None, partial=False):  # 👈 ADDED partial parameter
        """Update user - Admin only"""
        if request.user.role != 1:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user = User.objects.get(pk=pk)
            
            # Update fields if provided (support partial updates)
            if 'first_name' in request.data:
                user.first_name = request.data['first_name']
            if 'last_name' in request.data:
                user.last_name = request.data['last_name']
            if 'email' in request.data:
                user.email = request.data['email']
            if 'role' in request.data:
                user.role = request.data['role']
            if 'is_active' in request.data:
                user.is_active = request.data['is_active']
            
            # Update password if provided
            if 'password' in request.data and request.data['password']:
                user.set_password(request.data['password'])
            
            user.save()
            
            return Response({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}".strip(),
                'email': user.email,
                'role': user.role,
                'is_active': user.is_active,
            })
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def partial_update(self, request, pk=None):  # 👈 ADDED THIS METHOD
        """Handle PATCH requests"""
        return self.update(request, pk=pk, partial=True)
    
    def destroy(self, request, pk=None):
        """Delete user - Admin only"""
        if request.user.role != 1:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user = User.objects.get(pk=pk)
            
            if user.id == request.user.id:
                return Response(
                    {"error": "You cannot delete your own account."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.delete()
            return Response(
                {"message": "User deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

