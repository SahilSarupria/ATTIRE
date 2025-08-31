from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_orders, name='order-list'),
    path('<uuid:order_id>/', views.get_order_detail, name='order-detail'),
    path('create/', views.create_order, name='create-order'),
    path('<uuid:order_id>/cancel/', views.cancel_order, name='cancel-order'),
    path('order-items/<uuid:item_id>/update-status/', views.update_manufacturing_status, name = 'update-manufacturing-status'),
 # Admin endpoints
    path('admin/orders/', views.admin_orders_list, name='admin-orders-list'),
    path('admin/orders/<uuid:order_id>/', views.admin_order_detail, name='admin-order-detail'),
    path('admin/orders/<uuid:order_id>/update/', views.admin_update_order, name='admin-update-order'),
]
