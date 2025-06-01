from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_orders, name='order-list'),
    path('<uuid:order_id>/', views.get_order_detail, name='order-detail'),
    path('create/', views.create_order, name='create-order'),
    path('<uuid:order_id>/cancel/', views.cancel_order, name='cancel-order'),
]
