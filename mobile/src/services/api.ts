import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  Stop, 
  Puzzle, 
  Reward, 
  ApiResponse 
} from '../types/types';

// API Configuration
const API_BASE_URL = 'http://87.106.104.30:3001/api'; // Your VPS backend
// For local development, uncomment the line below:
// const API_BASE_URL = 'http://localhost:5000/api';

// Extended types for API responses (based on your requirements)
export interface Route {
  id: string;
  slug: string;
  name: string;
  stops: Stop[];
}

export interface Progress {
  id: string;
  completedStops: string[];
  seals: string[];
  points: number;
}

export interface LeaderboardEntry {
  user: string;
  points: number;
  seals: number;
}

// API User interface (simplified for API responses)
export interface APIUser {
  id: string;
  email: string;
  name?: string;
  token?: string;
}

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15 seconds timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add JWT token
  client.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request for debugging
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data,
        });
        
        return config;
      } catch (error) {
        console.error('❌ Error adding token to request:', error);
        return config;
      }
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
      });
      return response;
    },
    async (error) => {
      console.error(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url}`, {
        message: error.message,
        response: error.response?.data,
      });

      // Handle token expiration (401 Unauthorized)
      if (error.response?.status === 401) {
        try {
          await AsyncStorage.removeItem('userToken');
          console.log('🔓 Token removed due to 401 error');
        } catch (storageError) {
          console.error('❌ Error removing token:', storageError);
        }
      }

      // Transform error for consistent handling
      const apiError = {
        message: error.response?.data?.message || error.message || 'Network error',
        status: error.response?.status || 0,
        code: error.response?.data?.code || 'NETWORK_ERROR',
        details: error.response?.data?.details || null,
      };

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Create the API client instance
const apiClient = createApiClient();

/**
 * Register a new user account
 */
export const register = async (
  email: string, 
  password: string, 
  name?: string
): Promise<APIUser> => {
  try {
    const response = await apiClient.post('/auth/register', {
      email: email.toLowerCase().trim(),
      password,
      name: name?.trim(),
    });

    const userData = response.data.data || response.data;
    
    // Store token if provided
    if (userData.token) {
      await AsyncStorage.setItem('userToken', userData.token);
      console.log('💾 Token stored for new user');
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      token: userData.token,
    };
  } catch (error) {
    console.error('❌ Registration failed:', error);
    throw error;
  }
};

/**
 * Login with existing user credentials
 */
export const login = async (
  email: string, 
  password: string
): Promise<APIUser> => {
  try {
    const response = await apiClient.post('/auth/login', {
      email: email.toLowerCase().trim(),
      password,
    });

    const userData = response.data.data || response.data;
    
    // Store token
    if (userData.token) {
      await AsyncStorage.setItem('userToken', userData.token);
      console.log('💾 Token stored for logged in user');
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      token: userData.token,
    };
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
};

/**
 * Get route information by slug
 */
export const getRoute = async (slug: string): Promise<Route> => {
  try {
    const response = await apiClient.get(`/routes/${slug}`);
    const routeData = response.data.data || response.data;

    return {
      id: routeData.id,
      slug: routeData.slug,
      name: routeData.name,
      stops: routeData.stops || [],
    };
  } catch (error) {
    console.error(`❌ Failed to get route ${slug}:`, error);
    throw error;
  }
};

/**
 * Complete a stop in a route
 */
export const completeStop = async (
  routeSlug: string,
  stopSlug: string,
  userLat: number,
  userLng: number
): Promise<Progress> => {
  try {
    const response = await apiClient.post('/progress/complete', {
      routeSlug,
      stopSlug,
      userLocation: {
        lat: userLat,
        lng: userLng,
      },
      completedAt: new Date().toISOString(),
    });

    const progressData = response.data.data || response.data;

    return {
      id: progressData.id,
      completedStops: progressData.completedStops || [],
      seals: progressData.seals || [],
      points: progressData.points || 0,
    };
  } catch (error) {
    console.error(`❌ Failed to complete stop ${stopSlug} in route ${routeSlug}:`, error);
    throw error;
  }
};

/**
 * Get leaderboard for a specific route
 */
export const getLeaderboard = async (slug: string): Promise<LeaderboardEntry[]> => {
  try {
    const response = await apiClient.get(`/leaderboard/${slug}`);
    const leaderboardData = response.data.data || response.data;

    // Ensure we return an array
    if (Array.isArray(leaderboardData)) {
      return leaderboardData.map((entry: any) => ({
        user: entry.user || entry.username || entry.name || 'Anonymous',
        points: entry.points || 0,
        seals: entry.seals || entry.sealsCount || 0,
      }));
    }

    return [];
  } catch (error) {
    console.error(`❌ Failed to get leaderboard for route ${slug}:`, error);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<APIUser> => {
  try {
    const response = await apiClient.get('/auth/profile');
    const userData = response.data.data || response.data;

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
    };
  } catch (error) {
    console.error('❌ Failed to get user profile:', error);
    throw error;
  }
};

/**
 * Get user progress for a specific route
 */
export const getProgress = async (routeSlug: string): Promise<Progress> => {
  try {
    const response = await apiClient.get(`/progress/${routeSlug}`);
    const progressData = response.data.data || response.data;

    return {
      id: progressData.id,
      completedStops: progressData.completedStops || [],
      seals: progressData.seals || [],
      points: progressData.points || 0,
    };
  } catch (error) {
    console.error(`❌ Failed to get progress for route ${routeSlug}:`, error);
    throw error;
  }
};

/**
 * Logout user (clear local token)
 */
export const logout = async (): Promise<void> => {
  try {
    // Optionally notify backend about logout
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('⚠️ Backend logout failed (continuing with local logout):', error);
    }

    // Clear local token
    await AsyncStorage.removeItem('userToken');
    console.log('🔓 User logged out, token cleared');
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  } catch (error) {
    console.error('❌ Error checking authentication:', error);
    return false;
  }
};

/**
 * Refresh user token
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await apiClient.post('/auth/refresh');
    const tokenData = response.data.data || response.data;

    if (tokenData.token) {
      await AsyncStorage.setItem('userToken', tokenData.token);
      console.log('🔄 Token refreshed successfully');
      return tokenData.token;
    }

    return null;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return null;
  }
};

/**
 * Upload user avatar/profile image
 */
export const uploadAvatar = async (imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await apiClient.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const avatarData = response.data.data || response.data;
    return avatarData.avatarUrl || avatarData.url;
  } catch (error) {
    console.error('❌ Avatar upload failed:', error);
    throw error;
  }
};

// Export the API client instance for advanced usage
export { apiClient };

// Export all functions for use in screens and stores
export {
  // Auth functions
  login,
  register,
  logout,
  getProfile,
  isAuthenticated,
  refreshToken,
  uploadAvatar,
  
  // Route functions
  getRoute,
  getProgress,
  completeStop,
  
  // Social functions
  getLeaderboard,
};

// Default export for convenience
export default {
  auth: {
    login,
    register,
    logout,
    getProfile,
    isAuthenticated,
    refreshToken,
    uploadAvatar,
  },
  routes: {
    getRoute,
    getProgress,
    completeStop,
  },
  social: {
    getLeaderboard,
  },
  client: apiClient,
};