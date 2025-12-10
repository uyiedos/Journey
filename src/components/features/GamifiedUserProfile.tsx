'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GamifiedCard, AchievementCard, StreakCard, LeaderboardCard } from '@/components/ui/GamifiedCard';
import { ResponsiveText, ResponsiveGrid } from '@/components/layout/ResponsiveLayout';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { 
  Trophy as TrophyIcon, 
  Star, 
  Flame, 
  Clock, 
  Users, 
  TrendingUp,
  Award,
  Zap,
  Target,
  BookOpen,
  Heart,
  MessageCircle,
  Share2,
  Settings,
  Crown,
  Medal as MedalIcon,
  Gem,
  ChevronRight,
  BookMarked,
  MessageSquare,
  Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

// Types
type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string | null;
};

type UserStats = {
  reading_plans_completed: number;
  devotionals_created: number;
  community_posts: number;
  total_reading_days: number;
};

type Rank = {
  position: number;
  total_users: number;
};

type UserProfile = {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  points: number;
  level: number;
  streak: number;
  joined_at: string;
  stats: UserStats;
  achievements: Achievement[];
  rank?: Rank | null;
};

type GamifiedUserProfileProps = {
  user: Partial<UserProfile>;
  className?: string;
  compact?: boolean;
  isLoading?: boolean;
  onAchievementClick?: (achievement: Achievement) => void;
};

// Skeleton loader component
const UserProfileSkeleton = ({ compact = false }: { compact?: boolean }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-12 h-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GamifiedCard>
        <div className="flex items-start gap-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </div>
      </GamifiedCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
};

// Helper function to safely access user properties
const safeUser = (user: Partial<UserProfile>): UserProfile => {
  const safeAchievements = (achievements: any[] | undefined): Achievement[] => {
    if (!Array.isArray(achievements)) return [];
    return achievements.map(ach => ({
      id: ach.id || '',
      title: ach.title || 'Achievement',
      description: ach.description || 'Earned an achievement',
      icon: ach.icon || '🏆',
      unlocked_at: ach.unlocked_at || new Date().toISOString()
    }));
  };

  return {
    id: user.id || 'anonymous',
    email: user.email || '',
    full_name: user.full_name || 'Anonymous',
    avatar_url: user.avatar_url || '',
    points: typeof user.points === 'number' ? Math.max(0, user.points) : 0,
    level: typeof user.level === 'number' ? Math.max(1, user.level) : 1,
    streak: typeof user.streak === 'number' ? Math.max(0, user.streak) : 0,
    joined_at: user.joined_at || new Date().toISOString(),
    stats: {
      reading_plans_completed: Math.max(0, user.stats?.reading_plans_completed || 0),
      devotionals_created: Math.max(0, user.stats?.devotionals_created || 0),
      community_posts: Math.max(0, user.stats?.community_posts || 0),
      total_reading_days: Math.max(0, user.stats?.total_reading_days || 0),
    },
    achievements: safeAchievements(user.achievements),
    rank: user.rank || { position: 0, total_users: 0 }
  };
};

