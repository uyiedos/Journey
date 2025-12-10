'use client';

import { Button } from '@/components/ui/button';
import { useUserData } from '@/contexts/UserDataContext';
import { supabaseService } from '@/services/supabaseService';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export function DailyPointsClaim() {
  const { user, stats, refreshData } = useUserData();
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && 'last_daily_claim' in user && (user as any).last_daily_claim) {
      const lastClaim = new Date((user as any).last_daily_claim);
      const today = new Date();
      setIsClaimed(
        lastClaim.getDate() === today.getDate() &&
        lastClaim.getMonth() === today.getMonth() &&
        lastClaim.getFullYear() === today.getFullYear()
      );
    }
  }, [user]);

  const handleClaim = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { success, message } = await supabaseService.claimDailyPoints(user.id);
      if (success) {
        await refreshData();
        alert(message || 'Daily points claimed successfully!');
        setIsClaimed(true);
      } else {
        alert(message || 'Failed to claim daily points. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm text-blue-800 dark:text-blue-200">Daily Reward</h3>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            {isClaimed ? 'Come back tomorrow!' : 'Claim your daily points!'}
          </p>
        </div>
        <Button
          onClick={handleClaim}
          disabled={isClaimed || isLoading}
          size="sm"
          className={`${isClaimed ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'} dark:bg-blue-900/50 dark:text-blue-100 dark:hover:bg-blue-800/50`}
        >
          {isLoading ? (
            'Claiming...'
          ) : isClaimed ? (
            <>
              <Sparkles className="h-4 w-4 mr-1" />
              Claimed!
            </>
          ) : (
            'Claim 10 Points'
          )}
        </Button>
      </div>
    </div>
  );
}
