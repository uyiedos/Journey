'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabaseService } from '@/services/supabaseService';
import { useUserData } from '@/contexts/UserDataContext';
import { 
  Heart, MessageCircle, Share2, Plus, Search, Filter, TrendingUp, Calendar, Award, 
  Users, BookOpen, Sparkles, UserPlus, Settings, Bell, Home, User, Hash, Globe,
  Smile, Frown, Meh, Laugh, Heart as HeartIcon, Star, Coffee, Hand
} from 'lucide-react';

interface CommunityPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  verse_reference?: string;
  verse_text?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  is_public: boolean;
  is_friend_only: boolean;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    points: number;
    level: number;
  };
  is_liked?: boolean;
}

interface Friend {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  points: number;
  level: number;
  status: 'online' | 'offline' | 'away';
  friendship_status?: 'pending' | 'accepted' | 'none';
}

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  is_private: boolean;
  member_count: number;
  created_by: string;
  user_role?: 'admin' | 'moderator' | 'member';
}

const MOODS = [
  { value: 'happy', label: 'Happy', icon: Smile, color: 'text-yellow-500' },
  { value: 'grateful', label: 'Grateful', icon: Heart, color: 'text-red-500' },
  { value: 'thoughtful', label: 'Thoughtful', icon: Coffee, color: 'text-blue-500' },
  { value: 'prayerful', label: 'Prayerful', icon: Hand, color: 'text-purple-500' },
  { value: 'inspired', label: 'Inspired', icon: Star, color: 'text-orange-500' },
];

