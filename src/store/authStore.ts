import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase, getUserProfile, signUp as supabaseSignUp, signIn as supabaseSignIn, incrementUsageCount } from '../lib/supabase';
import type { User as UserProfile } from '../lib/supabase';

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
      const { data, error } = await supabaseSignIn(email, password);
      
      if (!error && data.user) {
        // Wait a moment for any database triggers to complete
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
      const { data, error } = await supabaseSignUp(email, password, fullName);
      
      if (!error && data.user) {
        // Wait for the user profile to be created by the database trigger
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
    await supabase.auth.signOut();
    set({ user: null, userProfile: null, loading: false });
  },

  initialize: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await getUserProfile();
        set({ user, userProfile: profile });
      }
      
      set({ initialized: true });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await getUserProfile();
          set({ user: session.user, userProfile: profile });
        } else {
          set({ user: null, userProfile: null });
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