'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  MoreHorizontal,
  Coins,
  Users,
  Bookmark,
  TrendingUp,
  Clock
} from 'lucide-react';
import { communityService } from '@/services/communityService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface SocialFeedProps {
  userId?: string;
}

export function SocialFeed({ userId }: SocialFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await communityService.getCommunityPosts(userId);
      setPosts(fetchedPosts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      setPosting(true);
      const post = await communityService.createCommunityPost({
        author_id: user.id,
        content: newPost,
        post_type: 'general',
        is_public: true
      });
      
      setPosts([post, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setPosting(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      await communityService.reactToPost(postId, 'like', user?.id || '');
      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, reactions: [...(post.reactions || []), { user_id: user?.id, reaction_type: 'like' }] }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const tipPost = async (postId: string, authorId: string) => {
    try {
      await communityService.tipPoints(user?.id || '', authorId, 10);
      // Show success message
    } catch (error) {
      console.error('Error tipping:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      {user && (
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Avatar>
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.user_metadata?.full_name?.[0] || user.email?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts, prayers, or testimony..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] resize-none border-none focus:ring-0"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={createPost}
                    disabled={!newPost.trim() || posting}
                    size="sm"
                  >
                    {posting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to share something with the community!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={post.author?.avatar_url} />
                      <AvatarFallback>
                        {post.author?.full_name?.[0] || post.author?.username?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">
                          {post.author?.full_name || post.author?.username}
                        </h4>
                        {post.author?.level && (
                          <Badge variant="secondary" className="text-xs">
                            Level {post.author.level}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {post.post_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Post Stats */}
                <div className="flex items-center justify-between py-3 border-t border-b">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{post.likes_count || 0} likes</span>
                    <span>{post.comments_count || 0} comments</span>
                    <span>{post.shares_count || 0} shares</span>
                  </div>
                  {post.author?.points && (
                    <div className="flex items-center space-x-1 text-sm">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span>{post.author.points} points</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => likePost(post.id)}
                      className={post.reactions?.some((r: any) => r.user_id === user?.id) ? 'text-red-500' : ''}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Comment
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                  
                  {user && user.id !== post.author_id && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => tipPost(post.id, post.author_id)}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <Coins className="h-4 w-4 mr-1" />
                      Tip 10
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
