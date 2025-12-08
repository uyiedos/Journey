import { supabaseService } from './supabaseService';
import { achievements, getAchievementById } from '@/data/achievements';
import { Achievement } from '@/types';

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  points_awarded: number;
}

export interface DailyLoginRecord {
  id: string;
  user_id: string;
  login_date: string;
  points_awarded: number;
  created_at: string;
}

class AchievementService {
  // Daily Login Tracking
  static async trackDailyLogin(userId: string): Promise<{
    pointsAwarded: number;
    newAchievements: Achievement[];
    streakUpdated: boolean;
  }> {
    const now = new Date();
    
    try {
      // Check if user has claimed in the last 24 hours
      const existingLogin = await this.getRecentLoginRecord(userId);
      
      if (existingLogin) {
        return {
          pointsAwarded: 0,
          newAchievements: [],
          streakUpdated: false,
        };
      }

      // Record today's login and award points
      const pointsAwarded = await this.awardDailyLoginPoints(userId);
      
      // Update streak
      const streakUpdated = await this.updateLoginStreak(userId);
      
      // Check for new achievements
      const newAchievements = await this.checkDailyLoginAchievements(userId);

      return {
        pointsAwarded,
        newAchievements,
        streakUpdated,
      };
    } catch (error) {
      console.error('Error tracking daily login:', error);
      return {
        pointsAwarded: 0,
        newAchievements: [],
        streakUpdated: false,
      };
    }
  }

  private static async getRecentLoginRecord(userId: string): Promise<DailyLoginRecord | null> {
    try {
      const now = new Date();
      const { data, error } = await supabaseService.getClient()
        .from('daily_login_rewards')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking recent login:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting recent login record:', error);
      return null;
    }
  }

  private static async awardDailyLoginPoints(userId: string): Promise<number> {
    const basePoints = 5;
    const userProfile = await supabaseService.getUserProfile(userId);
    
    if (!userProfile) return 0;

    // Bonus points for streak milestones
    let bonusPoints = 0;
    if (userProfile.streak === 7) bonusPoints = 10;
    if (userProfile.streak === 30) bonusPoints = 25;
    if (userProfile.streak === 100) bonusPoints = 100;

    const totalPoints = basePoints + bonusPoints;
    
    // Add points to user profile
    await supabaseService.addPoints(userId, totalPoints);
    
    // Record daily login
    await this.recordDailyLogin(userId, totalPoints);
    
    return totalPoints;
  }

  private static async recordDailyLogin(userId: string, points: number): Promise<void> {
    try {
      await supabaseService.getClient()
        .from('daily_login_rewards')
        .insert({
          user_id: userId,
          points_awarded: points,
        });
    } catch (error) {
      console.error('Error recording daily login:', error);
    }
  }

  private static async updateLoginStreak(userId: string): Promise<boolean> {
    try {
      const userProfile = await supabaseService.getUserProfile(userId);
      if (!userProfile) return false;

      const now = new Date();
      const lastActive = new Date(userProfile.updated_at);
      
      // Calculate hours difference
      const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      
      let newStreak = userProfile.streak;
      
      if (hoursDiff < 24) {
        // Already claimed within 24 hours, no change
        return false;
      } else if (hoursDiff <= 48) {
        // Continue streak (within 48 hours)
        newStreak += 1;
      } else {
        // Reset streak (more than 48 hours)
        newStreak = 1;
      }
      
      await supabaseService.updateStreak(userId, newStreak);
      return true;
    } catch (error) {
      console.error('Error updating login streak:', error);
      return false;
    }
  }

