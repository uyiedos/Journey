'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { GamifiedReadingPlanCard } from '@/components/features/GamifiedReadingPlanCard';
import { CreateReadingPlan } from '@/components/features/CreateReadingPlan';
import { ResponsiveLayout, ResponsiveGrid, ResponsiveText } from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabaseService } from '@/services/supabaseService';
import { readingPlanService } from '@/services/readingPlanService';
import { Search, Filter, Calendar, Clock, Users, Plus, Trophy, Flame, Star } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function ReadingPlansPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [userPlans, setUserPlans] = useState<any[]>([]);
  const [publicPlans, setPublicPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadingPlans();
  }, []);

  const fetchReadingPlans = async () => {
    try {
      setLoading(true);
      
      // Fetch public reading plans using the service
      const plansData = await readingPlanService.getPublicReadingPlans();
      setPublicPlans(plansData || []);

      // Fetch user's reading plans if logged in
      if (user) {
        const userPlansData = await readingPlanService.getUserReadingPlans(user.id);
        setUserPlans(userPlansData || []);

        // Fetch enhanced status for each user plan
        const enhancedUserPlans = await Promise.all(
          userPlansData.map(async (plan) => {
            const status = await readingPlanService.getReadingPlanStatus(user.id, plan.id);
            return {
              ...plan,
              status: status.status,
              progress: status.progressPercentage,
              currentDay: status.currentDay,
              streak: status.streak,
              completedDays: status.completedDays
            };
          })
        );
        setUserPlans(enhancedUserPlans);
      }
    } catch (error) {
      console.error('Error fetching reading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = [...userPlans, ...publicPlans].filter(plan => {
    if (!plan) return false; // Skip if plan is null/undefined
    
    const searchLower = searchTerm.toLowerCase();
    const title = plan.title || '';
    const description = plan.description || '';
    
    const matchesSearch = title.toLowerCase().includes(searchLower) ||
                         description.toLowerCase().includes(searchLower);
    
    const matchesDifficulty = !selectedDifficulty || plan.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  const difficulties: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];

  const handleSavePlan = async (plan: any) => {
    try {
      // Refresh the plans list after creating a new one
      await fetchReadingPlans();
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  if (isCreating) {
    return (
      <Layout>
        <div className="py-6">
          <CreateReadingPlan
            onSave={handleSavePlan}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reading plans...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <ResponsiveText size="2xl" weight="bold" className="mb-2">
              Reading Plans
            </ResponsiveText>
            <ResponsiveText size="sm" color="secondary">
              Structured Bible reading journeys to help you grow spiritually
            </ResponsiveText>
          </div>
          <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reading plans..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 sm:h-11"
            />
          </div>
          <Button variant="outline" className="h-10 sm:h-11">
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
          </Button>
        </div>

        {/* Difficulty Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedDifficulty === null ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setSelectedDifficulty(null)}
          >
            All Levels
          </Badge>
          {difficulties.map((difficulty) => (
            <Badge
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "secondary"}
              className="cursor-pointer capitalize"
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <ResponsiveGrid 
          cols={{ 
            mobile: 1, 
            tablet: 3, 
            desktop: 3 
          }}
          gap="sm"
        >
          <div className="text-center p-4 sm:p-6 border rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-blue-500">{[...userPlans, ...publicPlans].length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Available Plans</div>
          </div>
          <div className="text-center p-4 sm:p-6 border rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-green-500">
              {[...userPlans, ...publicPlans].reduce((sum, plan) => sum + (plan.participants || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Active Participants</div>
          </div>
          <div className="text-center p-4 sm:p-6 border rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-yellow-500">
              {([...userPlans, ...publicPlans].reduce((sum, plan) => sum + (plan.rating || 0), 0) / [...userPlans, ...publicPlans].length || 0).toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Average Rating</div>
          </div>
        </ResponsiveGrid>

        {/* Reading Plans Grid */}
        <ResponsiveGrid 
          cols={{ 
            mobile: 1, 
            tablet: 1, 
            desktop: 3 
          }}
          gap="md"
        >
          {filteredPlans.map((plan) => (
            <GamifiedReadingPlanCard 
              key={plan.id} 
              plan={plan}
              onStartPlan={async (planId) => {
                // Handle start plan logic here
                console.log('Starting plan:', planId);
              }}
            />
          ))}
        </ResponsiveGrid>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No reading plans found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for, or create your own plan.
            </p>
            <Button className="mt-4" onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Plan
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
