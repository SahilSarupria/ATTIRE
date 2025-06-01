// types.ts
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'employee';
}

export type RegisterPayload = {
  email: string;
  password: string;
  password_confirm: string;
};


export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
