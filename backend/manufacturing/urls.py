from django.urls import path
from . import views

urlpatterns = [
    path('queue/', views.ManufacturingQueueListView.as_view(), name='manufacturing-queue'),
    path('queue/<uuid:queue_id>/update/', views.update_manufacturing_status, name='update-manufacturing-status'),
]
