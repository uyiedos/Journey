'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAllDevotionals } from '@/data/devotionals';
import { Heart, Share2, Bookmark, MoreHorizontal, Filter, Search } from 'lucide-react';

export function CommunityDevotionals() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const allDevotionals = getAllDevotionals();
  const communityDevotionals = allDevotionals.filter(d => d.id.startsWith('community-'));
  
  const filteredDevotionals = communityDevotionals.filter(devotional => {
    const matchesSearch = devotional.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         devotional.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         devotional.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || devotional.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(communityDevotionals.flatMap(d => d.tags)));

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Community Devotionals</h2>
          <p className="text-muted-foreground">
            Inspiring devotionals shared by our community members
          </p>
        </div>
        <Button>
          Create Devotional
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search devotionals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selectedTag === null 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedTag === tag 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Devotionals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDevotionals.map((devotional) => (
          <Card key={devotional.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{devotional.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{devotional.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{devotional.author}</span>
                      <span>•</span>
                      <span>{formatDate(devotional.date)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Bible Verse */}
              <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-lg">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {devotional.verse.id.replace(/-/g, ' ').toUpperCase()}
                </div>
                <p className="text-sm text-blue-800 italic">
                  "{devotional.verse.text}"
                </p>
              </div>

              {/* Content Preview */}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {devotional.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {devotional.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Engagement */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                    <Heart className="h-4 w-4" />
                    <span>{devotional.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span>{devotional.shares}</span>
                  </button>
                  <button className="hover:text-yellow-500 transition-colors">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/devotionals/${devotional.id}`}>
                    Read More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDevotionals.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No devotionals found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
