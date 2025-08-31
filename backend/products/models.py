from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

# NEW: Fabric and pricing models (don't touch existing Product model)
class Fabric(models.Model):
    FABRIC_TYPE_CHOICES = [
        ('cotton', 'Cotton'),
        ('silk', 'Silk'),
        ('wool', 'Wool'),
        ('linen', 'Linen'),
        ('polyester', 'Polyester'),
        ('nylon', 'Nylon'),
        ('rayon', 'Rayon'),
        ('denim', 'Denim'),
        ('jersey', 'Jersey'),
        ('chiffon', 'Chiffon'),
        ('twill', 'Twill'),
        ('canvas', 'Canvas'),
        ('leather', 'Leather'),
        ('bamboo', 'Bamboo'),
        ('modal', 'Modal'),
        ('crepe', 'Crepe'),
        ('velvet', 'Velvet'),
        ('corduroy', 'Corduroy'),
        ('fleece', 'Fleece'),
        ('satin', 'Satin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    fabric_type = models.CharField(max_length=50, choices=FABRIC_TYPE_CHOICES)
    description = models.TextField(blank=True)
    
    # Pricing factors
    cost_per_yard = models.DecimalField(max_digits=8, decimal_places=2)
    premium_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)
    
    # Quality metrics
    durability_score = models.DecimalField(max_digits=3, decimal_places=2, default=0.5)
    comfort_score = models.DecimalField(max_digits=3, decimal_places=2, default=0.5)
    sustainability_score = models.DecimalField(max_digits=3, decimal_places=2, default=0.5)
    
    # Properties
    weight_gsm = models.IntegerField(help_text="Weight in grams per square meter")
    stretch_percentage = models.IntegerField(default=0, help_text="Stretch percentage")
    opacity_percentage = models.IntegerField(default=100, help_text="Opacity percentage")
    
    # Care instructions
    care_instructions = models.TextField(blank=True)
    washing_temperature = models.IntegerField(default=30, help_text="Max washing temperature in Celsius")
    
    # Flags
    is_premium = models.BooleanField(default=False)
    is_sustainable = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Inventory
    stock_quantity = models.IntegerField(default=0)
    minimum_order_yards = models.DecimalField(max_digits=6, decimal_places=2, default=1.0)
    
    # Metadata
    supplier = models.CharField(max_length=200, blank=True)
    color_options = models.JSONField(default=list, blank=True)
    pattern_options = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.fabric_type})"

class PricingFactor(models.Model):
    """Global pricing factors that affect all calculations"""
    name = models.CharField(max_length=100, unique=True)
    
    # Labor costs
    base_labor_cost = models.DecimalField(max_digits=6, decimal_places=2, default=15.0)
    skilled_labor_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.5)
    
    # Business costs
    overhead_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=25.0)
    profit_margin_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=40.0)
    
    # Market factors
    market_demand_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)
    seasonal_adjustment = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)
    
    # Quality premiums
    premium_design_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.2)
    custom_fit_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.3)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ClothingComplexity(models.Model):
    """Complexity factors for different clothing types"""
    clothing_type = models.CharField(max_length=100)
    
    # Complexity metrics
    base_complexity_score = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)
    labor_hours = models.DecimalField(max_digits=6, decimal_places=2, default=2.0)
    fabric_yards_needed = models.DecimalField(max_digits=6, decimal_places=2, default=2.0)
    
    # Skill requirements
    skill_level_required = models.CharField(max_length=50, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ], default='intermediate')
    
    # Construction details
    seam_count = models.IntegerField(default=10)
    button_count = models.IntegerField(default=0)
    zipper_count = models.IntegerField(default=0)
    pocket_count = models.IntegerField(default=0)
    
    # Special features
    requires_lining = models.BooleanField(default=False)
    requires_interfacing = models.BooleanField(default=False)
    requires_special_tools = models.BooleanField(default=False)
    
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['clothing_type']

    def __str__(self):
        return f"{self.clothing_type} (Complexity: {self.base_complexity_score})"

# KEEP YOUR ORIGINAL PRODUCT MODEL EXACTLY AS IS
class Product(models.Model):
    CATEGORY_CHOICES = [
        ('top', 'Top'),
        ('tshirt', 'Tshirt'),
        ('pant', 'Pant'),
        ('shirt', 'Shirt'),
        ('jacket', 'Jacker'),
        ('Hoodie', 'Hoodie'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image_url = models.URLField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    fabric = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    is_3d = models.BooleanField(default=False)  # For 3D product view
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_products', null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']

class ProductVariant(models.Model):
    SIZE_CHOICES = [
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double Extra Large'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=10, choices=SIZE_CHOICES)
    color = models.CharField(max_length=50, blank=True)
    sku = models.CharField(max_length=100, unique=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    inventory = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['product', 'size', 'color']

    def __str__(self):
        return f"{self.product.name} - {self.size} - {self.color}"

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    title = models.CharField(max_length=255, blank=True)
    comment = models.TextField(blank=True)
    images = models.JSONField(blank=True, null=True)
    is_verified_purchase = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.product.name} - {self.rating} stars"

class DesignSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='design_sessions')
    session_id = models.CharField(max_length=100, unique=True, db_index=True)
    prompt = models.TextField()
    generated_image_url = models.URLField(max_length=500)
    reference_image_url = models.URLField(max_length=500, null=True, blank=True)
    outfit_elements = models.JSONField(default=list, blank=True)
    detected_keywords = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_favorite = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['session_id']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.prompt[:50]}..."

class OutfitElement(models.Model):
    design_session = models.ForeignKey(DesignSession, on_delete=models.CASCADE, related_name='elements')
    element_id = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    fabric = models.CharField(max_length=100)
    color = models.CharField(max_length=50)
    position_x = models.IntegerField()
    position_y = models.IntegerField()
    width = models.IntegerField()
    height = models.IntegerField()
    
    # NEW: Add fabric recommendations for AI-generated items only
    recommended_fabrics = models.JSONField(default=list, blank=True)
    selected_fabric = models.ForeignKey(Fabric, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} - ${self.price}"

class ProductMedia(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('3d', '3D Model'),
        ('video', 'Video'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='media')
    media_url = models.URLField(max_length=500)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.media_type}"

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
