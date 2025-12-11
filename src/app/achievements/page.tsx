'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { achievements } from '@/data/achievements';
import { useUserData } from '@/contexts/UserDataContext';
import { supabaseService } from '@/services/supabaseService';
import { Trophy, Star, Target, BookOpen, Users, Flame, Calendar, Award, Lock } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AchievementsPage() {
  const { user } = useUserData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLocked, setShowLocked] = useState(true);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);

  useEffect(() => {
    const loadUserAchievements = async () => {
      if (!user?.id) return;
      const data = await supabaseService.getUserAchievements(user.id);
      setUserAchievements(data || []);
    };

    loadUserAchievements();
  }, [user?.id]);

  // Return loading state if user data is not available
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <h2 className="text-xl font-semibold mb-2">Loading Achievements...</h2>
            <p className="text-muted-foreground">Please wait while we load your data.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const categories = ['reading', 'community', 'streak', 'special'];
  const categoryIcons = {
    reading: BookOpen,
    community: Users,
    streak: Flame,
    special: Star,
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = !selectedCategory || achievement.category === selectedCategory;
    const isUnlocked = userAchievements.some(a => a.achievement_id === achievement.id);
    const shouldShow = showLocked || isUnlocked;
    
    return matchesCategory && shouldShow;
  });

  const unlockedCount = userAchievements.length || 0;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Achievements</h1>
            <p className="text-muted-foreground">
              Track your spiritual journey and unlock rewards
            </p>
          </div>
          <Link href="#achievements-list">
              <Button variant="outline">
                <Award className="mr-2 h-4 w-4" />
                View All Badges
              </Button>
            </Link>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Your Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Achievements Unlocked</span>
              <span>{unlockedCount} / {totalCount}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-center">
              <span className="text-2xl font-bold">{Math.round(progressPercentage)}%</span>
              <span className="text-sm text-muted-foreground ml-2">Complete</span>
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === null 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="capitalize">{category}</span>
              </button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const isUnlocked = userAchievements.some(a => a.achievement_id === achievement.id);
            const Icon = categoryIcons[achievement.category as keyof typeof categoryIcons] || Star;
            
            return (
              <Card key={achievement.id} className={`transition-all hover:shadow-md ${
                isUnlocked ? 'bg-linear-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'opacity-60'
              }`}>
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    isUnlocked ? 'bg-yellow-100' : 'bg-muted'
                  }`}>
                    <Icon className={`h-8 w-8 ${isUnlocked ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-lg">{achievement.name}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{achievement.points} points</span>
                  </div>
                  {isUnlocked ? (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                      <Star className="mr-1 h-3 w-3" />
                      Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Lock className="mr-1 h-3 w-3" />
                      Locked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No achievements found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or unlock more achievements to see them here.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
