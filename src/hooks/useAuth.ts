import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/types';
import * as api from '../services/api';

// Auth store state interface
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isInitialized: boolean;
}

// Auth store actions interface
interface AuthActions {
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name?: string) => Promise<User>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Combined store interface
interface AuthStore extends AuthState, AuthActions {}

// Create the auth store with Zustand
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      loading: false,
      isInitialized: false,

      // Actions
      login: async (email: string, password: string): Promise<User> => {
        set({ loading: true });
        
        try {
          console.log('🔐 Attempting login for:', email);
          
          // Call API login
          const apiUser = await api.login(email, password);
          
          // Create user object
          const user: User = {
            id: apiUser.id,
            username: apiUser.email.split('@')[0], // Extract username from email
            email: apiUser.email,
            displayName: apiUser.name || apiUser.email.split('@')[0],
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };

          // Update store
          set({ 
            user, 
            token: apiUser.token || null,
            loading: false 
          });

          console.log('✅ Login successful:', user);
          return user;

        } catch (error) {
          console.error('❌ Login failed:', error);
          set({ 
            user: null, 
            token: null, 
            loading: false 
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string): Promise<User> => {
        set({ loading: true });
        
        try {
          console.log('📝 Attempting registration for:', email);
          
          // Call API register
          const apiUser = await api.register(email, password, name);
          
          // Create user object
          const user: User = {
            id: apiUser.id,
            username: apiUser.email.split('@')[0],
            email: apiUser.email,
            displayName: apiUser.name || name || apiUser.email.split('@')[0],
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };

          // Update store
          set({ 
            user, 
            token: apiUser.token || null,
            loading: false 
          });

          console.log('✅ Registration successful:', user);
          return user;

        } catch (error) {
          console.error('❌ Registration failed:', error);
          set({ 
            user: null, 
            token: null, 
            loading: false 
          });
          throw error;
        }
      },

      logout: async (): Promise<void> => {
        set({ loading: true });
        
        try {
          console.log('🔓 Logging out user');
          
          // Call API logout (clears AsyncStorage token)
          await api.logout();
          
          // Clear store
          set({ 
            user: null, 
            token: null, 
            loading: false 
          });

          console.log('✅ Logout successful');

        } catch (error) {
          console.error('❌ Logout error:', error);
          
          // Force clear store even if API call fails
          set({ 
            user: null, 
            token: null, 
            loading: false 
          });
        }
      },

      setToken: (token: string): void => {
        console.log('🔑 Setting token manually');
        set({ token });
        
        // Also save to AsyncStorage
        AsyncStorage.setItem('userToken', token).catch((error) => {
          console.error('❌ Failed to save token to AsyncStorage:', error);
        });
      },

      setUser: (user: User | null): void => {
        console.log('👤 Setting user manually:', user?.email || 'null');
        set({ user });
      },

      setLoading: (loading: boolean): void => {
        set({ loading });
      },

      initialize: async (): Promise<void> => {
        if (get().isInitialized) {
          return;
        }

        set({ loading: true });
        
        try {
          console.log('🚀 Initializing auth store');
          
          // Check if user is authenticated
          const isAuth = await api.isAuthenticated();
          
          if (isAuth) {
            try {
              // Try to get user profile
              const apiUser = await api.getProfile();
              
              const user: User = {
                id: apiUser.id,
                username: apiUser.email.split('@')[0],
                email: apiUser.email,
                displayName: apiUser.name || apiUser.email.split('@')[0],
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              };

              // Get token from storage
              const token = await AsyncStorage.getItem('userToken');
              
              set({ 
                user, 
                token,
                loading: false,
                isInitialized: true 
              });

              console.log('✅ Auth initialized with user:', user.email);

            } catch (profileError) {
              console.warn('⚠️ Failed to load profile, clearing auth:', profileError);
              
              // Clear invalid auth state
              await api.logout();
              set({ 
                user: null, 
                token: null, 
                loading: false,
                isInitialized: true 
              });
            }
          } else {
            console.log('ℹ️ No valid authentication found');
            set({ 
              loading: false,
              isInitialized: true 
            });
          }

        } catch (error) {
          console.error('❌ Auth initialization failed:', error);
          set({ 
            user: null, 
            token: null, 
            loading: false,
            isInitialized: true 
          });
        }
      },

      refreshProfile: async (): Promise<void> => {
        const { token } = get();
        
        if (!token) {
          console.warn('⚠️ Cannot refresh profile: no token');
          return;
        }

        try {
          console.log('🔄 Refreshing user profile');
          
          const apiUser = await api.getProfile();
          
          const user: User = {
            id: apiUser.id,
            username: apiUser.email.split('@')[0],
            email: apiUser.email,
            displayName: apiUser.name || apiUser.email.split('@')[0],
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };

          set({ user });
          console.log('✅ Profile refreshed:', user.email);

        } catch (error) {
          console.error('❌ Profile refresh failed:', error);
          
          // If profile refresh fails due to auth, logout
          if (error.status === 401) {
            await get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
      // Handle rehydration
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('❌ Auth store rehydration failed:', error);
        } else {
          console.log('💾 Auth store rehydrated');
          
          // Initialize after rehydration
          if (state) {
            state.initialize();
          }
        }
      },
    }
  )
);

// Derived selectors for common use cases
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    // State
    user: store.user,
    token: store.token,
    loading: store.loading,
    isInitialized: store.isInitialized,
    
    // Computed values
    isAuthenticated: !!store.user && !!store.token,
    userName: store.user?.displayName || store.user?.username || 'Usuario',
    userEmail: store.user?.email,
    
    // Actions
    login: store.login,
    register: store.register,
    logout: store.logout,
    setToken: store.setToken,
    setUser: store.setUser,
    initialize: store.initialize,
    refreshProfile: store.refreshProfile,
  };
};

// Selector hooks for specific parts of state
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user && !!state.token);

// Action hooks
export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  setToken: state.setToken,
  setUser: state.setUser,
  initialize: state.initialize,
  refreshProfile: state.refreshProfile,
}));

// Utility function to initialize auth on app startup
export const initializeAuth = async (): Promise<void> => {
  const { initialize } = useAuthStore.getState();
  await initialize();
};

// Export the store for direct access if needed
export default useAuthStore;