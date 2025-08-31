from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Notification, EmailTemplate
from .serializers import NotificationSerializer, EmailTemplateSerializer

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

@api_view(['PATCH'])
def mark_as_read(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.is_read = True
    notification.save()
    
    serializer = NotificationSerializer(notification)
    return Response(serializer.data)

@api_view(['PATCH'])
def mark_all_as_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read'})

# Admin Email Template Management
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_email_templates_list(request):
    """Get all email templates for admin"""
    page = int(request.query_params.get('page', 1))
    search = request.query_params.get('search', '')
    template_type = request.query_params.get('template_type', '')
    status_filter = request.query_params.get('status', '')
    
    # Base queryset
    queryset = EmailTemplate.objects.all()
    
    # Apply filters
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) |
            Q(subject__icontains=search) |
            Q(template_type__icontains=search)
        )
    
    if template_type:
        queryset = queryset.filter(template_type=template_type)
    
    if status_filter:
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
    
    # Pagination
    per_page = 20
    start = (page - 1) * per_page
    end = start + per_page
    
    templates = queryset.order_by('-created_at')[start:end]
    
    return Response({
        'count': queryset.count(),
        'results': EmailTemplateSerializer(templates, many=True).data
    })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_email_template(request):
    """Create a new email template"""
    serializer = EmailTemplateSerializer(data=request.data)
    if serializer.is_valid():
        template = serializer.save(created_by=request.user)
        return Response(EmailTemplateSerializer(template).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_update_email_template(request, template_id):
    """Update an email template"""
    try:
        template = EmailTemplate.objects.get(id=template_id)
        serializer = EmailTemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except EmailTemplate.DoesNotExist:
        return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_email_template(request, template_id):
    """Delete an email template"""
    try:
        template = EmailTemplate.objects.get(id=template_id)
        template.delete()
        return Response({'message': 'Template deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except EmailTemplate.DoesNotExist:
        return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_email_template_detail(request, template_id):
    """Get detailed email template information"""
    try:
        template = EmailTemplate.objects.get(id=template_id)
        return Response(EmailTemplateSerializer(template).data)
    except EmailTemplate.DoesNotExist:
        return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
