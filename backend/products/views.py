from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Product, ProductVariant, DesignSession, Review
from .serializers import ProductSerializer, DesignSessionSerializer, ReviewSerializer
from .ai_services import generate_design_image, analyze_image

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        user_id = self.request.query_params.get('user_id')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(fabric__icontains=search)
            )

        return queryset.order_by('-created_at')

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_design_session(request):
    serializer = DesignSessionSerializer(data=request.data)
    if serializer.is_valid():
        design_session = serializer.save(user=request.user)
        return Response(DesignSessionSerializer(design_session).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anonymous users for demo
def generate_design(request):
    prompt = request.data.get('prompt')
    reference_image_url = request.data.get('reference_image_url')

    if not prompt:
        return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Generate design using AI service
        image_url = generate_design_image(prompt, reference_image_url)
        
        # Create design session
        design_session = DesignSession.objects.create(
            user=request.user if request.user.is_authenticated else None,
            prompt=prompt,
            reference_image_url=reference_image_url,
            generated_image_url=image_url,
            status='completed'
        )

        return Response({
            'design_session': DesignSessionSerializer(design_session).data,
            'imageUrl': image_url  # Match frontend expectation
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anonymous users for demo
def analyze_outfit(request):
    image_url = request.data.get('image_url')
    prompt = request.data.get('prompt', '')

    if not image_url:
        return Response({'error': 'Image URL is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        analysis = analyze_image(image_url, prompt)
        return Response(analysis, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anonymous users for demo
def transcribe_audio(request):
    """Handle audio transcription"""
    try:
        # For demo purposes, return a placeholder response
        return Response({
            'transcript': 'I want a blue cotton t-shirt with a vintage design'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anonymous users for demo
def analyze_image_upload(request):
    """Handle image analysis for uploaded reference images"""
    try:
        # For demo purposes, return a placeholder response
        return Response({
            'enhancedPrompt': 'A stylish casual outfit with modern design elements, featuring comfortable fabric and contemporary styling.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return Review.objects.filter(product_id=product_id, is_published=True).order_by('-created_at')

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        serializer.save(user=self.request.user, product_id=product_id)
