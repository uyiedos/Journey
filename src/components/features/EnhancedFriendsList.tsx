'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Search, UserPlus, Users, MessageCircle, MoreVertical, Check, X, UserX } from 'lucide-react';
import { communityService, Friendship, UserProfile } from '@/services/communityService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function EnhancedFriendsList() {
  const { user: authUser } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friendship[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    if (authUser) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [authUser]);

  const fetchFriends = async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      const data = await communityService.getFriends(authUser.id);
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    if (!authUser) return;
    
    try {
      const data = await communityService.getFriendRequests(authUser.id);
      setFriendRequests(data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const searchUsers = async () => {
    if (!friendUsername.trim() || !authUser) return;
    
    setSearchingUsers(true);
    try {
      // This would be a new method in communityService to search users
      // For now, we'll simulate with a placeholder
      const results: UserProfile[] = []; // Would implement user search here
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    if (!authUser) return;
    
    try {
      await communityService.sendFriendRequest(authUser.id, userId);
      setSearchResults(searchResults.filter(u => u.id !== userId));
      alert('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Error sending friend request');
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await communityService.acceptFriendRequest(requestId);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
      fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      await communityService.declineFriendRequest(requestId);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!authUser) return;
    
    if (confirm('Are you sure you want to remove this friend?')) {
      try {
        await communityService.removeFriend(authUser.id, friendId);
        setFriends(friends.filter(f => f.id !== friendId));
      } catch (error) {
        console.error('Error removing friend:', error);
      }
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Add Friend Dialog */}
      <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
        <DialogTrigger asChild>
          <AuthGuard action="friend">
            <Button className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          </AuthGuard>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Friend</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter username or email"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
              <Button onClick={searchUsers} disabled={searchingUsers}>
                {searchingUsers ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Search Results</h4>
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.fullName || user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.username}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => sendFriendRequest(user.id)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Friend Requests ({friendRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 rounded border">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Friend Request</p>
                    <p className="text-sm text-muted-foreground">
                      From user ID: {request.requester_id}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => acceptFriendRequest(request.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => declineFriendRequest(request.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Friends ({friends.length})
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading friends...</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No friends found' : 'No friends yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start connecting with other members of the community!'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 rounded border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.fullName?.charAt(0) || friend.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.fullName || friend.username}</p>
                      <p className="text-sm text-muted-foreground">@{friend.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      Online
                    </Badge>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeFriend(friend.id)}>
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
