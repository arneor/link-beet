/**
 * Mark Morph API Client
 * Centralized API configuration for NestJS backend integration
 */

// API Base URL
export const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api"
  : "/api";

// Token storage key
const TOKEN_KEY = "mm_auth_token";
const USER_KEY = "mm_user";

// Types for API responses
export interface User {
  id: string;
  email?: string;
  role: "admin" | "business" | "user";
  name?: string;
  isVerified: boolean;
  businessId?: string;
}

export interface Business {
  id: string;
  businessName: string;
  ownerId: string;
  location?: string;
  category?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  primaryColor: string;
  wifiSsid?: string;
  googleReviewUrl?: string;
  operatingHours?: Record<string, string>;
  profileType: "private" | "public";
  onboardingCompleted: boolean;
  isActive: boolean;
  ads: Ad[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Ad {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  ctaUrl?: string;
  title: string;
  description?: string;
  duration: number;
  status: "active" | "paused" | "archived";
  views: number;
  clicks: number;
  createdAt?: string;
}

export interface DashboardStats {
  totalConnections: number;
  activeUsers: number;
  totalAdsServed: number;
  totalViews: number;
  totalClicks: number;
  ctr: number;
  revenue: number;
  connectionsHistory: Array<{ date: string; count: number }>;
}

export interface AdminStats {
  totalBusinesses: number;
  totalConnections: number;
  totalActiveCampaigns: number;
  totalEmailsCollected: number;
  growthRate?: number;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Token management
export const tokenStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

// API error class
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// HTTP client with auth headers
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = tokenStorage.getToken();

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - clear token and redirect
  if (response.status === 401) {
    tokenStorage.removeToken();
    // Optionally redirect to login
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/splash")
    ) {
      window.location.href = "/";
    }
  }

  return response;
}

// Generic API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    const errorData = isJson ? await response.json() : await response.text();
    throw new ApiError(
      response.status,
      errorData.message || errorData || "Request failed",
      errorData,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (isJson ? response.json() : response.text()) as Promise<T>;
}

// ===== AUTH API =====
export const authApi = {
  async signup(data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async verifyOtp(
    email: string,
    otp: string,
    macAddress?: string,
  ): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, macAddress }),
    });

    // Store token and user
    tokenStorage.setToken(response.accessToken);
    tokenStorage.setUser(response.user);

    return response;
  },

  async getMe(): Promise<User> {
    return apiRequest("/auth/me");
  },

  logout(): void {
    tokenStorage.removeToken();
  },
};

// ===== BUSINESS API =====
export const businessApi = {
  async register(data: {
    businessName: string;
    location?: string;
    category?: string;
    contactEmail?: string;
    contactPhone?: string;
  }): Promise<Business> {
    return apiRequest("/business/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMyBusiness(): Promise<Business | null> {
    try {
      return await apiRequest<Business>("/business/me");
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Business> {
    return apiRequest(`/business/${id}`);
  },

  async update(id: string, data: Partial<Business>): Promise<Business> {
    return apiRequest(`/business/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async getDashboardStats(id: string): Promise<DashboardStats> {
    return apiRequest(`/business/dashboard/${id}`);
  },

  async getSplashData(id: string): Promise<{
    business: {
      id: string;
      name: string;
      logoUrl?: string;
      primaryColor?: string;
      googleReviewUrl?: string;
    };
    ads: Array<{
      id: string;
      title: string;
      mediaUrl: string;
      mediaType: "image" | "video";
      ctaUrl?: string;
      duration: number;
    }>;
  }> {
    return apiRequest(`/business/splash/${id}`);
  },
};

// ===== ADS API =====
export const adsApi = {
  async getByBusiness(businessId: string): Promise<Ad[]> {
    return apiRequest(`/ads/business/${businessId}`);
  },

  async create(
    businessId: string,
    data: {
      title: string;
      mediaUrl: string;
      mediaType: "image" | "video";
      ctaUrl?: string;
      description?: string;
      duration?: number;
    },
  ): Promise<Ad> {
    return apiRequest(`/ads/business/${businessId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(
    businessId: string,
    adId: string,
    data: Partial<Ad>,
  ): Promise<Ad> {
    return apiRequest(`/ads/business/${businessId}/${adId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(businessId: string, adId: string): Promise<void> {
    return apiRequest(`/ads/business/${businessId}/${adId}`, {
      method: "DELETE",
    });
  },

  async uploadMedia(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest("/ads/upload", {
      method: "POST",
      body: formData,
    });
  },
};

// ===== ANALYTICS API =====
export const analyticsApi = {
  async trackInteraction(data: {
    adId: string;
    businessId: string;
    interactionType: "view" | "click";
    userId?: string;
    macAddress?: string;
    deviceType?: string;
    sessionId?: string;
  }): Promise<{ success: boolean; redirectUrl?: string }> {
    return apiRequest("/analytics/track", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async connectWifi(data: {
    businessId: string;
    macAddress?: string;
    deviceType?: string;
    email?: string;
  }): Promise<{ success: boolean; redirectUrl: string }> {
    return apiRequest("/analytics/connect", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getSummary(
    businessId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalViews: number;
    totalClicks: number;
    ctr: number;
    uniqueUsers: number;
    startDate: string;
    endDate: string;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/analytics/summary/${businessId}${query}`);
  },

  async getDailyAnalytics(
    businessId: string,
    days?: number,
  ): Promise<
    Array<{
      date: string;
      views: number;
      clicks: number;
    }>
  > {
    const query = days ? `?days=${days}` : "";
    return apiRequest(`/analytics/daily/${businessId}${query}`);
  },
};

// ===== ADMIN API =====
export const adminApi = {
  async getStats(): Promise<AdminStats> {
    return apiRequest("/admin/stats");
  },

  async getBusinesses(): Promise<
    Array<{
      id: string;
      businessName: string;
      ownerPhone?: string;
      location?: string;
      category?: string;
      adsCount: number;
      connectionCount: number;
      isActive: boolean;
      createdAt: string;
    }>
  > {
    return apiRequest("/admin/businesses");
  },

  async getConnectionCount(): Promise<{ totalConnections: number }> {
    return apiRequest("/admin/connections/count");
  },
};

// ===== HEALTH API =====
export const healthApi = {
  async check(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
  }> {
    return apiRequest("/health");
  },
};
