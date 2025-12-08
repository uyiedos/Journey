import { supabaseService } from './supabaseService';

export interface SocialInteraction {
  type: 'like' | 'comment' | 'share';
  targetId: string;
  targetType: 'post' | 'devotional' | 'prayer';
  userId: string;
}

export class SocialService {
  private static instance: SocialService;

  static getInstance(): SocialService {
    if (!SocialService.instance) {
      SocialService.instance = new SocialService();
    }
    return SocialService.instance;
  }

  // Like/Unlike functionality
  async toggleLike(targetId: string, targetType: 'post' | 'devotional' | 'prayer', userId: string): Promise<{ liked: boolean; count: number }> {
    try {
      // Check if already liked
      const { data: existingLike } = await supabaseService.getClient()
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .maybeSingle();

      if (existingLike) {
        // Remove like
        await supabaseService.getClient()
          .from('likes')
          .delete()
          .eq('user_id', userId)
          .eq('target_id', targetId)
          .eq('target_type', targetType);

        // Update count
        await this.updateCount(targetId, targetType, 'likes_count', -1);
        
        return { liked: false, count: await this.getCount(targetId, targetType, 'likes_count') };
      } else {
        // Add like
        await supabaseService.getClient()
          .from('likes')
          .insert({
            user_id: userId,
            target_id: targetId,
            target_type: targetType,
          });

        // Update count
        await this.updateCount(targetId, targetType, 'likes_count', 1);
        
        return { liked: true, count: await this.getCount(targetId, targetType, 'likes_count') };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Check if user liked something
  async hasUserLiked(targetId: string, targetType: 'post' | 'devotional' | 'prayer', userId: string): Promise<boolean> {
    try {
      const { data } = await supabaseService.getClient()
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .maybeSingle();

      return !!data;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }

  // Add comment
  async addComment(targetId: string, targetType: 'post' | 'devotional' | 'prayer', userId: string, content: string): Promise<any> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('comments')
        .insert({
          user_id: userId,
          target_id: targetId,
          target_type: targetType,
          content: content.trim(),
        })
        .select(`
          *,
          user:users(id, username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Update count
      await this.updateCount(targetId, targetType, 'comments_count', 1);

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get comments
  async getComments(targetId: string, targetType: 'post' | 'devotional' | 'prayer'): Promise<any[]> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('comments')
        .select(`
          *,
          user:users(id, username, full_name, avatar_url)
        `)
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Share functionality
  async share(targetId: string, targetType: 'post' | 'devotional' | 'prayer', userId: string): Promise<{ count: number }> {
    try {
      // Record share
      await supabaseService.getClient()
        .from('shares')
        .insert({
          user_id: userId,
          target_id: targetId,
          target_type: targetType,
        });

      // Update count
      await this.updateCount(targetId, targetType, 'shares_count', 1);
      
      return { count: await this.getCount(targetId, targetType, 'shares_count') };
    } catch (error) {
      console.error('Error recording share:', error);
      throw error;
    }
  }

  // Get current count
  private async getCount(targetId: string, targetType: 'post' | 'devotional' | 'prayer', countField: string): Promise<number> {
    try {
      let tableName = '';
      switch (targetType) {
        case 'post':
          tableName = 'community_posts';
          break;
        case 'devotional':
          tableName = 'devotionals';
          break;
        case 'prayer':
          tableName = 'prayer_requests';
          break;
        default:
          return 0;
      }

      const { data } = await supabaseService.getClient()
        .from(tableName)
        .select(countField)
        .eq('id', targetId)
        .single();

      return (data as any)?.[countField] || 0;
    } catch (error) {
      console.error('Error getting count:', error);
      return 0;
    }
  }

  // Update count in target table
  private async updateCount(targetId: string, targetType: 'post' | 'devotional' | 'prayer', countField: string, increment: number): Promise<void> {
    try {
      let tableName = '';
      switch (targetType) {
        case 'post':
          tableName = 'community_posts';
          break;
        case 'devotional':
          tableName = 'devotionals';
          break;
        case 'prayer':
          tableName = 'prayer_requests';
          break;
        default:
          return;
      }

      // Use RPC to safely increment the count
      const { error } = await supabaseService.getClient()
        .rpc('increment_count', {
          table_name: tableName,
          record_id: targetId,
          column_name: countField,
          increment_value: increment
        });

      if (error) {
        // Fallback: fetch current count and update
        const { data: current } = await supabaseService.getClient()
          .from(tableName)
          .select(countField)
          .eq('id', targetId)
          .single();

        if (current) {
          const newCount = Math.max(0, ((current as any)[countField] || 0) + increment);
          await supabaseService.getClient()
            .from(tableName)
            .update({ [countField]: newCount })
            .eq('id', targetId);
        }
      }
    } catch (error) {
      console.error('Error updating count:', error);
    }
  }

  // Get user's social activity
  async getUserSocialActivity(userId: string): Promise<{ likes: any[]; comments: any[]; shares: any[] }> {
    try {
      const [likes, comments, shares] = await Promise.all([
        supabaseService.getClient()
          .from('likes')
          .select(`
            *,
            target:community_posts(id, content, created_at)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        
        supabaseService.getClient()
          .from('comments')
          .select(`
            *,
            target:community_posts(id, content, created_at)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),

        supabaseService.getClient()
          .from('shares')
          .select(`
            *,
            target:community_posts(id, content, created_at)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      return {
        likes: likes.data || [],
        comments: comments.data || [],
        shares: shares.data || [],
      };
    } catch (error) {
      console.error('Error fetching user social activity:', error);
      return { likes: [], comments: [], shares: [] };
    }
  }
}

export const socialService = SocialService.getInstance();
