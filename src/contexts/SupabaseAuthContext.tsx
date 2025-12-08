'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { referralService } from '@/services/referralService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, referralCode?: string) => Promise<{ 
    success: boolean; 
    message?: string; 
    error?: string; 
    needsConfirmation?: boolean 
  }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          
          // If refresh token is invalid, clear session and force re-auth
          if (error.message?.includes('Refresh Token Not Found') || 
              error.message?.includes('Invalid Refresh Token')) {
            console.log('Invalid refresh token, clearing session');
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          }
        } else {
          console.log('Initial session:', session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, signing out');
          await supabase.auth.signOut();
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, referralCode?: string) => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { 
          success: false, 
          error: 'Please enter a valid email address',
          message: 'Please enter a valid email address'
        };
      }

      if (password.length < 6) {
        return { 
          success: false, 
          error: 'Password must be at least 6 characters long',
          message: 'Password must be at least 6 characters long'
        };
      }

      console.log('Attempting sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Supabase sign up error:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to create account',
          message: error.message || 'Failed to create account'
        };
      }

      console.log('Sign up response:', data);

      // Process referral if provided and user was created
      if (referralCode && data.user) {
        console.log('Processing referral:', referralCode);
        await referralService.processReferral(referralCode, data.user.id);
      }

      if (data.user && !data.user.email_confirmed_at) {
        return { 
          success: true, 
          message: 'Please check your email to confirm your account.',
          needsConfirmation: true 
        };
      }

      return { success: true, message: 'Account created successfully!' };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred',
        message: error.message || 'An unexpected error occurred'
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { error: { message: 'Please enter a valid email address' } };
      }

      if (!password) {
        return { error: { message: 'Password is required' } };
      }

      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        return { error };
      }

      // Award daily login points
      if (data.user) {
        console.log('Awarding daily login points to:', data.user.id);
        try {
          const { data: pointsData, error: pointsError } = await supabase
            .rpc('award_daily_login_points', { user_uuid: data.user.id });
          
          if (pointsError) {
            console.error('Error awarding daily points:', pointsError);
          } else {
            console.log('Daily login points awarded:', pointsData);
          }
        } catch (pointsError) {
          console.error('Error calling daily points function:', pointsError);
        }

        // Check for pending referrals to complete
        try {
          await referralService.checkPendingReferrals(data.user.id);
        } catch (referralError) {
          console.error('Error checking pending referrals:', referralError);
        }
      }

      console.log('Sign in successful:', data.user?.email);
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force clear state even if signOut fails
      setSession(null);
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
