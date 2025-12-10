import { supabaseService } from './supabaseService';
import { achievementService } from './achievementService';
import { streakService } from './streakService';

export class ActivityService {
  // Reading Activities
  static async trackVerseRead(userId: string, book: string, chapter: number, verse: number): Promise<void> {
    try {
      // Update reading progress
      await supabaseService.updateReadingProgress(userId, book, chapter, 1);
      
      // Track activity and check achievements
      const result = await achievementService.trackActivityAndCheckAchievements(userId, 'verse_read', {
        book,
        chapter,
        verse,
      });
      
      // Update streak if they read today
      const streakResult = await streakService.updateStreak(userId, 'verse_read');
      
      // Log activity
      await this.logActivity(userId, 'verse_read', {
        book,
        chapter,
        verse,
        pointsAwarded: result.pointsAwarded,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking verse read:', error);
    }
  }

  static async trackChapterCompleted(userId: string, book: string, chapter: number): Promise<void> {
    try {
      // Update reading progress
      await supabaseService.updateReadingProgress(userId, book, chapter, 0);
      
      // Track activity and check achievements
      const result = await achievementService.trackActivityAndCheckAchievements(userId, 'chapter_completed', {
        book,
        chapter,
      });
      
      // Update streak if they read today
      const streakResult = await streakService.updateStreak(userId, 'chapter_completed');
      
      // Log activity
      await this.logActivity(userId, 'chapter_completed', {
        book,
        chapter,
        pointsAwarded: result.pointsAwarded,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking chapter completed:', error);
    }
  }

  static async trackReadingSession(userId: string, minutesRead: number, versesRead: number = 0): Promise<void> {
    try {
      // Add reading time
      await supabaseService.addReadingTime(userId, minutesRead);
      
      // Add points for reading time (1 point per minute)
      await supabaseService.addPoints(userId, minutesRead);
      
      // Update reading progress if verses were read
      if (versesRead > 0) {
        await supabaseService.updateReadingProgress(userId, 'general', 0, versesRead);
      }
      
      // Update streak if they read today
      const streakResult = await streakService.updateStreak(userId, 'reading_session');
      
      // Log activity
      await this.logActivity(userId, 'reading_session', {
        minutesRead,
        versesRead,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking reading session:', error);
    }
  }

  // Devotional Activities
  static async trackDevotionalCreated(userId: string, devotionalId: string): Promise<void> {
    try {
      await supabaseService.createDevotional(userId);
      
      // Track activity and check achievements
      const result = await achievementService.trackActivityAndCheckAchievements(userId, 'devotional_created', {
        devotionalId,
      });
      
      // Log activity
      await this.logActivity(userId, 'devotional_created', {
        devotionalId,
        pointsAwarded: result.pointsAwarded,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking devotional created:', error);
    }
  }

  static async trackDevotionalLiked(userId: string, devotionalId: string): Promise<void> {
    try {
      // Add points for engaging with content (2 points)
      await supabaseService.addPoints(userId, 2);
      
      // Log activity
      await this.logActivity(userId, 'devotional_liked', {
        devotionalId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking devotional liked:', error);
    }
  }

  // Prayer Activities
  static async trackPrayerShared(userId: string, prayerId: string): Promise<void> {
    try {
      await supabaseService.sharePrayer(userId);
      
      // Add points for sharing prayer (15 points)
      await supabaseService.addPoints(userId, 15);
      
      // Log activity
      await this.logActivity(userId, 'prayer_shared', {
        prayerId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking prayer shared:', error);
    }
  }

  static async trackPrayerResponded(userId: string, prayerId: string): Promise<void> {
    try {
      // Add points for responding to prayer (5 points)
      await supabaseService.addPoints(userId, 5);
      
      // Log activity
      await this.logActivity(userId, 'prayer_responded', {
        prayerId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking prayer responded:', error);
    }
  }

  // Community Activities
  static async trackPostCreated(userId: string, postId: string): Promise<void> {
    try {
      // Track activity and check achievements (no base points from achievements for posts)
      const result = await achievementService.trackActivityAndCheckAchievements(userId, 'post_created', {
        postId,
      });

      // Award fixed points for creating a post (10 points total per post)
      await supabaseService.addPoints(userId, 10);
      
      // Log activity
      await this.logActivity(userId, 'post_created', {
        postId,
        pointsAwarded: result.pointsAwarded,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking post created:', error);
    }
  }

  static async trackPostLiked(userId: string, postId: string): Promise<void> {
    try {
      // Log activity
      await this.logActivity(userId, 'post_liked', {
        postId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking post liked:', error);
    }
  }

  static async trackCommentPosted(userId: string, postId: string, commentId: string): Promise<void> {
    try {
      // Add points for commenting (2 points)
      await supabaseService.addPoints(userId, 2);
      
      // Log activity
      await this.logActivity(userId, 'comment_posted', {
        postId,
        commentId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking comment posted:', error);
    }
  }

  // Achievement Activities
  static async trackAchievementUnlocked(userId: string, achievementId: string): Promise<void> {
    try {
      // Add bonus points for achievements (50 points)
      await supabaseService.addPoints(userId, 50);
      
      // Log activity
      await this.logActivity(userId, 'achievement_unlocked', {
        achievementId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking achievement unlocked:', error);
    }
  }

  // Streak Management
  private static async updateDailyStreak(userId: string): Promise<void> {
    try {
      const userProfile = await supabaseService.getUserProfile(userId);
      if (!userProfile) return;

      const today = new Date().toDateString();
      const lastActive = new Date(userProfile.updated_at).toDateString();
      
      // If last active was yesterday, increment streak
      // If last active was today, keep current streak
      // If last active was before yesterday, reset streak to 1
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = userProfile.streak;
      
      if (lastActive === today) {
        // Already active today, no change
        return;
      } else if (lastActive === yesterday.toDateString()) {
        // Continue streak
        newStreak += 1;
      } else {
        // Reset streak
        newStreak = 1;
      }
      
      await supabaseService.updateStreak(userId, newStreak);
      
      // Log streak activity
      await this.logActivity(userId, 'streak_updated', {
        newStreak,
        previousStreak: userProfile.streak,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating daily streak:', error);
    }
  }

  // Activity Logging (for analytics and debugging)
  private static async logActivity(userId: string, activityType: string, metadata: Record<string, any>): Promise<void> {
    try {
      // This would log to an activities table for analytics
      // For now, just log to console
      console.log(`Activity logged for user ${userId}: ${activityType}`, metadata);
      
      // In a real implementation, you would:
      // await supabase.from('user_activities').insert({
      //   user_id: userId,
      //   activity_type: activityType,
      //   metadata: metadata,
      //   created_at: new Date().toISOString(),
      // });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Level Progress
  static async checkLevelProgress(userId: string): Promise<{ currentLevel: number; pointsToNext: number; progress: number }> {
    try {
      const userProfile = await supabaseService.getUserProfile(userId);
      if (!userProfile) {
        return { currentLevel: 1, pointsToNext: 1000, progress: 0 };
      }

      const pointsInCurrentLevel = userProfile.points % 1000;
      const pointsToNext = 1000 - pointsInCurrentLevel;
      const progress = (pointsInCurrentLevel / 1000) * 100;

      return {
        currentLevel: userProfile.level,
        pointsToNext,
        progress,
      };
    } catch (error) {
      console.error('Error checking level progress:', error);
      return { currentLevel: 1, pointsToNext: 1000, progress: 0 };
    }
  }
}

export const activityService = ActivityService;
