'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookOpen, Users, Heart, MessageCircle, RefreshCw } from 'lucide-react'
import { getAllDevotionals } from '@/data/devotionals'
import { formatTimeAgo } from '@/lib/utils'
import { SocialInteraction } from './SocialInteraction'

export function FeaturedDevotional() {
  const [devotional, setDevotional] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedDevotional = () => {
      try {
        const allDevotionals = getAllDevotionals()
        const communityDevotionals = allDevotionals.filter(d => d.id.startsWith('community-'))
        
        if (communityDevotionals.length > 0) {
          // Get a random devotional based on today's date for consistency
          const today = new Date()
          const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
          const randomIndex = dayOfYear % communityDevotionals.length
          
          setDevotional(communityDevotionals[randomIndex])
        }
      } catch (error) {
        console.error('Error loading featured devotional:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedDevotional()
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      const allDevotionals = getAllDevotionals()
      const communityDevotionals = allDevotionals.filter(d => d.id.startsWith('community-'))
      
      if (communityDevotionals.length > 0) {
        const randomIndex = Math.floor(Math.random() * communityDevotionals.length)
        setDevotional(communityDevotionals[randomIndex])
      }
      setLoading(false)
    }, 500)
  }

  if (loading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!devotional) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Featured Community Devotional</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No community devotionals available yet.</p>
        </CardContent>
      </Card>
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-xl">Featured Community Devotional</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Inspiring devotional shared by our community
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Title and Author */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{devotional.title}</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{author.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{author}</span>
            <span>•</span>
            <span>{formatTimeAgo(date)}</span>
          </div>
        </div>

        {/* Bible Verse */}
        {verseText && verseReference && (
          <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-lg">
            <div className="text-xs text-blue-600 font-medium mb-1">
              {verseReference}
            </div>
            <p className="text-sm text-blue-800 italic">
              "{verseText}"
            </p>
          </div>
        )}

        {/* Content Preview */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {devotional.content}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Social Interaction */}
        <div className="border-t pt-4">
          <SocialInteraction
            targetId={devotional.id}
            targetType="devotional"
            initialLikes={devotional.likes_count || 0}
            initialComments={devotional.comments_count || 0}
            initialShares={devotional.shares_count || 0}
            showComments={false}
          />
        </div>
      </CardContent>
    </Card>
  )
}
