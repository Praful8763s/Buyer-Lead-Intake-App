import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .serializers import LoginSerializer, UserSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def demo_login(request):
    """Demo login endpoint - creates/gets demo user"""
    
    # Create or get demo user
    demo_user, created = User.objects.get_or_create(
        email='demo@example.com',
        defaults={
            'username': 'demo@example.com',
            'first_name': 'Demo',
            'last_name': 'User',
            'is_active': True
        }
    )
    
    if created:
        demo_user.set_password('demo123')
        demo_user.save()
    
    # Generate JWT token
    payload = {
        'user_id': demo_user.id,
        'email': demo_user.email,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    
    return Response({
        'access_token': token,
        'token': token,  # Keep both for compatibility
        'user': UserSerializer(demo_user).data
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT token
        payload = {
            'user_id': user.id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(days=7),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        return Response({
            'access_token': token,
            'token': token,  # Keep both for compatibility
            'user': UserSerializer(user).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response(UserSerializer(request.user).data)