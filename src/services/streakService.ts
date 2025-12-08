import { supabaseService } from './supabaseService';
import { achievementService } from './achievementService';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakHistory: StreakRecord[];
  milestones: StreakMilestone[];
}

export interface StreakRecord {
  date: string;
  activity_count: number;
  points_earned: number;
  maintained: boolean;
}

export interface StreakMilestone {
  streak_number: number;
  achieved_at: string;
  bonus_points: number;
}

class StreakService {
  // Enhanced streak tracking
  static async updateStreak(userId: string, activityType: string): Promise<{
    streakUpdated: boolean;
    newStreak: number;
    streakMilestoneAchieved?: StreakMilestone;
  }> {
    try {
      const userProfile = await supabaseService.getUserProfile(userId);
      if (!userProfile) {
        return { streakUpdated: false, newStreak: 0 };
      }

      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const lastActive = new Date(userProfile.updated_at);
      const lastActiveString = lastActive.toISOString().split('T')[0];
      
      let newStreak = userProfile.streak;
      let streakUpdated = false;
      let streakMilestoneAchieved: StreakMilestone | undefined;

      // Calculate streak based on activity
      if (lastActiveString === todayString) {
        // Already active today, no streak change
        return { streakUpdated: false, newStreak };
      } else if (this.isYesterday(lastActive, today)) {
        // Continue streak
        newStreak += 1;
        streakUpdated = true;
      } else {
        // Reset streak
        newStreak = 1;
        streakUpdated = true;
      }

      // Update streak in database
      await supabaseService.updateStreak(userId, newStreak);
      
      // Record streak activity
      await this.recordStreakActivity(userId, todayString, activityType);
      
      // Check for streak milestones
      streakMilestoneAchieved = await this.checkStreakMilestones(userId, newStreak);

      return {
        streakUpdated,
        newStreak,
        streakMilestoneAchieved,
      };
    } catch (error) {
      console.error('Error updating streak:', error);
      return { streakUpdated: false, newStreak: 0 };
    }
  }

  private static isYesterday(lastActive: Date, today: Date): boolean {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return lastActive.toDateString() === yesterday.toDateString();
  }

