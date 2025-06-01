from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class Notification(models.Model):
    TYPE_CHOICES = [
        ('order_update', 'Order Update'),
        ('design_ready', 'Design Ready'),
        ('promotion', 'Promotion'),
        ('manufacturing_update', 'Manufacturing Update'),
        ('shipping_update', 'Shipping Update'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"
