'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Target, Star, Award, Zap, BookOpen, Users, Calendar, Clock, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Gamification } from '@/types';

import { formatPoints } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface GamificationStatsProps {
  stats: Gamification;
}

export function GamificationStats({ stats }: GamificationStatsProps) {
  const currentLevelPoints = stats.points % 1000;
  const progressToNextLevel = (currentLevelPoints / 1000) * 100;
  const pointsToNextLevel = 1000 - currentLevelPoints;

  // Real user stats - starting from zero
  const userStats = {
    totalReadTime: 0, // minutes
    versesRead: 0,
    chaptersCompleted: 0,
    booksCompleted: 0,
    prayersShared: 0,
    notesTaken: 0,
    communityPosts: 0,
    friendsCount: 0,
    joinedDate: new Date(),
    lastActive: new Date(),
    averageReadingTime: 0, // minutes per session
    favoriteBook: 'None yet',
    favoriteVerse: 'None yet',
  };

  // Real general stats - starting from zero since only one user
  const generalStats = {
    totalUsers: 1,
    activeToday: 0,
    totalVersesRead: 0,
    totalPrayers: 0,
    communityPosts: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* User Personal Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Your Journey</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{formatTime(userStats.totalReadTime)}</div>
              <div className="text-xs text-muted-foreground">Total Read Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{userStats.versesRead}</div>
              <div className="text-xs text-muted-foreground">Verses Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{userStats.chaptersCompleted}</div>
              <div className="text-xs text-muted-foreground">Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{userStats.booksCompleted}</div>
              <div className="text-xs text-muted-foreground">Books</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500">{userStats.prayersShared}</div>
              <div className="text-xs text-muted-foreground">Prayers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-500">{userStats.notesTaken}</div>
              <div className="text-xs text-muted-foreground">Notes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-500">{userStats.communityPosts}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-500">{userStats.friendsCount}</div>
              <div className="text-xs text-muted-foreground">Friends</div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Member since</span>
              <span>{formatDate(userStats.joinedDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Average session</span>
              <span>{userStats.averageReadingTime} minutes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Favorite book</span>
              <span>{userStats.favoriteBook}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Life verse</span>
              <span>{userStats.favoriteVerse}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Level {stats.level}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Progress to Level {stats.level + 1}</span>
            <span>{pointsToNextLevel} pts to go</span>
          </div>
          <Progress value={progressToNextLevel} className="h-2" />
          <div className="text-center">
            <span className="text-2xl font-bold">{formatPoints(stats.points)}</span>
            <span className="text-sm text-muted-foreground ml-2">total points</span>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>Reading Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">{stats.streak}</div>
            <div className="text-sm text-muted-foreground">days in a row</div>
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-500" />
            <span>Community</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{generalStats.totalUsers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{generalStats.activeToday}</div>
              <div className="text-xs text-muted-foreground">Active Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{(generalStats.totalVersesRead / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-muted-foreground">Verses Read</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500">{(generalStats.totalPrayers / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Prayers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-500">{(generalStats.communityPosts / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{(generalStats.dailyActiveUsers / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Daily Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-purple-500" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {stats.badges.slice(-6).map((badge) => (
              <div key={badge.id} className="text-center space-y-1">
                <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <span className="text-xs font-medium truncate">{badge.name.toString()}</span>
                <div className="text-xs text-muted-foreground">+{badge.points} pts</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-500" />
            <span>Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.leaderboard.slice(0, 5).map((entry, index) => (
              <div key={entry.userId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 && "bg-yellow-100 text-yellow-800",
                    index === 1 && "bg-gray-100 text-gray-800",
                    index === 2 && "bg-orange-100 text-orange-800",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {entry.rank}
                  </div>
                  <span className="text-sm font-medium">{entry.username}</span>
                </div>
                <span className="text-sm font-bold">{formatPoints(entry.points)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
