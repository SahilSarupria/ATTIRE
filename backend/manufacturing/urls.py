from django.urls import path
from . import views

urlpatterns = [
    path('queue/', views.ManufacturingQueueListView.as_view(), name='manufacturing-queue'),
    path('queue/<uuid:queue_id>/update/', views.update_manufacturing_status, name='update-manufacturing-status'),
# Admin endpoints
    path('admin/manufacturing/', views.admin_manufacturing_list, name='admin-manufacturing-list'),
    path('admin/manufacturing/<uuid:queue_id>/', views.admin_manufacturing_detail, name='admin-manufacturing-detail'),
    path('admin/manufacturing/<uuid:queue_id>/update/', views.admin_update_manufacturing, name='admin-update-manufacturing'),
]