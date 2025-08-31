from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal, ROUND_HALF_UP
import threading
import uuid
from .email_service import send_order_confirmation, send_shipping_notification
from datetime import datetime, timedelta
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import permission_classes
import logging
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from cart.models import CartItem
from .payment_service import create_payment_intent
from django.db.models import Q, Sum, Count

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

@api_view(['GET'])
def get_orders(request):
    """Get orders for the authenticated user"""
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response({'orders': serializer.data})

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    serializer = OrderCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    cart_items = CartItem.objects.filter(user=request.user)
    if not cart_items.exists():
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Calculate subtotal safely
            subtotal = sum(item.total_price for item in cart_items)
            subtotal = Decimal(subtotal).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            
            tax = (subtotal * Decimal('0.08')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)  # 8% tax
            
            shipping = Decimal('0.00') if subtotal > Decimal('100.00') else Decimal('15.00')
            total = (subtotal + tax + shipping).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

            order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

            # Create Stripe payment intent
            payment_intent = create_payment_intent(float(total), currency='usd')
            payment_intent_id = payment_intent['id']
            client_secret = payment_intent['client_secret']

            # Create Order
            order = Order.objects.create(
                user=request.user,
                order_number=order_number,
                subtotal=subtotal,
                tax=tax,
                shipping=shipping,
                total=total,
                payment_intent_id=payment_intent_id,
                shipping_address=serializer.validated_data['shipping_address'],
                billing_address=serializer.validated_data['billing_address'],
                estimated_delivery=datetime.now() + timedelta(days=14),
            )

            # Create OrderItems
            for cart_item in cart_items:
                unit_price = cart_item.variant.price if cart_item.variant else cart_item.product.base_price
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    variant=cart_item.variant,
                    quantity=cart_item.quantity,
                    unit_price=unit_price,
                    total_price=cart_item.total_price,
                    customizations=cart_item.customizations
                )

            # Clear user's cart
            cart_items.delete()
             # Send email asynchronously
            threading.Thread(target=send_order_confirmation, args=(order, request.user)).start()


            return Response({
                'order': OrderSerializer(order).data,
                'client_secret': client_secret
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Order creation failed for user {request.user.id}: {e}")
        return Response({'error': 'Failed to create order. Please try again later.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    if order.status in ['shipped', 'delivered']:
        return Response({'error': 'Cannot cancel shipped or delivered orders'}, status=status.HTTP_400_BAD_REQUEST)
    
    if order.status == 'cancelled':
        return Response({'error': 'Order is already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
    
    order.status = 'cancelled'
    order.save()
    
    # TODO: Optionally send email notification here

    return Response(OrderSerializer(order).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])  # Later, switch to employee/admin-only permission
def update_manufacturing_status(request, item_id):
    status = request.data.get('status')

    if status not in ['pending', 'in_production', 'completed']:
        return Response({'error': 'Invalid status'}, status=400)

    try:
        item = OrderItem.objects.get(id=item_id)
        item.manufacturing_status = status
        item.save()
        # After item.save()
        order = item.order
        if all(i.manufacturing_status == 'completed' for i in order.items.all()):
            order.status = 'shipped'
            order.save()

            # Send email asynchronously
            threading.Thread(target=send_shipping_notification, args=(order, order.user)).start()

        return Response({'message': 'Manufacturing status updated'})
    except OrderItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    serializer = OrderSerializer(order)
    return Response({'order': serializer.data})

# Admin Order Management Endpoints
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders_list(request):
    """Get all orders for admin with pagination and filtering"""
    page = int(request.query_params.get('page', 1))
    search = request.query_params.get('search', '')
    status_filter = request.query_params.get('status', '')
    payment_status = request.query_params.get('payment_status', '')
    
    # Base queryset
    queryset = Order.objects.all()
    
    # Apply filters
    if search:
        queryset = queryset.filter(
            Q(order_number__icontains=search) |
            Q(user__email__icontains=search) |
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search)
        )
    
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    if payment_status:
        queryset = queryset.filter(payment_status=payment_status)
    
    # Pagination
    per_page = 20
    start = (page - 1) * per_page
    end = start + per_page
    
    orders = queryset.order_by('-created_at')[start:end]
    
    return Response({
        'count': queryset.count(),
        'results': OrderSerializer(orders, many=True).data
    })

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_update_order(request, order_id):
    """Update order status"""
    try:
        order = Order.objects.get(id=order_id)
        
        if 'status' in request.data:
            order.status = request.data['status']
        if 'payment_status' in request.data:
            order.payment_status = request.data['payment_status']
        if 'tracking_number' in request.data:
            order.tracking_number = request.data['tracking_number']
        
        order.save()
        
        return Response(OrderSerializer(order).data)
    
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_order_detail(request, order_id):
    """Get detailed order information for admin"""
    try:
        order = Order.objects.get(id=order_id)
        return Response(OrderSerializer(order).data)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
