import { supabaseClient } from './supabaseService';
import { User } from '@/types';

// Re-export User as UserProfile for consistency
export type UserProfile = User;

// Types for community features
export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'verse' | 'prayer' | 'testimony';
  metadata?: Record<string, any>;
  reply_to_id?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  content: string;
  post_type: 'general' | 'prayer_request' | 'testimony' | 'verse_share' | 'question';
  attachments?: any[];
  tags?: string[];
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  author?: UserProfile;
  reactions?: PostReaction[];
  comments?: Comment[];
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'pray' | 'amen' | 'praise';
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  reply_to_id?: string;
  likes_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  author?: UserProfile;
  reactions?: CommentReaction[];
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'pray' | 'amen' | 'praise';
  created_at: string;
}

export interface BibleStudyGroup {
  id: string;
  name: string;
  description?: string;
  focus_book?: string;
  focus_chapter?: number;
  focus_verse_start?: number;
  focus_verse_end?: number;
  meeting_schedule?: Record<string, any>;
  is_private: boolean;
  max_members: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type:
    | 'friend_request'
    | 'friend_accepted'
    | 'message'
    | 'post_like'
    | 'post_comment'
    | 'group_invite'
    | 'prayer_support'
    | 'points_awarded'
    | 'points_spent'
    | 'achievement_unlocked';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

class CommunityService {
  // Friends Management
  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship | null> {
    try {
      const { data, error } = await supabaseClient
        .from('friendships')
        .insert({
          requester_id: requesterId,
          addressee_id: addresseeId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return null;
    }
  }

  async acceptFriendRequest(friendshipId: string): Promise<Friendship | null> {
    try {
      const { data, error } = await supabaseClient
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return null;
    }
  }

  async declineFriendRequest(friendshipId: string): Promise<Friendship | null> {
    try {
      const { data, error } = await supabaseClient
        .from('friendships')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error declining friend request:', error);
      return null;
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('friendships')
        .delete()
        .or(`and(requester_id.eq.${userId},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${userId})`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      return false;
    }
  }

  async getFriends(userId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabaseClient
        .from('friendships')
        .select(`
          requester_id,
          addressee_id,
          users!friendships_requester_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            email
          ),
          users!friendships_addressee_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            email
          )
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Extract friend profiles
      const friends: UserProfile[] = [];
      data.forEach((friendship: any) => {
        const friend = friendship.requester_id === userId 
          ? friendship.users?.addressee_id 
          : friendship.users?.requester_id;
        if (friend) {
          friends.push(friend);
        }
      });

      return friends;
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  }

  async getFriendRequests(userId: string): Promise<Friendship[]> {
    try {
      const { data, error } = await supabaseClient
        .from('friendships')
        .select('*')
        .eq('addressee_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return [];
    }
  }

  // Chat System
  async createDirectConversation(user1Id: string, user2Id: string): Promise<Conversation | null> {
    try {
      // Check if conversation already exists
      const { data: existing } = await supabaseClient
        .from('conversations')
        .select('id')
        .eq('type', 'direct')
        .eq('created_by', user1Id)
        .single();

      if (existing) {
        // Get full conversation data
        const { data: fullConv } = await supabaseClient
          .from('conversations')
          .select('*')
          .eq('id', existing.id)
          .single();
        return fullConv;
      }

      // Create new conversation
      const { data, error } = await supabaseClient
        .from('conversations')
        .insert({
          type: 'direct',
          created_by: user1Id
        })
        .select()
        .single();

      if (error) throw error;

      // Add participants
      await supabaseClient.from('conversation_participants').insert([
        { conversation_id: data.id, user_id: user1Id, role: 'admin' },
        { conversation_id: data.id, user_id: user2Id, role: 'member' }
      ]);

      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabaseClient
        .from('conversation_participants')
        .select(`
          conversations!inner (
            id,
            type,
            name,
            avatar_url,
            updated_at
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map((item: any) => item.conversations) || [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string, type: Message['message_type'] = 'text'): Promise<Message | null> {
    try {
      const { data, error } = await supabaseClient
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: type
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation timestamp
      await supabaseClient
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  // Community Posts
  async createPost(authorId: string, content: string, postType: CommunityPost['post_type'] = 'general', tags?: string[]): Promise<CommunityPost | null> {
    try {
      const { data, error } = await supabaseClient
        .from('community_posts')
        .insert({
          author_id: authorId,
          content,
          post_type: postType,
          tags: tags || []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  async getCommunityPosts(limit: number = 20, offset: number = 0): Promise<CommunityPost[]> {
    try {
      const { data, error } = await supabaseClient
        .from('community_posts')
        .select(`
          *,
          author:users!community_posts_author_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting community posts:', error);
      return [];
    }
  }

  async reactToPost(postId: string, userId: string, reactionType: PostReaction['reaction_type']): Promise<PostReaction | null> {
    try {
      // First remove any existing reaction
      await supabaseClient
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      // Add new reaction
      const { data, error } = await supabaseClient
        .from('post_reactions')
        .insert({
          post_id: postId,
          user_id: userId,
          reaction_type: reactionType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error reacting to post:', error);
      return null;
    }
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabaseClient
        .from('comments')
        .select(`
          *,
          author:users!comments_author_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting post comments:', error);
      return [];
    }
  }

  async addComment(postId: string, authorId: string, content: string, replyToId?: string): Promise<Comment | null> {
    try {
      const { data, error } = await supabaseClient
        .from('comments')
        .insert({
          post_id: postId,
          author_id: authorId,
          content,
          reply_to_id: replyToId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  // Bible Study Groups
  async createGroup(name: string, description: string, createdBy: string, isPrivate: boolean = false): Promise<BibleStudyGroup | null> {
    try {
      const { data, error } = await supabaseClient
        .from('bible_study_groups')
        .insert({
          name,
          description,
          created_by: createdBy,
          is_private: isPrivate
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      await supabaseClient.from('group_memberships').insert({
        group_id: data.id,
        user_id: createdBy,
        role: 'admin'
      });

      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      return null;
    }
  }

  async getPublicGroups(limit: number = 20): Promise<BibleStudyGroup[]> {
    try {
      const { data, error } = await supabaseClient
        .from('bible_study_groups')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting public groups:', error);
      return [];
    }
  }

  async joinGroup(groupId: string, userId: string): Promise<GroupMembership | null> {
    try {
      const { data, error } = await supabaseClient
        .from('group_memberships')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error joining group:', error);
      return null;
    }
  }

  // Notifications
  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        // Gracefully handle database/RLS issues without noisy console errors
        console.warn('Could not fetch notifications (database or RLS issue). Returning empty list.');
        return [];
      }

      return data || [];
    } catch (error) {
      // Catch-all safeguard that avoids spamming errors in the console
      console.warn('Unexpected error getting notifications. Returning empty list.');
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async createNotification(userId: string, type: Notification['type'], title: string, message: string, data?: Record<string, any>): Promise<Notification | null> {
    try {
      const { data: notificationData, error } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data: data || {}
        })
        .select()
        .single();

      if (error) throw error;
      return notificationData;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }
}

export const communityService = new CommunityService();
