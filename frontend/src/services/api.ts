import axios from "axios";

const API_BASE_URL = "http://localhost:8001"; // Backend is running on port 8001

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('forensicx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  total_detections: number;
  monthly_detections: number;
  plan_type: string;
}

// Detection interfaces (existing)

export interface TextDetectionResponse {
  label: string;
  confidence: number;
  highlights: Array<{
    start: number;
    end: number;
    type: string;
    confidence: number;
  }>;
  ai_percentage: number;
}

export interface ImageDetectionResponse {
  image_result: {
    label: string;
    confidence: number | null;
    note?: string;
  };
  text_result: {
    label: string;
    confidence: number;
    text: string;
  } | null;
}

export interface PdfDetectionResponse {
  text_result: {
    label: string;
    confidence: number;
    highlights: Array<{
      start: number;
      end: number;
      type: string;
      confidence: number;
    }>;
    ai_percentage: number;
  } | null;
  images: Array<{
    page: number;
    img_index: number;
    image_label: string;
    image_confidence: number;
    ocr_text: string;
    text_result: {
      label: string;
      confidence: number;
      text: string;
    } | null;
  }>;
  extracted_text: string;
}

// Authentication API functions
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await api.post("/auth/login-json", credentials);
  return response.data;
}

export async function register(userData: RegisterRequest): Promise<User> {
  const response = await api.post("/auth/register", userData);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function verifyToken(): Promise<{ valid: boolean; user_id: number; email: string }> {
  const response = await api.get("/auth/verify-token");
  return response.data;
}

// Detection API functions (existing)
export async function detectText(text: string): Promise<TextDetectionResponse> {
  const response = await api.post("/detect-text", { text });
  return response.data;
}

export async function detectImage(file: File): Promise<ImageDetectionResponse> {
  const formData = new FormData();
  formData.append("file", file);
  // Use the original protected endpoint
  const response = await api.post("/detect-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function detectPdf(file: File): Promise<PdfDetectionResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/detect-pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

// Razorpay payment API functions
export async function createRazorpayOrder(amount: number, plan: 'pro' | 'plus', token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, plan }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${res.status}: Failed to create payment order`);
    }
    
    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Unable to connect to payment service');
  }
}

export async function verifyRazorpayPayment(
  payment_id: string,
  order_id: string,
  signature: string,
  token: string
) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        razorpay_payment_id: payment_id,
        razorpay_order_id: order_id,
        razorpay_signature: signature,
      }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${res.status}: Payment verification failed`);
    }
    
    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Unable to verify payment');
  }
}
