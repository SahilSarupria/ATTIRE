from django.db import models
from orders.models import OrderItem
import uuid

class ManufacturingQueue(models.Model):
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_item = models.OneToOneField(OrderItem, on_delete=models.CASCADE, related_name='manufacturing_queue')
    priority = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    assigned_to = models.CharField(max_length=100, blank=True)
    estimated_completion = models.DateTimeField(blank=True, null=True)
    actual_completion = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', 'created_at']

    def __str__(self):
        return f"Manufacturing {self.order_item.order.order_number} - {self.order_item.product.name}"
