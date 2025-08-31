from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Q
from .models import Product, ProductVariant, Review, DesignSession, OutfitElement, Fabric
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .serializers import ProductSerializer, ReviewSerializer, FabricSerializer
from rest_framework.views import APIView
from django.views import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
import logging
from .fabric_service import fabric_pricing_service

logger = logging.getLogger(__name__)

# KEEP ALL YOUR ORIGINAL PRODUCT VIEWS EXACTLY AS THEY WERE
class CheckOutfitElementsView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Check if outfit elements exist for a given image URL
        """
        try:
            image_url = request.data.get('image_url')
            
            if not image_url:
                return Response({
                    'error': 'image_url is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create a hash of the image URL for consistent lookup
            image_hash = hashlib.md5(image_url.encode()).hexdigest()
            
            # Look for existing design sessions with this image URL
            design_sessions = DesignSession.objects.filter(
                generated_image_url=image_url,
                user=request.user
            ).order_by('-created_at')

            if design_sessions.exists():
                # Get the most recent session
                latest_session = design_sessions.first()
                
                # Check if it has outfit elements in JSON field
                if latest_session.outfit_elements:
                    logger.info(f"Found existing outfit elements for image: {image_url}")
                    return Response({
                        'exists': True,
                        'outfit_elements': latest_session.outfit_elements,
                        'session_id': latest_session.session_id,
                        'source': 'json_field'
                    })
                
                # Fallback: check OutfitElement table
                outfit_elements = OutfitElement.objects.filter(
                    design_session=latest_session
                )
                
                if outfit_elements.exists():
                    # Convert OutfitElement objects to the expected format
                    elements_data = []
                    for element in outfit_elements:
                        elements_data.append({
                            'id': element.element_id,
                            'element_id': element.element_id,
                            'name': element.name,
                            'price': str(element.price),
                            'fabric': element.fabric,
                            'color': element.color,
                            'position_x': element.position_x,
                            'position_y': element.position_y,
                            'width': element.width,
                            'height': element.height,
                            'design_session_id': element.design_session.id,
                            'polygon': [
                                [element.position_x, element.position_y],
                                [element.position_x + element.width, element.position_y],
                                [element.position_x + element.width, element.position_y + element.height],
                                [element.position_x, element.position_y + element.height],
                            ],
                            'bbox': [element.position_x, element.position_y, element.width, element.height],
                            'confidence': 0.8,  # Default confidence
                            'mask_base64': '',  # Empty for now
                            'category': 'clothing',
                            'type': element.name.lower(),
                            'coordinates': {
                                'x': element.position_x,
                                'y': element.position_y,
                                'width': element.width,
                                'height': element.height,
                            }
                        })
                    
                    logger.info(f"Found {len(elements_data)} outfit elements in table for image: {image_url}")
                    return Response({
                        'exists': True,
                        'outfit_elements': elements_data,
                        'session_id': latest_session.session_id,
                        'source': 'outfit_element_table'
                    })

            # No existing elements found
            logger.info(f"No existing outfit elements found for image: {image_url}")
            return Response({
                'exists': False,
                'outfit_elements': [],
                'message': 'No existing outfit elements found for this image'
            })

        except Exception as e:
            logger.error(f"Error checking outfit elements: {str(e)}")
            return Response({
                'error': str(e),
                'message': 'Failed to check existing outfit elements'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SaveOutfitElementsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Save outfit elements for a given image URL
        """
        try:
            image_url = request.data.get('image_url')
            outfit_elements = request.data.get('outfit_elements', [])
            
            if not image_url:
                return Response({
                    'error': 'image_url is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not outfit_elements:
                return Response({
                    'error': 'outfit_elements is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Look for existing design session with this image URL
            design_session = DesignSession.objects.filter(
                generated_image_url=image_url,
                user=request.user
            ).order_by('-created_at').first()

            if design_session:
                # Update existing session
                design_session.outfit_elements = outfit_elements
                design_session.save()
                
                # Also save to OutfitElement table for backup/compatibility
                # Clear existing elements first
                OutfitElement.objects.filter(design_session=design_session).delete()
                
                # Create new elements
                for element_data in outfit_elements:
                    coordinates = element_data.get('coordinates', {})
                    analysis = element_data.get('analysis', {})
                    
                    OutfitElement.objects.create(
                        design_session=design_session,
                        element_id=element_data.get('id', ''),
                        name=element_data.get('name', analysis.get('clothing_type', 'Unknown')),
                        price=element_data.get('price', 0),
                        fabric=analysis.get('fabric', 'Unknown'),
                        color=analysis.get('color', {}).get('name', 'Unknown'),
                        position_x=coordinates.get('x', 0),
                        position_y=coordinates.get('y', 0),
                        width=coordinates.get('width', 0),
                        height=coordinates.get('height', 0)
                    )
                
                logger.info(f"Updated outfit elements for existing session: {design_session.session_id}")
                
            else:
                # Create new design session
                session_id = str(uuid.uuid4())
                
                design_session = DesignSession.objects.create(
                    user=request.user,
                    session_id=session_id,
                    prompt=f"Segmentation results for {image_url}",
                    generated_image_url=image_url,
                    outfit_elements=outfit_elements,
                    detected_keywords=[]
                )
                
                # Save to OutfitElement table as well
                for element_data in outfit_elements:
                    coordinates = element_data.get('coordinates', {})
                    analysis = element_data.get('analysis', {})
                    
                    OutfitElement.objects.create(
                        design_session=design_session,
                        element_id=element_data.get('id', ''),
                        name=element_data.get('name', analysis.get('clothing_type', 'Unknown')),
                        price=element_data.get('price', 0),
                        fabric=analysis.get('fabric', 'Unknown'),
                        color=analysis.get('color', {}).get('name', 'Unknown'),
                        position_x=coordinates.get('x', 0),
                        position_y=coordinates.get('y', 0),
                        width=coordinates.get('width', 0),
                        height=coordinates.get('height', 0)
                    )
                
                logger.info(f"Created new design session with outfit elements: {session_id}")

            return Response({
                'success': True,
                'session_id': design_session.session_id,
                'elements_count': len(outfit_elements),
                'message': 'Outfit elements saved successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error saving outfit elements: {str(e)}")
            return Response({
                'error': str(e),
                'message': 'Failed to save outfit elements'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(fabric__icontains=search)
            )

        logger.info(f"ProductListView returning {queryset.count()} products")
        return queryset.order_by('-created_at')

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        product_id = self.kwargs.get('pk')
        logger.info(f"ProductDetailView looking for product with ID: {product_id}")
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
            logger.info(f"Found product: {product.name}")
            return product
        except Product.DoesNotExist:
            logger.error(f"Product with ID {product_id} not found")
            try:
                inactive_product = Product.objects.get(id=product_id, is_active=False)
                logger.error(f"Product exists but is inactive: {inactive_product.name}")
            except Product.DoesNotExist:
                logger.error(f"Product with ID {product_id} does not exist at all")
            raise
        except Exception as e:
            logger.error(f"Error retrieving product: {str(e)}")
            raise

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_product(request):
    """Create a new product with image upload support - UNCHANGED"""
    try:
        name = request.data.get('name')
        description = request.data.get('description')
        category = request.data.get('category')
        base_price = request.data.get('base_price')
        fabric = request.data.get('fabric', '')
        color = request.data.get('color', '')
        is_3d = request.data.get('is_3d', 'false').lower() == 'true'
        
        if not all([name, description, category, base_price]):
            return Response({
                'error': 'Missing required fields: name, description, category, base_price'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image = request.FILES.get('image')
        image_url = ''
        
        if image:
            file_extension = os.path.splitext(image.name)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            image_path = f"public/products/{unique_filename}"
            path = default_storage.save(image_path, ContentFile(image.read()))
            image_url = f"/products/{unique_filename}"
        
        product = Product.objects.create(
            name=name,
            description=description,
            category=category,
            base_price=float(base_price),
            fabric=fabric,
            color=color,
            is_3d=is_3d,
            image_url=image_url,
            created_by=request.user
        )
        
        logger.info(f"Created new product: {product.id} - {product.name}")
        
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# NEW: Fabric recommendation endpoints for AI-generated items only
@api_view(['GET'])
@permission_classes([AllowAny])
def get_fabric_recommendations(request):
    """Get fabric recommendations for AI-generated clothing items"""
    try:
        clothing_type = request.query_params.get('clothing_type')
        min_budget = request.query_params.get('min_budget')
        max_budget = request.query_params.get('max_budget')
        
        if not clothing_type:
            return Response({
                'error': 'clothing_type parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        budget_range = None
        if min_budget and max_budget:
            try:
                budget_range = (float(min_budget), float(max_budget))
            except ValueError:
                return Response({
                    'error': 'Invalid budget range values'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        recommendations = fabric_pricing_service.get_fabric_recommendations(
            clothing_type=clothing_type,
            budget_range=budget_range
        )
        
        response_data = []
        for rec in recommendations:
            fabric = rec['fabric']
            response_data.append({
                'fabric_id': str(fabric.id),
                'fabric_name': fabric.name,
                'fabric_type': fabric.fabric_type,
                'description': fabric.description,
                'estimated_price': float(rec['estimated_price']),
                'price_per_yard': float(rec['price_per_yard']),
                'recommendation_score': rec['score'],
                'is_premium': fabric.is_premium,
                'is_sustainable': fabric.is_sustainable,
                'sustainability_score': float(fabric.sustainability_score),
                'durability_score': float(fabric.durability_score),
                'comfort_score': float(fabric.comfort_score),
                'care_instructions': fabric.care_instructions,
                'color_options': fabric.color_options,
                'stock_quantity': fabric.stock_quantity,
            })
        
        return Response({
            'success': True,
            'clothing_type': clothing_type,
            'recommendations': response_data,
            'total_recommendations': len(response_data)
        })
        
    except Exception as e:
        logger.error(f"Error getting fabric recommendations: {e}")
        return Response({
            'error': str(e),
            'message': 'Failed to get fabric recommendations'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_fabric_price(request):
    """Calculate price for specific fabric and AI-generated clothing type combination"""
    try:
        fabric_id = request.data.get('fabric_id')
        clothing_type = request.data.get('clothing_type')
        design_complexity_data = request.data.get('design_complexity', {})
        
        if not fabric_id or not clothing_type:
            return Response({
                'error': 'fabric_id and clothing_type are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fabric = Fabric.objects.get(id=fabric_id, is_active=True)
        except Fabric.DoesNotExist:
            return Response({
                'error': 'Fabric not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate price using service
        predicted_price = fabric_pricing_service.predict_price(
            fabric=fabric,
            clothing_type=clothing_type,
            design_complexity_data=design_complexity_data
        )
        
        return Response({
            'success': True,
            'fabric_id': fabric_id,
            'fabric_name': fabric.name,
            'clothing_type': clothing_type,
            'predicted_price': float(predicted_price),
            'fabric_cost_per_yard': float(fabric.cost_per_yard),
            'is_premium': fabric.is_premium,
            'sustainability_score': float(fabric.sustainability_score)
        })
        
    except Exception as e:
        logger.error(f"Error calculating fabric price: {e}")
        return Response({
            'error': str(e),
            'message': 'Failed to calculate fabric price'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# KEEP ALL YOUR ORIGINAL DESIGN SESSION VIEWS
class SaveDesignSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            session_id = str(uuid.uuid4())

            # Process outfit elements with fabric recommendations for AI-generated items
            processed_elements = []
            for element_data in data.get('outfit_elements', []):
                clothing_type = element_data.get('analysis', {}).get('clothing_type', 'Unknown')
                
                # Get fabric recommendations for this AI-generated clothing item
                fabric_recommendations = fabric_pricing_service.get_fabric_recommendations(
                    clothing_type=clothing_type,
                    budget_range=None
                )
                
                # Add fabric recommendations to element data
                element_data['fabric_recommendations'] = [
                    {
                        'fabric_id': str(rec['fabric'].id),
                        'fabric_name': rec['fabric'].name,
                        'fabric_type': rec['fabric'].fabric_type,
                        'estimated_price': float(rec['estimated_price']),
                        'price_per_yard': float(rec['price_per_yard']),
                        'recommendation_score': rec['score'],
                        'is_premium': rec['fabric'].is_premium,
                        'is_sustainable': rec['fabric'].is_sustainable,
                        'sustainability_score': float(rec['fabric'].sustainability_score),
                        'durability_score': float(rec['fabric'].durability_score),
                        'comfort_score': float(rec['fabric'].comfort_score),
                    }
                    for rec in fabric_recommendations
                ]
                
                # Update price with best fabric recommendation
                if fabric_recommendations:
                    best_fabric = fabric_recommendations[0]['fabric']
                    predicted_price = fabric_pricing_service.predict_price(
                        fabric=best_fabric,
                        clothing_type=clothing_type,
                        design_complexity_data=element_data.get('analysis', {})
                    )
                    element_data['price'] = float(predicted_price)
                    element_data['fabric'] = best_fabric.name
                
                processed_elements.append(element_data)

            design_session = DesignSession.objects.create(
                user=request.user,
                session_id=session_id,
                prompt=data.get('prompt', ''),
                generated_image_url=data.get('generated_image_url', ''),
                reference_image_url=data.get('reference_image_url'),
                outfit_elements=processed_elements,
                detected_keywords=data.get('detected_keywords', [])
            )

            # Save individual outfit elements with fabric recommendations
            for element_data in processed_elements:
                OutfitElement.objects.create(
                    design_session=design_session,
                    element_id=element_data.get('id', ''),
                    name=element_data.get('name', ''),
                    price=element_data.get('price', 0),
                    fabric=element_data.get('fabric', ''),
                    color=element_data.get('color', ''),
                    position_x=element_data.get('position', {}).get('x', 0),
                    position_y=element_data.get('position', {}).get('y', 0),
                    width=element_data.get('size', {}).get('width', 0),
                    height=element_data.get('size', {}).get('height', 0),
                    recommended_fabrics=element_data.get('fabric_recommendations', [])
                )

            return Response({
                'success': True,
                'session_id': session_id,
                'message': 'AI-generated design session saved with fabric recommendations'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error saving design session: {str(e)}")
            return Response({
                'error': str(e),
                'message': 'Failed to save design session'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoadDesignSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            design_session = DesignSession.objects.get(
                session_id=session_id,
                user=request.user
            )

            outfit_elements = design_session.outfit_elements or []

            if not outfit_elements:
                outfit_elements = []
                for element in design_session.elements.all():
                    outfit_elements.append({
                        'id': element.element_id,
                        'name': element.name,
                        'price': float(element.price),
                        'fabric': element.fabric,
                        'color': element.color,
                        'coordinates': {
                            'x': element.position_x,
                            'y': element.position_y,
                            'width': element.width,
                            'height': element.height,
                        },
                        'category': 'clothing',
                        'type': 'clothing',
                        'confidence': 1.0,
                        'polygon': [],
                        'bbox': [
                            element.position_x,
                            element.position_y,
                            element.width,
                            element.height
                        ],
                        'mask_base64': '',
                        'fabric_recommendations': element.recommended_fabrics
                    })

            return Response({
                'success': True,
                'session_id': design_session.session_id,
                'prompt': design_session.prompt,
                'generated_image_url': design_session.generated_image_url,
                'reference_image_url': design_session.reference_image_url,
                'outfit_elements': outfit_elements,
                'detected_keywords': design_session.detected_keywords,
                'created_at': design_session.created_at.isoformat(),
                'is_favorite': design_session.is_favorite
            })

        except DesignSession.DoesNotExist:
            return Response({
                'error': 'Design session not found',
                'message': 'The requested design session does not exist'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to load design session'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# KEEP ALL YOUR OTHER ORIGINAL VIEWS UNCHANGED
class PromptHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 20))
            offset = (page - 1) * limit
            
            design_sessions = DesignSession.objects.filter(
                user_id=request.user.id
            ).order_by('-created_at')[offset:offset + limit]
            
            total_count = DesignSession.objects.filter(user=request.user).count()
            
            sessions_data = []
            for session in design_sessions:
                sessions_data.append({
                    'session_id': session.session_id,
                    'prompt': session.prompt,
                    'generated_image_url': session.generated_image_url,
                    'reference_image_url': session.reference_image_url,
                    'detected_keywords': session.detected_keywords,
                    'created_at': session.created_at.isoformat(),
                    'is_favorite': session.is_favorite,
                    'outfit_elements_count': session.elements.count()
                })
            
            return Response({
                'success': True,
                'sessions': sessions_data,
                'total_count': total_count,
                'page': page,
                'has_next': offset + limit < total_count
            })

        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch prompt history'
            }, status=500)

# KEEP ALL YOUR ADMIN VIEWS UNCHANGED
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_product_list(request):
    """Get all products for admin with pagination and sorting"""
    page = int(request.query_params.get('page', 1))
    sort_field = request.query_params.get('sort', 'created_at')
    direction = request.query_params.get('direction', 'desc')
    search = request.query_params.get('search', '')
    
    if direction == 'desc':
        sort_field = f"-{sort_field}"
    
    queryset = Product.objects.all()
    
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) | 
            Q(description__icontains=search) |
            Q(category__icontains=search) |
            Q(fabric__icontains=search) |
            Q(color__icontains=search)
        )
    
    products = queryset.order_by(sort_field)
    
    per_page = 10
    start = (page - 1) * per_page
    end = start + per_page
    
    paginated_products = products[start:end]
    
    logger.info(f"Admin product list returning {len(paginated_products)} products")
    
    return Response({
        'count': products.count(),
        'results': ProductSerializer(paginated_products, many=True).data
    })

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_product(request, pk):
    """Update an existing product"""
    try:
        product = Product.objects.get(pk=pk)
        
        if 'name' in request.data:
            product.name = request.data['name']
        if 'description' in request.data:
            product.description = request.data['description']
        if 'category' in request.data:
            product.category = request.data['category']
        if 'base_price' in request.data:
            product.base_price = float(request.data['base_price'])
        if 'fabric' in request.data:
            product.fabric = request.data['fabric']
        if 'color' in request.data:
            product.color = request.data['color']
        if 'is_3d' in request.data:
            product.is_3d = request.data['is_3d'].lower() == 'true'
        if 'is_active' in request.data:
            product.is_active = request.data['is_active'].lower() == 'true'
        
        image = request.FILES.get('image')
        if image:
            file_extension = os.path.splitext(image.name)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            image_path = f"public/products/{unique_filename}"
            path = default_storage.save(image_path, ContentFile(image.read()))
            product.image_url = f"/products/{unique_filename}"
        
        product.save()
        
        return Response(ProductSerializer(product).data, status=status.HTTP_200_OK)
    
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_product(request, pk):
    """Delete a product"""
    try:
        product = Product.objects.get(pk=pk)
        product.delete()
        return Response({'message': 'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """Get dashboard statistics for admin"""
    try:
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        inactive_products = Product.objects.filter(is_active=False).count()
        products_3d = Product.objects.filter(is_3d=True).count()
        products_without_image = Product.objects.filter(Q(image_url='') | Q(image_url__isnull=True)).count()
        
        category_stats = {}
        for category, _ in Product.CATEGORY_CHOICES:
            category_stats[category] = Product.objects.filter(category=category).count()
        
        return Response({
            'totalProducts': total_products,
            'activeProducts': active_products,
            'inactiveProducts': inactive_products,
            'products3D': products_3d,
            'productsWithoutImage': products_without_image,
            'categoryStats': category_stats
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def verify_admin(request):
    """Verify if the current user is an admin"""
    return Response({'is_admin': True}, status=status.HTTP_200_OK)

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return Review.objects.filter(product_id=product_id, is_published=True).order_by('-created_at')

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        serializer.save(user=self.request.user, product_id=product_id)

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_list_products(request):
    """Debug endpoint to list all products"""
    products = Product.objects.all()
    return Response({
        'total_count': products.count(),
        'products': [
            {
                'id': str(product.id),
                'name': product.name,
                'is_active': product.is_active,
                'created_at': product.created_at.isoformat()
            }
            for product in products
        ]
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_get_product(request, product_id):
    """Debug endpoint to get a specific product"""
    try:
        product = Product.objects.get(id=product_id)
        return Response(ProductSerializer(product).data)
    except Product.DoesNotExist:
        return Response({
            'error': 'Product not found',
            'product_id': product_id,
            'available_products': [
                str(p.id) for p in Product.objects.all()[:5]
            ]
        }, status=404)
