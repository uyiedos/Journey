'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { GamifiedCard } from '@/components/ui/GamifiedCard'
import { ResponsiveText, ResponsiveLayout } from '@/components/layout/ResponsiveLayout'
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star, 
  Trophy, 
  Flame,
  Zap,
  Target,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ReadingPlan {
  id: string
  title: string
  description: string
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  participants?: number
  userPlan?: {
    current_day: number
    completed_at?: string
    is_active: boolean
  }
  progress?: number
  points?: number
  streak?: number
}

interface GamifiedReadingPlanCardProps {
  plan: ReadingPlan
  onStartPlan?: (planId: string) => void
  showProgress?: boolean
  compact?: boolean
  className?: string
}

export function GamifiedReadingPlanCard({
  plan,
  onStartPlan,
  showProgress = true,
  compact = false,
  className
}: GamifiedReadingPlanCardProps) {
  const progressPercentage = plan.progress || 0
  const status = plan.status || 'not_started'
  const isStarted = status !== 'not_started'
  const isCompleted = status === 'completed'
  const currentDay = plan.userPlan?.current_day || 1

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_started': return 'Not Started'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      default: return 'Not Started'
    }
  }

  const getProgressVariant = () => {
    if (progressPercentage === 100) return 'achievement'
    if (progressPercentage > 50) return 'progress'
    if (progressPercentage > 0) return 'progress'
    return 'default'
  }

  const getStats = () => {
    const stats = [
      {
        icon: <Clock className="h-4 w-4" />,
        value: plan.duration,
        label: 'days'
      }
    ]

    if (plan.participants) {
      stats.push({
        icon: <Users className="h-4 w-4" />,
        value: plan.participants,
        label: 'users'
      })
    }

    if (plan.points) {
      stats.push({
        icon: <Trophy className="h-4 w-4" />,
        value: plan.points,
        label: 'points'
      })
    }

    if (plan.streak && plan.streak > 0) {
      stats.push({
        icon: <Flame className="h-4 w-4" />,
        value: plan.streak,
        label: 'streak'
      })
    }

    return stats
  }

  if (compact) {
    return (
      <GamifiedCard
        variant={getProgressVariant()}
        className={cn('cursor-pointer hover:scale-105 transition-transform', className)}
        glowEffect={isCompleted}
        animated={progressPercentage > 0 && progressPercentage < 100}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <ResponsiveText size="lg" weight="semibold" className="mb-1">
              {plan.title}
            </ResponsiveText>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(plan.difficulty)}>
                {plan.difficulty}
              </Badge>
              <Badge className={getStatusColor(status)}>
                {getStatusText(status)}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {plan.duration} days
              </div>
            </div>
            {showProgress && isStarted && (
              <Progress value={progressPercentage} className="h-2" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && <Trophy className="h-5 w-5 text-yellow-500" />}
            <Button size="sm" asChild>
              <Link href={`/plans/${plan.id}`}>
                {isStarted ? 'Continue' : 'Start'}
              </Link>
            </Button>
          </div>
        </div>
      </GamifiedCard>
    )
  }

  return (
    <GamifiedCard
      variant={getProgressVariant()}
      className={cn('hover:scale-105 transition-transform', className)}
      glowEffect={isCompleted}
      animated={progressPercentage > 0 && progressPercentage < 100}
      badge={
        isCompleted
          ? { text: 'Completed', icon: <Trophy className="h-3 w-3" />, variant: 'default' }
          : progressPercentage > 0
          ? { text: `${Math.round(progressPercentage)}% Complete`, variant: 'secondary' }
          : undefined
      }
      progress={
        showProgress && isStarted
          ? {
              value: progressPercentage,
              max: 100,
              label: `Day ${currentDay} of ${plan.duration}`,
              color: progressPercentage > 50 ? 'green' : progressPercentage > 0 ? 'blue' : 'gray'
            }
          : undefined
      }
      stats={getStats()}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <ResponsiveText size="xl" weight="semibold" className="mb-2">
              {plan.title}
            </ResponsiveText>
            <ResponsiveText size="sm" color="secondary" className="line-clamp-2">
              {plan.description}
            </ResponsiveText>
          </div>
          {isCompleted && (
            <div className="ml-4">
              <Trophy className="h-8 w-8 text-yellow-500 animate-bounce" />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getDifficultyColor(plan.difficulty)}>
            {plan.difficulty}
          </Badge>
          <Badge className={getStatusColor(status)}>
            {getStatusText(status)}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {plan.duration} days
          </div>
          {plan.participants && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              {plan.participants} joined
            </div>
          )}
          {plan.points && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Award className="h-3 w-3 mr-1" />
              {plan.points} points
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          {!isStarted ? (
            <Button 
              className="flex-1" 
              size="lg"
              onClick={() => onStartPlan?.(plan.id)}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Plan
            </Button>
          ) : (
            <Button className="flex-1" size="lg" asChild>
              <Link href={`/plans/${plan.id}/day/${currentDay}`}>
                <BookOpen className="h-4 w-4 mr-2" />
                {progressPercentage > 0 ? 'Continue Reading' : 'Start Reading'} (Day {currentDay})
              </Link>
            </Button>
          )}
          <Button variant="outline" size="lg" asChild>
            <Link href={`/plans/${plan.id}`}>
              View Details
            </Link>
          </Button>
        </div>

        {/* Achievement Indicators */}
        {progressPercentage > 0 && (
          <div className="flex items-center justify-center gap-4 pt-2 border-t">
            {progressPercentage >= 25 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-blue-500" />
                Started
              </div>
            )}
            {progressPercentage >= 50 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-yellow-500" />
                Halfway
              </div>
            )}
            {progressPercentage >= 75 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Target className="h-4 w-4 text-orange-500" />
                Almost There
              </div>
            )}
            {progressPercentage === 100 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Completed
              </div>
            )}
          </div>
        )}
      </div>
    </GamifiedCard>
  )
}