export function GamifiedUserProfile({
  user: userProp = {},
  className,
  compact = false,
  isLoading = false,
  onAchievementClick,
}: GamifiedUserProfileProps) {
  // Use safeUser to ensure all properties have default values
  const user = safeUser(userProp);
  
  // Show loading skeleton if data is loading
  if (isLoading) {
    return <UserProfileSkeleton compact={compact} />;
  }

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'bg-purple-500';
    if (level >= 30) return 'bg-blue-500';
    if (level >= 20) return 'bg-green-500';
    if (level >= 10) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Master';
    if (level >= 30) return 'Expert';
    if (level >= 20) return 'Advanced';
    if (level >= 10) return 'Intermediate';
    return 'Beginner';
  };

  const getProgressToNextLevel = () => {
    try {
      const nextLevel = user.level + 1;
      const currentLevelMin = user.level * 100;
      const nextLevelMin = nextLevel * 100;
      const currentPoints = user.points;
      const progress = ((currentPoints - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
      return Math.min(Math.max(progress, 0), 100);
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  const getRecentAchievements = (): Achievement[] => {
    try {
      return (user.achievements || [])
        .filter(ach => ach) // Filter out any null/undefined
        .slice(0, 3);
    } catch (error) {
      console.error('Error getting recent achievements:', error);
      return [];
    }
  };

  const renderAchievement = (achievement: Achievement) => {
    if (!achievement) return null;
    
    const handleClick = () => {
      if (onAchievementClick) {
        onAchievementClick(achievement);
      }
    };

    return (
      <div 
        key={achievement.id} 
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-colors',
          onAchievementClick && 'cursor-pointer hover:bg-yellow-50'
        )}
        onClick={handleClick}
      >
        <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
          {achievement.icon ? (
            <span className="text-lg">{achievement.icon}</span>
          ) : (
            <MedalIcon className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">
            {achievement.title || 'Achievement'}
          </h4>
          <p className="text-xs text-gray-500 truncate">
            {achievement.description || 'Earned an achievement'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400">
            {achievement.unlocked_at ? new Date(achievement.unlocked_at).toLocaleDateString() : '--'}
          </div>
          {onAchievementClick && <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <ErrorBoundary>
        <div className={cn('flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow', className)}>
          <div className="relative">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name || 'User'} 
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = '';
                  target.className = 'w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold';
                  target.textContent = user.full_name?.charAt(0)?.toUpperCase() || (user.email ? user.email.charAt(0).toUpperCase() : 'U');
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.full_name?.charAt(0)?.toUpperCase() || (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </div>
            )}
            {user.level >= 10 && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                <TrophyIcon className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {user.full_name || 'Anonymous'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                getLevelColor(user.level) === 'bg-purple-500' ? 'bg-purple-100 text-purple-800' :
                getLevelColor(user.level) === 'bg-blue-500' ? 'bg-blue-100 text-blue-800' :
                getLevelColor(user.level) === 'bg-green-500' ? 'bg-green-100 text-green-800' :
                getLevelColor(user.level) === 'bg-yellow-500' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              )}>
                {getLevelTitle(user.level)}
              </span>
              {user.streak > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                  <Flame className="h-3 w-3" />
                  {user.streak}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user.points}
            </div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Card */}
      <ErrorBoundary>
        <GamifiedCard 
          variant="achievement" 
          glowEffect={user.level >= 20}
          className="overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name || 'User'} 
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '';
                      target.className = 'w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg';
                      target.textContent = user.full_name?.charAt(0)?.toUpperCase() || (user.email ? user.email.charAt(0).toUpperCase() : 'U');
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {user.full_name?.charAt(0)?.toUpperCase() || (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                  </div>
                )}
                {user.level >= 10 && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-white">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Top 5% this week
                    </div>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {user.full_name || 'Anonymous'}
                    </h2>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {user.points.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.points.toLocaleString()} total points
                    </div>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">
                        Level {user.level}
                      </span>
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                        getLevelColor(user.level) === 'bg-purple-500' ? 'bg-purple-100 text-purple-900' :
                        getLevelColor(user.level) === 'bg-blue-500' ? 'bg-blue-100 text-blue-900' :
                        getLevelColor(user.level) === 'bg-green-500' ? 'bg-green-100 text-green-900' :
                        getLevelColor(user.level) === 'bg-yellow-500' ? 'bg-yellow-100 text-yellow-900' :
                        'bg-gray-100 text-gray-900'
                      )}>
                        {getLevelTitle(user.level)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Progress to Level {user.level + 1} • {Math.max(0, (user.level + 1) * 100 - user.points)} pts to go
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {user.points} / {(user.level + 1) * 100} XP
                    </span>
                  </div>
                  <div className="relative">
                    <div className="overflow-hidden h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div 
                        className={cn(
                          'h-full rounded-full',
                          getLevelColor(user.level)
                        )}
                        style={{ width: `${getProgressToNextLevel()}%` }}
                      ></div>
                    </div>
                    <div 
                      className={cn(
                        'absolute -top-1 h-4 w-4 rounded-full border-2 border-white',
                        getLevelColor(user.level)
                      )}
                      style={{ left: `calc(${getProgressToNextLevel()}% - 0.5rem)` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GamifiedCard>
      </ErrorBoundary>

      {/* Stats Grid */}
      <ResponsiveGrid className="gap-4">
        <ErrorBoundary>
          <StreakCard 
            count={user.streak}
            label={`Day Streak`}
            icon={<Flame className="h-5 w-5 text-orange-500" />}
          >
            <Button variant="ghost" size="icon">
              <Zap className="h-5 w-5 text-orange-500" />
            </Button>
          </StreakCard>
        </ErrorBoundary>

        <ErrorBoundary>
          <GamifiedCard variant="progress" className="h-full">
            <div className="flex items-center justify-between h-full">
              <div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-blue-500" />
                  {user.stats.reading_plans_completed}
                </div>
                <div className="text-sm text-muted-foreground">Plans Completed</div>
                <Progress 
                  value={(user.stats.reading_plans_completed / 100) * 100} 
                  className="h-1.5 mt-2 bg-blue-100"
                />
              </div>
              <Button variant="ghost" size="icon">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </Button>
            </div>
          </GamifiedCard>
        </ErrorBoundary>

        <ErrorBoundary>
          <LeaderboardCard 
            position={user.rank?.position || 0}
            total={user.rank?.total_users}
            label="Leaderboard Rank"
            icon={<TrophyIcon className="h-5 w-5 text-yellow-500" />}
          >
            <Button variant="ghost" size="icon">
              <Users className="h-5 w-5 text-purple-500" />
            </Button>
          </LeaderboardCard>
        </ErrorBoundary>
      </ResponsiveGrid>

      {/* Recent Achievements */}
      {user.achievements.length > 0 && (
        <ErrorBoundary>
          <AchievementCard
            title={
              <div className="flex items-center gap-2">
                <MedalIcon className="h-5 w-5 text-yellow-500" />
                <span>Recent Achievements</span>
                <span className="ml-auto text-sm font-normal text-yellow-600">
                  {user.achievements.length} total
                </span>
              </div>
            }
            className="overflow-hidden"
          >
            <div className="divide-y divide-yellow-100">
              {getRecentAchievements().map(renderAchievement)}
            </div>
            {user.achievements.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-3 text-sm text-yellow-600 hover:bg-yellow-50"
                onClick={() => {
                  // Handle view all achievements
                  console.log('View all achievements');
                }}
              >
                View All Achievements
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </AchievementCard>
        </ErrorBoundary>
      )}

      {/* Stats Overview */}
      <GamifiedCard variant="default" className="bg-gradient-to-br from-gray-50 to-gray-100">
        <h3 className="font-medium text-gray-900 mb-4">Activity Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Devotionals</div>
            <div className="text-xl font-bold text-gray-900">{user.stats.devotionals_created}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Community Posts</div>
            <div className="text-xl font-bold text-gray-900">{user.stats.community_posts}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Reading Days</div>
            <div className="text-xl font-bold text-gray-900">{user.stats.total_reading_days}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Member Since</div>
            <div className="text-xl font-bold text-gray-900">
              {new Date(user.joined_at).getFullYear()}
            </div>
          </div>
        </div>
      </GamifiedCard>
    </div>
  );
}