export default function CommunityPage() {
  const { user: authUser } = useAuth();
  const { user } = useUserData();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ 
    name: '', 
    description: '', 
    is_private: false 
  });
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    verse_reference: '', 
    verse_text: '',
    mood: '',
    tags: '',
    is_friend_only: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [showFindFriends, setShowFindFriends] = useState(false);
  const [allUsers, setAllUsers] = useState<Friend[]>([]);
  const [findingFriends, setFindingFriends] = useState(false);

  useEffect(() => {
    if (activeTab === 'feed') loadPosts();
    if (activeTab === 'friends') loadFriends();
    if (activeTab === 'groups') loadGroups();
  }, [activeTab, searchQuery, sortBy]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // This would be implemented in supabaseService
      const data = await supabaseService.getCommunityPosts(50);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      setLoading(true);
      if (!authUser?.id) {
        console.warn('No authenticated user found');
        setFriends([]);
        return;
      }
      // This would be implemented in supabaseService
      const data = await supabaseService.getFriends(authUser.id);
      setFriends(data || []);
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      setLoading(true);
      if (!authUser?.id) {
        console.warn('No authenticated user found');
        setGroups([]);
        return;
      }
      // This would be implemented in supabaseService
      const data = await supabaseService.getUserGroups(authUser.id);
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!authUser || !newGroup.name.trim()) return;

    try {
      const data = await supabaseService.createCommunityGroup(authUser.id, newGroup);
      
      if (data) {
        setGroups(prev => [data, ...prev]);
        setNewGroup({ name: '', description: '', is_private: false });
        setShowCreateGroup(false);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleCreatePost = async () => {
    if (!authUser || !newPost.content.trim()) return;

    try {
      const postData = {
        title: newPost.title,
        content: newPost.content,
        verse_reference: newPost.verse_reference,
        verse_text: newPost.verse_text,
        mood: newPost.mood,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        is_friend_only: newPost.is_friend_only,
      };

      const data = await supabaseService.createCommunityPost(authUser.id, postData);
      
      if (data) {
        setPosts(prev => [data, ...prev]);
        setNewPost({ 
          title: '', 
          content: '', 
          verse_reference: '', 
          verse_text: '',
          mood: '',
          tags: '',
          is_friend_only: false
        });
        setShowCreatePost(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!authUser) return;

    try {
      const liked = await supabaseService.toggleCommunityLike(authUser.id, postId);
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + (liked ? 1 : -1), is_liked: liked }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSendFriendRequest = async (friendId: string) => {
    if (!authUser) return;

    try {
      await supabaseService.sendFriendRequest(authUser.id, friendId);
      // Update UI to show pending status
      setFriends(prev => prev.map(friend => 
        friend.id === friendId 
          ? { ...friend, friendship_status: 'pending' }
          : friend
      ));
      setAllUsers(prev => prev.map(user =>
        user.id === friendId
          ? { ...user, friendship_status: 'pending' }
          : user
      ));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleFindFriendsClick = async () => {
    if (!authUser) return;

    const next = !showFindFriends;
    setShowFindFriends(next);

    if (!next) return;

    try {
      setFindingFriends(true);
      const friendIds = new Set(friends.map(f => f.id));

      const { data, error } = await supabaseService.getClient()
        .from('users')
        .select('id, username, full_name, avatar_url, points, level')
        .neq('id', authUser.id)
        .limit(50);

      if (error) {
        console.error('Error loading users for find friends:', error);
        return;
      }

      const mapped: Friend[] = (data || [])
        .filter((u: any) => !friendIds.has(u.id))
        .map((u: any) => ({
          id: u.id,
          username: u.username || u.full_name || 'User',
          full_name: u.full_name || u.username || 'User',
          avatar_url: u.avatar_url,
          points: u.points || 0,
          level: u.level || 1,
          status: 'offline',
          friendship_status: 'none',
        }));

      setAllUsers(mapped);
    } catch (err) {
      console.error('Unexpected error loading users for find friends:', err);
    } finally {
      setFindingFriends(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getMoodIcon = (mood?: string) => {
    const moodData = MOODS.find(m => m.value === mood);
    return moodData ? moodData.icon : null;
  };

  const getMoodColor = (mood?: string) => {
    const moodData = MOODS.find(m => m.value === mood);
    return moodData ? moodData.color : 'text-gray-500';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Community</h1>
          <p className="text-lg text-muted-foreground">
            Connect with fellow believers, share your journey, and grow together in faith
          </p>
          
          {/* Create Post Button */}
          {authUser && (
            <Button 
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          )}
        </div>

        {/* Create Group Form */}
        {showCreateGroup && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Group</CardTitle>
              <CardDescription>Start a new community group for believers to connect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Group name"
                value={newGroup.name}
                onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
              />
              <Textarea
                placeholder="Group description (optional)"
                value={newGroup.description}
                onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="private-group"
                  checked={newGroup.is_private}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, is_private: e.target.checked }))}
                />
                <label htmlFor="private-group" className="text-sm">Make group private</label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateGroup} disabled={!newGroup.name.trim()}>
                  Create Group
                </Button>
                <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Post Form */}
        {showCreatePost && (
          <Card>
            <CardHeader>
              <CardTitle>Share with the Community</CardTitle>
              <CardDescription>What's on your heart today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Title (optional)"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Share your thoughts, prayers, or insights..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
              
              {/* Mood Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">How are you feeling?</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => (
                    <Button
                      key={mood.value}
                      variant={newPost.mood === mood.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewPost(prev => ({ ...prev, mood: mood.value }))}
                      className="flex items-center space-x-1"
                    >
                      <mood.icon className={`h-4 w-4 ${mood.color}`} />
                      <span>{mood.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Verse reference (optional)"
                  value={newPost.verse_reference}
                  onChange={(e) => setNewPost(prev => ({ ...prev, verse_reference: e.target.value }))}
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="friend-only"
                  checked={newPost.is_friend_only}
                  onChange={(e) => setNewPost(prev => ({ ...prev, is_friend_only: e.target.checked }))}
                />
                <label htmlFor="friend-only" className="text-sm">Friends only</label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreatePost} disabled={!newPost.content.trim()}>
                  Share Post
                </Button>
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Feed</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Friends</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Groups</span>
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search posts, people, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  onClick={() => setSortBy('recent')}
                  size="sm"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Recent
                </Button>
                <Button
                  variant={sortBy === 'popular' ? 'default' : 'outline'}
                  onClick={() => setSortBy('popular')}
                  size="sm"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Popular
                </Button>
                <Button
                  variant={sortBy === 'trending' ? 'default' : 'outline'}
                  onClick={() => setSortBy('trending')}
                  size="sm"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Trending
                </Button>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading posts...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No posts match your search.' : 'Be the first to share in the community!'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={post.user.avatar_url} />
                            <AvatarFallback>
                              {post.user.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                className="font-semibold text-left hover:underline"
                                onClick={() => authUser && post.user.id !== authUser.id && handleSendFriendRequest(post.user.id)}
                              >
                                {post.user.username || 'Anonymous'}
                              </button>
                              <Badge variant="secondary" className="text-xs">
                                Level {post.user.level}
                              </Badge>
                              {post.is_friend_only && (
                                <Badge variant="outline" className="text-xs">
                                  <Users className="h-3 w-3 mr-1" />
                                  Friends
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {post.mood && (() => {
                          const MoodIcon = getMoodIcon(post.mood);
                          return MoodIcon ? (
                            <div className={`flex items-center space-x-1 ${getMoodColor(post.mood)}`}>
                              <MoodIcon className="h-4 w-4" />
                              <span className="text-xs capitalize">{post.mood}</span>
                            </div>
                          ) : null;
                        })()}
                      </div>
                      {post.title && <CardTitle className="mt-2">{post.title}</CardTitle>}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed">{post.content}</p>
                        
                        {post.verse_reference && (
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-sm">{post.verse_reference}</p>
                            {post.verse_text && <p className="text-sm italic mt-1">{post.verse_text}</p>}
                          </div>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Hash className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post.id)}
                              className={`flex items-center space-x-1 ${post.is_liked ? 'text-red-500' : ''}`}
                            >
                              <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                              <span>{post.likes_count}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center space-x-1"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.comments_count}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center space-x-1"
                            >
                              <Share2 className="h-4 w-4" />
                              <span>{post.shares_count}</span>
                            </Button>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Award className="h-4 w-4" />
                            <span>{post.user.points} points</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Friends</h2>
              {authUser && (
                <Button onClick={handleFindFriendsClick} variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {showFindFriends ? 'Hide' : 'Find Friends'}
                </Button>
              )}
            </div>

            {authUser && showFindFriends && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Find Friends</CardTitle>
                  <CardDescription>Browse other members and send friend requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  {findingFriends ? (
                    <div className="text-center py-6 text-muted-foreground">Loading members...</div>
                  ) : allUsers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">No members found to add right now.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allUsers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback>
                                {member.username?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{member.username}</p>
                              <p className="text-xs text-muted-foreground">Level {member.level} • {member.points} pts</p>
                            </div>
                          </div>
                          <div>
                            {member.friendship_status === 'pending' ? (
                              <Badge variant="outline" className="text-xs">Request Sent</Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleSendFriendRequest(member.id)}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading friends...</p>
              </div>
            ) : friends.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                  <p className="text-muted-foreground">Start connecting with other community members!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <Card key={friend.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>
                            {friend.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{friend.username || 'Anonymous'}</p>
                          <p className="text-sm text-muted-foreground">Level {friend.level}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          friend.status === 'online' ? 'bg-green-500' : 
                          friend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        {friend.friendship_status === 'none' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendFriendRequest(friend.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add Friend
                          </Button>
                        )}
                        {friend.friendship_status === 'pending' && (
                          <Button size="sm" variant="outline" disabled>
                            Request Sent
                          </Button>
                        )}
                        {friend.friendship_status === 'accepted' && (
                          <Button size="sm" variant="outline">
                            Message
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Groups</h2>
              <Button onClick={() => setShowCreateGroup(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading groups...</p>
              </div>
            ) : groups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                  <p className="text-muted-foreground">Join or create groups to connect with like-minded believers!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={group.avatar_url} />
                          <AvatarFallback>
                            {group.name?.[0]?.toUpperCase() || 'G'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{group.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {group.member_count} members
                          </p>
                        </div>
                        {group.is_private && (
                          <Badge variant="outline" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      
                      {group.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                      
                      <div className="mt-4">
                        <Button size="sm" className="w-full">
                          {group.user_role === 'admin' ? 'Manage' : 'View Group'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
