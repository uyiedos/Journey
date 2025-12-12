import { supabase } from '@/lib/supabase';

export interface Devotional {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  verse_reference?: string;
  verse_text?: string;
  author_name?: string;
  tags?: string[];
  likes?: number;
  shares?: number;
  views?: number;
  is_public?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export class DevotionalService {
  // Get all devotionals from Supabase
  static async getAllDevotionals(): Promise<Devotional[]> {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching devotionals:', error);
      return [];
    }
  }

  // Get today's devotional (most recent featured)
  static async getTodaysDevotional(): Promise<Devotional | null> {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('is_public', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching today\'s devotional:', error);
      return null;
    }
  }

  // Get devotional by ID
  static async getDevotionalById(id: string): Promise<Devotional | null> {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching devotional:', error);
      return null;
    }
  }

  // Get devotionals by tag
  static async getDevotionalsByTag(tag: string): Promise<Devotional[]> {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('is_public', true)
        .contains('tags', [tag])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching devotionals by tag:', error);
      return [];
    }
  }

  // Like a devotional
  static async likeDevotional(devotionalId: string): Promise<void> {
    try {
      // First get current likes count
      const { data: current, error: fetchError } = await supabase
        .from('devotionals')
        .select('likes')
        .eq('id', devotionalId)
        .single();

      if (fetchError) throw fetchError;

      // Update likes count
      const { error } = await supabase
        .from('devotionals')
        .update({ likes: (current?.likes || 0) + 1 })
        .eq('id', devotionalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error liking devotional:', error);
      throw error;
    }
  }

  // Increment views
  static async incrementViews(devotionalId: string): Promise<void> {
    try {
      // First get current views count
      const { data: current, error: fetchError } = await supabase
        .from('devotionals')
        .select('views')
        .eq('id', devotionalId)
        .single();

      if (fetchError) throw fetchError;

      // Update views count
      const { error } = await supabase
        .from('devotionals')
        .update({ views: (current?.views || 0) + 1 })
        .eq('id', devotionalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Don't throw error for views as it's not critical
    }
  }
}
