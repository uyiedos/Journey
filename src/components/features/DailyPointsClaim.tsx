'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { achievementService } from '@/services/achievementService';
import { notificationService } from '@/services/notificationService';
import { supabaseService } from '@/services/supabaseService';
import { Gift, Sparkles, Clock, CheckCircle, Trophy, Flame } from 'lucide-react';

export interface DailyClaimStatus {
  canClaim: boolean;
  claimedToday: boolean;
  nextClaimTime?: Date;
  pointsAwarded?: number;
  streak?: number;
}

export function DailyPointsClaim() {
  const { user: authUser } = useAuth();
  const { user, refreshData } = useUserData();
  const [claimStatus, setClaimStatus] = useState<DailyClaimStatus>({
    canClaim: false,
    claimedToday: false,
  });
  const [isClaiming, setIsClaiming] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Check claim status
  const checkClaimStatus = async () => {
    if (!authUser) return;

    try {
      const now = new Date();
      const client = supabaseService.getClient();
      
      // Check if user has claimed in the last 24 hours
      const { data: existingClaim, error } = await client
        .from('daily_login_rewards')
        .select('*')
        .eq('user_id', authUser.id)
        .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const claimedToday = !!existingClaim;
      
      // Calculate next claim time (24 hours after last claim)
      let nextClaimTime = undefined;
      if (claimedToday && existingClaim?.created_at) {
        const lastClaimTime = new Date(existingClaim.created_at);
        nextClaimTime = new Date(lastClaimTime.getTime() + 24 * 60 * 60 * 1000);
      }
      
      setClaimStatus({
        canClaim: !claimedToday,
        claimedToday,
        nextClaimTime: claimedToday ? nextClaimTime : undefined,
        pointsAwarded: existingClaim?.points_awarded,
        streak: user?.streak || 0,
      });
    } catch (error) {
      console.error('Error checking claim status:', error);
      setClaimStatus({
        canClaim: true,
        claimedToday: false,
        streak: user?.streak || 0,
      });
    }
  };

  // Claim daily points
  const handleClaimPoints = async () => {
    if (!authUser || !claimStatus.canClaim || isClaiming) return;

    setIsClaiming(true);
    
    try {
      const result = await achievementService.trackDailyLogin(authUser.id);
      
      if (result.pointsAwarded > 0) {
        // Show success notification
        await notificationService.showNotification({
          type: 'achievement',
          title: 'Daily Points Claimed!',
          message: `You earned ${result.pointsAwarded} points!`,
          icon: 'gift',
          duration: 5000,
        });

        // Refresh user data to update points/streak
        await refreshData();
        
        // Update claim status
        await checkClaimStatus();
      }
    } catch (error) {
      console.error('Error claiming daily points:', error);
      await notificationService.showNotification({
        type: 'error',
        title: 'Claim Failed',
        message: 'Unable to claim daily points. Please try again.',
        icon: 'error',
        duration: 5000,
      });
    } finally {
      setIsClaiming(false);
    }
  };

  // Check status on mount and user change
  useEffect(() => {
    if (authUser) {
      checkClaimStatus();
    }
  }, [authUser, user?.streak]);

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!authUser) {
    return null;
  }

  // Compact version for header
  if (claimStatus.claimedToday) {
    return (
      <div className="flex items-center space-x-2">
        <Badge className="px-2 py-1 bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Claimed
        </Badge>
      </div>
    );
  }

  return (
    <Card className="bg-linear-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-linear-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Gift className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg text-gray-900">Daily Points</CardTitle>
          </div>
          {claimStatus.streak && claimStatus.streak > 0 && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              <Flame className="h-3 w-3 mr-1" />
              {claimStatus.streak} day streak
            </Badge>
          )}
        </div>
        <CardDescription className="text-gray-700 dark:text-gray-300">
          Claim your daily points and maintain your streak!
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {claimStatus.canClaim ? (
          <div className="space-y-3">
            <Button 
              onClick={handleClaimPoints}
              disabled={isClaiming}
              className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              {isClaiming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Claiming...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Claim Daily Points
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="text-center text-sm text-gray-700 dark:text-gray-300">
              <Trophy className="h-3 w-3 inline mr-1" />
              Earn points and maintain your streak!
            </div>
          </div>
        ) : claimStatus.nextClaimTime ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Already claimed today!</span>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              Next claim: {claimStatus.nextClaimTime.toLocaleTimeString()}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// Compact version for header/navigation
export function DailyPointsClaimCompact() {
  const { user: authUser } = useAuth();
  const { user, refreshData } = useUserData();
  const [claimStatus, setClaimStatus] = useState<DailyClaimStatus>({
    canClaim: false,
    claimedToday: false,
  });
  const [isClaiming, setIsClaiming] = useState(false);

  const checkClaimStatus = async () => {
    if (!authUser) return;

    try {
      const now = new Date();
      const client = supabaseService.getClient();
      
      // Check if user has claimed in the last 24 hours
      const { data: existingClaim } = await client
        .from('daily_login_rewards')
        .select('*')
        .eq('user_id', authUser.id)
        .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const claimedToday = !!existingClaim;
      
      setClaimStatus({
        canClaim: !claimedToday,
        claimedToday,
        streak: user?.streak || 0,
      });
    } catch (error) {
      setClaimStatus({
        canClaim: true,
        claimedToday: false,
        streak: user?.streak || 0,
      });
    }
  };

  const handleClaimPoints = async () => {
    if (!authUser || !claimStatus.canClaim || isClaiming) return;

    setIsClaiming(true);
    
    try {
      const result = await achievementService.trackDailyLogin(authUser.id);
      
      if (result.pointsAwarded > 0) {
        await notificationService.showNotification({
          type: 'achievement',
          title: 'Daily Points Claimed!',
          message: `You earned ${result.pointsAwarded} points!`,
          icon: 'gift',
          duration: 5000,
        });

        await refreshData();
        await checkClaimStatus();
      }
    } catch (error) {
      console.error('Error claiming daily points:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      checkClaimStatus();
    }
  }, [authUser]);

  if (!authUser || claimStatus.claimedToday) {
    return null;
  }

  return (
    <Button
      onClick={handleClaimPoints}
      disabled={isClaiming}
      size="sm"
      className="bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md transition-all duration-200"
    >
      {isClaiming ? (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
      ) : (
        <>
          <Gift className="h-3 w-3 mr-1" />
          Claim
        </>
      )}
    </Button>
  );
}
