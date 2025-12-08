'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Heart, MessageCircle, Share2, Users, Calendar, MoreHorizontal, Bookmark, Smile, Send } from 'lucide-react'
import Link from 'next/link'
import { formatTimeAgo } from '@/lib/utils'
import { SocialInteraction } from '@/components/features/SocialInteraction'
import { AuthGuard } from '@/components/auth/AuthGuard'

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

interface CommunityPost {
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

export default function CommunityPostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<CommunityPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showComments, setShowComments] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // In a real app, this would fetch from your API
        const response = await fetch(`/api/community/posts/${params.id}`)
        if (!response.ok) {
          throw new Error('Post not found')
        }
        const data = await response.json()
        setPost(data)
        setLiked(data.isLiked || false)
        setBookmarked(data.isBookmarked || false)
        setLikeCount(data.likes || 0)
      } catch (err) {
        setError('Post not found')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  const handleShare = () => {
    console.log('Sharing post:', params.id)
  }

  const handleComment = () => {
    if (newComment.trim()) {
      console.log('Adding comment:', newComment)
      setNewComment('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'This post could not be found.'}</p>
          <Button asChild>
            <Link href="/community">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/community">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Link>
        </Button>

        {/* Main Post */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.authorAvatar} />
                  <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="font-semibold">{post.authorName}</h4>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{formatTimeAgo(post.timestamp)}</span>
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
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Bible Verse */}
              {post.verse && (
                <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-lg">
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    {post.verse.book} {post.verse.chapter}:{post.verse.verse}
                  </div>
                  <p className="text-sm text-blue-800 italic">
                    "{post.verse.text}"
                  </p>
                </div>
              )}

              {/* Image */}
              {post.image && (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={post.image} alt="Post image" className="w-full h-auto" />
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Engagement Stats */}
            {(likeCount > 0 || post.comments.length > 0 || post.shares > 0) && (
              <div className="flex items-center space-x-4 text-sm text-muted-foreground border-t pt-3">
                {likeCount > 0 && (
                  <span className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 fill-current text-red-500" />
                    <span>{likeCount}</span>
                  </span>
                )}
                {post.comments.length > 0 && (
                  <span>{post.comments.length} comments</span>
                )}
                {post.shares > 0 && (
                  <span>{post.shares} shares</span>
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
                  {post.comments.map((comment) => (
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

        {/* Related Posts */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Related Posts</h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              More posts coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
