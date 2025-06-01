from django.contrib import admin
from .models import ProductView, SearchQuery, SalesMetrics

@admin.register(ProductView)
class ProductViewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'ip_address', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('product__name', 'user__email', 'ip_address')

@admin.register(SearchQuery)
class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ('query', 'user', 'results_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('query', 'user__email')

@admin.register(SalesMetrics)
class SalesMetricsAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_orders', 'total_revenue', 'average_order_value')
    list_filter = ('date',)
