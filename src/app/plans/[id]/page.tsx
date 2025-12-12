'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  CheckCircle, 
  Lock,
  ArrowLeft,
  Star,
  Trophy,
  Flame,
  Target,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useUserData } from '@/contexts/UserDataContext'
import { readingPlanService } from '@/services/readingPlanService'
import { GamifiedCard, ProgressCard, AchievementCard } from '@/components/ui/GamifiedCard'
import { ResponsiveText, ResponsiveGrid } from '@/components/layout/ResponsiveLayout'

import { ReadingPlan } from '@/types'

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [plan, setPlan] = useState<ReadingPlan | null>(null)
  const [userPlan, setUserPlan] = useState<any>(null)
  const [progressData, setProgressData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingPlan, setStartingPlan] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plan from Supabase
        const planData = await readingPlanService.getReadingPlanById(params.id as string)
        if (planData) {
          setPlan(planData as any)
          
          // If user is logged in, check if they have this plan
          if (user) {
            const [userPlans, progress] = await Promise.all([
              readingPlanService.getUserReadingPlans(user.id),
              readingPlanService.getPlanProgress(user.id, params.id as string)
            ])
            const currentUserPlan = userPlans.find(up => up.plan_id === params.id)
            setUserPlan(currentUserPlan || null)
            setProgressData(progress || [])
          }
        } else {
          setError('Plan not found')
        }
      } catch (err) {
        setError('Plan not found')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, user])

  const handleStartPlan = async () => {
    if (!user || !plan) return
    
    try {
      setStartingPlan(true)
      const newUserPlan = await readingPlanService.startReadingPlan(user.id, plan.id, plan.duration)
      setUserPlan(newUserPlan)
    } catch (error) {
      console.error('Error starting plan:', error)
      // You could show a toast notification here
    } finally {
      setStartingPlan(false)
    }
  }

  const completeCurrentDay = async () => {
    if (!user || !userPlan) return
    
    try {
      await readingPlanService.completeDay(user.id, plan.id, userPlan.current_day)
      
      // Refresh progress data
      const progressData = await readingPlanService.getReadingPlanProgress(user.id, plan.id)
      setProgressData(progressData)
      
      // Refresh user plan data
      const updatedUserPlan = await readingPlanService.getUserReadingPlan(user.id, plan.id)
      setUserPlan(updatedUserPlan)
    } catch (error) {
      console.error('Error completing day:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Reading Plan Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'This reading plan could not be found.'}</p>
          <Button asChild>
            <Link href="/plans">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plans
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const duration = plan.duration || 0
  const participants = plan.participants || 0
  const difficulty = plan.difficulty || 'beginner'

  // Calculate progress based on completed days
  const completedDays = progressData.filter(p => p.completed).length
  const progress = duration > 0 ? (completedDays / duration) * 100 : 0
  
  const isCompleted = userPlan ? !!userPlan.completed_at : false

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </Button>

        {/* Plan Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="space-y-4">
              {/* Title and Status */}
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl md:text-3xl">{plan.title}</CardTitle>
                <Badge variant={progress > 0 ? "default" : "secondary"}>
                  {isCompleted ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'}
                </Badge>
              </div>
              
              {/* Plan Stats */}
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{duration} days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{participants.toLocaleString()} participants</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{difficulty}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress */}
            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {plan.description}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {!user ? (
                <Button size="lg" disabled>
                  Please log in to start this plan
                </Button>
              ) : !userPlan ? (
                <Button size="lg" onClick={handleStartPlan} disabled={startingPlan}>
                  {startingPlan ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Plan
                    </>
                  )}
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <Link href={`/plans/${params.id}/day/${userPlan.current_day}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    {completedDays > 0 ? `Continue Reading (Day ${userPlan.current_day})` : `Start Reading (Day ${userPlan.current_day})`}
                  </Link>
                </Button>
              )}
              {userPlan && !isCompleted && (
                <Button variant="outline" size="lg" onClick={completeCurrentDay}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reading Schedule */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Reading Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.readings && plan.readings.length > 0 ? (
                plan.readings.map((reading, index) => {
                  const dayNumber = reading.day
                  const dayProgress = progressData.find(p => p.day === dayNumber)
                  const isCompleted = dayProgress?.completed || false
                  const isCurrentDay = userPlan && userPlan.current_day === dayNumber && !isCompleted
                  
                  return (
                    <div key={reading.id || index} className={`flex items-start justify-between p-4 border rounded-lg ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`w-4 h-4 rounded-full mt-1 ${isCompleted ? 'bg-green-500' : isCurrentDay ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className="flex-1">
                          <p className="font-medium">Day {dayNumber}: {reading.title}</p>
                          {reading.passages && reading.passages.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-muted-foreground">Readings:</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {reading.passages.map((passage, passageIndex) => (
                                  <Badge key={passageIndex} variant="outline" className="text-xs">
                                    {passage}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {reading.devotional && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-muted-foreground">Devotional:</p>
                              <p className="text-sm text-muted-foreground italic line-clamp-2">
                                {reading.devotional}
                              </p>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            {isCompleted ? 'Completed' : isCurrentDay ? 'Current' : 'Not started'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {userPlan && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                          >
                            <Link href={`/plans/${params.id}/day/${dayNumber}`}>
                              {isCompleted ? 'Review' : isCurrentDay ? 'Continue' : 'Read'}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                // Fallback for plans without detailed readings
                Array.from({ length: duration }, (_, index) => {
                  const dayNumber = index + 1
                  const dayProgress = progressData.find(p => p.day === dayNumber)
                  const isCompleted = dayProgress?.completed || false
                  const isCurrentDay = userPlan && userPlan.current_day === dayNumber && !isCompleted
                  
                  return (
                    <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${isCompleted ? 'bg-green-500' : isCurrentDay ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <p className="font-medium">Day {dayNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {isCompleted ? 'Completed' : isCurrentDay ? 'Current' : 'Not started'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {userPlan && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                          >
                            <Link href={`/plans/${params.id}/day/${dayNumber}`}>
                              {isCompleted ? 'Review' : isCurrentDay ? 'Continue' : 'Read'}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Related Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              More reading plans coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
