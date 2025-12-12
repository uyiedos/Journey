'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Users, UserPlus, Search, MessageCircle, Trophy, Flame, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabaseService } from '@/services/supabaseService';
import { FriendRequestService, FriendRequest } from '@/services/friendRequestService';

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  points: number;
  level: number;
  streak: number;
  status: 'online' | 'offline' | 'reading';
  lastSeen?: Date;
  mutualFriends: number;
}

export function FriendsList() {
  const { user: authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'requests'>('all');
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch friends and requests
  const fetchFriends = async () => {
    if (!authUser) return;
    
    try {
      // Fetch all friends using FriendRequestService
      const friendsData = await FriendRequestService.getAllFriends(authUser.id);
      setFriends(friendsData);
      
      // Fetch received friend requests
      const requestsData = await FriendRequestService.getReceivedFriendRequests(authUser.id);
      setFriendRequests(requestsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await FriendRequestService.acceptFriendRequest(requestId);
      await fetchFriends(); // Refresh friends list
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // Reject friend request
  const handleRejectRequest = async (requestId: string) => {
    try {
      await FriendRequestService.rejectFriendRequest(requestId);
      await fetchFriends(); // Refresh friends list
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  // Send friend request
  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      await FriendRequestService.sendFriendRequest(authUser!.id, receiverId);
      alert('Friend request sent!');
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request');
    }
  };

  // Search for users
  const searchUsers = async (query: string) => {
    if (!query.trim() || !authUser) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await supabaseService.getClient()
        .from('users')
        .select('id, username, full_name, avatar_url, points, level, streak')
        .ilike('username', `%${query}%`)
        .neq('id', authUser.id)
        .limit(10);

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send friend request
  const sendFriendRequest = async (friendId: string) => {
    if (!authUser) return;

    try {
      const { error } = await supabaseService.getClient()
        .from('friends')
        .insert({
          user_id: authUser.id,
          friend_id: friendId,
          status: 'pending',
        });

      if (error) throw error;

      // Remove from search results
      setSearchResults(prev => prev.filter(user => user.id !== friendId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabaseService.getClient()
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh friends list
      fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchFriends();
    }
  }, [authUser]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'reading': return 'bg-blue-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string, lastSeen?: Date) => {
    switch (status) {
      case 'online': return 'Online';
      case 'reading': return 'Reading Bible';
      case 'offline': return lastSeen ? `Last seen ${formatTimeAgo(lastSeen)}` : 'Offline';
      default: return 'Offline';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Friends</h2>
          <p className="text-muted-foreground">
            Connect with fellow believers on their spiritual journey
          </p>
        </div>
        <AuthGuard action="friend">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Find Friends
          </Button>
        </AuthGuard>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{friends.length}</div>
            <div className="text-sm text-muted-foreground">Total Friends</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{friendRequests.length}</div>
            <div className="text-sm text-muted-foreground">Friend Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">0</div>
            <div className="text-sm text-muted-foreground">Online Now</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Find Friends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for users by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Search Results</h4>
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.full_name || user.username}</div>
                      <div className="text-sm text-muted-foreground">Level {user.level} • {user.points} points</div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleSendFriendRequest(user.id)}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add Friend
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Friend Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Friend Request</div>
                    <div className="text-sm text-muted-foreground">Someone wants to be your friend</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      {friends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Friends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {friends.map((friend) => {
              const friendData = friend.user || friend.friend;
              return (
                <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friendData?.avatar_url} />
                      <AvatarFallback>{friendData?.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{friendData?.full_name || friendData?.username}</div>
                      <div className="text-sm text-muted-foreground">Level {friendData?.level} • {friendData?.points} points</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {friends.length === 0 && friendRequests.length === 0 && searchResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
            <p className="text-muted-foreground">
              Start searching for users above to build your spiritual community!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
