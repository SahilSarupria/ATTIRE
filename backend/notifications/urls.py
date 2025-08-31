from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<uuid:notification_id>/read/', views.mark_as_read, name='mark-as-read'),
    path('mark-all-read/', views.mark_all_as_read, name='mark-all-as-read'),
    
    # Admin email template endpoints
    path('admin/email-templates/', views.admin_email_templates_list, name='admin-email-templates-list'),
    path('admin/email-templates/create/', views.admin_create_email_template, name='admin-create-email-template'),
    path('admin/email-templates/<uuid:template_id>/', views.admin_email_template_detail, name='admin-email-template-detail'),
    path('admin/email-templates/<uuid:template_id>/update/', views.admin_update_email_template, name='admin-update-email-template'),
    path('admin/email-templates/<uuid:template_id>/delete/', views.admin_delete_email_template, name='admin-delete-email-template'),
]
