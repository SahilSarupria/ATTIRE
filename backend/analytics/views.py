from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from orders.models import Order, OrderItem
from products.models import Product
from .models import ProductView, SearchQuery, SalesMetrics

@api_view(['GET'])
@permission_classes([IsAdminUser])
def sales_dashboard(request):
    # Get date range
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)

    # Sales metrics
    orders = Order.objects.filter(
        created_at__date__range=[start_date, end_date],
        payment_status='paid'
    )

    total_orders = orders.count()
    total_revenue = orders.aggregate(Sum('total'))['total__sum'] or 0
    average_order_value = orders.aggregate(Avg('total'))['total__avg'] or 0

    # Top products
    top_products = OrderItem.objects.filter(
        order__created_at__date__range=[start_date, end_date],
        order__payment_status='paid'
    ).values('product__name').annotate(
        total_sold=Sum('quantity'),
        total_revenue=Sum('total_price')
    ).order_by('-total_sold')[:10]

    # Recent orders
    recent_orders = Order.objects.filter(
        created_at__date__range=[start_date, end_date]
    ).order_by('-created_at')[:10]

    return Response({
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'average_order_value': float(average_order_value),
        'top_products': list(top_products),
        'recent_orders_count': recent_orders.count(),
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def product_analytics(request):
    # Most viewed products
    most_viewed = ProductView.objects.values('product__name').annotate(
        view_count=Count('id')
    ).order_by('-view_count')[:10]

    # Conversion rates
    total_views = ProductView.objects.count()
    total_purchases = OrderItem.objects.count()
    conversion_rate = (total_purchases / total_views * 100) if total_views > 0 else 0

    return Response({
        'most_viewed_products': list(most_viewed),
        'total_product_views': total_views,
        'conversion_rate': round(conversion_rate, 2),
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def track_product_view(request):
    product_id = request.data.get('product_id')
    if not product_id:
        return Response({'error': 'Product ID required'}, status=400)

    try:
        product = Product.objects.get(id=product_id)
        ProductView.objects.create(
            user=request.user if request.user.is_authenticated else None,
            product=product,
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        return Response({'success': True})
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
