'use client';

import React from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { DevotionalCard } from '@/components/features/DevotionalCard';
import { ReadingPlanCard } from '@/components/features/ReadingPlanCard';
import { GamificationStats } from '@/components/features/GamificationStats';
import { MobileGamificationStats } from '@/components/features/MobileGamificationStats';
import { DailyPointsClaim } from '@/components/features/DailyPointsClaim';
import { VerseOfTheDay } from '@/components/features/VerseOfTheDay';
import { FeaturedDevotional } from '@/components/features/FeaturedDevotional';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTodaysDevotional, getAllDevotionals } from '@/data/devotionals';
import { readingPlans, getReadingPlanById } from '@/data/readingPlans';
import { getUpcomingEvents } from '@/data/events';
import { BookOpen, Users, Heart, Trophy, Star, ArrowRight, Award, Sparkles, Calendar, Video } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  const { stats } = useUserData();
  const todaysDevotional = getTodaysDevotional();
  const allDevotionals = getAllDevotionals();
  const upcomingEvents = getUpcomingEvents();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section - Enhanced & Mobile Optimized */}
        <section className="text-center space-y-6 py-8 md:py-12">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to Journey
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Your Bible devotional app. Read Scripture, grow in faith, 
              connect with others on your spiritual journey, and earn rewards.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link href="/bible">
              <Button className="h-12 px-8 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Reading
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="outline" className="h-12 px-8 border-2 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20 transition-all duration-200">
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Button>
            </Link>
          </div>
          
          {/* Quick Stats Pills - Mobile Optimized */}
          <div className="flex flex-wrap justify-center gap-2 px-4">
            <Badge className="px-3 py-1.5 bg-linear-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
              <Trophy className="mr-1 h-3 w-3" />
              {stats?.points || 0} Points
            </Badge>
            <Badge className="px-3 py-1.5 bg-linear-to-r from-green-100 to-green-200 text-green-800 border-green-300">
              <Heart className="mr-1 h-3 w-3" />
              {stats?.streak || 0} Day Streak
            </Badge>
            <Badge className="px-3 py-1.5 bg-linear-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300">
              <Star className="mr-1 h-3 w-3" />
              Level {stats?.level || 1}
            </Badge>
          </div>
        </section>

        {/* Enhanced User Stats - Only show for authenticated users */}
        {stats && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Your Journey</h2>
                <p className="text-muted-foreground">
                  Track your spiritual progress and achievements
                </p>
              </div>
            </div>
            
            {/* Mobile Stats - Show on mobile */}
            <div className="lg:hidden">
              <DailyPointsClaim />
              <MobileGamificationStats />
            </div>
            
            {/* Desktop Stats - Show on desktop */}
            <div className="hidden lg:block">
              <DailyPointsClaim />
              <GamificationStats stats={stats} />
            </div>
          </section>
        )}

        {/* Verse of the Day */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Daily Inspiration</h2>
            <p className="text-muted-foreground">
              A selected verse to guide and inspire your day
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <VerseOfTheDay />
          </div>
        </section>

        {/* Events Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-500" />
                Events
              </h2>
              <p className="text-muted-foreground text-sm">
                Join live and recorded events like Shiloh 2025.
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline" size="sm">
                View All Events
              </Button>
            </Link>
          </div>

          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{upcomingEvents[0].title}</span>
                  <Badge variant="secondary">Upcoming</Badge>
                </CardTitle>
                <CardDescription>{upcomingEvents[0].description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(upcomingEvents[0].startsAt).toLocaleString()}</span>
                </div>
                <Link href="/events">
                  <Button size="sm" className="flex items-center gap-1">
                    Join Event
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Reading Plans */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Reading Plans</h2>
            <Link href="/plans">
              <Button variant="outline">Browse All Plans</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {readingPlans.slice(0, 4).map((plan, index) => (
              <ReadingPlanCard 
                key={plan.id} 
                plan={plan} 
                userProgress={Math.min((index + 1) * 3, plan.duration)}
              />
            ))}
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-muted-foreground">Inspired by faith</p>
      </footer>
    </Layout>
  );
}
