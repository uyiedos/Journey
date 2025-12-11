'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Smile, Image, X, BookOpen, Hand, Sparkles } from 'lucide-react';
import { communityService, CommunityPost, Comment } from '@/services/communityService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface EnhancedPostProps {
  post: CommunityPost;
  onPostUpdate?: () => void;
  currentUserId?: string;
}

export function EnhancedPost({
  post,
  onPostUpdate,
  currentUserId
}: EnhancedPostProps) {
  const { user: authUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  // Load comments when expanding
  const loadComments = async () => {
    if (!showComments && post.comments_count > 0) {
      setLoadingComments(true);
      try {
        const commentsData = await communityService.getPostComments(post.id);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  // Handle reaction
  const handleReaction = async (type: 'like' | 'love' | 'pray' | 'amen' | 'praise') => {
    if (!authUser) return;
    
    try {
      await communityService.reactToPost(post.id, authUser.id, type);
      setUserReaction(type);
      if (onPostUpdate) onPostUpdate();
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  // Handle comment submission
  const handleComment = async () => {
    if (!newComment.trim() || !authUser) return;
    
    setPostingComment(true);
    try {
      const comment = await communityService.addComment(post.id, authUser.id, newComment);
      if (comment) {
        setComments([...comments, comment]);
        setNewComment('');
        if (onPostUpdate) onPostUpdate();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setPostingComment(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getPostTypeIcon = () => {
    switch (post.post_type) {
      case 'prayer_request':
        return <Hand className="h-4 w-4" />;
      case 'testimony':
        return <Sparkles className="h-4 w-4" />;
      case 'verse_share':
        return <BookOpen className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPostTypeColor = () => {
    switch (post.post_type) {
      case 'prayer_request':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'testimony':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'verse_share':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={(post.author as any)?.avatar} />
              <AvatarFallback>{(post.author as any)?.full_name?.charAt(0) || (post.author as any)?.username?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="font-semibold">{(post.author as any)?.full_name || (post.author as any)?.username || 'Unknown User'}</h4>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{formatTimeAgo(post.created_at)}</span>
                <span>•</span>
                <span>{post.is_public ? 'Public' : 'Friends'}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Post Content */}
        <div className="space-y-3">
          {/* Post Type Badge */}
          {post.post_type !== 'general' && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPostTypeColor()}`}>
              {getPostTypeIcon()}
              <span className="capitalize">{post.post_type.replace('_', ' ')}</span>
            </div>
          )}

          <p className="text-sm leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Engagement Stats */}
        {(post.likes_count > 0 || post.comments_count > 0 || post.shares_count > 0) && (
          <div className="flex items-center space-x-4 text-sm text-muted-foreground border-t pt-3">
            {post.likes_count > 0 && (
              <span className="flex items-center space-x-1">
                <Heart className="h-4 w-4 fill-current text-red-500" />
                <span>{post.likes_count}</span>
              </span>
            )}
            {post.comments_count > 0 && (
              <span>{post.comments_count} comments</span>
            )}
            {post.shares_count > 0 && (
              <span>{post.shares_count} shares</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex space-x-2">
            <AuthGuard action="like">
              <div className="flex space-x-1">
                <Button
                  variant={userReaction === 'like' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleReaction('like')}
                  className={userReaction === 'like' ? "text-red-500 hover:text-red-600" : ""}
                >
                  <Heart className={`h-4 w-4 ${userReaction === 'like' ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant={userReaction === 'love' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleReaction('love')}
                  className={userReaction === 'love' ? "text-pink-500 hover:text-pink-600" : ""}
                >
                  <Heart className={`h-4 w-4 ${userReaction === 'love' ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant={userReaction === 'pray' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleReaction('pray')}
                  className={userReaction === 'pray' ? "text-purple-500 hover:text-purple-600" : ""}
                >
                  <Hand className={`h-4 w-4 ${userReaction === 'pray' ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant={userReaction === 'amen' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleReaction('amen')}
                  className={userReaction === 'amen' ? "text-blue-500 hover:text-blue-600" : ""}
                >
                  <Heart className={`h-4 w-4 ${userReaction === 'amen' ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant={userReaction === 'praise' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleReaction('praise')}
                  className={userReaction === 'praise' ? "text-yellow-500 hover:text-yellow-600" : ""}
                >
                  <Sparkles className={`h-4 w-4 ${userReaction === 'praise' ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </AuthGuard>
            <AuthGuard action="comment">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadComments}
                disabled={loadingComments}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {post.comments_count > 0 && post.comments_count}
              </Button>
            </AuthGuard>
            <AuthGuard action="post">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('Share post:', post.id)}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </AuthGuard>
          </div>
          <AuthGuard action="like">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Bookmark post:', post.id)}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </AuthGuard>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4 border-t pt-4">
            {/* Add Comment */}
            <AuthGuard action="comment">
              <div className="flex space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={authUser?.user_metadata?.avatar} />
                  <AvatarFallback>{authUser?.email?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button variant="ghost" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleComment} disabled={!newComment.trim() || postingComment}>
                    {postingComment ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </AuthGuard>

            {/* Comments List */}
            {loadingComments ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(comment.author as any)?.avatar} />
                      <AvatarFallback>{(comment.author as any)?.full_name?.charAt(0) || (comment.author as any)?.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{(comment.author as any)?.full_name || (comment.author as any)?.username || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <button className="hover:text-primary flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{comment.likes_count}</span>
                        </button>
                        <button className="hover:text-primary">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : post.comments_count === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
