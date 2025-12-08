'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/contexts/UserDataContext';
import { cn } from '@/lib/utils';
import {
  Trophy,
  Flame,
  Target,
  Star,
  Award,
  Zap,
  BookOpen,
  Users,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Gift,
  Crown,
  Rocket,
  Sparkles,
  ChevronRight,
  BarChart3,
  Activity
} from 'lucide-react';

export function MobileGamificationStats() {
  const { user, stats, addPoints, incrementStreak } = useUserData();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges'>('overview');

  // Enhanced user stats
  const userStats = {
    totalReadTime: 1247,
    versesRead: 2847,
    chaptersCompleted: 156,
    booksCompleted: 12,
    prayersShared: 89,
    notesTaken: 234,
    communityPosts: 45,
    friendsCount: 67,
    joinedDate: new Date('2023-01-15'),
    lastActive: new Date(),
    averageReadingTime: 15,
    favoriteBook: 'Psalms',
    favoriteVerse: 'John 3:16',
  };

  const generalStats = {
    totalUsers: 2847,
    activeToday: 892,
    totalVersesRead: 1247890,
    totalPrayers: 45678,
    communityPosts: 12456,
    dailyActiveUsers: 1567,
    weeklyActiveUsers: 2341,
    monthlyActiveUsers: 5678,
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'read':
        addPoints(10);
        break;
      case 'pray':
        addPoints(5);
        break;
      case 'share':
        addPoints(15);
        break;
      case 'streak':
        incrementStreak();
        addPoints(20);
        break;
    }
  };

  if (!user || !stats) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div className="text-xl font-bold text-blue-700">{formatNumber(stats.points)}</div>
            <div className="text-xs text-blue-600">Points</div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-orange-500 rounded-full flex items-center justify-center">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div className="text-xl font-bold text-orange-700">{stats.streak}</div>
            <div className="text-xs text-orange-600">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="text-xl font-bold text-green-700">{userStats.chaptersCompleted}</div>
            <div className="text-xs text-green-600">Chapters</div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-purple-500 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="text-xl font-bold text-purple-700">{userStats.friendsCount}</div>
            <div className="text-xs text-purple-600">Friends</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress - Enhanced */}
      <Card className="bg-linear-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <div className="w-8 h-8 bg-linear-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <span>Level {stats.level}</span>
            <Badge className="bg-yellow-100 text-yellow-800">Expert</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress to Level {stats.level + 1}</span>
            <span className="text-muted-foreground">{1000 - (stats.points % 1000)} pts to go</span>
          </div>
          <Progress value={(stats.points % 1000) / 10} className="h-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Rocket className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{formatNumber(stats.points)} total points</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Top 5% this week</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Mobile First */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              onClick={() => handleQuickAction('read')}
              className="h-16 flex-col space-y-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Read (+10)</span>
            </Button>
            <Button 
              onClick={() => handleQuickAction('pray')}
              className="h-16 flex-col space-y-2 bg-linear-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
            >
              <Heart className="h-6 w-6" />
              <span className="text-sm">Pray (+5)</span>
            </Button>
            <Button 
              onClick={() => handleQuickAction('share')}
              className="h-16 flex-col space-y-2 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              <Share2 className="h-6 w-6" />
              <span className="text-sm">Share (+15)</span>
            </Button>
            <Button 
              onClick={() => handleQuickAction('streak')}
              className="h-16 flex-col space-y-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Flame className="h-6 w-6" />
              <span className="text-sm">Streak (+20)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline - Mobile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-500" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { icon: Trophy, color: 'text-yellow-500', text: 'Achievement Unlocked', subtext: 'Bible Scholar - 100 chapters', time: '2h ago', points: '+50' },
              { icon: BookOpen, color: 'text-blue-500', text: 'Completed Reading', subtext: 'Proverbs Chapter 3', time: '4h ago', points: '+10' },
              { icon: Heart, color: 'text-pink-500', text: 'Shared Prayer', subtext: 'Community prayer request', time: '6h ago', points: '+5' },
              { icon: Flame, color: 'text-orange-500', text: 'Daily Streak', subtext: '15 days in a row!', time: '1d ago', points: '+20' },
            ].map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{activity.text}</div>
                    <div className="text-xs text-muted-foreground">{activity.subtext}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{activity.points}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Community Stats - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <span>Community Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(generalStats.totalUsers)}</div>
              <div className="text-xs text-blue-500">Total Users</div>
            </div>
            <div className="text-center p-4 bg-linear-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{generalStats.activeToday}</div>
              <div className="text-xs text-green-500">Active Today</div>
            </div>
            <div className="text-center p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatNumber(generalStats.totalVersesRead)}</div>
              <div className="text-xs text-purple-500">Verses Read</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
