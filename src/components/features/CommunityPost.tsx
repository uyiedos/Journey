'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';
import { SocialInteraction } from './SocialInteraction';

interface CommunityPostProps {
  post: any;
  authorName: string;
  authorAvatar?: string;
}

export function CommunityPost({ post, authorName, authorAvatar }: CommunityPostProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{authorName}</div>
              <div className="text-sm text-muted-foreground">
                {post.created_at ? formatTimeAgo(new Date(post.created_at)) : 'Just now'}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">{post.content}</p>
          
          {post.verse_reference && post.verse_text && (
            <div className="bg-muted/50 p-3 rounded-lg border-l-4 border-primary">
              <p className="text-sm italic text-muted-foreground">
                "{post.verse_text}" - {post.verse_reference}
              </p>
            </div>
          )}
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <SocialInteraction
          targetId={post.id}
          targetType="post"
          initialLikes={post.likes_count || 0}
          initialComments={post.comments_count || 0}
          initialShares={post.shares_count || 0}
          showComments={true}
        />
      </CardContent>
    </Card>
  );
}
