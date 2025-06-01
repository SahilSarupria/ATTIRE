# FashionAI Django Backend

A complete Django REST API backend for the FashionAI custom clothing platform.

## Features

- **User Management**: Registration, authentication, profiles
- **Product Catalog**: AI-generated designs, variants, reviews
- **Shopping Cart**: Add/remove items, wishlist functionality
- **Order Management**: Complete order lifecycle with payment processing
- **Manufacturing Queue**: Track custom clothing production
- **Analytics**: Sales dashboard and product tracking
- **Admin Panel**: Django admin for managing all data

## Quick Start

1. **Setup Environment**:
   \`\`\`bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   \`\`\`

2. **Configure Settings**:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Database Setup**:
   \`\`\`bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   \`\`\`

4. **Run Server**:
   \`\`\`bash
   python manage.py runserver
   \`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - Get user profile

### Products
- `GET /api/products/` - List products
- `GET /api/products/{id}/` - Product detail
- `POST /api/products/generate-design/` - Generate AI design
- `POST /api/products/analyze-outfit/` - Analyze clothing image

### Cart
- `GET /api/cart/` - Get cart items
- `POST /api/cart/add/` - Add item to cart
- `DELETE /api/cart/remove/` - Remove item from cart

### Orders
- `GET /api/orders/` - List user orders
- `POST /api/orders/create/` - Create new order
- `GET /api/orders/{id}/` - Order details

### Manufacturing
- `GET /api/manufacturing/queue/` - Manufacturing queue
- `PATCH /api/manufacturing/queue/{id}/update/` - Update status

### Analytics
- `GET /api/analytics/sales-dashboard/` - Sales metrics
- `POST /api/analytics/track-view/` - Track product views

## Database

Uses SQLite by default for simplicity. The database includes:

- Users and addresses
- Products, variants, and reviews
- Shopping cart and wishlist
- Orders and order items
- Manufacturing queue
- Analytics tracking

## Admin Panel

Access the Django admin at `/admin/` to manage:
- Users and permissions
- Products and inventory
- Orders and manufacturing
- Analytics and reports

## Development

The backend is designed to work seamlessly with the Next.js frontend. All API endpoints return JSON and support CORS for local development.

## Production Deployment

For production:
1. Set `DEBUG=False` in settings
2. Configure proper database (PostgreSQL recommended)
3. Set up Redis for Celery (optional)
4. Configure email backend
5. Set up proper static file serving
