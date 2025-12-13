'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Star, Clock, BookOpen, Play, CheckCircle } from 'lucide-react';
import { readingPlanService } from '@/services/readingPlanService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';

interface ReadingPlanCardProps {
  plan: any; // Using any to avoid type conflicts between service and types
  userProgress?: number;
}

export function ReadingPlanCard({ plan, userProgress = 0 }: ReadingPlanCardProps) {
  const { user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);
  const [hasStarted, setHasStarted] = useState(userProgress > 0);
  const progressPercentage = (userProgress / plan.duration) * 100;
  
  const handleStartPlan = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || isStarting || hasStarted) return;
    
    try {
      setIsStarting(true);
      await readingPlanService.startReadingPlan(user.id, plan.id, plan.duration || 30);
      setHasStarted(true);
      // Optionally redirect to the plans page
      window.location.href = `/plans`;
    } catch (error) {
      console.error('Error starting reading plan:', error);
      // You could show a toast notification here
    } finally {
      setIsStarting(false);
    }
  };
  
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  // Handle both mock and Supabase data structures
  const participants = plan.participants || 0;
  const rating = plan.rating || 0;
  const readingsCount = plan.readings?.length || plan.duration || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{plan.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {plan.description}
            </CardDescription>
          </div>
          <Badge className={cn("text-xs", difficultyColors[plan.difficulty as keyof typeof difficultyColors])}>
            {plan.difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {plan.image_url && (
          <div>
            <img
              src={plan.image_url}
              alt={plan.title}
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{plan.duration} days</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{participants.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span>{rating}</span>
          </div>
        </div>
        
        {userProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{userProgress}/{plan.duration} days</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{readingsCount} readings</span>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={hasStarted ? "default" : "secondary"}
            className={cn(
              "text-xs",
              hasStarted ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-800 border-gray-300"
            )}
          >
            {hasStarted ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Started
              </>
            ) : (
              <>
                <Clock className="mr-1 h-3 w-3" />
                Plan
              </>
            )}
          </Badge>
        </div>
        
        <Button 
          className="w-full" 
          asChild={!hasStarted}
          onClick={hasStarted ? undefined : handleStartPlan}
          disabled={isStarting || !user}
        >
          {hasStarted ? (
            <Link href="/plans">
              Continue Plan
            </Link>
          ) : (
            <div>
              {isStarting ? (
                <span>Starting...</span>
              ) : (
                <Link href="/plans">
                  <span>
                    <Play className="mr-2 h-4 w-4" />
                    Start Plan
                  </span>
                </Link>
              )}
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
