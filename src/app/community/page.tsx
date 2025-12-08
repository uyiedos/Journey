'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CommunityPost } from '@/components/features/CommunityPost';
import { FriendsList } from '@/components/features/FriendsList';
import { ChatInterface } from '@/components/features/ChatInterface';
import { EnhancedPost } from '@/components/features/EnhancedPost';
import { CreatePostDialog } from '@/components/features/CreatePostDialog';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Users, Heart, MessageCircle, Share2, Plus, Bell, PenTool } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabaseService } from '@/services/supabaseService';

export default function CommunityPage() {
  const { user: authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch posts from database
  const fetchPosts = async () => {
    if (!authUser || !mounted) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabaseService.getClient()
        .from('community_posts')
        .select(`
          *,
          user:users(id, username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser && mounted) {
      fetchPosts();
    }
  }, [authUser, mounted]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filters = ['Recent', 'Popular', 'Following', 'My Posts'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Community</h1>
            <p className="text-muted-foreground">
              Connect with fellow believers, share insights, and grow together
            </p>
          </div>
          <AuthGuard action="post">
            <CreatePostDialog onPostCreated={fetchPosts}>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </CreatePostDialog>
          </AuthGuard>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant={selectedFilter === filter ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>

        {/* Community Tabs */}
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-4">
                {!mounted ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading posts...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to share your thoughts with the community!
                    </p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div key={post.id}>
                      <CommunityPost
                        post={post}
                        authorName={post.user?.full_name || post.user?.username || 'Unknown'}
                        authorAvatar={post.user?.avatar_url}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Community Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Members</span>
                        <span className="font-medium">1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Online Now</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Posts Today</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prayers Shared</span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trending Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {['#Prayer', '#YouthMinistry', '#BibleStudy', '#Faith', '#Community'].map((topic) => (
                      <div key={topic} className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer">
                        <span className="text-sm font-medium">{topic}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 50) + 10}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="friends">
            <FriendsList />
          </TabsContent>

          <TabsContent value="messages">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No new notifications</h3>
                  <p className="text-muted-foreground">
                    You're all caught up! Check back later for updates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
