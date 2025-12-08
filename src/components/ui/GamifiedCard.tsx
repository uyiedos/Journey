'use client'

import React from 'react'
import { Card, CardContent } from './card'
import { Badge } from './badge'
import { Progress } from './progress'
import { cn } from '@/lib/utils'
import { 
  Trophy, 
  Star, 
  Flame, 
  Clock, 
  Users, 
  TrendingUp,
  Award,
  Zap,
  Target
} from 'lucide-react'

interface GamifiedCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'achievement' | 'progress' | 'streak' | 'leaderboard'
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    icon?: React.ReactNode
  }
  progress?: {
    value: number
    max: number
    label?: string
    color?: string
  }
  stats?: Array<{
    icon: React.ReactNode
    value: string | number
    label: string
  }>
  glowEffect?: boolean
  animated?: boolean
}

export function GamifiedCard({
  children,
  className,
  variant = 'default',
  badge,
  progress,
  stats,
  glowEffect = false,
  animated = false
}: GamifiedCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'achievement':
        return 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-yellow-100'
      case 'progress':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-blue-100'
      case 'streak':
        return 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-orange-100'
      case 'leaderboard':
        return 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-purple-100'
      default:
        return 'bg-white border-gray-200 shadow-gray-100'
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="h-4 w-4" />
      case 'star': return <Star className="h-4 w-4" />
      case 'flame': return <Flame className="h-4 w-4" />
      case 'clock': return <Clock className="h-4 w-4" />
      case 'users': return <Users className="h-4 w-4" />
      case 'trending': return <TrendingUp className="h-4 w-4" />
      case 'award': return <Award className="h-4 w-4" />
      case 'zap': return <Zap className="h-4 w-4" />
      case 'target': return <Target className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
        getVariantStyles(),
        glowEffect && 'shadow-lg ring-2 ring-offset-2',
        animated && 'animate-pulse',
        className
      )}
    >
      {/* Glow Effect */}
      {glowEffect && (
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
      )}
      
      <CardContent className="p-6">
        {/* Badge */}
        {badge && (
          <div className="flex items-center justify-between mb-4">
            <Badge 
              variant={badge.variant || 'default'}
              className="flex items-center gap-1"
            >
              {badge.icon}
              {badge.text}
            </Badge>
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="mb-4">
            {progress.label && (
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{progress.label}</span>
                <span className="text-muted-foreground">
                  {progress.value}/{progress.max}
                </span>
              </div>
            )}
            <Progress 
              value={progress.value} 
              max={progress.max}
              className={cn(
                "h-2",
                progress.color && `bg-${progress.color}-100`
              )}
            />
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-1 text-muted-foreground">
                  {stat.icon}
                </div>
                <div className="font-bold text-lg">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        {children}
      </CardContent>

      {/* Animated Border */}
      {animated && (
        <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-border animate-gradient-xy" />
      )}
    </Card>
  )
}

// Helper components for specific use cases
export function AchievementCard({ children, ...props }: React.ComponentProps<typeof GamifiedCard>) {
  return (
    <GamifiedCard variant="achievement" {...props}>
      {children}
    </GamifiedCard>
  )
}

export function ProgressCard({ children, ...props }: React.ComponentProps<typeof GamifiedCard>) {
  return (
    <GamifiedCard variant="progress" {...props}>
      {children}
    </GamifiedCard>
  )
}

export function StreakCard({ children, ...props }: React.ComponentProps<typeof GamifiedCard>) {
  return (
    <GamifiedCard variant="streak" {...props}>
      {children}
    </GamifiedCard>
  )
}

// Type for LeaderboardCard props
type LeaderboardCardProps = Omit<GamifiedCardProps, 'variant'> & {
  position: number;
  total?: number;
  label?: string;
  icon?: React.ReactNode;
};

export function LeaderboardCard({ 
  children, 
  position,
  total,
  label = 'Rank',
  icon = <Users className="h-5 w-5 text-purple-500" />,
  ...props 
}: LeaderboardCardProps) {
  return (
    <GamifiedCard variant="leaderboard" {...props}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold flex items-center gap-2">
            {icon}
            #{position}
            {total !== undefined && (
              <span className="text-sm font-normal text-muted-foreground">
                of {total}
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
        {children}
      </div>
    </GamifiedCard>
  );
}
