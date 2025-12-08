'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, BookOpen, CheckCircle, Clock, Users, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useUserData } from '@/contexts/UserDataContext'
import { readingPlanService } from '@/services/readingPlanService'
import { ReadingPlan } from '@/types'

export default function PlanDayPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [plan, setPlan] = useState<ReadingPlan | null>(null)
  const [userPlan, setUserPlan] = useState<any>(null)
  const [dayContent, setDayContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const planId = params.id as string
  const dayNumber = parseInt(params.day as string)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !planId || !dayNumber) {
          setError('Invalid plan or day')
          return
        }

        // Fetch plan and user plan
        const [planData, userPlans] = await Promise.all([
          readingPlanService.getReadingPlanById(planId),
          readingPlanService.getUserReadingPlans(user.id)
        ])

        if (!planData) {
          setError('Plan not found')
          return
        }

        setPlan(planData as any)

        const currentUserPlan = userPlans.find(up => up.plan_id === planId)
        if (!currentUserPlan) {
          setError('You have not started this plan')
          return
        }

        setUserPlan(currentUserPlan)

        // Fetch day content from plan readings
        const dayData = planData.readings?.find(r => r.day === dayNumber)
        setDayContent(dayData)

        // Check if this day is already completed
        const progress = await readingPlanService.getPlanProgress(user.id, planId)
        const dayProgress = progress?.find(p => p.day === dayNumber)
        setCompleted(!!dayProgress?.completed)

      } catch (err) {
        setError('Failed to load content')
      } finally {
        setLoading(false)
      }
    }

    if (planId && dayNumber) {
      fetchData()
    }
  }, [planId, dayNumber, user])

  const handleCompleteDay = async () => {
    if (!user || !planId) return

    try {
      setCompleting(true)
      await readingPlanService.completeDay(user.id, planId, dayNumber, notes)
      setCompleted(true)
      
      // Update user plan progress
      if (userPlan && dayNumber >= userPlan.current_day) {
        const newCurrentDay = Math.min(dayNumber + 1, plan?.duration || dayNumber + 1)
        setUserPlan({ ...userPlan, current_day: newCurrentDay })
      }
    } catch (error) {
      console.error('Error completing day:', error)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !plan || !dayContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Content Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'This content could not be found.'}</p>
          <Button asChild>
            <Link href={`/plans/${planId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plan
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const progress = ((dayNumber - 1) / (plan.duration || 1)) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/plans/${planId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plan
            </Link>
          </Button>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline">
              Day {dayNumber} of {plan.duration}
            </Badge>
            {completed && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Plan Progress</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Day Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{dayContent.title}</CardTitle>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{dayContent.passages?.length || 0} passages</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>15 min read</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Scripture Passages */}
            {dayContent.passages && dayContent.passages.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Today's Reading</h3>
                {dayContent.passages.map((passage: string, index: number) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <p className="font-medium text-blue-600 mb-2">{passage}</p>
                    <p className="text-sm text-muted-foreground">
                      Click to read the full passage in your Bible
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Devotional */}
            {dayContent.devotional && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Devotional</h3>
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {dayContent.devotional}
                  </div>
                </div>
              </div>
            )}

            {/* Reflection */}
            {dayContent.reflection && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reflection Question</h3>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-blue-800">{dayContent.reflection}</p>
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your thoughts, prayers, or insights here..."
                className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={completed}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              {!completed ? (
                <Button 
                  size="lg" 
                  onClick={handleCompleteDay}
                  disabled={completing}
                >
                  {completing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Marking Complete...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Day Complete
                    </>
                  )}
                </Button>
              ) : (
                <Button size="lg" variant="outline" disabled>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Day Completed
                </Button>
              )}

              <Button variant="outline" size="lg">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>

              {dayNumber < (plan.duration || dayNumber) && (
                <Button variant="ghost" size="lg" asChild>
                  <Link href={`/plans/${planId}/day/${dayNumber + 1}`}>
                    Next Day →
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}