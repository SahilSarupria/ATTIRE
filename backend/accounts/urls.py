from django.urls import path
from . import views
from .views import CookieTokenRefreshView

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.profile, name='profile'),
    path('logout/', views.logout, name='logout'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),

    path('admin/users/', views.admin_users_list, name='admin-users-list'),
    path('admin/users/<int:user_id>/update/', views.admin_update_user, name='admin-update-user'),
    path('admin/users/<int:user_id>/delete/', views.admin_delete_user, name='admin-delete-user'),
    path('admin/dashboard-stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
    
# Address Management URLs
    path('addresses/', views.address_list_create, name='address-list-create'),
    path('addresses/<uuid:address_id>/', views.address_detail, name='address-detail'),
    path('addresses/<uuid:address_id>/update/', views.address_update, name='address-update'),
    path('addresses/<uuid:address_id>/delete/', views.address_delete, name='address-delete'),
    path('addresses/<uuid:address_id>/set-default/', views.set_default_address, name='set-default-address'),
]
