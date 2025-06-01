from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal
import uuid
from datetime import datetime, timedelta

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from cart.models import CartItem
from .payment_service import create_payment_intent

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

@api_view(['POST'])
def create_order(request):
    serializer = OrderCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Get cart items
    cart_items = CartItem.objects.filter(user=request.user)
    if not cart_items.exists():
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Calculate totals
            subtotal = sum(item.total_price for item in cart_items)
            tax = subtotal * Decimal('0.08')  # 8% tax
            shipping = Decimal('0.00') if subtotal > 100 else Decimal('15.00')
            total = subtotal + tax + shipping

            # Generate order number
            order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

            # Create payment intent
            try:
                payment_intent = create_payment_intent(float(total))
                payment_intent_id = payment_intent['id']
                client_secret = payment_intent['client_secret']
            except Exception as e:
                # For demo purposes, create a mock payment intent
                payment_intent_id = f"pi_mock_{uuid.uuid4().hex[:16]}"
                client_secret = f"pi_mock_{uuid.uuid4().hex[:16]}_secret"

            # Create order
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
                estimated_delivery=datetime.now() + timedelta(days=14)
            )

            # Create order items
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

            # Clear cart
            cart_items.delete()

            return Response({
                'order': OrderSerializer(order).data,
                'client_secret': client_secret
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def cancel_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    if order.status in ['shipped', 'delivered']:
        return Response({'error': 'Cannot cancel shipped or delivered orders'}, status=status.HTTP_400_BAD_REQUEST)
    
    order.status = 'cancelled'
    order.save()
    
    return Response(OrderSerializer(order).data)

@api_view(['GET'])
def get_order_detail(request, order_id):
    """Get detailed order information"""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    serializer = OrderSerializer(order)
    return Response({'order': serializer.data})
