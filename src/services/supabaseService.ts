import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

// Add getClient method for the achievement service
export const supabaseClient = supabase;

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  points: number;
  level: number;
  streak: number;
  longest_streak: number;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  verses_read: number;
  chapters_completed: number;
  devotionals_created: number;
  prayers_shared: number;
  friends_count: number;
  reading_time_minutes: number;
  community_posts: number;
  reading_plans_started: number;
  reading_plans_completed: number;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  points_awarded: number;
  achievement?: any;
}

class SupabaseService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Helper method to get supabase client
  getClient() {
    return supabase;
  }

  // Authentication
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // User Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', {
          error: error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          userId: userId,
          updates: updates
        });
        return null;
      }

      return data;
    } catch (err) {
      console.error('Unexpected error in updateUserProfile:', err);
      return null;
    }
  }

  async createUserProfile(user: User, additionalData?: { username?: string; full_name?: string }): Promise<UserProfile | null> {
    const profileData = {
      id: user.id,
      email: user.email || '',
      username: additionalData?.username || user.email?.split('@')[0] || 'user',
      full_name: additionalData?.full_name || user.user_metadata?.full_name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      points: 0,
      level: 1,
      streak: 0,
      longest_streak: 0,
      status: 'active' as const,
    };

    try {
      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        
        // If username column doesn't exist, try without it
        if (error.message.includes('column') && error.message.includes('username')) {
          const { data: dataWithoutUsername, error: errorWithoutUsername } = await supabase
            .from('users')
            .insert({
              id: profileData.id,
              email: profileData.email,
              full_name: profileData.full_name,
              avatar_url: profileData.avatar_url,
              points: profileData.points,
              level: profileData.level,
              streak: profileData.streak,
              longest_streak: profileData.longest_streak,
              status: profileData.status,
            })
            .select()
            .single();
            
          if (errorWithoutUsername) {
            console.error('Error creating user profile without username:', errorWithoutUsername);
            return null;
          }
          
          // Create user stats
          await this.createUserStats(user.id);
          return dataWithoutUsername;
        }
        
        return null;
      }

      // Create user stats
      await this.createUserStats(user.id);
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  // User Stats Management
  async getUserStats(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }

    return data;
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('user_stats')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user stats:', error);
      return null;
    }

    return data;
  }

  private async createUserStats(userId: string): Promise<UserStats | null> {
    const statsData = {
      user_id: userId,
      verses_read: 0,
      chapters_completed: 0,
      devotionals_created: 0,
      prayers_shared: 0,
      friends_count: 0,
      reading_time_minutes: 0,
    };

    const { data, error } = await supabase
      .from('user_stats')
      .insert(statsData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user stats:', error);
      return null;
    }

    return data;
  }

  // Points and Level Management
  async addPoints(userId: string, points: number): Promise<UserProfile | null> {
    try {
      // Get current user profile
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        console.error('User profile not found for userId:', userId);
        return null;
      }

      // Calculate new points and level
      const newPoints = profile.points + points;
      const newLevel = Math.floor(newPoints / 1000) + 1;

      // Update profile with better error handling
      const { data, error } = await supabase
        .from('users')
        .update({
          points: newPoints,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', {
          error: error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          userId: userId,
          newPoints: newPoints,
          newLevel: newLevel
        });
        return null;
      }

      return data;
    } catch (err) {
      console.error('Unexpected error in addPoints:', err);
      return null;
    }
  }

  async updateStreak(userId: string, streak: number): Promise<UserProfile | null> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return null;

    // Update longest streak if current streak exceeds it
    const newLongestStreak = Math.max(profile.longest_streak, streak);

    return await this.updateUserProfile(userId, { 
      streak, 
      longest_streak: newLongestStreak 
    });
  }

  // Reading Progress
  async updateReadingProgress(userId: string, book: string, chapter: number, versesRead: number = 1): Promise<UserStats | null> {
    const stats = await this.getUserStats(userId);
    if (!stats) return null;

    return await this.updateUserStats(userId, {
      verses_read: stats.verses_read + versesRead,
      chapters_completed: stats.chapters_completed + (versesRead > 0 ? 1 : 0),
    });
  }

  // Devotional Activities
  async createDevotional(userId: string): Promise<UserStats | null> {
    const stats = await this.getUserStats(userId);
    if (!stats) return null;

    return await this.updateUserStats(userId, {
      devotionals_created: stats.devotionals_created + 1,
    });
  }

  // Real Devotional Creation
  async createDevotionalContent(userId: string, devotionalData: {
    title: string;
    content: string;
    verse_reference?: string;
    verse_text?: string;
    author_name?: string;
    tags?: string[];
    is_public?: boolean;
  }): Promise<any> {
    try {
      // Check if user is authenticated
      const { data: authData } = await this.getClient().auth.getUser();
      console.log('Auth check:', authData);
      
      if (!authData.user) {
        console.error('User not authenticated');
        return null;
      }

      console.log('Creating devotional with data:', {
        userId,
        devotionalData
      });

      const { data, error } = await this.getClient()
        .from('devotionals')
        .insert({
          user_id: userId,
          title: devotionalData.title,
          content: devotionalData.content,
          verse_reference: devotionalData.verse_reference,
          verse_text: devotionalData.verse_text,
          author_name: devotionalData.author_name || 'Anonymous',
          tags: devotionalData.tags || [],
          is_public: devotionalData.is_public !== false,
        })
        .select()
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error creating devotional:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      // Award points for creating devotional
      await this.addPoints(userId, 20); // 20 points for creating a devotional
      await this.createDevotional(userId);

      return data;
    } catch (error) {
      console.error('Error creating devotional (catch):', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return null;
    }
  }

  // Reading Plan Creation
  async createReadingPlan(userId: string, planData: {
    title: string;
    description?: string;
    duration: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
    verses_per_day?: number;
    is_public?: boolean;
  }): Promise<any> {
    try {
      const { data, error } = await this.getClient()
        .from('reading_plans')
        .insert({
          user_id: userId,
          title: planData.title,
          description: planData.description,
          duration: planData.duration,
          difficulty: planData.difficulty || 'beginner',
          category: planData.category,
          verses_per_day: planData.verses_per_day || 3,
          is_public: planData.is_public !== false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reading plan:', error);
        return null;
      }

      // Award points for creating reading plan
      await this.addPoints(userId, 15); // 15 points for creating a reading plan

      return data;
    } catch (error) {
      console.error('Error creating reading plan:', error);
      return null;
    }
  }

  // Start Reading Plan
  async startReadingPlan(userId: string, planId: string): Promise<any> {
    try {
      const { data, error } = await this.getClient()
        .from('user_reading_plans')
        .insert({
          user_id: userId,
          plan_id: planId,
          started_at: new Date().toISOString(),
          current_day: 1,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting reading plan:', error);
        return null;
      }

      // Award points for starting a reading plan
      await this.addPoints(userId, 5); // 5 points for starting a plan

      return data;
    } catch (error) {
      console.error('Error starting reading plan:', error);
      return null;
    }
  }

  // Prayer Activities
  async sharePrayer(userId: string): Promise<UserStats | null> {
    const stats = await this.getUserStats(userId);
    if (!stats) return null;

    return await this.updateUserStats(userId, {
      prayers_shared: stats.prayers_shared + 1,
    });
  }

  // Reading Time
  async addReadingTime(userId: string, minutes: number): Promise<UserStats | null> {
    const stats = await this.getUserStats(userId);
    if (!stats) return null;

    return await this.updateUserStats(userId, {
      reading_time_minutes: stats.reading_time_minutes + minutes,
    });
  }

  // User Achievements
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      // First get user achievements
      const { data: userAchievements, error: userAchievementsError } = await this.getClient()
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (userAchievementsError) {
        console.error('Error fetching user achievements:', userAchievementsError);
        return [];
      }

      if (!userAchievements || userAchievements.length === 0) {
        return [];
      }

      // Then get achievement details from local data
      const { achievements } = await import('@/data/achievements');
      const achievementIds = userAchievements.map((ua: any) => ua.achievement_id);
      const achievementMap = new Map(achievements.map((a: any) => [a.id, a]));
      
      return userAchievements.map((ua: any) => ({
        id: ua.id,
        user_id: ua.user_id,
        achievement_id: ua.achievement_id,
        unlocked_at: ua.unlocked_at,
        points_awarded: ua.points_awarded,
        achievement: achievementMap.get(ua.achievement_id) || null,
      }));
    } catch (error) {
      console.error('Error in getUserAchievements:', error);
      return [];
    }
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      // Check if achievement is already unlocked
      const { data: existing } = await this.getClient()
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();

      if (existing) {
        // Achievement already unlocked, no need to insert again
        return true;
      }

      // Insert new achievement
      const { error } = await this.getClient()
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error unlocking achievement:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }

  // Leaderboard methods
  async getLeaderboard(limit: number = 50): Promise<UserProfile[]> {
    try {
      console.log('Fetching leaderboard data from optimized table...');
      
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('rank_position', { ascending: true })
        .limit(limit);

      console.log('Leaderboard query result:', { data, error, count: data?.length });

      if (error) throw error;
      
      // Transform to UserProfile format
      return data?.map(user => ({
        id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        points: user.total_points,
        level: user.level,
        streak: user.streak,
        longest_streak: user.longest_streak,
        status: 'active' as const,
        created_at: user.user_created_at,
        updated_at: user.updated_at,
      })) || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Fallback to original users table
      return this.getLeaderboardFallback(limit);
    }
  }

  private async getLeaderboardFallback(limit: number = 50): Promise<UserProfile[]> {
    try {
      console.log('Using fallback leaderboard query...');
      
      // First try with status filter, then fallback without it
      let query = supabase.from('users').select('*');
      
      try {
        query = query.eq('status', 'active');
      } catch (statusError) {
        console.log('Status column might not exist, skipping status filter');
        // Continue without status filter
      }
      
      const { data, error } = await query
        .order('points', { ascending: false })
        .limit(limit);
      
      console.log('Fallback leaderboard query result:', { data, error, count: data?.length });
      
      if (error) throw error;
      return data || [];
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return [];
    }
  }

  async getWeeklyLeaderboard(limit: number = 50): Promise<UserProfile[]> {
    try {
      console.log('Fetching weekly leaderboard data from optimized table...');
      
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('weekly_points', { ascending: false })
        .limit(limit);

      console.log('Weekly leaderboard query result:', { data, error, count: data?.length });

      if (error) throw error;
      
      // Transform to UserProfile format
      return data?.map(user => ({
        id: user.user_id,
        username: user.username,
        email: '',
        full_name: '',
        avatar_url: user.avatar_url,
        points: user.weekly_points, // Use weekly points
        level: user.level,
        streak: user.streak,
        longest_streak: user.longest_streak,
        status: 'active' as const,
        created_at: user.created_at,
        updated_at: user.updated_at,
      })) || [];
    } catch (error) {
      console.error('Error fetching weekly leaderboard:', error);
      // Fallback to original method
      return this.getWeeklyLeaderboardFallback(limit);
    }
  }

  private async getWeeklyLeaderboardFallback(limit: number = 50): Promise<UserProfile[]> {
    try {
      console.log('Using fallback weekly leaderboard query...');
      // Get users with their points from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // First try with status filter, then fallback without it
      let query = supabase
        .from('users')
        .select('*')
        .gte('updated_at', sevenDaysAgo.toISOString());
      
      try {
        query = query.eq('status', 'active');
      } catch (statusError) {
        console.log('Status column might not exist, skipping status filter for weekly leaderboard');
        // Continue without status filter
      }
      
      const { data, error } = await query
        .order('points', { ascending: false })
        .limit(limit);

      console.log('Fallback weekly leaderboard query result:', { data, error, count: data?.length });

      if (error) throw error;
      return data || [];
    } catch (fallbackError) {
      console.error('Fallback weekly query also failed:', fallbackError);
      return [];
    }
  }

  async getStreakLeaderboard(limit: number = 50): Promise<UserProfile[]> {
    try {
      console.log('Fetching streak leaderboard data from optimized table...');
      
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('streak', { ascending: false })
        .limit(limit);

      console.log('Streak leaderboard query result:', { data, error, count: data?.length });

      if (error) throw error;
      
      // Transform to UserProfile format
      return data?.map(user => ({
        id: user.user_id,
        username: user.username,
        email: '',
        full_name: '',
        avatar_url: user.avatar_url,
        points: user.total_points,
        level: user.level,
        streak: user.streak,
        longest_streak: user.longest_streak,
        status: 'active' as const,
        created_at: user.created_at,
        updated_at: user.updated_at,
      })) || [];
    } catch (error) {
      console.error('Error fetching streak leaderboard:', error);
      // Fallback to original method
      return this.getStreakLeaderboardFallback(limit);
    }
  }

  private async getStreakLeaderboardFallback(limit: number = 50): Promise<UserProfile[]> {
    try {
      console.log('Using fallback streak leaderboard query...');
      
      // First try with status filter, then fallback without it
      let query = supabase.from('users').select('*');
      
      try {
        query = query.eq('status', 'active');
      } catch (statusError) {
        console.log('Status column might not exist, skipping status filter for streak leaderboard');
        // Continue without status filter
      }
      
      const { data, error } = await query
        .order('streak', { ascending: false })
        .limit(limit);

      console.log('Fallback streak leaderboard query result:', { data, error, count: data?.length });

      if (error) throw error;
      return data || [];
    } catch (fallbackError) {
      console.error('Fallback streak query also failed:', fallbackError);
      return [];
    }
  }

  async getUserRank(userId: string): Promise<number> {
    try {
      // Try to get rank from optimized leaderboard table first
      const { data: rankData, error: rankError } = await supabase
        .from('leaderboard')
        .select('rank_position')
        .eq('user_id', userId)
        .single();

      if (!rankError && rankData) {
        return rankData.rank_position;
      }

      // Fallback to calculating rank from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { count, error: rankError2 } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('points', userData.points);

      if (rankError2) throw rankError2;

      return (count || 0) + 1;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return 1;
    }
  }

  // Real-time subscription methods for leaderboard
  subscribeToLeaderboard(callback: (leaderboard: UserProfile[]) => void): RealtimeChannel {
    const channelName = 'leaderboard_updates';
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard',
        },
        async () => {
          // Refresh leaderboard data when changes occur
          const updatedLeaderboard = await this.getLeaderboard(50);
          callback(updatedLeaderboard);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  subscribeToUserRanking(userId: string, callback: (ranking: any) => void): RealtimeChannel {
    const channelName = `user_ranking_${userId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            callback(payload.new);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Realtime Subscriptions
  subscribeToUser(userId: string, callback: (profile: UserProfile) => void): RealtimeChannel {
    const channelName = `user_${userId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            callback(payload.new as UserProfile);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  subscribeToUserStats(userId: string, callback: (stats: UserStats) => void): RealtimeChannel {
    const channelName = `user_stats_${userId}`;
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            callback(payload.new as UserStats);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Cleanup
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel: any) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const supabaseService = new SupabaseService();
