export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}