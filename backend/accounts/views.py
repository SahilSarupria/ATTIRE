from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import status
from .serializers import CookieTokenRefreshSerializer

class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = CookieTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        
        access = serializer.validated_data.get('access')
        # Typically no new refresh token here unless you enable rotation
        # refresh = serializer.validated_data.get('refresh') 

        response = Response({
            'access': access,
            # 'refresh': refresh,  # omit this to avoid confusion
        })

        # Update the access token cookie
        response.set_cookie(
            'access_token', 
            access,
            httponly=True, 
            secure=False,  # Change to True in production with HTTPS
            samesite='Lax',
            max_age=60*15,  # 15 mins access token lifetime (adjust accordingly)
        )
        
        # Do NOT reset refresh_token cookie unless rotating tokens!

        return response


@api_view(['POST'])
def logout(request):
    response = Response({"message": "Logged out"}, status=status.HTTP_200_OK)
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        response = Response({
            'user': UserSerializer(user).data,
            'message': 'Login successful',
        }, status=status.HTTP_200_OK)

        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response.set_cookie(
            'access_token',
            access_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=60*15,
        )

        # Only set refresh_token if valid and not 'None'
        if refresh_token and refresh_token != "None":
            response.set_cookie(
                'refresh_token',
                refresh_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=60*60*24*7,
            )
        else:
            response.delete_cookie('refresh_token')

        return response
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        response = Response({
            'user': UserSerializer(user).data,
            'message': 'Registration successful',
        }, status=status.HTTP_201_CREATED)

        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=7 * 24 * 60 * 60,
            path='/',
        )

        if refresh_token and refresh_token != "None":
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                max_age=14 * 24 * 60 * 60,
                path='/',
            )
        else:
            response.delete_cookie('refresh_token')

        return response
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def register(request):
#     serializer = UserRegistrationSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.save()
#         token = generate_jwt_token(user)
        
#         return Response({
#             'user': UserSerializer(user).data,
#             'token': token
#         }, status=status.HTTP_201_CREATED)
    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def login(request):
#     serializer = UserLoginSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.validated_data['user']
#         token = generate_jwt_token(user)
        
#         return Response({
#             'user': UserSerializer(user).data,
#             'token': token
#         }, status=status.HTTP_200_OK)
    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

