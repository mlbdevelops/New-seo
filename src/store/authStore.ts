import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth, getUserProfile, signUp as firebaseSignUp, signIn as firebaseSignIn, signOut as firebaseSignOut, incrementUsageCount, onAuthStateChange } from '../lib/firebase';
import type { UserProfile } from '../lib/firebase';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  incrementUsage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  loading: false,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    
    try {
      const { data, error } = await firebaseSignIn(email, password);
      
      if (!error && data.user) {
        // Wait a moment for any database operations to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: profile } = await getUserProfile();
        set({ user: data.user, userProfile: profile, loading: false });
      } else {
        set({ loading: false });
      }
      
      return { error };
    } catch (err) {
      set({ loading: false });
      return { error: err };
    }
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    set({ loading: true });
    
    try {
      const { data, error } = await firebaseSignUp(email, password, fullName);
      
      if (!error && data.user) {
        // Wait for the user profile to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch the newly created user profile
        const { data: profile } = await getUserProfile();
        set({ user: data.user, userProfile: profile, loading: false });
      } else {
        set({ loading: false });
      }
      
      return { error };
    } catch (err) {
      set({ loading: false });
      return { error: err };
    }
  },

  signOut: async () => {
    set({ loading: true });
    await firebaseSignOut();
    set({ user: null, userProfile: null, loading: false });
  },

  initialize: async () => {
    try {
      // Listen for auth changes
      onAuthStateChange(async (user) => {
        if (user) {
          const { data: profile } = await getUserProfile();
          set({ user, userProfile: profile });
        } else {
          set({ user: null, userProfile: null });
        }
        
        if (!get().initialized) {
          set({ initialized: true });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ initialized: true });
    }
  },

  refreshProfile: async () => {
    try {
      const { data: profile } = await getUserProfile();
      set({ userProfile: profile });
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  },

  incrementUsage: async () => {
    try {
      const { data } = await incrementUsageCount();
      if (data) {
        set({ userProfile: data });
      }
    } catch (error) {
      console.error('Increment usage error:', error);
    }
  },
}));