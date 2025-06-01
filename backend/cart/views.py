from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import CartItem, WishlistItem
from .serializers import CartItemSerializer, WishlistItemSerializer
from products.models import Product, ProductVariant

class CartItemListView(generics.ListAPIView):
    serializer_class = CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).order_by('-created_at')

@api_view(['GET'])
def get_cart(request):
    """Get cart items for the authenticated user"""
    cart_items = CartItem.objects.filter(user=request.user).order_by('-created_at')
    serializer = CartItemSerializer(cart_items, many=True)
    return Response({'items': serializer.data})

@api_view(['POST'])
def add_to_cart(request):
    product_id = request.data.get('product_id') or request.data.get('productId')
    variant_id = request.data.get('variant_id') or request.data.get('variantId')
    quantity = request.data.get('quantity', 1)
    customizations = request.data.get('customizations')

    if not product_id:
        return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    product = get_object_or_404(Product, id=product_id)
    variant = None
    if variant_id:
        variant = get_object_or_404(ProductVariant, id=variant_id)

    cart_item, created = CartItem.objects.get_or_create(
        user=request.user,
        product=product,
        variant=variant,
        defaults={
            'quantity': quantity,
            'customizations': customizations
        }
    )

    if not created:
        cart_item.quantity += quantity
        cart_item.save()

    serializer = CartItemSerializer(cart_item)
    return Response({'item': serializer.data}, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
def update_cart_item(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)
    
    quantity = request.data.get('quantity')
    if quantity is not None:
        cart_item.quantity = quantity
        cart_item.save()

    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data)

@api_view(['DELETE'])
def remove_from_cart(request):
    item_id = request.query_params.get('itemId')
    if not item_id:
        return Response({'error': 'Item ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)
    cart_item.delete()
    return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)

@api_view(['DELETE'])
def clear_cart(request):
    CartItem.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# Wishlist views
class WishlistItemListView(generics.ListAPIView):
    serializer_class = WishlistItemSerializer

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).order_by('-created_at')

@api_view(['POST'])
def add_to_wishlist(request):
    product_id = request.data.get('product_id')
    product = get_object_or_404(Product, id=product_id)

    wishlist_item, created = WishlistItem.objects.get_or_create(
        user=request.user,
        product=product
    )

    serializer = WishlistItemSerializer(wishlist_item)
    status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
    return Response(serializer.data, status=status_code)

@api_view(['DELETE'])
def remove_from_wishlist(request, item_id):
    wishlist_item = get_object_or_404(WishlistItem, id=item_id, user=request.user)
    wishlist_item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
