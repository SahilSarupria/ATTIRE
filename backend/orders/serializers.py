from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer, ProductVariantSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('user', 'order_number')

class OrderCreateSerializer(serializers.Serializer):
    shipping_address = serializers.JSONField()
    billing_address = serializers.JSONField()
    payment_method_id = serializers.CharField(required=False)
