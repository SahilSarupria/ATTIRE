from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ManufacturingQueue
from .serializers import ManufacturingQueueSerializer

class ManufacturingQueueListView(generics.ListAPIView):
    queryset = ManufacturingQueue.objects.all()
    serializer_class = ManufacturingQueueSerializer

@api_view(['PATCH'])
def update_manufacturing_status(request, queue_id):
    queue_item = get_object_or_404(ManufacturingQueue, id=queue_id)
    
    status_value = request.data.get('status')
    assigned_to = request.data.get('assigned_to')
    estimated_completion = request.data.get('estimated_completion')
    notes = request.data.get('notes')

    if status_value:
        queue_item.status = status_value
    if assigned_to:
        queue_item.assigned_to = assigned_to
    if estimated_completion:
        queue_item.estimated_completion = estimated_completion
    if notes:
        queue_item.notes = notes

    queue_item.save()

    # Update order item status if completed
    if status_value == 'completed':
        queue_item.order_item.manufacturing_status = 'completed'
        queue_item.order_item.save()

    serializer = ManufacturingQueueSerializer(queue_item)
    return Response(serializer.data)

# Admin Manufacturing Management Endpoints
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_manufacturing_list(request):
    """Get all manufacturing orders for admin"""
    page = int(request.query_params.get('page', 1))
    search = request.query_params.get('search', '')
    status_filter = request.query_params.get('status', '')
    priority = request.query_params.get('priority', '')
    
    # Base queryset
    queryset = ManufacturingQueue.objects.all()
    
    # Apply filters
    if search:
        queryset = queryset.filter(
            Q(order_item__order__order_number__icontains=search) |
            Q(order_item__product__name__icontains=search) |
            Q(assigned_to__icontains=search)
        )
    
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    if priority:
        queryset = queryset.filter(priority=priority)
    
    # Pagination
    per_page = 20
    start = (page - 1) * per_page
    end = start + per_page
    
    manufacturing_orders = queryset.order_by('-created_at')[start:end]
    
    return Response({
        'count': queryset.count(),
        'results': ManufacturingQueueSerializer(manufacturing_orders, many=True).data
    })

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_update_manufacturing(request, queue_id):
    """Update manufacturing order"""
    try:
        queue_item = ManufacturingQueue.objects.get(id=queue_id)
        
        if 'status' in request.data:
            queue_item.status = request.data['status']
        if 'priority' in request.data:
            queue_item.priority = request.data['priority']
        if 'assigned_to' in request.data:
            queue_item.assigned_to = request.data['assigned_to']
        if 'estimated_completion' in request.data:
            queue_item.estimated_completion = request.data['estimated_completion']
        if 'notes' in request.data:
            queue_item.notes = request.data['notes']
        
        queue_item.save()
        
        # Update order item status if completed
        if queue_item.status == 'completed':
            queue_item.order_item.manufacturing_status = 'completed'
            queue_item.order_item.save()
        
        return Response(ManufacturingQueueSerializer(queue_item).data)
    
    except ManufacturingQueue.DoesNotExist:
        return Response({'error': 'Manufacturing order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_manufacturing_detail(request, queue_id):
    """Get detailed manufacturing order information"""
    try:
        queue_item = ManufacturingQueue.objects.get(id=queue_id)
        return Response(ManufacturingQueueSerializer(queue_item).data)
    except ManufacturingQueue.DoesNotExist:
        return Response({'error': 'Manufacturing order not found'}, status=status.HTTP_404_NOT_FOUND)