  private static async recordStreakActivity(userId: string, date: string, activityType: string): Promise<void> {
    try {
      // Check if record exists for today
      const { data: existingRecord } = await supabaseService.getClient()
        .from('streak_activities')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (existingRecord) {
        // Update existing record
        await supabaseService.getClient()
          .from('streak_activities')
          .update({
            activity_count: existingRecord.activity_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecord.id);
      } else {
        // Create new record
        await supabaseService.getClient()
          .from('streak_activities')
          .insert({
            user_id: userId,
            date,
            activity_type: activityType,
            activity_count: 1,
            maintained: true,
          });
      }
    } catch (error) {
      console.error('Error recording streak activity:', error);
    }
  }

  private static async checkStreakMilestones(userId: string, streak: number): Promise<StreakMilestone | undefined> {
    const milestones = [
      { streak_number: 3, bonus_points: 10 },
      { streak_number: 7, bonus_points: 25 },
      { streak_number: 14, bonus_points: 50 },
      { streak_number: 30, bonus_points: 100 },
      { streak_number: 50, bonus_points: 200 },
      { streak_number: 100, bonus_points: 500 },
      { streak_number: 365, bonus_points: 1000 },
    ];

    const milestone = milestones.find(m => m.streak_number === streak);
    if (!milestone) return undefined;

    try {
      // Check if milestone already achieved
      const { data: existingMilestone } = await supabaseService.getClient()
        .from('streak_milestones')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_number', streak)
        .single();

      if (existingMilestone) return undefined;

      // Record milestone achievement
      const milestoneData: StreakMilestone = {
        streak_number: streak,
        achieved_at: new Date().toISOString(),
        bonus_points: milestone.bonus_points,
      };

      await supabaseService.getClient()
        .from('streak_milestones')
        .insert({
          user_id: userId,
          streak_number: streak,
          achieved_at: milestoneData.achieved_at,
          bonus_points: milestone.bonus_points,
        });

      // Award bonus points
      await supabaseService.addPoints(userId, milestone.bonus_points);

      return milestoneData;
    } catch (error) {
      console.error('Error checking streak milestones:', error);
      return undefined;
    }
  }

  // Get comprehensive streak data
  static async getStreakData(userId: string): Promise<StreakData> {
    try {
      const userProfile = await supabaseService.getUserProfile(userId);
      if (!userProfile) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: '',
          streakHistory: [],
          milestones: [],
        };
      }

      // Get streak history
      const { data: streakHistory } = await supabaseService.getClient()
        .from('streak_activities')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      // Get milestones
      const { data: milestones } = await supabaseService.getClient()
        .from('streak_milestones')
        .select('*')
        .eq('user_id', userId)
        .order('streak_number', { ascending: false });

      return {
        currentStreak: userProfile.streak,
        longestStreak: userProfile.longest_streak || userProfile.streak,
        lastActiveDate: userProfile.updated_at,
        streakHistory: streakHistory || [],
        milestones: milestones || [],
      };
    } catch (error) {
      console.error('Error getting streak data:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: '',
        streakHistory: [],
        milestones: [],
      };
    }
  }

  // Check if streak is at risk
  static async getStreakStatus(userId: string): Promise<{
    isActive: boolean;
    hoursUntilReset: number;
    isAtRisk: boolean;
    nextMilestone: number;
  }> {
    try {
      const userProfile = await supabaseService.getUserProfile(userId);
      if (!userProfile) {
        return {
          isActive: false,
          hoursUntilReset: 0,
          isAtRisk: false,
          nextMilestone: 1,
        };
      }

      const now = new Date();
      const lastActive = new Date(userProfile.updated_at);
      const hoursSinceLastActivity = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      
      // Streak resets after 48 hours of inactivity
      const hoursUntilReset = Math.max(0, 48 - hoursSinceLastActivity);
      const isAtRisk = hoursSinceLastActivity > 24;
      const isActive = hoursSinceLastActivity < 48;

      // Calculate next milestone
      const currentStreak = userProfile.streak;
      const milestones = [3, 7, 14, 30, 50, 100, 365];
      const nextMilestone = milestones.find(m => m > currentStreak) || 366;

      return {
        isActive,
        hoursUntilReset: Math.round(hoursUntilReset),
        isAtRisk,
        nextMilestone,
      };
    } catch (error) {
      console.error('Error getting streak status:', error);
      return {
        isActive: false,
        hoursUntilReset: 0,
        isAtRisk: false,
        nextMilestone: 1,
      };
    }
  }

  // Get streak predictions
  static async getStreakPrediction(userId: string): Promise<{
    currentStreak: number;
    predictedWeeklyStreak: number;
    predictedMonthlyStreak: number;
    streakProbability: number;
  }> {
    try {
      const streakData = await this.getStreakData(userId);
      const currentStreak = streakData.currentStreak;

      // Simple prediction based on recent activity patterns
      const recentActivities = streakData.streakHistory.slice(0, 7);
      const activeDays = recentActivities.filter(day => day.maintained).length;
      
      const streakProbability = recentActivities.length > 0 ? activeDays / recentActivities.length : 0;
      
      const predictedWeeklyStreak = currentStreak + (streakProbability * 7);
      const predictedMonthlyStreak = currentStreak + (streakProbability * 30);

      return {
        currentStreak,
        predictedWeeklyStreak: Math.round(predictedWeeklyStreak),
        predictedMonthlyStreak: Math.round(predictedMonthlyStreak),
        streakProbability: Math.round(streakProbability * 100),
      };
    } catch (error) {
      console.error('Error getting streak prediction:', error);
      return {
        currentStreak: 0,
        predictedWeeklyStreak: 0,
        predictedMonthlyStreak: 0,
        streakProbability: 0,
      };
    }
  }

  // Reset streak (for testing or admin purposes)
  static async resetStreak(userId: string): Promise<boolean> {
    try {
      await supabaseService.updateStreak(userId, 0);
      
      // Log streak reset
      await supabaseService.getClient()
        .from('streak_activities')
        .insert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          activity_type: 'streak_reset',
          activity_count: 0,
          maintained: false,
        });

      return true;
    } catch (error) {
      console.error('Error resetting streak:', error);
      return false;
    }
  }
}

export const streakService = StreakService;
