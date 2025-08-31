import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashionai.settings')
django.setup()

from products.models import Fabric, PricingFactor, ClothingComplexity

def populate_fabrics():
    """Populate the database with sample fabric data"""
    
    fabrics_data = [
        {
            'name': 'Premium Cotton Jersey',
            'fabric_type': 'cotton',
            'description': 'Soft, breathable cotton jersey perfect for casual wear',
            'cost_per_yard': 12.50,
            'premium_multiplier': 1.2,
            'durability_score': 0.8,
            'comfort_score': 0.9,
            'sustainability_score': 0.7,
            'weight_gsm': 180,
            'stretch_percentage': 15,
            'opacity_percentage': 95,
            'care_instructions': 'Machine wash cold, tumble dry low',
            'washing_temperature': 30,
            'is_premium': True,
            'is_sustainable': True,
            'stock_quantity': 500,
            'minimum_order_yards': 2.0,
            'supplier': 'EcoTextiles Inc.',
            'color_options': ['white', 'black', 'navy', 'gray', 'red'],
            'pattern_options': ['solid', 'heather']
        },
        {
            'name': 'Organic Bamboo Blend',
            'fabric_type': 'bamboo',
            'description': 'Eco-friendly bamboo blend with natural antibacterial properties',
            'cost_per_yard': 18.00,
            'premium_multiplier': 1.4,
            'durability_score': 0.7,
            'comfort_score': 0.95,
            'sustainability_score': 0.95,
            'weight_gsm': 160,
            'stretch_percentage': 20,
            'opacity_percentage': 90,
            'care_instructions': 'Machine wash cold, air dry recommended',
            'washing_temperature': 30,
            'is_premium': True,
            'is_sustainable': True,
            'stock_quantity': 300,
            'minimum_order_yards': 1.5,
            'supplier': 'Green Fiber Co.',
            'color_options': ['natural', 'charcoal', 'sage', 'blush'],
            'pattern_options': ['solid']
        },
        {
            'name': 'Classic Denim',
            'fabric_type': 'denim',
            'description': 'Traditional 100% cotton denim for jeans and jackets',
            'cost_per_yard': 15.75,
            'premium_multiplier': 1.1,
            'durability_score': 0.95,
            'comfort_score': 0.6,
            'sustainability_score': 0.5,
            'weight_gsm': 320,
            'stretch_percentage': 2,
            'opacity_percentage': 100,
            'care_instructions': 'Machine wash cold, tumble dry medium',
            'washing_temperature': 40,
            'is_premium': False,
            'is_sustainable': False,
            'stock_quantity': 800,
            'minimum_order_yards': 3.0,
            'supplier': 'Classic Denim Mills',
            'color_options': ['indigo', 'black', 'light blue', 'dark blue'],
            'pattern_options': ['solid', 'distressed']
        },
        {
            'name': 'Luxury Silk Charmeuse',
            'fabric_type': 'silk',
            'description': 'Premium silk with lustrous finish for elegant garments',
            'cost_per_yard': 45.00,
            'premium_multiplier': 2.0,
            'durability_score': 0.6,
            'comfort_score': 0.9,
            'sustainability_score': 0.8,
            'weight_gsm': 120,
            'stretch_percentage': 5,
            'opacity_percentage': 85,
            'care_instructions': 'Dry clean only',
            'washing_temperature': 0,
            'is_premium': True,
            'is_sustainable': True,
            'stock_quantity': 150,
            'minimum_order_yards': 1.0,
            'supplier': 'Silk Luxury Ltd.',
            'color_options': ['ivory', 'black', 'navy', 'burgundy', 'emerald'],
            'pattern_options': ['solid', 'jacquard']
        },
        {
            'name': 'Performance Polyester',
            'fabric_type': 'polyester',
            'description': 'Moisture-wicking polyester blend for activewear',
            'cost_per_yard': 8.50,
            'premium_multiplier': 1.0,
            'durability_score': 0.85,
            'comfort_score': 0.7,
            'sustainability_score': 0.3,
            'weight_gsm': 140,
            'stretch_percentage': 25,
            'opacity_percentage': 95,
            'care_instructions': 'Machine wash cold, tumble dry low',
            'washing_temperature': 30,
            'is_premium': False,
            'is_sustainable': False,
            'stock_quantity': 1000,
            'minimum_order_yards': 2.0,
            'supplier': 'SportsTech Fabrics',
            'color_options': ['black', 'white', 'navy', 'red', 'royal blue'],
            'pattern_options': ['solid', 'mesh']
        },
        {
            'name': 'Merino Wool Blend',
            'fabric_type': 'wool',
            'description': 'Soft merino wool blend perfect for sweaters and coats',
            'cost_per_yard': 32.00,
            'premium_multiplier': 1.6,
            'durability_score': 0.9,
            'comfort_score': 0.85,
            'sustainability_score': 0.8,
            'weight_gsm': 280,
            'stretch_percentage': 10,
            'opacity_percentage': 100,
            'care_instructions': 'Hand wash cold or dry clean',
            'washing_temperature': 20,
            'is_premium': True,
            'is_sustainable': True,
            'stock_quantity': 200,
            'minimum_order_yards': 2.5,
            'supplier': 'Alpine Wool Co.',
            'color_options': ['charcoal', 'cream', 'camel', 'forest', 'burgundy'],
            'pattern_options': ['solid', 'cable knit']
        },
        {
            'name': 'Linen Canvas',
            'fabric_type': 'linen',
            'description': 'Natural linen canvas for summer clothing and accessories',
            'cost_per_yard': 22.00,
            'premium_multiplier': 1.3,
            'durability_score': 0.8,
            'comfort_score': 0.8,
            'sustainability_score': 0.9,
            'weight_gsm': 220,
            'stretch_percentage': 3,
            'opacity_percentage': 90,
            'care_instructions': 'Machine wash cold, air dry',
            'washing_temperature': 30,
            'is_premium': True,
            'is_sustainable': True,
            'stock_quantity': 400,
            'minimum_order_yards': 2.0,
            'supplier': 'Natural Linen Mills',
            'color_options': ['natural', 'white', 'navy', 'olive', 'rust'],
            'pattern_options': ['solid', 'striped']
        },
        {
            'name': 'Stretch Twill',
            'fabric_type': 'twill',
            'description': 'Cotton twill with elastane for comfortable pants and skirts',
            'cost_per_yard': 14.25,
            'premium_multiplier': 1.1,
            'durability_score': 0.85,
            'comfort_score': 0.8,
            'sustainability_score': 0.6,
            'weight_gsm': 240,
            'stretch_percentage': 12,
            'opacity_percentage': 100,
            'care_instructions': 'Machine wash warm, tumble dry low',
            'washing_temperature': 40,
            'is_premium': False,
            'is_sustainable': False,
            'stock_quantity': 600,
            'minimum_order_yards': 2.5,
            'supplier': 'Comfort Textiles',
            'color_options': ['khaki', 'black', 'navy', 'olive', 'burgundy'],
            'pattern_options': ['solid']
        }
    ]
    
    print("Creating fabric records...")
    for fabric_data in fabrics_data:
        fabric, created = Fabric.objects.get_or_create(
            name=fabric_data['name'],
            defaults=fabric_data
        )
        if created:
            print(f"✓ Created fabric: {fabric.name}")
        else:
            print(f"- Fabric already exists: {fabric.name}")

