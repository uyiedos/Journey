'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Heart, MessageCircle, Share2, BookOpen, Calendar, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { Devotional } from '@/types'
import { formatTimeAgo } from '@/lib/utils'
import { SocialInteraction } from '@/components/features/SocialInteraction'

export default function DevotionalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDevotional = async () => {
      try {
        // In a real app, this would fetch from your API
        // For now, we'll try to get from mock data or return null
        const response = await fetch(`/api/devotionals/${params.id}`)
        if (!response.ok) {
          throw new Error('Devotional not found')
        }
        const data = await response.json()
        setDevotional(data)
      } catch (err) {
        // Fallback to mock data or show error
        setError('Devotional not found')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDevotional()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !devotional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Devotional Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'This devotional could not be found.'}</p>
          <Button asChild>
            <Link href="/devotionals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Devotionals
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const verseText = devotional.verse?.text || devotional.verse_text || ''
  const verseReference = devotional.verse ? 
    `${devotional.verse.book || ''} ${devotional.verse.chapter || ''}:${devotional.verse.number || ''}` : 
    devotional.verse_reference || ''
  const author = devotional.author_name || devotional.author || 'Anonymous'
  const date = devotional.date ? 
    (devotional.date instanceof Date ? devotional.date : new Date(devotional.date)) :
    (devotional.created_at ? new Date(devotional.created_at) : new Date())
  const tags = devotional.tags || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/devotionals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Devotionals
          </Link>
        </Button>

        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="space-y-4">
              {/* Title */}
              <CardTitle className="text-2xl md:text-3xl">{devotional.title}</CardTitle>
              
              {/* Author and Date */}
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{author.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatTimeAgo(date)}</span>
                </div>
              </div>

              {/* Bible Verse */}
              {verseText && verseReference && (
                <div className="bg-blue-50 border-l-4 border-blue-200 p-4 rounded-r-lg">
                  <div className="text-sm text-blue-600 font-medium mb-2">
                    {verseReference}
                  </div>
                  <p className="text-blue-800 italic text-lg">
                    "{verseText}"
                  </p>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Full Content */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {devotional.content}
              </div>
            </div>

            {/* Social Interaction */}
            <div className="border-t pt-6">
              <SocialInteraction
                targetId={devotional.id}
                targetType="devotional"
                initialLikes={devotional.likes_count || 0}
                initialComments={devotional.comments_count || 0}
                initialShares={devotional.shares_count || 0}
                showComments={true}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 border-t pt-6">
              <Button variant="outline" size="sm">
                <Heart className="mr-2 h-4 w-4" />
                Like
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Devotionals Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Related Devotionals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              More devotionals coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
