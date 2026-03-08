import { create } from "zustand";

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  
  attemptLogin: (email: string, password: string) => Promise<boolean>;
  attemptSignup: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

//IMPORTANT: Replace with your actual IP address from ipconfig
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  attemptLogin: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    console.log("API_BASE_URL in app:", API_BASE_URL);
    console.log("Login URL:", `${API_BASE_URL}/users/login`);
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      set({ 
        isAuthenticated: true, 
        user: data.user,
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Login failed', 
        isLoading: false,
        isAuthenticated: false 
      });
      return false;
    }
  },

  attemptSignup: async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      
      set({ 
        isAuthenticated: true, 
        user: data,
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Signup failed', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async (): Promise<void> => {
    set({ 
      isAuthenticated: false, 
      user: null,
      error: null,
      isLoading: false
    });
  },
}));

export default useAuthStore;