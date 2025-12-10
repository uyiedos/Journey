'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { supabaseService } from '@/services/supabaseService';
import { achievementService } from '@/services/achievementService';
import { Plus, TrendingUp, Award, Database } from 'lucide-react';

export function PointsSystemDebug() {
  const { user: authUser } = useAuth();
  const { user, stats, refreshData } = useUserData();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testAddPoints = async (points: number) => {
    if (!authUser || !user) return;
    
    setIsLoading(true);
    try {
      const result = await supabaseService.addPoints(authUser.id, points);
      if (result) {
        console.log('Points added successfully:', result);
        await refreshData();
      } else {
        console.error('Failed to add points');
      }
    } catch (error) {
      console.error('Error adding points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testDailyLogin = async () => {
    if (!authUser) return;
    
    setIsLoading(true);
    try {
      const result = await achievementService.trackActivityAndCheckAchievements(authUser.id, 'daily_login', { value: 1 });
      console.log('Daily login result:', result);
      await refreshData();
    } catch (error) {
      console.error('Error testing daily login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDatabaseState = async () => {
    if (!authUser) return;
    
    setIsLoading(true);
    try {
      const profile = await supabaseService.getUserProfile(authUser.id);
      const userStats = await supabaseService.getUserStats(authUser.id);
      const achievements = await supabaseService.getUserAchievements(authUser.id);
      
      setDebugInfo({
        profile,
        userStats,
        achievements,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error checking database state:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!authUser) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Points System Debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to debug the points system.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Points System Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">User Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Points:</span>
                  <Badge variant="secondary">{user?.points || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <Badge variant="outline">{user?.level || 1}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Streak:</span>
                  <Badge variant="outline">{user?.streak || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Gamification Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Level:</span>
                  <Badge variant="secondary">{stats?.level || 1}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Points:</span>
                  <Badge variant="outline">{stats?.points || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Achievements:</span>
                  <Badge variant="outline">{user?.achievements?.length || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => testAddPoints(10)} 
                  disabled={isLoading}
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add 10 Points
                </Button>
                <Button 
                  onClick={() => testAddPoints(50)} 
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Add 50 Points
                </Button>
                <Button 
                  onClick={testDailyLogin} 
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Test Daily Login
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Database Check */}
          <div className="flex gap-2">
            <Button 
              onClick={checkDatabaseState} 
              disabled={isLoading}
              variant="outline"
            >
              Check Database State
            </Button>
            <Button 
              onClick={refreshData} 
              disabled={isLoading}
              variant="outline"
            >
              Refresh Data
            </Button>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Database Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Testing Instructions</CardTitle>
            </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>1. Click "Add 10 Points" to test basic point addition</p>
                <p>2. Click "Add 50 Points" to test larger point amounts</p>
                <p>3. Click "Test Daily Login" to simulate daily login rewards</p>
                <p>4. Click "Check Database State" to see raw database data</p>
                <p>5. Check the browser console for detailed logs</p>
                <p className="text-muted-foreground text-xs mt-4">
                  Make sure you've run the fix-gamified-points-system.sql script in Supabase first.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    );
  }
