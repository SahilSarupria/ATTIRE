from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import status
from .serializers import CookieTokenRefreshSerializer
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Address
from .serializers import AddressSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def address_list_create(request):
    """
    GET: List all addresses for the authenticated user
    POST: Create a new address for the authenticated user
    """
    if request.method == 'GET':
        addresses = Address.objects.filter(user=request.user).order_by('-is_default', '-created_at')
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            # If this is set as default, unset other defaults of the same type
            if serializer.validated_data.get('is_default', False):
                Address.objects.filter(
                    user=request.user, 
                    type=serializer.validated_data['type']
                ).update(is_default=False)
            
            address = serializer.save(user=request.user)
            return Response(AddressSerializer(address).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def address_detail(request, address_id):
    """
    GET: Retrieve a specific address
    """
    address = get_object_or_404(Address, id=address_id, user=request.user)
    serializer = AddressSerializer(address)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def address_update(request, address_id):
    """
    PUT/PATCH: Update a specific address
    """
    address = get_object_or_404(Address, id=address_id, user=request.user)
    serializer = AddressSerializer(address, data=request.data, partial=request.method == 'PATCH')
    
    if serializer.is_valid():
        # If this is set as default, unset other defaults of the same type
        if serializer.validated_data.get('is_default', False):
            Address.objects.filter(
                user=request.user, 
                type=serializer.validated_data.get('type', address.type)
            ).exclude(id=address_id).update(is_default=False)
        
        address = serializer.save()
        return Response(AddressSerializer(address).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def address_delete(request, address_id):
    """
    DELETE: Delete a specific address
    """
    address = get_object_or_404(Address, id=address_id, user=request.user)
    address.delete()
    return Response({'message': 'Address deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_default_address(request, address_id):
    """
    POST: Set an address as default
    """
    address = get_object_or_404(Address, id=address_id, user=request.user)
    
    # Unset other defaults of the same type
    Address.objects.filter(user=request.user, type=address.type).update(is_default=False)
    
    # Set this address as default
    address.is_default = True
    address.save()
    
    return Response({'message': f'Address set as default {address.type} address'})


User = get_user_model()

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
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# Admin User Management Endpoints
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    """Get all users for admin with pagination and filtering"""
    page = int(request.query_params.get('page', 1))
    search = request.query_params.get('search', '')
    role = request.query_params.get('role', '')
    status_filter = request.query_params.get('status', '')
    
    # Base queryset
    queryset = User.objects.all()
    
    # Apply filters
    if search:
        queryset = queryset.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    if role:
        if role == 'admin':
            queryset = queryset.filter(is_staff=True, is_superuser=True)
        elif role == 'employee':
            queryset = queryset.filter(is_staff=True, is_superuser=False)
        elif role == 'user':
            queryset = queryset.filter(is_staff=False)
    
    if status_filter:
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
    
    # Pagination
    per_page = 20
    start = (page - 1) * per_page
    end = start + per_page
    
    users = queryset.order_by('-date_joined')[start:end]
    
    # Serialize users with role information
    users_data = []
    for user in users:
        user_data = UserSerializer(user).data
        # Add role information
        if user.is_superuser:
            user_data['role'] = 'admin'
        elif user.is_staff:
            user_data['role'] = 'employee'
        else:
            user_data['role'] = 'user'
        users_data.append(user_data)
    
    return Response({
        'count': queryset.count(),
        'results': users_data
    })

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_update_user(request, user_id):
    """Update user details"""
    try:
        user = User.objects.get(id=user_id)
        
        # Update basic fields
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            user.email = request.data['email']
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        
        # Update role
        if 'role' in request.data:
            role = request.data['role']
            if role == 'admin':
                user.is_staff = True
                user.is_superuser = True
            elif role == 'employee':
                user.is_staff = True
                user.is_superuser = False
            elif role == 'user':
                user.is_staff = False
                user.is_superuser = False
        
        user.save()
        
        # Return updated user data with role
        user_data = UserSerializer(user).data
        if user.is_superuser:
            user_data['role'] = 'admin'
        elif user.is_staff:
            user_data['role'] = 'employee'
        else:
            user_data['role'] = 'user'
        
        return Response(user_data)
    
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_user(request, user_id):
    """Delete a user"""
    try:
        user = User.objects.get(id=user_id)
        
        # Prevent deleting superusers or self
        if user.is_superuser:
            return Response({'error': 'Cannot delete superuser'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.id == request.user.id:
            return Response({'error': 'Cannot delete yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """Get admin dashboard statistics"""
    from orders.models import Order
    from products.models import Product
    from django.db.models import Sum, Count
    from datetime import datetime, timedelta
    
    # User stats
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    new_users_this_month = User.objects.filter(
        date_joined__gte=datetime.now() - timedelta(days=30)
    ).count()
    
    # Order stats
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='pending').count()
    total_revenue = Order.objects.filter(
        payment_status='paid'
    ).aggregate(Sum('total'))['total__sum'] or 0
    
    # Product stats
    total_products = Product.objects.count()
    active_products = Product.objects.filter(is_active=True).count()
    
    return Response({
        'totalUsers': total_users,
        'activeUsers': active_users,
        'newUsersThisMonth': new_users_this_month,
        'totalOrders': total_orders,
        'pendingOrders': pending_orders,
        'totalRevenue': float(total_revenue),
        'totalProducts': total_products,
        'activeProducts': active_products,
    })
