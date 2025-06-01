from rest_framework import serializers
from .models import Product, ProductVariant, DesignSession, Review

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

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

class DesignSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignSession
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('user', 'is_verified_purchase')
