'use client';

import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DevotionalService, Devotional } from '@/services/devotionalService';
import { getTodaysDevotional, getAllDevotionals } from '@/data/devotionals';
import { getLatestEvents } from '@/data/events';
import { readingPlanService, type ReadingPlan, type UserReadingPlan } from '@/services/readingPlanService';
import { BookOpen, Users, Heart, Trophy, Star, ArrowRight, Award, Sparkles, Calendar, Video } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  const { stats } = useUserData();
  const { user } = useAuth();
  const [dbReadingPlans, setDbReadingPlans] = useState<ReadingPlan[]>([]);
  const [userReadingPlans, setUserReadingPlans] = useState<UserReadingPlan[]>([]);
  const [dbDevotionals, setDbDevotionals] = useState<Devotional[]>([]);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch reading plans
        console.log('Fetching reading plans from Supabase...');
        const plans = await readingPlanService.getPublicReadingPlans();
        console.log('Fetched reading plans:', plans);
        
        // If no plans from Supabase, use mock data as fallback
        if (plans.length === 0) {
          console.log('No reading plans from Supabase, using mock data fallback');
          const { readingPlans: mockPlans } = await import('@/data/readingPlans');
          // Convert mock data to match service types
          const convertedPlans = mockPlans.map(plan => ({
            ...plan,
            readings: plan.readings.map(reading => ({
              ...reading,
              devotional: reading.devotional || '' // Ensure devotional is a string
            }))
          }));
          setDbReadingPlans(convertedPlans);
        } else {
          setDbReadingPlans(plans);
        }
        
        // Fetch devotionals from Supabase
        const devotionals = await DevotionalService.getAllDevotionals();
        setDbDevotionals(devotionals);
        
        // Fetch events from Supabase
        const { EventService } = await import('@/services/eventService');
        const events = await EventService.getAllEvents();
        setDbEvents(events);
        
        // Fetch user reading plans if logged in
        if (user) {
          const userPlans = await readingPlanService.getUserReadingPlans(user.id);
          setUserReadingPlans(userPlans);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
            <DailyPointsClaim />
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
            <div className="text-center">
              <h2 className="text-3xl font-bold">Your Journey</h2>
              <p className="text-muted-foreground">
                Track your spiritual progress and achievements
              </p>
            </div>
            
            {/* Journey Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{stats?.level || 1}</div>
                  <div className="text-sm text-muted-foreground">Level</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{stats?.streak || 0}</div>
                  <div className="text-sm text-muted-foreground">Reading Streak</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">{stats?.badges?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">{stats?.points || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Verse of the Day */}
        <section className="space-y-4">
          <VerseOfTheDay />
        </section>

        {/* Latest Devotionals */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Latest Devotionals</h2>
            <Link href="/devotionals">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbDevotionals.slice(0, 3).map((devotional, index) => (
              <Card key={`devotional-${devotional.id}-${index}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{devotional.title}</CardTitle>
                  <CardDescription>{new Date(devotional.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {devotional.content.substring(0, 150)}...
                  </p>
                  <Link href="/devotionals">
                    <Button variant="ghost" size="sm" className="mt-2">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Latest Events */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Latest Events</h2>
            <Link href="/events">
              <Button variant="outline">View All Events</Button>
            </Link>
          </div>
          
          {dbEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbEvents.slice(0, 3).map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Video Preview */}
                  {event.videoUrl || event.video_url ? (
                    <div className="relative aspect-video bg-gray-100">
                      {(() => {
                        const videoUrl = event.videoUrl || event.video_url;
                        const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
                        if (youtubeMatch) {
                          const videoId = youtubeMatch[1];
                          return (
                            <iframe
                              className="w-full h-full"
                              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`}
                              title={event.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }
                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-12 w-12 text-gray-400" />
                            <span className="ml-2 text-gray-500">Video Preview</span>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.startsAt || event.starts_at).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Link href={`/events/${event.id}`}>
                      <Button size="sm" className="w-full flex items-center justify-center gap-2">
                        View Event
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Latest Reading Plans */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Latest Reading Plans</h2>
            <Link href="/plans">
              <Button variant="outline">Browse All Plans</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dbReadingPlans.slice(0, 4).map((plan) => {
                const userPlan = userReadingPlans.find(up => up.plan_id === plan.id);
                const progress = userPlan ? userPlan.current_day - 1 : 0;
                
                return (
                  <ReadingPlanCard 
                    key={plan.id} 
                    plan={plan} 
                    userProgress={progress}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Inspired by Faith</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <span>Developed by </span>
            <a 
              href="https://x.com/blackralphsol" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              Blackralph.sol
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <span> Made for </span>
            <a 
              href="https://solanamobile.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Seeker
            </a>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
