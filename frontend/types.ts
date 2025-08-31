// types.ts
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'employee';
  is_staff: boolean;
}

export type RegisterPayload = {
  email: string;
  password: string;
  password_confirm: string;
};

// types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  base_price: string;
  category: string;
  fabric: string;
  color: string;
  is_active: boolean;
  is_3d: boolean;
  created_by_name?: string;
  average_rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  price: string;
  inventory: number;
  is_active: boolean;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  is_verified_purchase: boolean;
  created_at: string;
  user_name?: string;
}


export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// types/order.ts
export interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at: string;
  items: {
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
}
