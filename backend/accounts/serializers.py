from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    full_name = serializers.SerializerMethodField()  # 👈 if it's a computed field
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'date_joined','is_active']
        read_only_fields = ['id', 'date_joined']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"  # 👈 combine first + last


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm', 'role']
        extra_kwargs = {
            'role': {'required': False}
        }
    
    def validate(self, data):
        password = data.get('password')
        password_confirm = data.pop('password_confirm', None)
        
        if password_confirm and password != password_confirm:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        
        return data
    
    def create(self, validated_data):
        role = validated_data.pop('role', 2)
        password = validated_data.pop('password')
        
        # ✅ DON'T set full_name - it's auto-computed from first_name + last_name
        user = User.objects.create(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=role,
            is_active=True
        )
        user.set_password(password)
        user.save()
        
        return user

class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            data['user'] = user
        else:
            raise serializers.ValidationError("Must include email and password")
        
        return data
    
class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user information"""
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    full_name = serializers.SerializerMethodField(read_only=True)  # 👈 Read-only computed field
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email', 'role', 'is_active', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def update(self, instance, validated_data):
        # Handle password separately
        password = validated_data.pop('password', None)
        
        # Update other fields (first_name, last_name, email, role, is_active)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance
