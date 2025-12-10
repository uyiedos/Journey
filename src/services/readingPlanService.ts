// Reading Plan Service for Supabase integration
import { supabase } from '../lib/supabase';

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readings?: ReadingPlanItem[];
  participants?: number;
  rating?: number;
  user_id?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReadingPlanItem {
  id: string;
  day: number;
  title: string;
  passages: string[];
  devotional: string;
  completed?: boolean;
}

export interface UserReadingPlan {
  id: string;
  user_id: string;
  plan_id: string;
  started_at: string;
  completed_at?: string;
  current_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReadingPlanProgress {
  id: string;
  user_id: string;
  plan_id: string;
  day: number;
  completed: boolean;
  completed_at?: string;
  notes?: string;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

class ReadingPlanService {
  // Get all public reading plans
  async getPublicReadingPlans(): Promise<ReadingPlan[]> {
    try {
      const { data, error } = await supabase
        .from('reading_plans')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reading plans:', error);
      return [];
    }
  }

  // Get reading plan by ID
  async getReadingPlanById(id: string): Promise<ReadingPlan | null> {
    if (!id) {
      console.error('Error: No ID provided to getReadingPlanById');
      return null;
    }
    
    try {
      console.log(`Fetching reading plan with ID: ${id}`);
      const { data, error } = await supabase
        .from('reading_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }
      
      if (!data) {
        console.error(`No reading plan found with ID: ${id}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getReadingPlanById:', {
        error,
        errorString: String(error),
        errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        planId: id
      });
      return null;
    }
  }

  // Start a reading plan for a user
  async startReadingPlan(userId: string, planId: string): Promise<UserReadingPlan> {
    try {
      // Create user reading plan entry
      const { data: userPlan, error: userPlanError } = await supabase
        .from('user_reading_plans')
        .insert([{
          user_id: userId,
          plan_id: planId,
          started_at: new Date().toISOString(),
          current_day: 1,
          is_active: true
        }])
        .select()
        .single();

      if (userPlanError) throw userPlanError;

      // Award initial points for starting a plan
      await this.awardPoints(userId, 10, 'Started a reading plan');

      return userPlan;
    } catch (error) {
      console.error('Error starting reading plan:', error);
      throw error;
    }
  }

  // Get user's reading plans
  async getUserReadingPlans(userId: string): Promise<UserReadingPlan[]> {
    try {
      const { data, error } = await supabase
        .from('user_reading_plans')
        .select(`
          *,
          reading_plans (*)
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user reading plans:', error);
      return [];
    }
  }

  // Get user's progress for a specific plan
  async getPlanProgress(userId: string, planId: string): Promise<ReadingPlanProgress[]> {
    try {
      const { data, error } = await supabase
        .from('reading_plan_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('plan_id', planId)
        .order('day_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching plan progress:', error);
      return [];
    }
  }

  // Mark a day as completed
  async completeDay(
    userId: string, 
    planId: string, 
    day: number, 
    notes?: string
  ): Promise<ReadingPlanProgress> {
    try {
      const { data, error } = await supabase
        .from('reading_plan_progress')
        .upsert([{
          user_id: userId,
          plan_id: planId,
          day: day,
          completed: true,
          completed_at: new Date().toISOString(),
          notes: notes || null,
          points_earned: 5 // Award 5 points per completed day
        }])
        .select()
        .single();

      if (error) throw error;

      // Award points for completing a day
      await this.awardPoints(userId, 5, 'Completed a reading plan day');

      // Update user reading plan current day
      await supabase
        .from('user_reading_plans')
        .update({ 
          current_day: day + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('plan_id', planId);

      return data;
    } catch (error) {
      console.error('Error completing day:', error);
      throw error;
    }
  }

  // Complete entire reading plan
  async completeReadingPlan(userId: string, planId: string): Promise<UserReadingPlan> {
    try {
      // Get plan details to calculate completion bonus
      const plan = await this.getReadingPlanById(planId);
      if (!plan) throw new Error('Plan not found');

      const completionBonus = plan.duration * 2; // 2 points per day as bonus

      const { data, error } = await supabase
        .from('user_reading_plans')
        .update({
          is_active: false,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('plan_id', planId)
        .select()
        .single();

      if (error) throw error;

      // Award completion bonus points
      await this.awardPoints(userId, completionBonus, 'Completed a reading plan');

      return data;
    } catch (error) {
      console.error('Error completing reading plan:', error);
      throw error;
    }
  }

  // Award points to user
  private async awardPoints(userId: string, points: number, reason: string): Promise<void> {
    try {
      // Update user points
      const { error: updateError } = await supabase.rpc('increment_user_points', {
        p_user_id: userId,
        p_points: points
      });

      if (updateError) throw updateError;

      // Create activity record
      const { error: activityError } = await supabase
        .from('activities')
        .insert([{
          user_id: userId,
          type: 'reading_plan',
          description: reason,
          points: points,
          created_at: new Date().toISOString()
        }]);

      if (activityError) throw activityError;
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }

  // Get reading plan statistics
  async getPlanStats(planId: string): Promise<{
    totalParticipants: number;
    averageCompletion: number;
    totalCompletions: number;
  }> {
    try {
      const { data: userPlans, error } = await supabase
        .from('user_reading_plans')
        .select('is_completed')
        .eq('plan_id', planId);

      if (error) throw error;

      const totalParticipants = userPlans?.length || 0;
      const totalCompletions = userPlans?.filter(plan => plan.is_completed).length || 0;
      const averageCompletion = totalParticipants > 0 ? (totalCompletions / totalParticipants) * 100 : 0;

      return {
        totalParticipants,
        averageCompletion,
        totalCompletions
      };
    } catch (error) {
      console.error('Error fetching plan stats:', error);
      return {
        totalParticipants: 0,
        averageCompletion: 0,
        totalCompletions: 0
      };
    }
  }

  // Create a new reading plan (for admin users)
  async createReadingPlan(plan: Omit<ReadingPlan, 'id' | 'created_at' | 'updated_at'>): Promise<ReadingPlan> {
    try {
      const { data, error } = await supabase
        .from('reading_plans')
        .insert([plan])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating reading plan:', error);
      throw error;
    }
  }
}

export const readingPlanService = new ReadingPlanService();
