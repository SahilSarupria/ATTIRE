from rest_framework import serializers
from .models import Product, ProductVariant, Review, ProductMedia, Fabric

class FabricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = [
            'id', 'name', 'fabric_type', 'description', 'cost_per_yard',
            'premium_multiplier', 'durability_score', 'comfort_score',
            'sustainability_score', 'weight_gsm', 'stretch_percentage',
            'opacity_percentage', 'care_instructions', 'washing_temperature',
            'is_premium', 'is_sustainable', 'stock_quantity',
            'minimum_order_yards', 'supplier', 'color_options',
            'pattern_options', 'created_at', 'updated_at'
        ]

class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = '__all__'

class ProductVariantSerializer(serializers.ModelSerializer):
    fabric = FabricSerializer(read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    media = ProductMediaSerializer(many=True, read_only=True)
    recommended_fabrics = FabricSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_published=True)
        if reviews.exists():
            return sum(review.rating for review in reviews) / reviews.count()
        return 0

    def get_review_count(self, obj):
        return obj.reviews.filter(is_published=True).count()

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('user', 'is_verified_purchase')
