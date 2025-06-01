from rest_framework import serializers
from .models import CartItem, WishlistItem
from products.serializers import ProductSerializer, ProductVariantSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = '__all__'
        read_only_fields = ('user',)

class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = '__all__'
        read_only_fields = ('user',)
