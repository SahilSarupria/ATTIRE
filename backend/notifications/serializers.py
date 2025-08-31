from rest_framework import serializers
from .models import Notification, EmailTemplate

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at', 'updated_at']

class EmailTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = EmailTemplate
        fields = [
            'id', 'name', 'template_type', 'subject', 'html_content', 
            'text_content', 'is_active', 'created_at', 'updated_at', 
            'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_by']
