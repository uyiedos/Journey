'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Heart, Sparkles } from 'lucide-react';

interface CommunityPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  verse_reference?: string;
  verse_text?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  is_public: boolean;
  is_friend_only: boolean;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    points: number;
    level: number;
  };
  is_liked?: boolean;
}

interface Friend {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  points?: number;
  level?: number;
  status?: 'online' | 'offline' | 'away';
  friendship_status?: 'pending' | 'accepted' | 'none';
}

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  is_private: boolean;
  member_count: number;
  created_by: string;
  user_role?: 'admin' | 'moderator' | 'member';
}

export default function CommunityPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center py-20">
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              <Users className="h-16 w-16 text-gray-400 mb-4" />
              <CardTitle className="text-2xl font-bold">Community</CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-md">
                Connect with fellow believers, share your journey, and grow together in faith.
              </CardDescription>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Sparkles className="h-4 w-4" />
                <span>Coming Soon</span>
              </div>
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Share Devotions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Join Groups</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>Support Others</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
