from django.urls import path
from . import views

urlpatterns = [
    path('sales-dashboard/', views.sales_dashboard, name='sales-dashboard'),
    path('product-analytics/', views.product_analytics, name='product-analytics'),
    path('track-view/', views.track_product_view, name='track-product-view'),

    
    # Admin analytics endpoints
    path('admin/overview/', views.admin_analytics_overview, name='admin-analytics-overview'),
    path('admin/products/', views.admin_product_performance, name='admin-product-performance'),
]
