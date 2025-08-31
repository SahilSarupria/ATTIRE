import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os
from django.conf import settings
from .models import Fabric, PricingFactor, ClothingComplexity
import logging
from decimal import Decimal
from typing import List, Dict, Optional, Tuple

logger = logging.getLogger(__name__)

class FabricPricingService:
    """
    Service for fabric recommendations and pricing calculations
    ONLY for AI-generated items, not regular products
    """
    
    def __init__(self):
        self.pricing_factor = self._get_active_pricing_factor()
        self.pricing_model = None
        self.scaler = None
        # Don't load ML model on init - use rule-based pricing first
        logger.info("✓ Fabric Pricing Service initialized with rule-based pricing")
    
    def _get_active_pricing_factor(self) -> Optional[PricingFactor]:
        """Get the active pricing factor"""
        try:
            return PricingFactor.objects.filter(is_active=True).first()
        except Exception as e:
            logger.warning(f"Could not load pricing factors: {e}")
            return None
    
    def predict_price(self, fabric: Fabric, clothing_type: str, design_complexity_data: Optional[Dict] = None) -> Decimal:
        """
        Predict price for AI-generated clothing item with specific fabric
        Uses rule-based calculation (no ML model required)
        """
        try:
            # Get complexity data
            complexity = self._get_clothing_complexity(clothing_type)
            if not complexity:
                # Fallback complexity
                complexity_score = Decimal('1.5')
                labor_hours = Decimal('3.0')
                fabric_yards = Decimal('2.0')
            else:
                complexity_score = complexity.base_complexity_score
                labor_hours = complexity.labor_hours
                fabric_yards = complexity.fabric_yards_needed
            
            # Base calculations
            fabric_cost = fabric.cost_per_yard * fabric_yards * fabric.premium_multiplier
            
            # Labor cost
            base_labor = self.pricing_factor.base_labor_cost if self.pricing_factor else Decimal('15.00')
            labor_cost = base_labor * labor_hours * complexity_score
            
            # Apply skill multiplier
            if complexity and complexity.skill_level_required == 'advanced':
                labor_cost *= Decimal('1.3')
            elif complexity and complexity.skill_level_required == 'expert':
                labor_cost *= Decimal('1.6')
            
            # Base price
            base_price = fabric_cost + labor_cost
            
            # Add overhead
            overhead_rate = self.pricing_factor.overhead_percentage / 100 if self.pricing_factor else Decimal('0.25')
            price_with_overhead = base_price * (1 + overhead_rate)
            
            # Add profit margin
            profit_rate = self.pricing_factor.profit_margin_percentage / 100 if self.pricing_factor else Decimal('0.40')
            final_price = price_with_overhead * (1 + profit_rate)
            
            # Apply premium multipliers
            if fabric.is_premium:
                final_price *= Decimal('1.2')
            
            if fabric.is_sustainable:
                final_price *= Decimal('1.1')
            
            # Market adjustments
            if self.pricing_factor:
                final_price *= self.pricing_factor.market_demand_multiplier
                final_price *= self.pricing_factor.seasonal_adjustment
            
            # Round to reasonable price
            return round(final_price, 2)
            
        except Exception as e:
            logger.error(f"Error predicting price: {e}")
            # Fallback pricing
            return fabric.cost_per_yard * Decimal('3.0')
    
    def get_fabric_recommendations(self, clothing_type: str, budget_range: Optional[Tuple[float, float]] = None) -> List[Dict]:
        """
        Get fabric recommendations for AI-generated clothing items
        """
        try:
            # Get suitable fabrics for this clothing type
            suitable_fabrics = self._get_suitable_fabrics_for_type(clothing_type)
            
            if budget_range:
                min_budget, max_budget = budget_range
                # Filter by estimated price range
                filtered_fabrics = []
                for fabric in suitable_fabrics:
                    estimated_price = self.predict_price(fabric, clothing_type)
                    if min_budget <= estimated_price <= max_budget:
                        filtered_fabrics.append(fabric)
                suitable_fabrics = filtered_fabrics
            
            # Calculate recommendations with scores
            recommendations = []
            for fabric in suitable_fabrics[:8]:  # Limit to top 8
                estimated_price = self.predict_price(fabric, clothing_type)
                score = self._calculate_recommendation_score(fabric, clothing_type)
                
                recommendations.append({
                    'fabric': fabric,
                    'estimated_price': estimated_price,
                    'price_per_yard': fabric.cost_per_yard,
                    'score': score
                })
            
            # Sort by recommendation score
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            return recommendations[:5]  # Return top 5
            
        except Exception as e:
            logger.error(f"Error getting fabric recommendations: {e}")
            return []
    
    def _get_suitable_fabrics_for_type(self, clothing_type: str) -> List[Fabric]:
        """Get fabrics suitable for specific clothing type"""
        
        # Define fabric suitability mapping
        fabric_mapping = {
            'T-Shirt/Top': ['cotton', 'jersey', 'bamboo', 'modal'],
            'Patterned Shirt': ['cotton', 'linen', 'silk', 'rayon'],
            'Pants/Jeans': ['denim', 'twill', 'cotton', 'canvas'],
            'Long Pants/Trousers': ['wool', 'cotton', 'linen', 'twill'],
            'Jacket/Blazer': ['wool', 'cotton', 'linen', 'twill'],
            'Dress/Tunic': ['silk', 'cotton', 'rayon', 'chiffon', 'crepe'],
            'Long Dress/Gown': ['silk', 'chiffon', 'satin', 'crepe', 'velvet'],
            'Skirt/Shorts': ['cotton', 'linen', 'denim', 'twill'],
            'Sweater/Hoodie': ['cotton', 'wool', 'fleece', 'jersey'],
            'Footwear': ['leather', 'canvas', 'cotton'],
        }
        
        suitable_types = fabric_mapping.get(clothing_type, ['cotton', 'polyester'])
        
        return Fabric.objects.filter(
            fabric_type__in=suitable_types,
            is_active=True,
            stock_quantity__gt=0
        ).order_by('-sustainability_score', '-durability_score')
    
    def _get_clothing_complexity(self, clothing_type: str) -> Optional[ClothingComplexity]:
        """Get complexity data for clothing type"""
        try:
            return ClothingComplexity.objects.get(clothing_type=clothing_type)
        except ClothingComplexity.DoesNotExist:
            return None
    
    def _calculate_recommendation_score(self, fabric: Fabric, clothing_type: str) -> float:
        """Calculate recommendation score for fabric-clothing combination"""
        score = 0.0
        
        # Base suitability score
        suitable_fabrics = {
            'T-Shirt/Top': {'cotton': 0.9, 'jersey': 0.95, 'bamboo': 0.85},
            'Pants/Jeans': {'denim': 0.95, 'twill': 0.8, 'cotton': 0.7},
            'Jacket/Blazer': {'wool': 0.95, 'cotton': 0.8, 'linen': 0.75},
            'Dress/Tunic': {'silk': 0.9, 'cotton': 0.8, 'rayon': 0.85},
        }
        
        type_scores = suitable_fabrics.get(clothing_type, {})
        score += type_scores.get(fabric.fabric_type, 0.5) * 0.4
        
        # Quality scores
        score += float(fabric.durability_score) * 0.2
        score += float(fabric.comfort_score) * 0.2
        score += float(fabric.sustainability_score) * 0.1
        
        # Premium bonus
        if fabric.is_premium:
            score += 0.05
        
        # Sustainability bonus
        if fabric.is_sustainable:
            score += 0.05
        
        return min(score, 1.0)

# Global service instance
fabric_pricing_service = FabricPricingService()
