'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Star, Clock, BookOpen } from 'lucide-react';
import { ReadingPlan } from '@/types';
import { cn } from '@/lib/utils';

interface ReadingPlanCardProps {
  plan: ReadingPlan;
  userProgress?: number;
}

export function ReadingPlanCard({ plan, userProgress = 0 }: ReadingPlanCardProps) {
  const progressPercentage = (userProgress / plan.duration) * 100;
  
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
          <Badge className={cn("text-xs", difficultyColors[plan.difficulty])}>
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
        
        <Button className="w-full" asChild>
          <Link href={`/plans/${plan.id}`}>
            {userProgress > 0 ? 'Continue Plan' : 'Start Plan'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
