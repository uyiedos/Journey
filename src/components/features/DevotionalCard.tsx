'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, MessageCircle } from 'lucide-react';
import { Devotional } from '@/types';
import { formatTimeAgo } from '@/lib/utils';
import { SocialInteraction } from './SocialInteraction';

interface DevotionalCardProps {
  devotional: Devotional;
}

export function DevotionalCard({ devotional }: DevotionalCardProps) {
  // Handle both mock data structure and Supabase structure
  const verseText = devotional.verse?.text || devotional.verse_text || '';
  const verseReference = devotional.verse ? 
    `${devotional.verse.book || ''} ${devotional.verse.chapter || ''}:${devotional.verse.number || ''}` : 
    devotional.verse_reference || '';
  const author = devotional.author_name || devotional.author || 'Anonymous';
  
  // Convert date to Date object (handles both Date objects and string dates from Supabase)
  const date = devotional.date ? 
    (devotional.date instanceof Date ? devotional.date : new Date(devotional.date)) :
    (devotional.created_at ? new Date(devotional.created_at) : new Date());
  const shares = devotional.shares || 0;
  const tags = devotional.tags || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{devotional.title}</CardTitle>
            <CardDescription>
              {verseText && verseReference ? `${verseText} - ${verseReference}` : verseText || verseReference}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{author.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{author}</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{formatTimeAgo(date)}</span>
        </div>
      </CardHeader>
      
      <CardContent>
        {devotional.image_url && (
          <div className="mb-3">
            <img
              src={devotional.image_url}
              alt={devotional.title}
              className="w-full h-40 object-cover rounded-md"
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {devotional.content}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
        
        <SocialInteraction
          targetId={devotional.id}
          targetType="devotional"
          initialLikes={devotional.likes_count || 0}
          initialComments={devotional.comments_count || 0}
          initialShares={devotional.shares_count || 0}
          showComments={false}
          className="mb-4"
        />
      </CardContent>
    </Card>
  );
}
