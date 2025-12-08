'use client';

import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { LogIn, Heart, MessageCircle, UserPlus, PenTool, Sparkles } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  action: 'post' | 'comment' | 'like' | 'friend' | 'devotional' | 'ai-tools';
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, action, fallback }: AuthGuardProps) {
  const { user } = useAuth();

  if (user) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const actionMessages = {
    post: {
      title: 'Sign in to Post',
      description: 'Join our community to share your thoughts and devotionals',
      icon: PenTool,
    },
    comment: {
      title: 'Sign in to Comment',
      description: 'Share your thoughts and engage with the community',
      icon: MessageCircle,
    },
    like: {
      title: 'Sign in to Like',
      description: 'Show appreciation for posts that inspire you',
      icon: Heart,
    },
    friend: {
      title: 'Sign in to Add Friends',
      description: 'Connect with others on their spiritual journey',
      icon: UserPlus,
    },
    devotional: {
      title: 'Sign in to Create Devotionals',
      description: 'Share your insights and inspire others',
      icon: PenTool,
    },
    'ai-tools': {
      title: 'Sign in to Use AI Tools',
      description: 'Generate personalized reading plans, devotionals, and Bible studies with AI',
      icon: Sparkles,
    },
  };

  const message = actionMessages[action];
  const Icon = message.icon;

  return (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/30">
      <CardContent className="p-6 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg mb-2">{message.title}</CardTitle>
        <CardDescription className="mb-4">
          {message.description}
        </CardDescription>
        <Link href="/auth">
          <Button className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In to Continue
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Hook for checking authentication status
export function useRequireAuth() {
  const { user, loading } = useAuth();
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
  };
}
