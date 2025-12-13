'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Search, 
  Circle
} from 'lucide-react';
import { communityService } from '@/services/communityService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function FriendsSidebar() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        communityService.getFriends(user?.id || ''),
        communityService.getFriendRequests(user?.id || '')
      ]);
      setFriends(friendsData || []);
      setFriendRequests(requestsData || []);
    } catch (error) {
      console.error('Error fetching friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await communityService.acceptFriendRequest(requestId);
      fetchFriendsData();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      await communityService.declineFriendRequest(requestId);
      fetchFriendsData();
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const startConversation = async (friendId: string) => {
    try {
      const conversation = await communityService.createDirectMessage(user?.id || '', friendId);
      // Navigate to conversation or open chat modal
      console.log('Conversation created:', conversation);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'away':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Friend Requests ({friendRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={request.requester?.avatar_url} />
                    <AvatarFallback>
                      {request.requester?.full_name?.[0] || request.requester?.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {request.requester?.full_name || request.requester?.username}
                    </p>
                    <p className="text-xs text-gray-500">Level {request.requester?.level || 1}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    onClick={() => acceptFriendRequest(request.id)}
                    className="px-2 py-1 h-7 text-xs"
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => declineFriendRequest(request.id)}
                    className="px-2 py-1 h-7 text-xs"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Friends ({filteredFriends.length})
            </div>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredFriends.length === 0 ? (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'No friends found' : 'No friends yet'}
                </p>
                <p className="text-xs text-gray-400">
                  Connect with others to build your spiritual community
                </p>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={friend.avatar_url} />
                        <AvatarFallback>
                          {friend.full_name?.[0] || friend.username?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        {getStatusIcon(friend.status)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {friend.full_name || friend.username}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500 capitalize">
                          {friend.status || 'offline'}
                        </p>
                        {friend.level && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            L{friend.level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="p-1" onClick={() => startConversation(friend.id)}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