def populate_pricing_factors():
    """Populate pricing factors"""
    
    pricing_data = {
        'name': 'Default Pricing Model',
        'base_labor_cost': 18.50,
        'skilled_labor_multiplier': 1.8,
        'overhead_percentage': 28.0,
        'profit_margin_percentage': 45.0,
        'market_demand_multiplier': 1.1,
        'seasonal_adjustment': 1.0,
        'premium_design_multiplier': 1.4,
        'custom_fit_multiplier': 1.5,
        'is_active': True
    }
    
    pricing_factor, created = PricingFactor.objects.get_or_create(
        name=pricing_data['name'],
        defaults=pricing_data
    )
    
    if created:
        print(f"✓ Created pricing factor: {pricing_factor.name}")
    else:
        print(f"- Pricing factor already exists: {pricing_factor.name}")

def populate_clothing_complexity():
    """Populate clothing complexity data"""
    
    complexity_data = [
        {
            'clothing_type': 'T-Shirt/Top',
            'base_complexity_score': 1.0,
            'labor_hours': 2.5,
            'fabric_yards_needed': 1.5,
            'skill_level_required': 'beginner',
            'seam_count': 8,
            'button_count': 0,
            'zipper_count': 0,
            'pocket_count': 0,
            'requires_lining': False,
            'requires_interfacing': False,
            'requires_special_tools': False,
            'description': 'Basic t-shirt construction with minimal complexity'
        },
        {
            'clothing_type': 'Patterned Shirt',
            'base_complexity_score': 1.8,
            'labor_hours': 4.0,
            'fabric_yards_needed': 2.5,
            'skill_level_required': 'intermediate',
            'seam_count': 15,
            'button_count': 8,
            'zipper_count': 0,
            'pocket_count': 1,
            'requires_lining': False,
            'requires_interfacing': True,
            'requires_special_tools': False,
            'description': 'Button-up shirt with collar and cuffs'
        },
        {
            'clothing_type': 'Pants/Jeans',
            'base_complexity_score': 2.2,
            'labor_hours': 5.5,
            'fabric_yards_needed': 3.0,
            'skill_level_required': 'intermediate',
            'seam_count': 20,
            'button_count': 1,
            'zipper_count': 1,
            'pocket_count': 5,
            'requires_lining': False,
            'requires_interfacing': True,
            'requires_special_tools': True,
            'description': 'Full pants construction with pockets and waistband'
        },
        {
            'clothing_type': 'Jacket/Blazer',
            'base_complexity_score': 4.0,
            'labor_hours': 12.0,
            'fabric_yards_needed': 4.5,
            'skill_level_required': 'advanced',
            'seam_count': 35,
            'button_count': 4,
            'zipper_count': 0,
            'pocket_count': 4,
            'requires_lining': True,
            'requires_interfacing': True,
            'requires_special_tools': True,
            'description': 'Structured jacket with lining and multiple construction details'
        },
        {
            'clothing_type': 'Dress/Tunic',
            'base_complexity_score': 2.8,
            'labor_hours': 7.0,
            'fabric_yards_needed': 3.5,
            'skill_level_required': 'intermediate',
            'seam_count': 18,
            'button_count': 0,
            'zipper_count': 1,
            'pocket_count': 0,
            'requires_lining': False,
            'requires_interfacing': True,
            'requires_special_tools': False,
            'description': 'Fitted dress with zipper closure'
        },
        {
            'clothing_type': 'Skirt/Shorts',
            'base_complexity_score': 1.5,
            'labor_hours': 3.5,
            'fabric_yards_needed': 2.0,
            'skill_level_required': 'beginner',
            'seam_count': 12,
            'button_count': 1,
            'zipper_count': 1,
            'pocket_count': 2,
            'requires_lining': False,
            'requires_interfacing': True,
            'requires_special_tools': False,
            'description': 'Basic skirt or shorts with waistband'
        },
        {
            'clothing_type': 'Footwear',
            'base_complexity_score': 5.0,
            'labor_hours': 15.0,
            'fabric_yards_needed': 2.0,
            'skill_level_required': 'expert',
            'seam_count': 25,
            'button_count': 0,
            'zipper_count': 0,
            'pocket_count': 0,
            'requires_lining': True,
            'requires_interfacing': False,
            'requires_special_tools': True,
            'description': 'Shoe construction requiring specialized tools and techniques'
        }
    ]
    
    print("Creating clothing complexity records...")
    for complexity in complexity_data:
        obj, created = ClothingComplexity.objects.get_or_create(
            clothing_type=complexity['clothing_type'],
            defaults=complexity
        )
        if created:
            print(f"✓ Created complexity: {obj.clothing_type}")
        else:
            print(f"- Complexity already exists: {obj.clothing_type}")

def main():
    """Main function to populate all fabric and pricing data"""
    print("🧵 Populating Fabric and Pricing Database...")
    print("=" * 50)
    
    try:
        populate_fabrics()
        print()
        populate_pricing_factors()
        print()
        populate_clothing_complexity()
        print()
        print("✅ Database population completed successfully!")
        print(f"📊 Total fabrics: {Fabric.objects.count()}")
        print(f"📊 Total pricing factors: {PricingFactor.objects.count()}")
        print(f"📊 Total complexity records: {ClothingComplexity.objects.count()}")
        
    except Exception as e:
        print(f"❌ Error populating database: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    main()
