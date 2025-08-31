from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def send_order_confirmation(order, user):
    try:
        subject = f"Order Confirmation - {order.order_number}"
        html_message = render_to_string('emails/order_confirmation.html', {
            'user': user,
            'order': order,
        })

        send_mail(
            subject=subject,
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        import logging
        logging.error(f"Failed to send order confirmation for Order {order.order_number}: {e}")


def send_shipping_notification(order, user):
    """Send shipping notification email"""
    subject = f"Order Shipped - {order.order_number}"
    
    html_message = render_to_string('emails/shipping_notification.html', {
        'user': user,
        'order': order,
    })
    
    send_mail(
        subject=subject,
        message='',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )
