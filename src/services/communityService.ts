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
  async sendFriendRequest(fromId: string, toId: string): Promise<boolean> {
    try {
      if (fromId === toId) {
        throw new Error('Cannot send friend request to yourself');
      }

      // Check if friend request already exists
      const { data: existing, error: checkError } = await supabaseClient
        .from('friend_requests')
        .select('id, status')
        .or(`and(from_id.eq.${fromId},to_id.eq.${toId}),and(from_id.eq.${toId},to_id.eq.${fromId})`)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing friend request:', checkError);
        throw checkError;
      }

      if (existing) {
        if (existing.status === 'pending') {
          console.log('Friend request already pending');
          return true;
        } else if (existing.status === 'accepted') {
          console.log('Already friends');
          return true;
        }
      }

      // Insert new friend request
      const { error } = await supabaseClient
        .from('friend_requests')
        .insert({
          from_id: fromId,
          to_id: toId,
          status: 'pending'
        });

      if (error) {
        console.error('Database error inserting friend request:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error sending friend request:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
        fromId,
        toId
      });
      return false;
    }
  }

  async acceptFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  }

  async declineFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error declining friend request:', error);
      return false;
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('friend_requests')
        .delete()
        .or(`and(from_id.eq.${userId},to_id.eq.${friendId}),and(from_id.eq.${friendId},to_id.eq.${userId})`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      return false;
    }
  }

  async getFriends(userId: string): Promise<any[]> {
    try {
      // Get all accepted friend requests for this user
      const { data: requests, error: requestError } = await supabaseClient
        .from('friend_requests')
        .select('from_id, to_id')
        .or(`and(from_id.eq.${userId},status.eq.accepted),and(to_id.eq.${userId},status.eq.accepted)`);

      if (requestError) {
        console.error('Error getting friend requests:', requestError);
        return [];
      }

      if (!requests || requests.length === 0) {
        return [];
      }

      // Get the friend IDs (exclude the current user)
      const friendIds = requests.map(req => 
        req.from_id === userId ? req.to_id : req.from_id
      ).filter(id => id !== userId);

      // Get the user details for friends
      const { data: friends, error: friendError } = await supabaseClient
        .from('users')
        .select('id, username, full_name, avatar_url, email')
        .in('id', friendIds);

      if (friendError) {
        console.error('Error getting friend details:', friendError);
        return [];
      }

      return friends || [];
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  }

  async getFriendRequests(userId: string): Promise<any[]> {
    try {
      // First get the friend requests
      const { data: requests, error: requestError } = await supabaseClient
        .from('friend_requests')
        .select('*')
        .eq('to_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestError) {
        console.error('Error getting friend requests:', requestError);
        return [];
      }

      if (!requests || requests.length === 0) {
        return [];
      }

      // Then get the user details for each request
      const userIds = requests.map(req => req.from_id);
      const { data: users, error: userError } = await supabaseClient
        .from('users')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);

      if (userError) {
        console.error('Error getting user details:', userError);
        return [];
      }

      // Combine the data
      return requests.map(request => {
        const user = users?.find(u => u.id === request.from_id);
        return {
          ...request,
          from_user: user || { id: request.from_id, username: 'Unknown', full_name: 'Unknown User' }
        };
      });
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

  async getCommunityPosts(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      // Get public posts first
      const { data: posts, error: postError } = await supabaseClient
        .from('community_posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (postError) {
        console.error('Error getting community posts:', postError);
        return [];
      }

      if (!posts || posts.length === 0) {
        return [];
      }

      // Get author details for each post
      const authorIds = posts.map(post => post.author_id).filter(Boolean);
      const { data: authors, error: authorError } = await supabaseClient
        .from('users')
        .select('id, username, full_name, avatar_url')
        .in('id', authorIds);

      if (authorError) {
        console.error('Error getting authors:', authorError);
        // Return posts without author info
        return posts;
      }

      // Combine posts with author info
      return posts.map(post => {
        const author = authors?.find(a => a.id === post.author_id);
        return {
          ...post,
          author: author || { id: post.author_id, username: 'Unknown', full_name: 'Unknown User' }
        };
      });
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
  async createGroup(name: string, description: string, createdBy: string, isPrivate: boolean = false): Promise<any> {
    try {
      console.log('Creating group:', { name, description, createdBy, isPrivate });
      
      // Check if user is authenticated
      const { data: authData, error: authError } = await supabaseClient.auth.getUser();
      console.log('Auth check:', { authData, authError });
      
      if (authError || !authData.user) {
        console.error('User not authenticated:', authError);
        return null;
      }
      
      // Test simple database operation first
      console.log('Testing database with simple select...');
      const testResult = await supabaseClient
        .from('groups')
        .select('id')
        .limit(1);
      
      console.log('Database test result:', testResult);
      
      if (testResult.error) {
        console.error('Database test failed:', testResult.error);
        return null;
      }
      
      // Create the group
      console.log('About to insert group with data:', {
        name,
        description,
        created_by: createdBy,
        is_private: isPrivate
      });
      
      const result = await supabaseClient
        .from('groups')
        .insert({
          name,
          description,
          created_by: createdBy,
          is_private: isPrivate
        })
        .select();
      
      console.log('Insert result:', result);
      const { data, error } = result;

      if (error) {
        console.error('Group creation error - full details:', {
          errorString: JSON.stringify(error),
          errorKeys: Object.keys(error),
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          constructor: error.constructor.name,
          isArray: Array.isArray(error),
          type: typeof error
        });
        
        if (error.code === '42501') {
          console.error('No permission to create groups. Please check RLS policies.');
        } else if (error.code === '42P01') {
          console.error('Groups table does not exist.');
        } else if (error.code === '23503') {
          console.error('Foreign key violation - user_id may not exist in auth.users.');
        } else {
          console.error('Error creating group:', error);
        }
        throw error;
      }

      console.log('Group created successfully:', data);

      // Add creator as admin member
      if (data && data.length > 0) {
        const group = data[0];
        console.log('Adding creator as admin member...');
        const { error: memberError } = await supabaseClient
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: createdBy,
            role: 'admin'
          });

        if (memberError) {
          console.warn('Group created but failed to add creator as member:', memberError);
        } else {
          console.log('Creator added as admin member successfully');
        }
        
        return group;
      }

      return null;
    } catch (error) {
      console.error('Group creation failed:', error);
      return null;
    }
  }

  async getUserGroups(userId: string): Promise<any[]> {
    try {
      console.log('Getting user groups for:', userId);
      
      // Try to get user's group memberships
      let memberships, membershipError;
      
      try {
        const result = await supabaseClient
          .from('group_members')
          .select('group_id, role')
          .eq('user_id', userId);
        memberships = result.data;
        membershipError = result.error;
      } catch (e) {
        console.log('Exception getting memberships:', e);
        membershipError = e;
      }
      
      console.log('Memberships result:', { memberships, membershipError });
      
      // If there's any error, return empty array (groups functionality will work with public groups only)
      if (membershipError || !memberships) {
        console.log('Group memberships not accessible, returning empty array');
        return [];
      }

      if (memberships.length === 0) {
        console.log('No group memberships found');
        return [];
      }

      // Get group details
      const groupIds = memberships.map(m => m.group_id);
      let groups, groupError;
      
      try {
        const result = await supabaseClient
          .from('groups')
          .select('*')
          .in('id', groupIds);
        groups = result.data;
        groupError = result.error;
      } catch (e) {
        console.log('Exception getting groups:', e);
        groupError = e;
      }
      
      if (groupError || !groups) {
        console.log('Group details not accessible, returning empty array');
        return [];
      }

      // Combine the data without member counts for simplicity
      return memberships.map(membership => {
        const group = groups.find((g: any) => g.id === membership.group_id);
        return {
          ...group,
          user_role: membership.role,
          members_count: 1 // Just the user for now
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }

  async getPublicGroups(limit: number = 20): Promise<any[]> {
    try {
      console.log('Getting public groups...');
      
      // Try to get public groups
      let groups, groupError;
      
      try {
        const result = await supabaseClient
          .from('groups')
          .select('*')
          .eq('is_private', false)
          .order('created_at', { ascending: false })
          .limit(limit);
        groups = result.data;
        groupError = result.error;
      } catch (e) {
        console.log('Exception getting public groups:', e);
        groupError = e;
      }
      
      console.log('Public groups result:', { groups, groupError });
      
      // If there's any error or no groups, return empty array
      if (groupError || !groups) {
        console.log('Public groups not accessible, returning empty array');
        return [];
      }

      if (groups.length === 0) {
        console.log('No public groups found');
        return [];
      }

      // Return groups with basic member count (simplified)
      return groups.map(group => ({
        ...group,
        members_count: 0 // Simplified for now
      }));
    } catch (error) {
      console.error('Unexpected error getting public groups:', error);
      return [];
    }
  }

  async joinGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      // First check if user is already a member
      const { data: existing } = await supabaseClient
        .from('group_members')
        .select('id')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .maybeSingle();

      if (existing) return true; // Already a member

      // Check if group is public
      const { data: group, error: groupError } = await supabaseClient
        .from('groups')
        .select('is_private')
        .eq('id', groupId)
        .single();

      if (groupError || !group) {
        console.error('Error finding group:', groupError);
        return false;
      }

      if (group.is_private) {
        console.error('Cannot join private group directly');
        return false;
      }

      // Add as member
      const { error } = await supabaseClient
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      return false;
    }
  }

  async searchUsers(query: string, excludeIds: string[] = []): Promise<any[]> {
    try {
      let queryBuilder = supabaseClient
        .from('users')
        .select('id, username, full_name, avatar_url, email')
        .limit(20);

      // Only add search filter if query is provided
      if (query.trim()) {
        queryBuilder = queryBuilder.ilike('username', `%${query}%`);
      }

      if (excludeIds.length > 0) {
        queryBuilder = queryBuilder.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  async sendMessageToFriend(fromUserId: string, toUserId: string, content: string): Promise<boolean> {
    try {
      // Check if conversation exists
      const { data: existingConv, error: convError } = await supabaseClient
        .from('conversations')
        .select('*')
        .or(`and(created_by.eq.${fromUserId},type.eq.direct),and(created_by.eq.${toUserId},type.eq.direct)`)
        .maybeSingle();

      if (convError && convError.code !== 'PGRST116') {
        console.error('Error checking conversation:', convError);
        return false;
      }

      let conversationId: string;

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabaseClient
          .from('conversations')
          .insert({
            type: 'direct',
            created_by: fromUserId
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          return false;
        }

        conversationId = newConv.id;

        // Add both users as participants
        await supabaseClient.from('conversation_participants').insert([
          { conversation_id: conversationId, user_id: fromUserId, role: 'admin' },
          { conversation_id: conversationId, user_id: toUserId, role: 'member' }
        ]);
      }

      // Send message
      const { error: messageError } = await supabaseClient
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: fromUserId,
          content,
          message_type: 'text'
        });

      if (messageError) {
        console.error('Error sending message:', messageError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending message to friend:', error);
      return false;
    }
  }

  async tipPoints(fromUserId: string, toUserId: string, amount: number): Promise<boolean> {
    try {
      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      // Get sender's current points
      const { data: sender, error: senderError } = await supabaseClient
        .from('users')
        .select('points')
        .eq('id', fromUserId)
        .single();

      if (senderError || !sender) {
        console.error('Error getting sender points:', senderError);
        return false;
      }

      if (sender.points < amount) {
        console.error('Insufficient points');
        return false;
      }

      // Deduct points from sender
      const { error: deductError } = await supabaseClient
        .from('users')
        .update({ points: sender.points - amount })
        .eq('id', fromUserId);

      if (deductError) {
        console.error('Error deducting points:', deductError);
        return false;
      }

      // Add points to receiver
      const { error: addError } = await supabaseClient.rpc('increment_points', {
        user_id: toUserId,
        amount: amount
      });

      if (addError) {
        console.error('Error adding points:', addError);
        // Rollback deduction
        await supabaseClient
          .from('users')
          .update({ points: sender.points })
          .eq('id', fromUserId);
        return false;
      }

      // Create notification
      await this.createNotification(
        toUserId,
        'points_awarded',
        'Points Received!',
        `You received ${amount} points from a friend!`,
        { amount, fromUserId }
      );

      return true;
    } catch (error) {
      console.error('Error tipping points:', error);
      return false;
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
