from django.urls import path
from . import views

urlpatterns = [
    # KEEP ALL YOUR ORIGINAL PRODUCT URLS
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<uuid:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('<uuid:product_id>/reviews/', views.ReviewListCreateView.as_view(), name='product-reviews'),
    
    # KEEP ALL YOUR ORIGINAL ADMIN URLS
    path('admin/products/', views.admin_product_list, name='admin-product-list'),
    path('admin/products/create/', views.create_product, name='admin-create-product'),
    path('admin/products/<uuid:pk>/update/', views.update_product, name='admin-update-product'),
    path('admin/products/<uuid:pk>/delete/', views.delete_product, name='admin-delete-product'),
    path('admin/dashboard/stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
    path('admin/verify/', views.verify_admin, name='admin-verify'),
    
    # KEEP ALL YOUR ORIGINAL DESIGN SESSION URLS
    path('save-design-session/', views.SaveDesignSessionView.as_view(), name='save-design-session'),
    path('load-design-session/<str:session_id>/', views.LoadDesignSessionView.as_view(), name='load-design-session'),
    path('prompt-history/', views.PromptHistoryView.as_view(), name='prompt-history'),
    
    # NEW: Fabric recommendation URLs for AI-generated items only
    path('fabric-recommendations/', views.get_fabric_recommendations, name='fabric-recommendations'),
    path('calculate-fabric-price/', views.calculate_fabric_price, name='calculate-fabric-price'),
    
    # KEEP YOUR DEBUG URLS
    path('debug/products/', views.debug_list_products, name='debug-products'),
    path('debug/products/<uuid:product_id>/', views.debug_get_product, name='debug-product'),
]
