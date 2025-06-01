from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<uuid:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('design-sessions/', views.create_design_session, name='create-design-session'),
    path('generate-design/', views.generate_design, name='generate-design'),
    path('analyze-outfit/', views.analyze_outfit, name='analyze-outfit'),
    path('transcribe/', views.transcribe_audio, name='transcribe-audio'),
    path('analyze-image/', views.analyze_image_upload, name='analyze-image'),
    path('<uuid:product_id>/reviews/', views.ReviewListCreateView.as_view(), name='product-reviews'),
]
