from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_cart, name='cart-list'),
    path('add/', views.add_to_cart, name='add-to-cart'),
    path('<uuid:item_id>/update/', views.update_cart_item, name='update-cart-item'),
    path('remove/', views.remove_from_cart, name='remove-from-cart'),
    path('clear/', views.clear_cart, name='clear-cart'),
    
    # Wishlist
    path('wishlist/', views.WishlistItemListView.as_view(), name='wishlist-list'),
    path('wishlist/add/', views.add_to_wishlist, name='add-to-wishlist'),
    path('wishlist/<uuid:item_id>/remove/', views.remove_from_wishlist, name='remove-from-wishlist'),
]
