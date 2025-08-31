// Token management
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Base API request function
// lib/api.ts or wherever apiRequest is defined
export async function apiRequest(url: string, options?: RequestInit) {
  try {
    // Get token from localStorage (or wherever you store it)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Set up headers, including Authorization if token exists
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Token ${token}` } : {}),
    };

    // Merge headers with any passed in options.headers
    const finalHeaders = {
      ...headers,
      ...(options?.headers || {}),
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      credentials: 'include',  // if you use cookies/session
      ...options,
      headers: finalHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
      const firstKey = Object.keys(data)[0];
      const errorMessage = Array.isArray(data[firstKey])
        ? data[firstKey][0]
        : data[firstKey];

      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    // Re-throw the message for use in your catch block
    throw new Error(error.message || "Something went wrong");
  }
}


// Auth services
export const authService = {
  register: (userData: any) => 
    apiRequest('/api/auth/register/', { method: 'POST', body: JSON.stringify(userData) }),
  
  login: (credentials: { email: string; password: string }) => 
    apiRequest('/api/auth/login/', { method: 'POST', body: JSON.stringify(credentials) }),
  
  getProfile: () => 
    apiRequest('/api/auth/profile/'),
};

// Product services
export const productService = {
  getProducts: (params = '') => 
    apiRequest(`/api/products/${params}`),
  
  getProduct: (id: string) => 
    apiRequest(`/api/products/${id}/`),
  
  getProductReviews: (id: string) => 
    apiRequest(`/api/products/${id}/reviews/`),
  
  createReview: (productId: string, reviewData: any) => 
    apiRequest(`/api/products/${productId}/reviews/`, { method: 'POST', body: JSON.stringify(reviewData) }),
  
  generateDesign: (data: any) => 
    apiRequest('/api/products/generate-design/', { method: 'POST', body: JSON.stringify(data) }),
};

// Cart services
export const cartService = {
  getCart: () => 
    apiRequest('/api/cart/'),
  
  addToCart: (productData: any) => 
    apiRequest('/api/cart/add/', { method: 'POST', body: JSON.stringify(productData) }),
  
  updateCartItem: (itemId: string, quantity: number) => 
    apiRequest(`/api/cart/${itemId}/update/`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  
  removeFromCart: (itemId: string) => 
    apiRequest(`/api/cart/remove/?itemId=${itemId}`, { method: 'DELETE' }),
  
  clearCart: () => 
    apiRequest('/api/cart/clear/', { method: 'DELETE' }),
  
  getWishlist: () => 
    apiRequest('/api/cart/wishlist/'),
  
  addToWishlist: (productId: string) => 
    apiRequest('/api/cart/wishlist/add/', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),
  
  removeFromWishlist: (itemId: string) => 
    apiRequest(`/api/cart/wishlist/${itemId}/remove/`, { method: 'DELETE' }),
};

// Order services
export const orderService = {
  getOrders: () => 
    apiRequest('/api/orders/'),
  
  getOrder: (orderId: string) => 
    apiRequest(`/api/orders/${orderId}/`),
  
  createOrder: (orderData: any) => 
    apiRequest('/api/orders/create/', { method: 'POST', body: JSON.stringify(orderData) }),
  
  cancelOrder: (orderId: string) => 
    apiRequest(`/api/orders/${orderId}/cancel/`, { method: 'POST' }),
};