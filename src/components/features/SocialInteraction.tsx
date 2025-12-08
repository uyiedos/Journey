import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { socialService } from '@/services/socialService';
import { formatTimeAgo } from '@/lib/utils';

interface SocialInteractionProps {
  targetId: string;
  targetType: 'post' | 'devotional' | 'prayer';
  initialLikes?: number;
  initialComments?: number;
  initialShares?: number;
  showComments?: boolean;
  className?: string;
}

export function SocialInteraction({
  targetId,
  targetType,
  initialLikes = 0,
  initialComments = 0,
  initialShares = 0,
  showComments = true,
  className = ''
}: SocialInteractionProps) {
  const { user: authUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [shares, setShares] = useState(initialShares);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user liked this content
  useEffect(() => {
    if (authUser && mounted) {
      socialService.hasUserLiked(targetId, targetType, authUser.id).then(setIsLiked);
    }
  }, [targetId, targetType, authUser, mounted]);

  // Load comments when section is opened
  useEffect(() => {
    if (showCommentsSection && showComments && mounted) {
      loadComments();
    }
  }, [showCommentsSection, targetId, targetType, showComments, mounted]);

  const loadComments = async () => {
    try {
      const commentsData = await socialService.getComments(targetId, targetType);
      setCommentsList(commentsData);
      setComments(commentsData.length);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLike = async () => {
    if (!authUser || isLiking || !mounted) return;

    setIsLiking(true);
    
    // Optimistic update - update UI immediately
    const newLikedState = !isLiked;
    const newCount = newLikedState ? likes + 1 : Math.max(0, likes - 1);
    setIsLiked(newLikedState);
    setLikes(newCount);

    try {
      const result = await socialService.toggleLike(targetId, targetType, authUser.id);
      // Sync with actual database result
      setLikes(result.count);
      setIsLiked(result.liked);
    } catch (error) {
      // Revert on error
      console.error('Error toggling like:', error);
      setIsLiked(!newLikedState);
      setLikes(likes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (!authUser || isSharing || !mounted) return;

    setIsSharing(true);
    try {
      const result = await socialService.share(targetId, targetType, authUser.id);
      setShares(result.count);
      
      // You could implement native share functionality here
      if (navigator.share) {
        await navigator.share({
          title: `Check out this ${targetType}`,
          text: `Found this amazing ${targetType} on Journey!`,
          url: window.location.href,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleComment = async () => {
    if (!authUser || !newComment.trim() || isSubmittingComment || !mounted) return;

    setIsSubmittingComment(true);
    try {
      const comment = await socialService.addComment(targetId, targetType, authUser.id, newComment);
      setCommentsList([comment, ...commentsList]);
      setComments(prev => prev + 1);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Interaction Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={`text-muted-foreground hover:text-red-500 transition-colors ${
              isLiked ? 'text-red-500' : ''
            }`}
            onClick={handleLike}
            disabled={!authUser || isLiking}
          >
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {likes}
          </Button>
          
          {showComments && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-blue-500 transition-colors"
              onClick={() => setShowCommentsSection(!showCommentsSection)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {comments}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-green-500 transition-colors"
            onClick={handleShare}
            disabled={!authUser || isSharing}
          >
            <Share2 className="h-4 w-4 mr-1" />
            {shares}
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && showCommentsSection && (
        <div className="space-y-4 border-t pt-4">
          {/* Add Comment */}
          {authUser && (
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={authUser.user_metadata?.avatar_url} />
                <AvatarFallback>{authUser.email?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {isSubmittingComment ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {commentsList.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </div>
            ) : (
              commentsList.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.avatar_url} />
                    <AvatarFallback>
                      {comment.user?.full_name?.charAt(0) || comment.user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {comment.user?.full_name || comment.user?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(new Date(comment.created_at))}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
