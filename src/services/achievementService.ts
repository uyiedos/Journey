import { supabaseService } from './supabaseService';
import { achievements, getAchievementById } from '@/data/achievements';
import { Achievement } from '@/types';

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  max_progress: number;
  is_unlocked: boolean;
  rewards_claimed: boolean;
}

export interface AchievementProgress {
  id: string;
  user_id: string;
  achievement_id: string;
  current_value: number;
  last_updated: string;
}

class AchievementService {

  // Enhanced Achievement Management with Database Integration
  static async updateAchievementProgress(
    userId: string, 
    achievementId: string, 
    incrementValue: number = 1
  ): Promise<{ unlocked: boolean; pointsAwarded: number }> {
    try {
      // Try to call the database function first
      const { data, error } = await supabaseService.getClient()
        .rpc('update_achievement_progress', {
          user_id_param: userId,
          achievement_id_param: achievementId,
          increment_value: incrementValue
        });

      if (error) {
        // If function doesn't exist, fall back to manual progress tracking
        if (error.code === 'PGRST202') {
          return await this.updateAchievementProgressFallback(userId, achievementId, incrementValue);
        }
        console.error('Error updating achievement progress:', error);
        return { unlocked: false, pointsAwarded: 0 };
      }

      return { 
        unlocked: !!data, 
        pointsAwarded: data ? this.getAchievementPoints(achievementId) : 0 
      };
    } catch (error) {
      console.error('Error updating achievement progress:', error);
      return { unlocked: false, pointsAwarded: 0 };
    }
  }

  // Fallback method when database function doesn't exist
  private static async updateAchievementProgressFallback(
    userId: string, 
    achievementId: string, 
    incrementValue: number = 1
  ): Promise<{ unlocked: boolean; pointsAwarded: number }> {
    try {
      const achievement = getAchievementById(achievementId);
      if (!achievement) return { unlocked: false, pointsAwarded: 0 };

      // Check if already unlocked using legacy method
      const existing = await this.getUserAchievement(userId, achievementId);
      if (existing && existing.is_unlocked) {
        return { unlocked: false, pointsAwarded: 0 };
      }

      // For now, simulate progress checking based on user points
      const userProfile = await supabaseService.getUserProfile(userId);
      if (!userProfile) {
        return { unlocked: false, pointsAwarded: 0 };
      }

      let shouldUnlock = false;
      
      // Simple logic based on achievement requirements
      if (achievement.requirements) {
        switch (achievement.requirements.type) {
          case 'count':
            shouldUnlock = userProfile.points >= achievement.requirements.target;
            break;
          case 'streak':
            shouldUnlock = userProfile.streak >= achievement.requirements.target;
            break;
          case 'points':
            shouldUnlock = userProfile.points >= achievement.requirements.target;
            break;
          case 'social':
            shouldUnlock = userProfile.points >= (achievement.requirements.target * 10);
            break;
          case 'group':
            shouldUnlock = userProfile.points >= (achievement.requirements.target * 50);
            break;
          case 'challenge':
            shouldUnlock = userProfile.points >= (achievement.requirements.target * 25);
            break;
        }
      } else {
        // Fallback to simple point-based logic
        shouldUnlock = userProfile.points >= achievement.points;
      }

      if (shouldUnlock) {
        // Create achievement record in user_achievements if table exists
        try {
          // Try to insert with new schema first
          const { error: insertError } = await supabaseService.getClient()
            .from('user_achievements')
            .upsert({
              user_id: userId,
              achievement_id: achievementId,
              unlocked_at: new Date().toISOString(),
              progress: 1,
              max_progress: 1,
              is_unlocked: true,
              rewards_claimed: false
            }, {
              onConflict: 'user_id,achievement_id'
            });

          if (insertError) {
            console.log('New schema insert failed, trying legacy:', insertError);
            // If new schema fails, try with legacy schema
            if (insertError.code === 'PGRST204' || insertError.code === '400' || insertError.code === 'PGRST116') {
              const { error: legacyError } = await supabaseService.getClient()
                .from('user_achievements')
                .upsert({
                  user_id: userId,
                  achievement_id: achievementId,
                  unlocked_at: new Date().toISOString(),
                  points_awarded: achievement.points
                }, {
                  onConflict: 'user_id,achievement_id'
                });

              if (legacyError && legacyError.code !== 'PGRST116') {
                console.log('Legacy schema insert also failed:', legacyError);
              } else if (!legacyError) {
                console.log('Legacy schema insert successful');
              }
            } else {
              console.error('Error creating achievement record:', insertError);
            }
          } else {
            console.log('New schema insert successful');
          }

          // Award points regardless of database record success
          await supabaseService.addPoints(userId, achievement.points);

          return { unlocked: true, pointsAwarded: achievement.points };
        } catch (insertError) {
          console.log('Exception in fallback achievement creation:', insertError);
          // Still award points even if database fails
          try {
            await supabaseService.addPoints(userId, achievement.points);
            return { unlocked: true, pointsAwarded: achievement.points };
          } catch (pointsError) {
            console.error('Error awarding points:', pointsError);
            return { unlocked: false, pointsAwarded: 0 };
          }
        }
      }

      return { unlocked: false, pointsAwarded: 0 };
    } catch (error) {
      console.error('Error in fallback progress update:', error);
      return { unlocked: false, pointsAwarded: 0 };
    }
  }

