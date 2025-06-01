from django.contrib import admin
from .models import CartItem, WishlistItem

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'variant', 'quantity', 'total_price', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'product__name')

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'product__name')
