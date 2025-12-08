'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Smile, Image, X } from 'lucide-react';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  timestamp: Date;
  isLiked?: boolean;
}

interface EnhancedPostProps {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  verse?: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  };
  image?: string;
  likes: number;
  shares: number;
  comments: Comment[];
  timestamp: Date;
  isLiked?: boolean;
  isBookmarked?: boolean;
  tags?: string[];
}

export function EnhancedPost({
  id,
  authorId,
  authorName,
  authorAvatar,
  content,
  verse,
  image,
  likes,
  shares,
  comments,
  timestamp,
  isLiked = false,
  isBookmarked = false,
  tags = [],
}: EnhancedPostProps) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likeCount, setLikeCount] = useState(likes);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleShare = () => {
    // In real app, this would open share dialog
    console.log('Sharing post:', id);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      // In real app, this would send to API
      console.log('Adding comment:', newComment);
      setNewComment('');
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="font-semibold">{authorName}</h4>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{formatTimeAgo(timestamp)}</span>
                <span>•</span>
                <span>Public</span>
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
          <p className="text-sm leading-relaxed line-clamp-3">
            {content}
          </p>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/community/${id}`}>
              Read More
            </Link>
          </Button>

          {/* Bible Verse */}
          {verse && (
            <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-lg">
              <div className="text-xs text-blue-600 font-medium mb-1">
                {verse.book} {verse.chapter}:{verse.verse}
              </div>
              <p className="text-sm text-blue-800 italic">
                "{verse.text}"
              </p>
            </div>
          )}

          {/* Image */}
          {image && (
            <div className="relative rounded-lg overflow-hidden">
              <img src={image} alt="Post image" className="w-full h-auto" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        {(likes > 0 || comments.length > 0 || shares > 0) && (
          <div className="flex items-center space-x-4 text-sm text-muted-foreground border-t pt-3">
            {likes > 0 && (
              <span className="flex items-center space-x-1">
                <Heart className="h-4 w-4 fill-current text-red-500" />
                <span>{likeCount}</span>
              </span>
            )}
            {comments.length > 0 && (
              <span>{comments.length} comments</span>
            )}
            {shares > 0 && (
              <span>{shares} shares</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex space-x-2">
            <AuthGuard action="like">
              <Button
                variant={liked ? "default" : "ghost"}
                size="sm"
                onClick={handleLike}
                className={liked ? "text-red-500 hover:text-red-600" : ""}
              >
                <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                Like
              </Button>
            </AuthGuard>
            <AuthGuard action="comment">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Comment
              </Button>
            </AuthGuard>
            <AuthGuard action="post">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </AuthGuard>
          </div>
          <AuthGuard action="like">
            <Button
              variant={bookmarked ? "default" : "ghost"}
              size="sm"
              onClick={handleBookmark}
              className={bookmarked ? "text-blue-500" : ""}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
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
                  <AvatarFallback>Y</AvatarFallback>
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
                  <Button onClick={handleComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AuthGuard>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.authorAvatar} />
                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <button className="hover:text-primary flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="hover:text-primary">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
