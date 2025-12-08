import { supabase } from '@/lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'user' | 'admin' | 'owner';
  is_active: boolean;
  points: number;
  level: number;
  streak: number;
  created_at: string;
  last_login_at: string | null;
  referral_code: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'announcement' | 'maintenance' | 'feature' | 'spiritual';
  target_audience: 'all' | 'admins' | 'users';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface UserMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  message_type: 'message' | 'announcement' | 'warning' | 'reward';
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  author_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
}

export interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'rewarded';
  points_awarded: number;
  created_at: string;
  completed_at: string | null;
}

export class AdminService {
  // User Management
  static async getAllUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateUserRole(userId: string, role: 'user' | 'admin' | 'owner'): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
  }

  static async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (error) throw error;
  }

  static async awardPointsToUser(userId: string, points: number, description: string): Promise<void> {
    // Add points transaction
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'admin_bonus',
        points,
        description,
        metadata: { awarded_by: 'admin' }
      });

    if (transactionError) throw transactionError;

    // Update user points
    const { error: userError } = await supabase
      .from('users')
      .update({ points: supabase.rpc('increment', { amount: points }) })
      .eq('id', userId);

    if (userError) throw userError;

    // Update user stats
    const { error: statsError } = await supabase
      .from('user_stats')
      .update({ 
        total_points_earned: supabase.rpc('increment', { amount: points }),
        last_activity_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (statsError) throw statsError;
  }

  // Notifications Management
  static async createNotification(notification: Omit<AdminNotification, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('admin_notifications')
      .insert(notification);

    if (error) throw error;
  }

  static async getAllNotifications(): Promise<AdminNotification[]> {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateNotification(id: string, updates: Partial<AdminNotification>): Promise<void> {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // User Messages
  static async sendMessage(message: Omit<UserMessage, 'id' | 'created_at' | 'read_at' | 'is_read'>): Promise<void> {
    const { error } = await supabase
      .from('user_messages')
      .insert(message);

    if (error) throw error;
  }

  static async getSentMessages(senderId: string): Promise<UserMessage[]> {
    const { data, error } = await supabase
      .from('user_messages')
      .select('*')
      .eq('sender_id', senderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getReceivedMessages(recipientId: string): Promise<UserMessage[]> {
    const { data, error } = await supabase
      .from('user_messages')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async markMessageAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('user_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
  }

  // News Management
  static async createNews(article: Omit<NewsArticle, 'id' | 'created_at' | 'published_at'>): Promise<void> {
    const { error } = await supabase
      .from('news')
      .insert({
        ...article,
        published_at: article.is_published ? new Date().toISOString() : null
      });

    if (error) throw error;
  }

  static async getAllNews(): Promise<NewsArticle[]> {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateNews(id: string, updates: Partial<NewsArticle>): Promise<void> {
    const updateData = { ...updates };
    if (updates.is_published && !updates.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('news')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteNews(id: string): Promise<void> {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Referral Management
  static async getAllReferrals(): Promise<ReferralData[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getReferralStats(): Promise<{
    total_referrals: number;
    completed_referrals: number;
    pending_referrals: number;
    total_points_awarded: number;
  }> {
    const { data, error } = await supabase
      .from('referrals')
      .select('status, points_awarded');

    if (error) throw error;

    const referrals = data || [];
    const total_referrals = referrals.length;
    const completed_referrals = referrals.filter(r => r.status === 'completed').length;
    const pending_referrals = referrals.filter(r => r.status === 'pending').length;
    const total_points_awarded = referrals.reduce((sum, r) => sum + r.points_awarded, 0);

    return {
      total_referrals,
      completed_referrals,
      pending_referrals,
      total_points_awarded
    };
  }

  // Analytics
  static async getDashboardStats(): Promise<{
    total_users: number;
    active_users: number;
    total_points_awarded: number;
    daily_logins: number;
    new_signups_today: number;
  }> {
    const today = new Date().toISOString().split('T')[0];

    // Get total users
    const { count: total_users } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count: active_users } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login_at', sevenDaysAgo.toISOString());

    // Get total points awarded
    const { data: pointsData } = await supabase
      .from('points_transactions')
      .select('points');
    const total_points_awarded = pointsData?.reduce((sum, t) => sum + t.points, 0) || 0;

    // Get daily logins today
    const { count: daily_logins } = await supabase
      .from('daily_login_rewards')
      .select('*', { count: 'exact', head: true })
      .eq('login_date', today);

    // Get new signups today
    const { count: new_signups_today } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    return {
      total_users: total_users || 0,
      active_users: active_users || 0,
      total_points_awarded,
      daily_logins: daily_logins || 0,
      new_signups_today: new_signups_today || 0
    };
  }

  // Real-time subscriptions
  static subscribeToUsers(callback: (users: AdminUser[]) => void) {
    return supabase
      .channel('admin-users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        async () => {
          const users = await this.getAllUsers();
          callback(users);
        }
      )
      .subscribe();
  }

  static subscribeToMessages(callback: (messages: UserMessage[]) => void, recipientId: string) {
    return supabase
      .channel(`user-messages-${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_messages',
          filter: `recipient_id=eq.${recipientId}`
        },
        async () => {
          const messages = await this.getReceivedMessages(recipientId);
          callback(messages);
        }
      )
      .subscribe();
  }
}

export const adminService = AdminService;