  private static async checkDailyLoginAchievements(userId: string): Promise<Achievement[]> {
    const userProfile = await supabaseService.getUserProfile(userId);
    if (!userProfile) return [];

    const newAchievements: Achievement[] = [];
    const userAchievements = await this.getUserAchievements(userId);
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));

    // Check daily login achievements
    const dailyAchievements = achievements.filter(a => a.category === 'daily');
    
    for (const achievement of dailyAchievements) {
      if (unlockedIds.has(achievement.id)) continue;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'daily-login-1':
          shouldUnlock = userProfile.streak >= 1;
          break;
        case 'daily-login-7':
          shouldUnlock = userProfile.streak >= 7;
          break;
        case 'daily-login-30':
          shouldUnlock = userProfile.streak >= 30;
          break;
      }
      
      if (shouldUnlock) {
        await this.unlockAchievement(userId, achievement.id);
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  // Achievement Management
  static async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      const achievement = getAchievementById(achievementId);
      if (!achievement) return false;

      // Check if already unlocked
      const existing = await this.getUserAchievement(userId, achievementId);
      if (existing) return false;

      // Record achievement unlock
      await supabaseService.getClient()
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
          points_awarded: achievement.points,
        });

      // Award achievement points
      await supabaseService.addPoints(userId, achievement.points);

      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }

  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        console.error('Error fetching user achievements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  static async getUserAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      if (error) {
        console.error('Error fetching user achievement:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user achievement:', error);
      return null;
    }
  }

  // Enhanced Activity Tracking
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
      // Track the specific activity and award points
      switch (activityType) {
        case 'verse_read':
          pointsAwarded = 1;
          await this.checkReadingAchievements(userId);
          break;
        case 'chapter_completed':
          pointsAwarded = 10;
          await this.checkReadingAchievements(userId);
          break;
        case 'book_completed':
          pointsAwarded = 50;
          await this.checkReadingAchievements(userId);
          break;
        case 'post_created':
          pointsAwarded = 20;
          await this.checkCommunityAchievements(userId);
          break;
        case 'friend_added':
          pointsAwarded = 15;
          await this.checkCommunityAchievements(userId);
          break;
        default:
          pointsAwarded = 0;
      }

      // Award points
      if (pointsAwarded > 0) {
        await supabaseService.addPoints(userId, pointsAwarded);
      }

      return { pointsAwarded, newAchievements };
    } catch (error) {
      console.error('Error tracking activity and achievements:', error);
      return { pointsAwarded: 0, newAchievements: [] };
    }
  }

  private static async checkReadingAchievements(userId: string): Promise<Achievement[]> {
    // Implementation for checking reading achievements
    // This would check verses read, chapters completed, etc.
    return [];
  }

  private static async checkCommunityAchievements(userId: string): Promise<Achievement[]> {
    // Implementation for checking community achievements
    // This would check friends count, posts created, etc.
    return [];
  }

  // Check and award achievements based on user activity
  static async checkAndAwardAchievements(userId: string): Promise<{
    newAchievements: Achievement[];
    pointsAwarded: number;
  }> {
    try {
      const newAchievements: Achievement[] = [];
      let totalPointsAwarded = 0;

      // Get user stats
      const userStats = await supabaseService.getUserStats(userId);
      if (!userStats) {
        return { newAchievements, pointsAwarded: 0 };
      }

      // Get user profile for streak info
      const userProfile = await supabaseService.getUserProfile(userId);
      if (!userProfile) {
        return { newAchievements, pointsAwarded: 0 };
      }

      // Get existing achievements to avoid duplicates
      const existingAchievements = await supabaseService.getUserAchievements(userId);
      const unlockedIds = new Set(existingAchievements.map(ua => ua.achievement_id));

      // Check all achievements
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
            shouldAward = userStats.verses_read > 0;
            break;
          case 'chapter-complete':
            shouldAward = userStats.chapters_completed >= 1;
            break;
          case 'book-complete':
            shouldAward = userStats.chapters_completed >= 10; // Approximate
            break;
          case 'testament-complete':
            shouldAward = userStats.chapters_completed >= 50; // Approximate
            break;
          case 'bible-complete':
            shouldAward = userStats.chapters_completed >= 1189; // All chapters
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

          // Devotional Achievements
          case 'first-devotional':
            shouldAward = userStats.devotionals_created >= 1;
            break;
          case 'devotional-writer':
            shouldAward = userStats.devotionals_created >= 5;
            break;
          case 'devotional-author':
            shouldAward = userStats.devotionals_created >= 20;
            break;

          // Prayer Achievements
          case 'first-prayer':
            shouldAward = userStats.prayers_shared >= 1;
            break;
          case 'prayer-warrior':
            shouldAward = userStats.prayers_shared >= 10;
            break;
          case 'prayer-intercessor':
            shouldAward = userStats.prayers_shared >= 50;
            break;

          // Reading Plan Achievements
          case 'first-plan':
            shouldAward = userStats.reading_plans_started >= 1;
            break;
          case 'plan-completer':
            shouldAward = userStats.reading_plans_completed >= 1;
            break;
          case 'plan-enthusiast':
            shouldAward = userStats.reading_plans_started >= 5;
            break;

          // Community Achievements
          case 'first-friend':
            shouldAward = userStats.friends_count >= 1;
            break;
          case 'social-butterfly':
            shouldAward = userStats.friends_count >= 10;
            break;
          case 'first-post':
            shouldAward = userStats.community_posts >= 1;
            break;
          case 'community-leader':
            shouldAward = userStats.community_posts >= 10;
            break;

          // Special Achievements
          case 'early-bird':
            shouldAward = !!(userProfile.created_at && new Date(userProfile.created_at) < new Date('2024-01-01'));
            break;
          case 'point-collector':
            shouldAward = userProfile.points >= 100;
            break;
          case 'point-master':
            shouldAward = userProfile.points >= 1000;
            break;
          case 'point-legend':
            shouldAward = userProfile.points >= 10000;
            break;
        }

        if (shouldAward) {
          // Award the achievement
          const awarded = await supabaseService.unlockAchievement(userId, achievement.id);
          if (awarded) {
            newAchievements.push(achievement);
            totalPointsAwarded += achievement.points;
          }
        }
      }

      // Award total points for new achievements
      if (totalPointsAwarded > 0) {
        await supabaseService.addPoints(userId, totalPointsAwarded);
      }

      return { newAchievements, pointsAwarded: totalPointsAwarded };
    } catch (error) {
      console.error('Error checking achievements:', error);
      return { newAchievements: [], pointsAwarded: 0 };
    }
  }
  static async getAchievementStats(userId: string): Promise<{
    totalAchievements: number;
    unlockedAchievements: number;
    totalPoints: number;
    categoryProgress: Record<string, { unlocked: number; total: number }>;
  }> {
    try {
      const allAchievements = achievements;
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));

      const categories = [...new Set(allAchievements.map(a => a.category))];
      const categoryProgress: Record<string, { unlocked: number; total: number }> = {};

      categories.forEach(category => {
        const categoryAchievements = allAchievements.filter(a => a.category === category);
        const unlockedInCategory = categoryAchievements.filter(a => unlockedIds.has(a.id));
        
        categoryProgress[category] = {
          unlocked: unlockedInCategory.length,
          total: categoryAchievements.length,
        };
      });

      return {
        totalAchievements: allAchievements.length,
        unlockedAchievements: userAchievements.length,
        totalPoints: userAchievements.reduce((sum, ua) => sum + ua.points_awarded, 0),
        categoryProgress,
      };
    } catch (error) {
      console.error('Error getting achievement stats:', error);
      return {
        totalAchievements: 0,
        unlockedAchievements: 0,
        totalPoints: 0,
        categoryProgress: {},
      };
    }
  }
}

export const achievementService = AchievementService;
