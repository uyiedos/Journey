'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  referralEarnings: number;
  pendingEarnings: number;
  referralRank: number;
  referralBonus: number;
  referredBy?: string;
  referralHistory: ReferralHistory[];
}

interface ReferralHistory {
  id: string;
  referredUserId: string;
  referredUsername: string;
  referralDate: Date;
  status: 'pending' | 'active' | 'inactive';
  earnings: number;
  bonusEarned: boolean;
}

interface ReferralContextType {
  referralData: ReferralData | null;
  loading: boolean;
  generateReferralCode: () => string;
  copyReferralLink: () => Promise<void>;
  sendReferralInvite: (email: string) => Promise<{ success: boolean; error?: string }>;
  validateReferralCode: (code: string) => Promise<boolean>;
  claimReferralBonus: () => Promise<{ success: boolean; error?: string }>;
  getReferralStats: () => ReferralData | null;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export function useReferral() {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    // Return fallback data during build time
    return {
      referralData: null,
      loading: false,
      generateReferralCode: () => 'JOURNEY123',
      copyReferralLink: async () => {},
      sendReferralInvite: async () => ({ success: false }),
      validateReferralCode: async () => false,
      claimReferralBonus: async () => ({ success: false }),
      getReferralStats: () => null,
    };
  }
  return context;
}

export function ReferralProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      // Initialize referral data
      const mockReferralData: ReferralData = {
        referralCode: `JOURNEY${authUser.id.slice(-6).toUpperCase()}`,
        totalReferrals: 12,
        activeReferrals: 8,
        referralEarnings: 2450,
        pendingEarnings: 320,
        referralRank: 15,
        referralBonus: 500,
        referralHistory: [
          {
            id: 'ref-1',
            referredUserId: 'user-123',
            referredUsername: 'John Doe',
            referralDate: new Date('2024-01-15'),
            status: 'active',
            earnings: 450,
            bonusEarned: true,
          },
          {
            id: 'ref-2',
            referredUserId: 'user-456',
            referredUsername: 'Jane Smith',
            referralDate: new Date('2024-02-20'),
            status: 'active',
            earnings: 320,
            bonusEarned: true,
          },
          {
            id: 'ref-3',
            referredUserId: 'user-789',
            referredUsername: 'Mike Johnson',
            referralDate: new Date('2024-03-10'),
            status: 'pending',
            earnings: 0,
            bonusEarned: false,
          },
        ],
      };
      
      setReferralData(mockReferralData);
    } else {
      setReferralData(null);
    }
    
    setLoading(false);
  }, [authUser]);

  const generateReferralCode = (): string => {
    if (!authUser) return 'JOURNEY123';
    return `JOURNEY${authUser.id.slice(-6).toUpperCase()}`;
  };

  const copyReferralLink = async (): Promise<void> => {
    if (!referralData) return;
    
    const referralLink = `https://journey.app/referral/${referralData.referralCode}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  const sendReferralInvite = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!referralData || !authUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // In real app, this would send an email via your backend
      console.log('Sending referral invite to:', email);
      console.log('Referral code:', referralData.referralCode);
      
      // Mock success
      return { success: true };
    } catch (error) {
      console.error('Failed to send referral invite:', error);
      return { success: false, error: 'Failed to send invitation' };
    }
  };

  const validateReferralCode = async (code: string): Promise<boolean> => {
    try {
      // In real app, this would validate against your backend
      // Mock validation - check if code format is correct
      const codeRegex = /^JOURNEY[A-Z0-9]{6}$/;
      return codeRegex.test(code);
    } catch (error) {
      console.error('Failed to validate referral code:', error);
      return false;
    }
  };

  const claimReferralBonus = async (): Promise<{ success: boolean; error?: string }> => {
    if (!referralData || !authUser) {
      return { success: false, error: 'User not authenticated' };
    }

    if (referralData.pendingEarnings === 0) {
      return { success: false, error: 'No pending bonuses to claim' };
    }

    try {
      // In real app, this would process the claim via your backend
      console.log('Claiming referral bonus:', referralData.pendingEarnings);
      
      // Update local state
      setReferralData(prev => prev ? {
        ...prev,
        referralEarnings: prev.referralEarnings + prev.pendingEarnings,
        pendingEarnings: 0,
      } : null);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to claim referral bonus:', error);
      return { success: false, error: 'Failed to claim bonus' };
    }
  };

  const getReferralStats = (): ReferralData | null => {
    return referralData;
  };

  const value = {
    referralData,
    loading,
    generateReferralCode,
    copyReferralLink,
    sendReferralInvite,
    validateReferralCode,
    claimReferralBonus,
    getReferralStats,
  };

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}
