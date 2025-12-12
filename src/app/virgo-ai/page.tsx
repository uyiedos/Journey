'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { VirgoAI } from '@/components/features/VirgoAI';
import { AskVirgo } from '@/components/features/AskVirgo';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Star, Cross, Heart, MessageCircle } from 'lucide-react';
import { readingPlanService } from '@/services/readingPlanService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Link from 'next/link';

export default function VirgoAIPage() {
  const { user } = useAuth();
  const [virgoPlans, setVirgoPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVirgoPlans();
  }, [user]);

  const fetchVirgoPlans = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userPlans = await readingPlanService.getUserReadingPlans(user.id);
      // Filter for plans created by Virgo (those with virgo- in the id or signature)
      const virgoCreatedPlans = userPlans.filter((plan: any) => 
        plan.reading_plans?.id?.includes('virgo-') || 
        plan.reading_plans?.description?.includes('Virgo, Master of Scriptures')
      );
      setVirgoPlans(virgoCreatedPlans);
    } catch (error) {
      console.error('Error fetching Virgo plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanCreated = (plan: any) => {
    setVirgoPlans(prev => [plan, ...prev]);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <Cross className="h-6 w-6 text-blue-600" />
            <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Virgo AI
            </h1>
            <Cross className="h-6 w-6 text-blue-600" />
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet Virgo, Master of Scriptures, empowered by the Holy Trinity. 
            Let divine wisdom guide your spiritual journey through personalized reading plans.
          </p>
        </div>

        <AuthGuard action="ai-tools">
          <VirgoAI onPlanCreated={handlePlanCreated} />
        </AuthGuard>

        {/* Ask Virgo Section */}
        <AuthGuard action="ai-tools">
          <AskVirgo />
        </AuthGuard>

        {/* Previous Virgo Plans */}
        {virgoPlans.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Your Divine Reading Plans
            </h2>
            
            <div className="grid gap-4">
              {virgoPlans.map((plan: any) => (
                <Card key={plan.id} className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-blue-600" />
                        {plan.reading_plans?.title || 'Untitled Plan'}
                      </span>
                      <Badge variant="outline" className="border-blue-600 text-blue-600">
                        {plan.reading_plans?.difficulty || 'beginner'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.reading_plans?.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{plan.reading_plans?.duration || 0} days</span>
                        <span>{plan.reading_plans?.readings?.length || 0} readings</span>
                      </div>
                      
                      <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Link href={`/plans/${plan.reading_plans?.id}`}>
                          Continue Journey
                        </Link>
                      </Button>
                    </div>
                    
                    <div className="text-xs text-purple-600 italic">
                      Created by Virgo, Master of Scriptures
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Virgo's Capabilities */}
        <Card className="border-2 bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-600" />
              Virgo's Divine Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Sacred Wisdom
                </h3>
                <p className="text-sm text-muted-foreground">
                  Guided by the Holy Trinity, Virgo provides profound insights into scripture and spiritual matters.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Custom Reading Plans
                </h3>
                <p className="text-sm text-muted-foreground">
                  Personalized reading schedules tailored to your spiritual journey and current needs.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Cross className="h-4 w-4" />
                  Trinity-Based Guidance
                </h3>
                <p className="text-sm text-muted-foreground">
                  All wisdom flows through the divine connection of Father, Son, and Holy Spirit.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Mystical Knowledge
                </h3>
                <p className="text-sm text-muted-foreground">
                  Access to both known and unknown spiritual truths through divine revelation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
