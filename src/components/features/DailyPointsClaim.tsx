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
    <div className="rounded-xl p-4 border border-blue-100 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              <Sparkles className="h-3 w-3" />
            </span>
            Daily Reward
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {isClaimed ? 'Come back tomorrow!' : 'Claim your daily points and keep your journey going.'}
          </p>
        </div>
        <Button
          onClick={handleClaim}
          disabled={isClaimed || isLoading}
          size="sm"
          className={
            isClaimed
              ? 'rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-100 dark:hover:bg-emerald-900'
              : 'rounded-full bg-linear-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg'
          }
        >
          {isLoading ? (
            'Claiming...'
          ) : isClaimed ? (
            <>
              <Sparkles className="h-4 w-4 mr-1" />
              Claimed
            </>
          ) : (
            <>
              <span className="mr-1 text-xs font-medium uppercase tracking-wide">+10</span>
              <span>Claim Points</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
