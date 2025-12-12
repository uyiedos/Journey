import { supabase } from '@/lib/supabase';

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
}

export class FriendRequestService {
  // Send friend request
  static async sendFriendRequest(senderId: string, receiverId: string, message?: string): Promise<FriendRequest> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to send friend request');
      
      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  // Get received friend requests
  static async getReceivedFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching received friend requests:', error);
      return [];
    }
  }

  // Get sent friend requests
  static async getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          receiver:receiver_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sent friend requests:', error);
      return [];
    }
  }

  // Accept friend request
  static async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  // Reject friend request
  static async rejectFriendRequest(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  // Get user friendships
  static async getUserFriendships(userId: string): Promise<Friendship[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:friend_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching friendships:', error);
      return [];
    }
  }

  // Get all friends (both sides of friendship)
  static async getAllFriends(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:friend_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          user:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (error) throw error;
      
      // Return friends with consistent structure
      return (data || []).map(friendship => {
        const friend = friendship.user_id === userId ? friendship.friend : friendship.user;
        return {
          ...friend,
          friendship_id: friendship.id,
          friendship_created_at: friendship.created_at
        };
      });
    } catch (error) {
      console.error('Error fetching all friends:', error);
      return [];
    }
  }

  // Remove friendship
  static async removeFriendship(userId: string, friendId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing friendship:', error);
      throw error;
    }
  }

  // Check if users are friends
  static async areFriends(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${userId1},friend_id.eq.${userId2}),and(user_id.eq.${userId2},friend_id.eq.${userId1})`)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking friendship status:', error);
      return false;
    }
  }

  // Check if friend request exists
  static async friendRequestExists(senderId: string, receiverId: string): Promise<FriendRequest | null> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error checking friend request:', error);
      return null;
    }
  }
}
