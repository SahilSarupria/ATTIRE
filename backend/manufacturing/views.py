from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
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
