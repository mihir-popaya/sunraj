export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: AdminUser;
  accessToken: string;
}