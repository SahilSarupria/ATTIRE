from django.urls import path
from . import views

urlpatterns = [
    path('sales-dashboard/', views.sales_dashboard, name='sales-dashboard'),
    path('product-analytics/', views.product_analytics, name='product-analytics'),
    path('track-view/', views.track_product_view, name='track-product-view'),
]