  private static getAchievementPoints(achievementId: string): number {
    const achievement = getAchievementById(achievementId);
    return achievement?.points || 0;
  }

  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      console.log('Attempting to fetch user achievements for:', userId);
      
      // Try new schema first
      const { data, error } = await supabaseService.getClient()
        .from('user_achievements')
        .select(`
          *,
          achievement:achievement_definitions(
            id,
            name,
            description,
            icon,
            points,
            category,
            rarity
          )
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      console.log('New schema query result:', { data: data?.length || 0, error });

      if (error) {
        console.log('New schema failed, trying legacy:', error);
        // If new schema fails, try legacy schema - handle PGRST200 (no relationship)
        if (error.code === 'PGRST116' || error.code === 'PGRST204' || error.code === 'PGRST200' || !error.code) {
          return this.getLegacyUserAchievements(userId);
        }
        console.error('Error fetching user achievements:', error);
        return this.getSampleUserAchievements(userId);
      }

      return data?.map(ua => ({
        ...ua,
        achievement: ua.achievement
      })) || [];
    } catch (error) {
      console.log('Exception in getUserAchievements:', error);
      console.error('Error getting user achievements:', error);
      return this.getSampleUserAchievements(userId);
    }
  }

  // Legacy method for old schema
  private static async getLegacyUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      console.log('Trying legacy schema for user achievements');
      const { data, error } = await supabaseService.getClient()
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      console.log('Legacy schema query result:', { data: data?.length || 0, error });

      if (error) {
        console.log('Legacy schema failed, using sample data:', error);
        if (error.code === 'PGRST116') {
          return this.getSampleUserAchievements(userId);
        }
        console.error('Error fetching legacy user achievements:', error);
        return this.getSampleUserAchievements(userId);
      }

      console.log('Legacy schema returned data:', data?.length || 0, 'achievements');
      return data?.map(ua => ({
        ...ua,
        progress: ua.points_awarded > 0 ? 1 : 0,
        max_progress: 1,
        is_unlocked: ua.points_awarded > 0,
        rewards_claimed: true,
        achievement: getAchievementById(ua.achievement_id)
      })) || [];
    } catch (error) {
      console.log('Exception in legacy user achievements:', error);
      console.error('Error getting legacy user achievements:', error);
      return this.getSampleUserAchievements(userId);
    }
  }

  static async getUserAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    try {
      console.log('Fetching single achievement:', { userId, achievementId });
      
      const { data, error } = await supabaseService.getClient()
        .from('user_achievements')
        .select(`
          *,
          achievement:achievement_definitions(
            id,
            name,
            description,
            icon,
            points,
            category,
            rarity
          )
        `)
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      console.log('Single achievement query result:', { data, error });

      if (error) {
        console.log('Single achievement query failed, trying legacy:', error);
        // Try legacy schema if new fails - handle PGRST200 (no relationship) and other errors
        if (error.code === 'PGRST116' || error.code === 'PGRST204' || error.code === 'PGRST200' || !error.code) {
          return this.getLegacyUserAchievement(userId, achievementId);
        }
        console.error('Error fetching user achievement:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.log('Exception in getUserAchievement:', error);
      console.error('Error getting user achievement:', error);
      return null;
    }
  }

  // Legacy method for single achievement
  private static async getLegacyUserAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    try {
      console.log('Trying legacy schema for single achievement:', { userId, achievementId });
      const { data, error } = await supabaseService.getClient()
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      console.log('Legacy single achievement result:', { data, error });

      if (error) {
        console.log('Legacy single achievement failed:', error);
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching legacy user achievement:', error);
        return null;
      }

      return data ? {
        ...data,
        progress: data.points_awarded > 0 ? 1 : 0,
        max_progress: 1,
        is_unlocked: data.points_awarded > 0,
        rewards_claimed: true,
        achievement: getAchievementById(data.achievement_id)
      } : null;
    } catch (error) {
      console.log('Exception in legacy single achievement:', error);
      console.error('Error getting legacy user achievement:', error);
      return null;
    }
  }

  static async getAchievementProgress(userId: string, achievementId: string): Promise<AchievementProgress | null> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('achievement_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching achievement progress:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return null;
    }
  }

  static async getUserBadges(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116') {
          return this.getSampleUserBadges(userId);
        }
        console.error('Error fetching user badges:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user badges:', error);
      return this.getSampleUserBadges(userId);
    }
  }

  static async getUserTitles(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('user_titles')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116') {
          return this.getSampleUserTitles(userId);
        }
        console.error('Error fetching user titles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user titles:', error);
      return this.getSampleUserTitles(userId);
    }
  }

  static async getUnlockedFeatures(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('user_unlocked_features')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116') {
          return this.getSampleUnlockedFeatures(userId);
        }
        console.error('Error fetching unlocked features:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting unlocked features:', error);
      return this.getSampleUnlockedFeatures(userId);
    }
  }

  // Enhanced Activity Tracking with Progress Updates
  static async trackActivityAndCheckAchievements(
    userId: string, 
    activityType: string, 
    metadata?: Record<string, any>
  ): Promise<{
    pointsAwarded: number;
    newAchievements: Achievement[];
  }> {
    const newAchievements: Achievement[] = [];
    let pointsAwarded = 0;

    try {
      // Track the specific activity and update achievement progress
      switch (activityType) {
        case 'verse_read':
          pointsAwarded = 1;
          await this.updateAchievementProgress(userId, 'first-verse', 1);
          break;
        case 'chapter_completed':
          pointsAwarded = 10;
          await this.updateAchievementProgress(userId, 'chapter-complete', 1);
          break;
        case 'book_completed':
          pointsAwarded = 50;
          await this.updateAchievementProgress(userId, 'book-complete', 1);
          break;
        case 'post_created':
          // Base points for posts are handled in ActivityService (10 per post)
          pointsAwarded = 0;
          await this.updateAchievementProgress(userId, 'first-post', 1);
          await this.updateAchievementProgress(userId, 'community-leader', 1);
          break;
        case 'friend_added':
          pointsAwarded = 15;
          await this.updateAchievementProgress(userId, 'first-friend', 1);
          await this.updateAchievementProgress(userId, 'social-butterfly', 1);
          break;
        case 'group_created':
          pointsAwarded = 50;
          await this.updateAchievementProgress(userId, 'group-founder', 1);
          await this.updateAchievementProgress(userId, 'group-builder', 1);
          break;
        case 'points_contributed':
          const contributedPoints = metadata?.points || 0;
          pointsAwarded = 0; // No points for contributing, just achievement progress
          await this.updateAchievementProgress(userId, 'points-contributor', contributedPoints);
          await this.updateAchievementProgress(userId, 'generous-giver', contributedPoints);
          await this.updateAchievementProgress(userId, 'group-master', contributedPoints);
          break;
        case 'challenge_completed':
          pointsAwarded = 25;
          await this.updateAchievementProgress(userId, 'challenge-champion', 1);
          break;
        case 'prayer_shared':
          pointsAwarded = 15;
          await this.updateAchievementProgress(userId, 'first-prayer', 1);
          await this.updateAchievementProgress(userId, 'prayer-warrior', 1);
          await this.updateAchievementProgress(userId, 'prayer-intercessor', 1);
          await this.updateAchievementProgress(userId, 'prayer-general', 1);
          break;
        case 'daily_login':
          // Daily base points are handled via claimDailyPoints (10 per day)
          pointsAwarded = 0;
          await this.updateAchievementProgress(userId, 'daily-login-1', 1);
          // Streak achievements would be handled separately
          break;
        default:
          pointsAwarded = 0;
      }

      // Award activity points
      if (pointsAwarded > 0) {
        await supabaseService.addPoints(userId, pointsAwarded);
      }

      return { pointsAwarded, newAchievements };
    } catch (error) {
      console.error('Error tracking activity and achievements:', error);
      return { pointsAwarded: 0, newAchievements: [] };
    }
  }

  // Sample data methods for fallback
  private static getSampleUserAchievements(userId: string): UserAchievement[] {
    return [
      {
        id: 'sample-1',
        user_id: userId,
        achievement_id: 'daily-login-1',
        unlocked_at: new Date().toISOString(),
        progress: 1,
        max_progress: 1,
        is_unlocked: true,
        rewards_claimed: true
      },
      {
        id: 'sample-2',
        user_id: userId,
        achievement_id: 'first-verse',
        unlocked_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        progress: 1,
        max_progress: 1,
        is_unlocked: true,
        rewards_claimed: true
      }
    ];
  }

  private static getSampleUserBadges(userId: string): any[] {
    return [
      {
        id: 'badge-1',
        user_id: userId,
        badge_id: 'newcomer',
        badge_name: 'Newcomer',
        badge_icon: 'sun',
        earned_at: new Date().toISOString(),
        is_equipped: true
      },
      {
        id: 'badge-2',
        user_id: userId,
        badge_id: 'reader',
        badge_name: 'Reader',
        badge_icon: 'book-open',
        earned_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_equipped: false
      }
    ];
  }

  private static getSampleUserTitles(userId: string): any[] {
    return [
      {
        id: 'title-1',
        user_id: userId,
        title_id: 'Bible Master',
        title_name: 'Bible Master',
        earned_at: new Date().toISOString(),
        is_active: true
      }
    ];
  }

  private static getSampleUnlockedFeatures(userId: string): any[] {
    return [
      {
        id: 'feature-1',
        user_id: userId,
        feature_key: 'group_creation',
        feature_name: 'Group Creation',
        unlocked_at: new Date().toISOString()
      },
      {
        id: 'feature-2',
        user_id: userId,
        feature_key: 'advanced_search',
        feature_name: 'Advanced Search',
        unlocked_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Check and award achievements based on user activity (Legacy compatibility)
  static async checkAndAwardAchievements(userId: string): Promise<{
    newAchievements: Achievement[];
    pointsAwarded: number;
  }> {
    try {
      const newAchievements: Achievement[] = [];
      let totalPointsAwarded = 0;

      // Get user profile for current stats
      const userProfile = await supabaseService.getUserProfile(userId);
      if (!userProfile) {
        return { newAchievements, pointsAwarded: 0 };
      }

      // Get existing achievements to avoid duplicates
      const existingAchievements = await this.getUserAchievements(userId);
      const unlockedIds = new Set(existingAchievements.map(ua => ua.achievement_id));

      // Check all achievements using the static definitions
      for (const achievement of achievements) {
        if (unlockedIds.has(achievement.id)) continue; // Skip if already unlocked

        let shouldAward = false;

        // Check based on achievement category and criteria
        switch (achievement.id) {
          // Daily Login Achievements
          case 'daily-login-1':
            shouldAward = true; // Awarded when user first logs in
            break;
          case 'daily-login-7':
            shouldAward = userProfile.streak >= 7;
            break;
          case 'daily-login-30':
            shouldAward = userProfile.streak >= 30;
            break;

          // Reading Achievements
          case 'first-verse':
            shouldAward = userProfile.points >= 10; // Approximate based on points
            break;
          case 'chapter-complete':
            shouldAward = userProfile.points >= 25;
            break;
          case 'book-complete':
            shouldAward = userProfile.points >= 100;
            break;
          case 'testament-complete':
            shouldAward = userProfile.points >= 500;
            break;
          case 'bible-complete':
            shouldAward = userProfile.points >= 1000;
            break;

          // Streak Achievements
          case 'streak-3':
            shouldAward = userProfile.streak >= 3;
            break;
          case 'streak-7':
            shouldAward = userProfile.streak >= 7;
            break;
          case 'streak-30':
            shouldAward = userProfile.streak >= 30;
            break;
          case 'streak-100':
            shouldAward = userProfile.streak >= 100;
            break;

          // Community Achievements
          case 'first-friend':
            shouldAward = userProfile.points >= 15; // Approximate
            break;
          case 'social-butterfly':
            shouldAward = userProfile.points >= 50;
            break;
          case 'community-connector':
            shouldAward = userProfile.points >= 150;
            break;
          case 'first-post':
            shouldAward = userProfile.points >= 20;
            break;
          case 'community-leader':
            shouldAward = userProfile.points >= 100;
            break;
          case 'content-creator':
            shouldAward = userProfile.points >= 300;
            break;
          case 'engagement-master':
            shouldAward = userProfile.points >= 200;
            break;

          // Group Achievements
          case 'group-founder':
            shouldAward = userProfile.points >= 50;
            break;
          case 'group-builder':
            shouldAward = userProfile.points >= 150;
            break;
          case 'points-contributor':
            shouldAward = userProfile.points >= 75;
            break;
          case 'generous-giver':
            shouldAward = userProfile.points >= 250;
            break;
          case 'challenge-champion':
            shouldAward = userProfile.points >= 200;
            break;
          case 'group-master':
            shouldAward = userProfile.points >= 500;
            break;

          // Prayer Achievements
          case 'first-prayer':
            shouldAward = userProfile.points >= 15;
            break;
          case 'prayer-warrior':
            shouldAward = userProfile.points >= 75;
            break;
          case 'prayer-intercessor':
            shouldAward = userProfile.points >= 200;
            break;
          case 'prayer-general':
            shouldAward = userProfile.points >= 400;
            break;

          // Points Achievements
          case 'point-collector':
            shouldAward = userProfile.points >= 100;
            break;
          case 'point-master':
            shouldAward = userProfile.points >= 1000;
            break;
          case 'point-legend':
            shouldAward = userProfile.points >= 10000;
            break;

          // Special Achievements
          case 'early-bird':
            shouldAward = !!(userProfile.created_at && new Date(userProfile.created_at as string) < new Date('2024-01-01'));
            break;
          case 'night-owl':
            shouldAward = userProfile.points >= 150;
            break;
          case 'explorer':
            shouldAward = userProfile.points >= 750;
            break;
          case 'community-angel':
            shouldAward = userProfile.points >= 300;
            break;
          case 'mood-master':
            shouldAward = userProfile.points >= 100;
            break;
        }

        if (shouldAward) {
          // Award the achievement using the enhanced progress system
          const { unlocked } = await this.updateAchievementProgress(userId, achievement.id, 1);
          if (unlocked) {
            newAchievements.push(achievement);
            totalPointsAwarded += achievement.points;
          }
        }
      }

      return { newAchievements, pointsAwarded: totalPointsAwarded };
    } catch (error) {
      console.error('Error checking achievements:', error);
      return { newAchievements: [], pointsAwarded: 0 };
    }
  }

  // Enhanced Stats with Database Integration
  static async getAchievementStats(userId: string): Promise<{
    totalAchievements: number;
    unlockedAchievements: number;
    totalPoints: number;
    categoryProgress: Record<string, { unlocked: number; total: number }>;
  }> {
    try {
      const { data: definitions, error: defError } = await supabaseService.getClient()
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true);

      if (defError) {
        if (defError.code === 'PGRST116') {
          return this.getSampleAchievementStats(userId);
        }
        throw defError;
      }

      const userAchievements = await this.getUserAchievements(userId);
      const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));

      const categories = [...new Set(definitions?.map((d: any) => d.category) || [])];
      const categoryProgress: Record<string, { unlocked: number; total: number }> = {};

      categories.forEach(category => {
        const categoryAchievements = definitions?.filter((d: any) => d.category === category) || [];
        const unlockedInCategory = categoryAchievements.filter((d: any) => unlockedIds.has(d.id));
        
        categoryProgress[category] = {
          unlocked: unlockedInCategory.length,
          total: categoryAchievements.length,
        };
      });

      return {
        totalAchievements: definitions?.length || 0,
        unlockedAchievements: userAchievements.length,
        totalPoints: userAchievements.reduce((sum, ua) => {
          const achievement = getAchievementById(ua.achievement_id);
          return sum + (achievement?.points || 0);
        }, 0),
        categoryProgress,
      };
    } catch (error) {
      console.error('Error getting achievement stats:', error);
      return this.getSampleAchievementStats(userId);
    }
  }

  private static getSampleAchievementStats(userId: string) {
    const allAchievements = achievements;
    const sampleUnlocked = ['daily-login-1', 'first-verse'];
    
    const categories = [...new Set(allAchievements.map(a => a.category))];
    const categoryProgress: Record<string, { unlocked: number; total: number }> = {};

    categories.forEach(category => {
      const categoryAchievements = allAchievements.filter(a => a.category === category);
      const unlockedInCategory = categoryAchievements.filter(a => sampleUnlocked.includes(a.id));
      
      categoryProgress[category] = {
        unlocked: unlockedInCategory.length,
        total: categoryAchievements.length,
      };
    });

    return {
      totalAchievements: allAchievements.length,
      unlockedAchievements: sampleUnlocked.length,
      totalPoints: 15, // Sample points
      categoryProgress,
    };
  }
}

export const achievementService = AchievementService;
