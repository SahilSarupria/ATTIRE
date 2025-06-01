import type { AuthResponse, User, RegisterPayload } from '@/types';

export const authService = {
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await fetch('http://localhost:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // send & receive cookies
    });

    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await fetch('http://localhost:8000/api/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      const error = new Error('Registration failed');
      (error as any).response = { data: errorData };
      throw error;
    }
    return res.json();
  },

  logout: async (): Promise<void> => {
    const res = await fetch('http://localhost:8000/api/auth/logout/', {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Logout failed');
  },

  refreshToken: async (): Promise<void> => {
  const res = await fetch('http://localhost:8000/api/auth/token/refresh/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}), // Send empty JSON body or "{}"
  });

  if (!res.ok) {
    throw new Error('Failed to refresh token');
  }
  // No need to read body since tokens are in httpOnly cookies
},


  getProfile: async (): Promise<User> => {
    return fetchWithRefresh('http://localhost:8000/api/auth/profile/');
  },

  // Add more authenticated API calls here with fetchWithRefresh...
};

// Helper function for requests that need token refresh
async function fetchWithRefresh(url: string, options: RequestInit = {}) {
  options.credentials = 'include'; // always send cookies

  let response = await fetch(url, options);

  if (response.status === 401) {
    // Try to refresh token and retry once
    try {
      await authService.refreshToken();
      response = await fetch(url, options);
    } catch (error) {
      throw new Error('Not authenticated');
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}
