import apiClient, { TokenManager } from './api-client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
  user: {
    id: string;
    username: string;
    role: 'super_admin' | 'rd_department' | 'other_department';
  };
}

export interface AuthUser {
  id: string;
  username: string;
  role: 'super_admin' | 'rd_department' | 'other_department';
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  static async logout(): Promise<void> {
    try {
      // Clear tokens from localStorage
      TokenManager.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken();
    return !!token;
  }

  static getCurrentUser(): AuthUser | null {
    const role = TokenManager.getUserRole();
    if (!role) return null;

    // In a real app, you might want to decode the JWT token to get user info
    // For now, we'll return a basic user object based on the stored role
    return {
      id: 'user-id', // This would come from JWT token
      username: 'user', // This would come from JWT token
      role: role as 'super_admin' | 'rd_department' | 'other_department',
    };
  }

  static hasRole(role: 'super_admin' | 'rd_department' | 'other_department'): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role === role;
  }
} 