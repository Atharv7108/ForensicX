import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, verifyToken, login as apiLogin, register as apiRegister, User, LoginRequest, RegisterRequest } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('forensicx_token');
      if (token) {
        // Verify token is still valid
        await verifyToken();
        // Get user data
        const userData = await getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('forensicx_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const authResponse = await apiLogin(credentials);
      
      // Store token
      localStorage.setItem('forensicx_token', authResponse.access_token);
      
      // Get user data
      const userData = await getCurrentUser();
      setUser(userData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Create account
      await apiRegister(userData);
      
      // Auto login after registration
      const loginResult = await login({
        email: userData.email,
        password: userData.password
      });
      
      return loginResult;
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.status === 400) {
        if (error.response.data?.detail?.includes('email')) {
          errorMessage = 'Email already registered.';
        } else if (error.response.data?.detail?.includes('username')) {
          errorMessage = 'Username already taken.';
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('forensicx_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}