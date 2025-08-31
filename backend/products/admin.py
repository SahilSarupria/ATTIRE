from django.contrib import admin
from .models import Product, ProductVariant, Review

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'base_price', 'is_active', 'is_3d', 'created_at', 'updated_at')
    list_filter = ('category', 'is_active', 'is_3d', 'created_at', 'updated_at')
    search_fields = ('name', 'description', 'fabric', 'color')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'size', 'color', 'sku', 'price', 'inventory', 'is_active')
    list_filter = ('size', 'is_active')
    search_fields = ('product__name', 'sku')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product', 'rating', 'is_verified_purchase', 'is_published', 'created_at')
    list_filter = ('rating', 'is_verified_purchase', 'is_published', 'created_at')
    search_fields = ('user__email', 'product__name', 'title')
    readonly_fields = ('id', 'created_at')


# from django.contrib import admin
# from .models import Product, ProductVariant, Review

# @admin.register(DesignSession)
# class DesignSessionAdmin(admin.ModelAdmin):
#     list_display = ('id', 'user', 'status', 'created_at')
#     list_filter = ('status', 'created_at')
#     search_fields = ('user__email', 'prompt')
#     readonly_fields = ('id', 'created_at')

# @admin.register(Product)
# class ProductAdmin(admin.ModelAdmin):
#     list_display = ('name', 'category', 'base_price', 'is_active', 'created_at')
#     list_filter = ('category', 'is_custom', 'is_active', 'created_at')
#     search_fields = ('name', 'description', 'fabric', 'color')
#     readonly_fields = ('id', 'created_at')

# @admin.register(ProductVariant)
# class ProductVariantAdmin(admin.ModelAdmin):
#     list_display = ('product', 'size', 'color', 'price', 'inventory', 'is_active')
#     list_filter = ('size', 'is_active')
#     search_fields = ('product__name', 'sku')

# @admin.register(Review)
# class ReviewAdmin(admin.ModelAdmin):
#     list_display = ('user', 'product', 'rating', 'is_published', 'created_at')
#     list_filter = ('rating', 'is_published', 'created_at')
#     search_fields = ('user__email', 'product__name', 'title')
