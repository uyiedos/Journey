import { supabase } from '@/lib/supabase';
import { supabaseService } from './supabaseService';

export interface ReferralInfo {
  referral_code: string;
  referral_url: string;
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  points_earned: number;
}

export class ReferralService {
  static async getReferralInfo(userId: string): Promise<ReferralInfo | null> {
    try {
      console.log('Getting referral info for userId:', userId);
      
      // Try to get username and referral_code, fallback to email if username doesn't exist
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('username, referral_code, email')
        .eq('id', userId)
        .single();

      console.log('User data:', user);
      console.log('User error:', userError);

      if (userError) {
        console.error('Error fetching user:', userError);
        console.error('Error details:', JSON.stringify(userError, null, 2));
        console.error('Error code:', userError.code);
        console.error('Error message:', userError.message);
        console.error('Error details:', userError.details);
        
        // If user doesn't exist, try to get their email from auth and create a basic referral code
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user && authUser.user.email) {
          const emailReferralCode = authUser.user.email.split('@')[0].toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
          console.log('Using auth email for referral code:', emailReferralCode);
          
          return {
            referral_code: emailReferralCode,
            referral_url: `${window.location.origin}/auth?ref=${emailReferralCode}`,
            total_referrals: 0,
            completed_referrals: 0,
            pending_referrals: 0,
            points_earned: 0
          };
        }
        
        return null;
      }

      if (!user) {
        console.log('No user data found');
        return null;
      }

      // Use username as referral code if referral_code is not set, fallback to email
      const referralCode = user.referral_code || user.username || user.email.split('@')[0].toLowerCase();
      console.log('Using referral code:', referralCode);

      const { data: referrals, error: referralError } = await supabase
        .from('referrals')
        .select('status, points_awarded')
        .eq('referrer_id', userId);

      console.log('Referrals data:', referrals);
      console.log('Referrals error:', referralError);

      if (referralError) {
        console.error('Error fetching referrals:', referralError);
        // Return basic info if referrals table doesn't exist or has permission issues
        return {
          referral_code: referralCode,
          referral_url: `${window.location.origin}/auth?ref=${referralCode}`,
          total_referrals: 0,
          completed_referrals: 0,
          pending_referrals: 0,
          points_earned: 0
        };
      }

      const referralList = referrals || [];
      const completed_referrals = referralList.filter(r => r.status === 'completed').length;
      const pending_referrals = referralList.filter(r => r.status === 'pending').length;
      const points_earned = referralList.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

      return {
        referral_code: referralCode,
        referral_url: `${window.location.origin}/auth?ref=${referralCode}`,
        total_referrals: referralList.length,
        completed_referrals,
        pending_referrals,
        points_earned
      };
    } catch (error) {
      console.error('Error getting referral info:', error);
      return null;
    }
  }

  static async processReferral(referralCode: string, newUserId: string): Promise<boolean> {
    try {
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (referrerError || !referrer) return false;

      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', newUserId)
        .single();

      if (existingReferral) return false;

      await supabase
        .from('users')
        .update({ referred_by: referrer.id })
        .eq('id', newUserId);

      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: newUserId,
          referral_code: referralCode,
          status: 'pending',
          points_awarded: 0
        });

      if (referralError) throw referralError;
      return true;
    } catch (error) {
      console.error('Error processing referral:', error);
      return false;
    }
  }

  static async completeReferral(referralId: string): Promise<void> {
    try {
      const { data: referral, error: fetchError } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', referralId)
        .single();

      if (fetchError || !referral) throw fetchError;

      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          status: 'completed',
          points_awarded: 100,
          completed_at: new Date().toISOString()
        })
        .eq('id', referralId);

      if (updateError) throw updateError;

      await supabaseService.addPoints(referral.referrer_id, 100);

      await supabase
        .from('points_transactions')
        .insert({
          user_id: referral.referrer_id,
          transaction_type: 'referral',
          points: 100,
          description: 'Referral bonus',
          metadata: {
            referred_user: referral.referred_id,
            referral_code: referral.referral_code
          }
        });

      await supabase
        .from('user_stats')
        .update({
          referrals_completed: supabase.rpc('increment', { amount: 1 }),
          total_points_earned: supabase.rpc('increment', { amount: 100 })
        })
        .eq('user_id', referral.referrer_id);

      await supabaseService.addPoints(referral.referred_id, 50);

      await supabase
        .from('points_transactions')
        .insert({
          user_id: referral.referred_id,
          transaction_type: 'referral',
          points: 50,
          description: 'Welcome bonus',
          metadata: {
            referred_by: referral.referrer_id,
            referral_code: referral.referral_code
          }
        });

      await supabase
        .from('user_stats')
        .update({
          total_points_earned: supabase.rpc('increment', { amount: 50 })
        })
        .eq('user_id', referral.referred_id);
    } catch (error) {
      console.error('Error completing referral:', error);
      throw error;
    }
  }

  static generateReferralUrl(referralCode: string): string {
    return `${window.location.origin}/auth?ref=${referralCode}`;
  }

  static async validateReferralCode(referralCode: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  static async getReferralHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:referred_id(id, username, email, created_at)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting referral history:', error);
      return [];
    }
  }

  static async checkPendingReferrals(userId: string): Promise<void> {
    try {
      const userProfile = await supabaseService.getUserProfile(userId);
      if (!userProfile) return;

      const isActive = userProfile.points > 0 || userProfile.streak > 0;
      
      if (isActive) {
        const { data: pendingReferrals } = await supabase
          .from('referrals')
          .select('id')
          .eq('referred_id', userId)
          .eq('status', 'pending');

        if (pendingReferrals && pendingReferrals.length > 0) {
          await this.completeReferral(pendingReferrals[0].id);
        }
      }
    } catch (error) {
      console.error('Error checking pending referrals:', error);
    }
  }
}

export const referralService = ReferralService;
