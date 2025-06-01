from rest_framework import serializers
from .models import ManufacturingQueue
from orders.serializers import OrderItemSerializer

class ManufacturingQueueSerializer(serializers.ModelSerializer):
    order_item = OrderItemSerializer(read_only=True)

    class Meta:
        model = ManufacturingQueue
        fields = '__all__'
