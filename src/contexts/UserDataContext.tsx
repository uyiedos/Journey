'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabaseService, UserProfile, UserStats } from '@/services/supabaseService';
import { achievementService } from '@/services/achievementService';
import { User, Gamification, UserSettings } from '@/types';

interface UserDataContextType {
  user: User | null;
  stats: Gamification | null;
  loading: boolean;
  error: string | null;
  updateUser: (user: Partial<User>) => void;
  updateStats: (stats: Partial<Gamification>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  addPoints: (points: number) => void;
  incrementStreak: () => void;
  refreshData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    // Return fallback data during build time
    return {
      user: {
        id: 'fallback',
        username: 'Guest',
        email: 'guest@example.com',
        fullName: 'Guest User',
        avatar: '',
        level: 1,
        points: 0,
        streak: 0,
        badges: [],
        achievements: [],
        joinedAt: new Date(),
        lastActive: new Date(),
        friends: [],
        settings: {
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            dailyDevotional: true,
            friendRequests: true,
            messages: true,
            achievementAlerts: true,
            communityPosts: false,
            readingReminders: true,
            weeklyProgress: true,
          },
          privacy: {
            profileVisibility: 'public',
            showOnlineStatus: true,
            showReadingProgress: true,
            allowFriendRequests: true,
            showAchievements: true,
          },
          reading: {
            fontSize: 'medium',
            translation: 'kjv',
            dailyReminderTime: '08:00',
            autoPlayAudio: false,
            highlightVerses: true,
            showNotes: true,
          },
          community: {
            showInFeed: true,
            allowMentions: true,
            emailNotifications: true,
            pushNotifications: true,
            filterContent: true,
            hideBlockedUsers: true,
          },
        },
      },
      stats: {
        level: 1,
        points: 0,
        streak: 0,
        badges: [],
        leaderboard: [],
      },
      loading: false,
      error: null,
      updateUser: async () => {},
      updateStats: async () => {},
      updateSettings: async () => {},
      addPoints: async () => {},
      incrementStreak: async () => {},
      refreshData: async () => {},
    };
  }
  return context;
}

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Gamification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeUserData = async () => {
      if (!authUser) {
        setUser(null);
        setStats(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get or create user profile from Supabase
        let userProfile = await supabaseService.getUserProfile(authUser.id);
        
        if (!userProfile) {
          // Create profile if it doesn't exist
          userProfile = await supabaseService.createUserProfile(authUser);
          if (!userProfile) {
            throw new Error('Failed to create user profile');
          }
        }

        // Get user stats from Supabase
        const userStats = await supabaseService.getUserStats(authUser.id);
        if (!userStats) {
          throw new Error('Failed to load user stats');
        }

        // Get user achievements from Supabase
        const userAchievements = await supabaseService.getUserAchievements(authUser.id);

        // Convert Supabase data to our User type
        const userData: User = {
          id: userProfile.id,
          username: userProfile.username || userProfile.email?.split('@')[0] || 'user',
          email: userProfile.email,
          fullName: userProfile.full_name || '',
          avatar: userProfile.avatar_url || '',
          joinedAt: new Date(userProfile.created_at),
          points: userProfile.points,
          level: userProfile.level,
          streak: userProfile.streak,
          longestStreak: userProfile.longest_streak || 0,
          friends: [],
          achievements: userAchievements.map(ua => ua.achievement).filter(Boolean),
          settings: {
            theme: 'system',
            notifications: {
              email: true,
              push: true,
              dailyDevotional: true,
              friendRequests: true,
              messages: true,
              achievementAlerts: true,
              communityPosts: false,
              readingReminders: true,
              weeklyProgress: true,
            },
            privacy: {
              profileVisibility: 'public',
              showOnlineStatus: true,
              showReadingProgress: true,
              allowFriendRequests: true,
              showAchievements: true,
            },
            reading: {
              fontSize: 'medium',
              translation: 'kjv',
              dailyReminderTime: '08:00',
              autoPlayAudio: false,
              highlightVerses: true,
              showNotes: true,
            },
            community: {
              showInFeed: true,
              allowMentions: true,
              emailNotifications: true,
              pushNotifications: true,
              filterContent: true,
              hideBlockedUsers: true,
            },
          },
        };

        // Convert stats to Gamification type
        const gamificationData: Gamification = {
          level: userProfile.level,
          points: userProfile.points,
          streak: userProfile.streak,
          badges: [],
          leaderboard: [], // Will be populated from a separate query
        };

        setUser(userData);
        setStats(gamificationData);

        // Check for new achievements based on current activity
        try {
          const { newAchievements, pointsAwarded } = await achievementService.checkAndAwardAchievements(authUser.id);
          
          if (newAchievements.length > 0) {
            console.log('New achievements unlocked:', newAchievements);
            console.log('Points awarded:', pointsAwarded);
            
            // Refresh user data to get updated achievements
            const updatedUserAchievements = await supabaseService.getUserAchievements(authUser.id);
            setUser(prev => prev ? {
              ...prev,
              achievements: updatedUserAchievements.map(ua => ua.achievement).filter(Boolean),
            } : null);
          }
        } catch (achievementError) {
          console.error('Error checking achievements:', achievementError);
          // Don't fail the whole user data load if achievements fail
        }

        // Subscribe to real-time updates
        const profileChannel = supabaseService.subscribeToUser(authUser.id, (profile) => {
          setUser(prev => prev ? { ...prev, ...profile } : null);
        });

        const statsChannel = supabaseService.subscribeToUserStats(authUser.id, (newStats) => {
          // Update user stats in background, but don't change the Gamification stats
          // since they have a different structure
          console.log('User stats updated:', newStats);
        });

      } catch (err) {
        console.error('Error initializing user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    initializeUserData();

    return () => {
      supabaseService.unsubscribeAll();
    };
  }, [authUser]);

  const updateUser = async (userData: Partial<User>) => {
    if (!authUser || !user) return;

    try {
      const profileUpdates: Partial<UserProfile> = {
        username: userData.username,
        full_name: userData.fullName,
        avatar_url: userData.avatar,
      };

      const updatedProfile = await supabaseService.updateUserProfile(authUser.id, profileUpdates);
      if (updatedProfile) {
        setUser(prev => prev ? { ...prev, ...userData } : null);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const updateStats = (statsData: Partial<Gamification>) => {
    if (stats) {
      setStats({ ...stats, ...statsData });
    }
  };

  const updateSettings = (settingsData: Partial<UserSettings>) => {
    if (user) {
      setUser({
        ...user,
        settings: { ...user.settings, ...settingsData },
      });
    }
  };

  const addPoints = async (points: number) => {
    if (!authUser) return;

    try {
      const updatedProfile = await supabaseService.addPoints(authUser.id, points);
      if (updatedProfile) {
        setUser(prev => prev ? {
          ...prev,
          points: updatedProfile.points,
          level: updatedProfile.level,
        } : null);
        setStats(prev => prev ? {
          ...prev,
          points: updatedProfile.points,
          level: updatedProfile.level,
        } : null);
      }
    } catch (err) {
      console.error('Error adding points:', err);
      setError(err instanceof Error ? err.message : 'Failed to add points');
    }
  };

  const incrementStreak = async () => {
    if (!authUser || !user) return;

    try {
      const newStreak = user.streak + 1;
      const updatedProfile = await supabaseService.updateStreak(authUser.id, newStreak);
      if (updatedProfile) {
        setUser(prev => prev ? { ...prev, streak: newStreak } : null);
        setStats(prev => prev ? { ...prev, streak: newStreak } : null);
      }
    } catch (err) {
      console.error('Error updating streak:', err);
      setError(err instanceof Error ? err.message : 'Failed to update streak');
    }
  };

  const refreshData = async () => {
    if (authUser) {
      try {
        setLoading(true);
        const userProfile = await supabaseService.getUserProfile(authUser.id);
        
        if (userProfile) {
          setUser(prev => prev ? {
            ...prev,
            points: userProfile.points,
            level: userProfile.level,
            streak: userProfile.streak,
            fullName: userProfile.full_name,
            avatar: userProfile.avatar_url || '',
          } : null);
          
          setStats(prev => prev ? {
            ...prev,
            points: userProfile.points,
            level: userProfile.level,
            streak: userProfile.streak,
          } : null);
        }
      } catch (err) {
        console.error('Error refreshing data:', err);
        setError(err instanceof Error ? err.message : 'Failed to refresh data');
      } finally {
        setLoading(false);
      }
    }
  };

  const value = {
    user,
    stats,
    loading,
    error,
    updateUser,
    updateStats,
    updateSettings,
    addPoints,
    incrementStreak,
    refreshData,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}
