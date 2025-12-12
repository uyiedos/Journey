import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

// Add getClient method for the achievement service
export const supabaseClient = supabase;

export interface UserProfile {
  id: string;
  username?: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  points: number;
  level: number;
  streak: number;
  longest_streak: number;
  last_daily_claim?: string;
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

  // Helper method to calculate level from points
  private calculateLevel(points: number): number {
    // Every 100 points = 1 level (starting from level 1 at 0 points)
    return Math.floor(points / 100) + 1;
  }

  // Daily action reward helpers (client-side caps)
  private getDailyActionKey(userId: string, action: string): string {
    const today = new Date().toISOString().split('T')[0];
    return `journey:daily_reward:${userId}:${action}:${today}`;
  }

  private hasReceivedDailyActionReward(userId: string, action: string): boolean {
    if (typeof window === 'undefined') return false;
    const key = this.getDailyActionKey(userId, action);
    return window.localStorage.getItem(key) === '1';
  }

  private setDailyActionReward(userId: string, action: string): void {
    if (typeof window === 'undefined') return;
    const key = this.getDailyActionKey(userId, action);
    window.localStorage.setItem(key, '1');
  }

  // Helper method to get supabase client
  getClient() {
    return supabase;
  }

  // Authentication
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.getClient().auth.getUser();
    return user;
  }

  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await this.getClient().auth.getSession();
    return session;
  }

  // User Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.getClient()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Ensure username field has a default value if it doesn't exist in DB
    if (data && !data.username) {
      data.username = data.email?.split('@')[0] || 'user';
    }

    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log('Updating user profile:', { userId, updates });
      
      // Filter out username if it doesn't exist in the database
      const filteredUpdates: Record<string, any> = {};
      Object.keys(updates).forEach(key => {
        if (key !== 'username' && updates[key as keyof UserProfile] !== undefined) {
          filteredUpdates[key] = updates[key as keyof UserProfile];
        }
      });

      // Auto-calculate level if points are being updated
      if (updates.points !== undefined) {
        filteredUpdates.level = this.calculateLevel(updates.points);
      }

      console.log('Filtered updates:', filteredUpdates);

      const { error } = await this.getClient()
        .from('users')
        .update(filteredUpdates)
        .eq('id', userId);

      console.log('Update result:', { error });

      if (error) {
        console.error('Error updating user profile:', {
          error: error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          userId: userId,
          updates: filteredUpdates
        });
        return null;
      }

      // Fetch the updated profile to return
      const updatedProfile = await this.getUserProfile(userId);
      return updatedProfile;
    } catch (err) {
      console.error('Unexpected error in updateUserProfile:', err);
      return null;
    }
  }

  async createUserProfile(user: User, additionalData?: { username?: string; full_name?: string }): Promise<UserProfile | null> {
    console.log('Creating user profile for:', user.id);
    
    // Start with minimal required fields
    const profileData: any = {
      id: user.id,
      email: user.email || '',
      points: 0,
      level: 1,
      updated_at: new Date().toISOString()
    };

    // Add optional fields if they exist in the table
    const optionalFields = [
      'username',
      'full_name',
      'avatar_url',
      'streak',
      'longest_streak',
      'status'
    ];

    optionalFields.forEach(field => {
      if (field === 'username') {
        profileData[field] = additionalData?.username || user.email?.split('@')[0] || 'user';
      } else if (field === 'full_name') {
        profileData[field] = additionalData?.full_name || user.user_metadata?.full_name || '';
      } else if (field === 'avatar_url') {
        profileData[field] = user.user_metadata?.avatar_url || '';
      } else if (field === 'streak' || field === 'longest_streak') {
        profileData[field] = 0;
      } else if (field === 'status') {
        profileData[field] = 'active';
      }
    });

    console.log('Profile data to insert:', profileData);

    try {
      const { data, error } = await this.getClient()
        .from('users')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        
        // Try with minimal fields only
        console.log('Trying with minimal fields...');
        const minimalProfile = {
          id: user.id,
          email: user.email || '',
          points: 0,
          level: 1,
          updated_at: new Date().toISOString()
        };
        
        const { data: minimalData, error: minimalError } = await this.getClient()
          .from('users')
          .insert(minimalProfile)
          .select()
          .single();
          
        if (minimalError) {
          console.error('Error creating minimal user profile:', minimalError);
          return null;
        }
        
        console.log('Created minimal profile:', minimalData);
        
        // Create user stats
        await this.createUserStats(user.id);
        return minimalData;
      }

      console.log('Created user profile:', data);
      
      // Create user stats
      await this.createUserStats(user.id);
      return data;
    } catch (error) {
      console.error('Error creatingetu creating user profile:', error);
      return null;
    }
  }

  // User Stats Management
  async getUserStats(userId: string): Promise<UserStats | null> {
    const { data, error } = await this.getClient()
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
    const { data, error } = await this.getClient()
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

    const { data, error } = await this.getClient()
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
  async claimDailyPoints(userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Claiming daily points for user:', userId);
      
      // 1. First verify user exists and get current data
      const { data: userData, error: userError } = await this.getClient()
        .from('users')
        .select('points, streak, longest_streak, last_daily_claim')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        // Try to create user profile if it doesn't exist
        const { data: { user: authUser } } = await this.getClient().auth.getUser();
        if (authUser) {
          console.log('Creating user profile for:', authUser.id);
          const newProfile = await this.createUserProfile(authUser);
          if (!newProfile) {
            return { success: false, message: 'User not found and could not be created' };
          }
          // Retry with new profile
          return await this.claimDailyPoints(userId);
        }
        return { success: false, message: 'User not found' };
      }

      console.log('Current user data:', userData);

      // 2. Check if already claimed today
      const lastClaim = userData.last_daily_claim ? new Date(userData.last_daily_claim) : null;
      const today = new Date();
      
      if (lastClaim && 
          lastClaim.getDate() === today.getDate() &&
          lastClaim.getMonth() === today.getMonth() &&
          lastClaim.getFullYear() === today.getFullYear()) {
        return { success: false, message: 'Daily points already claimed today' };
      }

      // 3. Calculate new values
      const pointsToAdd = 10;
      const newPoints = (userData.points || 0) + pointsToAdd;
      const newLevel = this.calculateLevel(newPoints);
      const newStreak = (userData.streak || 0) + 1;
      const now = new Date().toISOString();

      // 4. Update user directly (minimal update to test)
      console.log('Attempting minimal update with:', {
        userId,
        points: newPoints,
        updated_at: now
      });
      
      const { error } = await this.getClient()
        .from('users')
        .update({
          points: newPoints,
          updated_at: now
        })
        .eq('id', userId);
      
      console.log('Minimal update completed. Error:', error);
      
      if (error) {
        console.error('Error updating user points (minimal):', error);
        return { success: false, message: error.message || 'Failed to update points' };
      }
      
      // 4b. Try updating level and streak separately
      console.log('Updating level and streak...');
      const { error: levelError } = await this.getClient()
        .from('users')
        .update({
          level: newLevel,
          streak: newStreak,
          last_daily_claim: now
        })
        .eq('id', userId);
      
      console.log('Level/streak update completed. Error:', levelError);
      
      if (levelError) {
        console.warn('Could not update level/streak:', levelError);
        // Don't fail the operation, just warn
      }

      // 5. Log the daily reward (temporarily disabled to isolate issue)
      /*
      try {
        await this.getClient()
          .from('daily_login_rewards')
          .insert({
            user_id: userId,
            reward_date: today.toISOString().split('T')[0],
            points_awarded: pointsToAdd,
            streak_day: newStreak
          });
      } catch (rewardError) {
        console.warn('Could not log daily reward:', rewardError);
        // Don't fail the whole operation if reward logging fails
      }
      */

      // 6. Update user stats
      try {
        await this.getClient()
          .from('user_stats')
          .update({
            total_points_earned: newPoints,
            last_activity_at: now
          })
          .eq('user_id', userId);
      } catch (statsError) {
        console.warn('Could not update user_stats:', statsError);
        // Don't fail the whole operation if stats update fails
      }

      return { success: true, message: `Daily points claimed successfully! +${pointsToAdd} points` };

    } catch (error) {
      console.error('Unexpected error in claimDailyPoints:', error);
      return { success: false, message: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  };

  async addPoints(userId: string, points: number): Promise<UserProfile | null> {
    try {
      console.log('Adding points:', { userId, points });
      
      // First, check if user exists
      const existingProfile = await this.getUserProfile(userId);
      if (!existingProfile) {
        console.error('User profile not found for userId:', userId);
        // Try to create the user profile if it doesn't exist
        const { data: { user: authUser } } = await this.getClient().auth.getUser();
        if (authUser) {
          const newProfile = await this.createUserProfile(authUser);
          if (!newProfile) {
            console.error('Failed to create user profile for userId:', userId);
            return null;
          }
          // Now try adding points again with the new profile
          return await this.addPoints(userId, points);
        }
        return null;
      }

      // Calculate new points and level
      const currentPoints = existingProfile.points || 0;
      const newPoints = currentPoints + points;
      const newLevel = this.calculateLevel(newPoints);

      console.log('Updating points:', { currentPoints, pointsToAdd: points, newPoints, newLevel });

      // Update profile with better error handling
      const updateData: Record<string, any> = {
        points: newPoints,
        level: newLevel,
        updated_at: new Date().toISOString()
      };

      // Only include longest_streak if it exists in the profile
      if ('longest_streak' in existingProfile && existingProfile.longest_streak !== undefined) {
        updateData.longest_streak = existingProfile.longest_streak;
      }

      console.log('Update data:', updateData);

      const { error } = await this.getClient()
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', {
          error: error,
          message: error.message || 'Unknown error',
          details: error.details || 'No details',
          hint: error.hint || 'No hint',
          code: error.code || 'No code',
          userId: userId,
          newPoints: newPoints,
          newLevel: newLevel,
          updateData: updateData
        });
        
        // Try a simpler update without longest_streak
        console.log('Trying simpler update...');
        const simpleUpdateData = {
          points: newPoints,
          level: newLevel,
          updated_at: new Date().toISOString()
        };
        
        const { error: simpleError } = await this.getClient()
          .from('users')
          .update(simpleUpdateData)
          .eq('id', userId);
          
        if (simpleError) {
          console.error('Simple update also failed:', simpleError);
          return null;
        }
        
        console.log('Simple update succeeded');
        // Fetch the updated profile to return
        const updatedProfile = await this.getUserProfile(userId);
        return updatedProfile;
      }

      console.log('Successfully updated points');

      // Also update user_stats if table exists
      try {
        await this.getClient()
          .from('user_stats')
          .update({
            total_points_earned: newPoints,
            last_activity_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } catch (statsError) {
        console.warn('Could not update user_stats:', statsError);
        // Don't fail the whole operation if stats update fails
      }

      // Fetch the updated profile to return
      const updatedProfile = await this.getUserProfile(userId);
      
      // Create notification for points change
      if (updatedProfile && points !== 0) {
        try {
          const { communityService } = await import('./communityService');
          
          if (points > 0) {
            await communityService.createNotification(userId, 'points_awarded', 'Points earned', `You earned +${points} points.`, { delta: points });
          } else if (points < 0) {
            await communityService.createNotification(userId, 'points_spent', 'Points spent', `You spent ${Math.abs(points)} points.`, { delta: points });
          }
        } catch (notifError) {
          console.warn('Could not create notification:', notifError);
        }
      }
      
      return updatedProfile;
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
    image_url?: string;
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
          image_url: devotionalData.image_url || null,
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

      // Award points for creating devotional (once per day)
      if (!this.hasReceivedDailyActionReward(userId, 'create_devotional')) {
        await this.addPoints(userId, 20); // 20 points for creating a devotional
        this.setDailyActionReward(userId, 'create_devotional');
      }
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
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
    verses_per_day?: number;
    image_url?: string;
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
          difficulty: planData.difficulty,
          category: planData.category,
          verses_per_day: planData.verses_per_day || 3,
          image_url: planData.image_url || null,
          is_public: planData.is_public !== false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reading plan:', error);
        return null;
      }

      // Award points for creating reading plan (once per day)
      if (!this.hasReceivedDailyActionReward(userId, 'create_reading_plan')) {
        await this.addPoints(userId, 15); // 15 points for creating a reading plan
        this.setDailyActionReward(userId, 'create_reading_plan');
      }

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

      // Create notification for achievement unlock
      try {
        const achievements = require('@/data/achievements').achievements;
        const achievement = achievements.find((a: any) => a.id === achievementId);
        
        if (achievement) {
          const { communityService } = await import('./communityService');
          
          await communityService.createNotification(
            userId, 
            'achievement_unlocked', 
            'New achievement unlocked', 
            `You unlocked "${achievement.name}" (+${achievement.points || 0} points).`,
            { achievementId }
          );
        }
      } catch (notifError) {
        console.warn('Could not create achievement notification:', notifError);
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
      return data?.map(data => ({
        id: data.id,
        username: data.username || 'Anonymous',
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        points: data.points,
        level: data.level,
        streak: data.streak,
        longest_streak: data.longest_streak,
        last_daily_claim: data.last_daily_claim,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
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
      let query = this.getClient().from('users').select('*');
      
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
      let query = this.getClient()
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
      let query = this.getClient().from('users').select('*');
      
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
      // Try to get rank from leaderboard_view
      const { data: rankData, error: rankError } = await supabase
        .from('leaderboard_view')
        .select('rank_position')
        .eq('id', userId)
        .single();

      if (!rankError && rankData) {
        return rankData.rank_position;
      }

      // Fallback to calculating rank from users table
      const { data: userData, error: userError } = await this.getClient()
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { count, error: rankError2 } = await this.getClient()
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

  // Enhanced Community methods
  async getPendingFriendRequests(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          created_at,
          users!friendships_requester_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            points,
            level
          )
        `)
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending friend requests:', error);
      return [];
    }
  }

  async acceptFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ 
          status: 'accepted', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', friendshipId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  }

  async declineFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ 
          status: 'declined', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', friendshipId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error declining friend request:', error);
      return false;
    }
  }

  async getFriends(userId: string): Promise<any[]> {
    try {
      // Get friendships where user is involved and status is accepted
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          requester_id,
          addressee_id,
          requester:users!friendships_requester_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            points,
            level
          ),
          addressee:users!friendships_addressee_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            points,
            level
          )
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) {
        // If table doesn't exist, return sample friends
        if (error.code === 'PGRST116') {
          return this.getSampleFriends();
        }
        throw error;
      }
      
      if (!friendships || friendships.length === 0) return [];

      // Extract friend information
      const friends = friendships.map(friendship => {
        const isRequester = friendship.requester_id === userId;
        const friendData = isRequester ? friendship.addressee : friendship.requester;
        
        // Handle case where friendData might be an array (Supabase sometimes returns arrays)
        const friend = Array.isArray(friendData) ? friendData[0] : friendData;
        
        return {
          id: friend.id,
          username: friend.username,
          full_name: friend.full_name,
          avatar_url: friend.avatar_url,
          points: friend.points,
          level: friend.level,
          friendship_status: 'accepted',
          status: 'online' // Would need real-time status tracking
        };
      });

      return friends;
    } catch (error) {
      console.error('Error fetching friends:', error);
      // Return sample friends as fallback
      return this.getSampleFriends();
    }
  }

  private getSampleFriends(): any[] {
    return [
      {
        id: 'friend-1',
        username: 'faithful_walker',
        full_name: 'Sarah Johnson',
        avatar_url: null,
        points: 150,
        level: 3,
        friendship_status: 'accepted',
        status: 'online'
      },
      {
        id: 'friend-2',
        username: 'prayer_warrior',
        full_name: 'Michael Chen',
        avatar_url: null,
        points: 220,
        level: 4,
        friendship_status: 'accepted',
        status: 'offline'
      },
      {
        id: 'friend-3',
        username: 'bible_reader',
        full_name: 'Emily Davis',
        avatar_url: null,
        points: 180,
        level: 3,
        friendship_status: 'pending',
        status: 'away'
      }
    ];
  }

  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<boolean> {
    try {
      // Check if request already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'pending') {
          console.log('Friend request already pending');
          return false;
        }
        if (existing.status === 'accepted') {
          console.log('Already friends');
          return false;
        }
      }

      // Create new friend request
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: requesterId,
          addressee_id: addresseeId,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  }

  // Enhanced group methods with points pool
  async contributeToGroupPoints(userId: string, groupId: string, points: number, reason?: string): Promise<boolean> {
    try {
      // Check if user has enough points
      const { data: user } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();

      if (!user || user.points < points) {
        throw new Error('Insufficient points');
      }

      // Deduct points from user
      await this.addPoints(userId, -points);

      // Add contribution record
      const { error: contributionError } = await supabase
        .from('group_point_contributions')
        .insert({
          group_id: groupId,
          user_id: userId,
          points: points,
          reason: reason
        });

      if (contributionError) throw contributionError;

      // Update group points pool
      const { error: groupError } = await supabase.rpc('increment_group_points', {
        group_id: groupId,
        points_to_add: points
      });

      if (groupError) throw groupError;

      // Update user's contribution total
      const { error: memberError } = await supabase.rpc('increment_member_contribution', {
        group_id: groupId,
        user_id: userId,
        points_to_add: points
      });

      if (memberError) throw memberError;

      return true;
    } catch (error) {
      console.error('Error contributing to group points:', error);
      return false;
    }
  }

  async getGroupPointsContributions(groupId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('group_point_contributions')
        .select(`
          *,
          user:users (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST100') {
          return this.getSampleGroupContributions();
        }
        throw error;
      }

      return data?.map(contribution => ({
        ...contribution,
        user: contribution.user
      })) || [];
    } catch (error) {
      console.error('Error fetching group contributions:', error);
      return this.getSampleGroupContributions();
    }
  }

  private getSampleGroupContributions(): any[] {
    return [
      {
        id: 'contribution-1',
        group_id: 'group-1',
        user_id: 'user-1',
        points: 10,
        reason: 'Daily devotion completed',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: {
          username: 'faithful_walker',
          full_name: 'Sarah Johnson',
          avatar_url: null
        }
      },
      {
        id: 'contribution-2',
        group_id: 'group-1',
        user_id: 'user-2',
        points: 5,
        reason: 'Challenge completed',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user: {
          username: 'prayer_warrior',
          full_name: 'Michael Chen',
          avatar_url: null
        }
      }
    ];
  }

  async createGroupChallenge(groupId: string, challengeData: {
    title: string;
    description?: string;
    points_reward: number;
    target_count?: number;
    expires_at?: string;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('group_challenges')
        .insert({
          group_id: groupId,
          ...challengeData
        })
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST100') {
          return this.getSampleChallenge();
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating group challenge:', error);
      return this.getSampleChallenge();
    }
  }

  private getSampleChallenge(): any {
    return {
      id: 'challenge-1',
      group_id: 'group-1',
      title: '7-Day Prayer Challenge',
      description: 'Pray for 15 minutes every day for one week',
      points_reward: 100,
      target_count: 5,
      current_count: 2,
      is_active: true,
      expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  async completeGroupChallenge(userId: string, challengeId: string): Promise<boolean> {
    try {
      // Get challenge details
      const { data: challenge, error: challengeError } = await supabase
        .from('group_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      // Check if already completed
      const { data: existing } = await supabase
        .from('group_challenge_completions')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) return false; // Already completed

      // Add completion
      const { error: completionError } = await supabase
        .from('group_challenge_completions')
        .insert({
          challenge_id: challengeId,
          user_id: userId
        });

      if (completionError) throw completionError;

      // Update challenge current count
      const { error: updateError } = await supabase
        .from('group_challenges')
        .update({ current_count: challenge.current_count + 1 })
        .eq('id', challengeId);

      if (updateError) throw updateError;

      // If target reached, add points to group pool
      if (challenge.current_count + 1 >= challenge.target_count) {
        await this.contributeToGroupPoints(
          'system', // System contribution
          challenge.group_id,
          challenge.points_reward,
          `Challenge completed: ${challenge.title}`
        );

        // Mark challenge as inactive
        await supabase
          .from('group_challenges')
          .update({ is_active: false })
          .eq('id', challengeId);
      }

      return true;
    } catch (error) {
      console.error('Error completing group challenge:', error);
      return false;
    }
  }

  async getUserGroups(userId: string): Promise<any[]> {
    try {
      // Get group memberships for user
      const { data: memberships, error } = await supabase
        .from('group_memberships')
        .select('group_id, role')
        .eq('user_id', userId);

      if (error) {
        // If table doesn't exist, return sample groups
        if (error.code === 'PGRST116') {
          return this.getSampleGroups();
        }
        throw error;
      }
      
      if (!memberships || memberships.length === 0) return [];

      // Get group details
      const groupIds = memberships.map(m => m.group_id);

      const { data: groups, error: groupsError } = await supabase
        .from('community_groups')
        .select('id, name, description, avatar_url, is_private, member_count, created_by')
        .in('id', groupIds);

      if (groupsError) throw groupsError;
      
      return groups?.map((group, index) => ({
        ...group,
        user_role: memberships[index].role
      })) || [];
    } catch (error) {
      console.error('Error fetching user groups:', error);
      // Return sample groups as fallback
      return this.getSampleGroups();
    }
  }

  private getSampleGroups(): any[] {
    return [
      {
        id: 'group-1',
        name: 'Daily Devotionals',
        description: 'A group for sharing daily Bible readings and reflections',
        avatar_url: null,
        is_private: false,
        member_count: 45,
        points_pool: 1250, // Total points contributed by members
        goal_points: 2000, // Optional goal
        created_by: 'admin-user',
        user_role: 'member'
      },
      {
        id: 'group-2',
        name: 'Prayer Warriors',
        description: 'Join us in prayer and support one another through faith',
        avatar_url: null,
        is_private: false,
        member_count: 32,
        points_pool: 890,
        goal_points: 1000,
        created_by: 'admin-user',
        user_role: 'admin'
      },
      {
        id: 'group-3',
        name: 'Bible Study Leaders',
        description: 'Resources and discussions for leading Bible study groups',
        avatar_url: null,
        is_private: true,
        member_count: 18,
        points_pool: 450,
        goal_points: 500,
        created_by: 'admin-user',
        user_role: 'moderator'
      }
    ];
  }

  async createCommunityGroup(userId: string, groupData: {
    name: string;
    description?: string;
    avatar_url?: string;
    is_private?: boolean;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .insert({
          ...groupData,
          created_by: userId,
          is_private: false // Always public - anyone can join
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      await supabase
        .from('group_memberships')
        .insert({
          group_id: data.id,
          user_id: userId,
          role: 'admin'
        });

      return data;
    } catch (error) {
      console.error('Error creating community group:', error);
      return null;
    }
  }

  async joinGroup(userId: string, groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_memberships')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;

      // Update member count
      await supabase.rpc('increment_group_members', { group_id: groupId });

      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      return false;
    }
  }

  async getUserNotifications(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Enhanced community methods
  async getCommunityPosts(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          users (
            username,
            full_name,
            avatar_url,
            points,
            level
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        // If table doesn't exist, create sample data
        if (error.code === 'PGRST116') { // relation does not exist
          return this.getSampleCommunityPosts();
        }
        // If query syntax error, also return sample data
        if (error.code === 'PGRST100') { // parse error
          return this.getSampleCommunityPosts();
        }
        throw error;
      }
      
      // Transform the data to match expected format
      return data?.map(post => ({
        ...post,
        user: post.users
      })) || [];
    } catch (error) {
      console.error('Error fetching community posts:', error);
      // Return sample data as fallback
      return this.getSampleCommunityPosts();
    }
  }

  private getSampleCommunityPosts(): any[] {
    return [
      {
        id: 'sample-1',
        user_id: 'sample-user-1',
        title: 'Daily Reflection',
        content: 'Today I was reminded of God\'s faithfulness through Psalm 23. Even when we walk through the darkest valleys, He is with us.',
        verse_reference: 'Psalm 23:4',
        verse_text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me.',
        likes_count: 15,
        comments_count: 3,
        shares_count: 2,
        views_count: 45,
        is_public: true,
        is_friend_only: false,
        mood: 'grateful',
        tags: ['faith', 'psalms', 'encouragement'],
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'sample-user-1',
          username: 'faithful_walker',
          full_name: 'Sarah Johnson',
          avatar_url: null,
          points: 150,
          level: 3
        },
        is_liked: false
      },
      {
        id: 'sample-2',
        user_id: 'sample-user-2',
        title: 'Prayer Request',
        content: 'Please pray for my family as we go through a difficult time. We\'re trusting in God\'s plan and need strength.',
        likes_count: 8,
        comments_count: 5,
        shares_count: 1,
        views_count: 32,
        is_public: true,
        is_friend_only: false,
        mood: 'prayerful',
        tags: ['prayer', 'family', 'strength'],
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'sample-user-2',
          username: 'prayer_warrior',
          full_name: 'Michael Chen',
          avatar_url: null,
          points: 220,
          level: 4
        },
        is_liked: false
      },
      {
        id: 'sample-3',
        user_id: 'sample-user-3',
        content: 'Just finished reading Proverbs chapter 3. The wisdom about trusting in the Lord with all your heart really resonated with me today!',
        verse_reference: 'Proverbs 3:5-6',
        verse_text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        likes_count: 23,
        comments_count: 7,
        shares_count: 4,
        views_count: 67,
        is_public: true,
        is_friend_only: false,
        mood: 'inspired',
        tags: ['proverbs', 'wisdom', 'trust'],
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'sample-user-3',
          username: 'bible_reader',
          full_name: 'Emily Davis',
          avatar_url: null,
          points: 180,
          level: 3
        },
        is_liked: false
      }
    ];
  }

  async createCommunityPost(userId: string, postData: {
    title?: string;
    content: string;
    verse_reference?: string;
    verse_text?: string;
    image_url?: string;
    mood?: string;
    tags?: string[];
    is_friend_only?: boolean;
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: userId,
          ...postData,
        })
        .select(`
          *,
          users (
            username,
            full_name,
            avatar_url,
            points,
            level
          )
        `)
        .single();

      if (error) {
        // If table doesn't exist or query syntax error, return sample post
        if (error.code === 'PGRST116' || error.code === 'PGRST100') {
          return this.getSampleCreatedPost(userId, postData);
        }
        throw error;
      }
      
      // Award points for creating a community post (once per day)
      if (!this.hasReceivedDailyActionReward(userId, 'create_community_post')) {
        await this.addPoints(userId, 5); // 5 points for creating a post
        this.setDailyActionReward(userId, 'create_community_post');
      }
      
      // Transform the data to match expected format
      return {
        ...data,
        user: data.users
      };
    } catch (error) {
      console.error('Error creating community post:', error);
      // Return sample post as fallback
      return this.getSampleCreatedPost(userId, postData);
    }
  }

  private getSampleCreatedPost(userId: string, postData: any): any {
    return {
      id: 'sample-new-' + Date.now(),
      user_id: userId,
      title: postData.title,
      content: postData.content,
      verse_reference: postData.verse_reference,
      verse_text: postData.verse_text,
      image_url: postData.image_url,
      mood: postData.mood,
      tags: postData.tags,
      is_friend_only: postData.is_friend_only || false,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 1,
      is_public: !postData.is_friend_only,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: userId,
        username: 'current_user',
        full_name: 'Current User',
        avatar_url: null,
        points: 100,
        level: 2
      },
      is_liked: false
    };
  }

  async getCommunityComments(postId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          user:public.users(
            username,
            full_name,
            avatar_url,
            points,
            level
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching community comments:', error);
      return [];
    }
  }

  async createCommunityComment(userId: string, postId: string, content: string): Promise<any> {
    try {
      // Get post author to reward points correctly
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (postError || !postData) {
        throw postError || new Error('Post not found');
      }

      const authorId = postData.user_id as string;

      // Ensure commenter has enough points to "thank" the author
      const commenterProfile = await this.getUserProfile(userId);
      if (!commenterProfile || (commenterProfile.points || 0) < 2) {
        throw new Error('Not enough points to comment');
      }

      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          user_id: userId,
          post_id: postId,
          content,
        })
        .select(`
          *,
          user:public.users(
            username,
            full_name,
            avatar_url,
            points,
            level
          )
        `)
        .single();

      if (error) throw error;

      // Transfer points: commenter pays 2 points, author receives 2 points
      await this.addPoints(userId, -2);
      if (authorId && authorId !== userId) {
        await this.addPoints(authorId, 2);
      }

      // Create notification for post author about the comment
      if (authorId && authorId !== userId) {
        try {
          const { communityService } = await import('./communityService');
          
          await communityService.createNotification(
            authorId,
            'post_comment',
            'Your post has a comment',
            'Someone commented on your post',
            { postId, fromUserId: userId }
          );
        } catch (notifError) {
          console.warn('Could not create comment notification:', notifError);
        }
      }

      return data;
    } catch (error) {
      console.error('Error creating community comment:', error);
      return null;
    }
  }

  async toggleCommunityLike(userId: string, postId: string): Promise<boolean> {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        if (error) throw error;
        return false; // Unliked
      } else {
        // Like – ensure user has enough points
        const likerProfile = await this.getUserProfile(userId);
        if (!likerProfile || (likerProfile.points || 0) < 2) {
          throw new Error('Not enough points to like');
        }

        // Get post author to reward points correctly
        const { data: postData, error: postError } = await supabase
          .from('community_posts')
          .select('user_id')
          .eq('id', postId)
          .single();

        if (postError || !postData) {
          throw postError || new Error('Post not found');
        }

        const authorId = postData.user_id as string;

        const { error } = await supabase
          .from('community_likes')
          .insert({
            user_id: userId,
            post_id: postId,
          });

        if (error) throw error;

        // Transfer points: liker pays 2 points, author receives 2 points
        await this.addPoints(userId, -2);
        if (authorId && authorId !== userId) {
          await this.addPoints(authorId, 2);
        }

        // Create notification for post author about the like
        if (authorId && authorId !== userId) {
          try {
            const { communityService } = await import('./communityService');
            
            await communityService.createNotification(
              authorId,
              'post_like',
              'Your post was liked',
              'Someone liked your post (+2 points)',
              { postId, fromUserId: userId, points: 2 }
            );
          } catch (notifError) {
            console.warn('Could not create like notification:', notifError);
          }
        }

        return true; // Liked
      }
    } catch (error) {
      console.error('Error toggling community like:', error);
      return false;
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
          table: 'users',
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
          table: 'users',
          filter: `id=eq.${userId}`,
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
        async (payload) => {
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
