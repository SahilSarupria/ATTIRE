from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from orders.models import Order
from manufacturing.models import ManufacturingQueue
from notifications.models import Notification

@shared_task
def process_order_payment(order_id):
    """Process order payment and create manufacturing queue items"""
    try:
        order = Order.objects.get(id=order_id)
        
        # Create manufacturing queue items for each order item
        for order_item in order.items.all():
            ManufacturingQueue.objects.create(
                order_item=order_item,
                priority=1 if order_item.product.is_custom else 2
            )
        
        # Create notification
        Notification.objects.create(
            user=order.user,
            type='order_update',
            title='Order Confirmed',
            message=f'Your order {order.order_number} has been confirmed and is being prepared for manufacturing.',
            data={'order_id': str(order.id)}
        )
        
        return f"Order {order.order_number} processed successfully"
    except Order.DoesNotExist:
        return f"Order {order_id} not found"

@shared_task
def send_email_notification(user_email, subject, message):
    """Send email notification"""
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )

@shared_task
def update_manufacturing_status(queue_id, status):
    """Update manufacturing status and notify user"""
    try:
        queue_item = ManufacturingQueue.objects.get(id=queue_id)
        queue_item.status = status
        queue_item.save()
        
        # Create notification
        status_messages = {
            'in_progress': 'Your custom item is now being manufactured.',
            'completed': 'Your custom item has been completed and will ship soon.',
        }
        
        if status in status_messages:
            Notification.objects.create(
                user=queue_item.order_item.order.user,
                type='manufacturing_update',
                title='Manufacturing Update',
                message=status_messages[status],
                data={'order_id': str(queue_item.order_item.order.id)}
            )
        
        return f"Manufacturing status updated for {queue_item.id}"
    except ManufacturingQueue.DoesNotExist:
        return f"Manufacturing queue item {queue_id} not found"
