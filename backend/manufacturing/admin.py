from django.contrib import admin
from .models import ManufacturingQueue

@admin.register(ManufacturingQueue)
class ManufacturingQueueAdmin(admin.ModelAdmin):
    list_display = ('order_item', 'status', 'priority', 'assigned_to', 'estimated_completion', 'created_at')
    list_filter = ('status', 'priority', 'created_at',  'estimated_completion', 'created_at')
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('order_item__order__order_number', 'order_item__product__name', 'assigned_to')
    readonly_fields = ('id', 'created_at', 'updated_at')
