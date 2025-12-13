// Journey TV Channel Service
import { supabase } from '@/lib/supabase';
import { Channel } from '@/data/channels';

export interface ChannelService {
  getAllChannels(): Promise<Channel[]>;
  getChannelById(id: string): Promise<Channel | null>;
  getChannelsByCategory(category: string): Promise<Channel[]>;
  getLiveChannels(): Promise<Channel[]>;
}

class ChannelServiceImpl implements ChannelService {
  async getAllChannels(): Promise<Channel[]> {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching channels:', error);
        // Return mock data as fallback
        const { mockChannels } = await import('@/data/channels');
        return mockChannels;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllChannels:', error);
      // Return mock data as fallback
      const { mockChannels } = await import('@/data/channels');
      return mockChannels;
    }
  }

  async getChannelById(id: string): Promise<Channel | null> {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching channel:', error);
        // Return mock data as fallback
        const { getChannelById } = await import('@/data/channels');
        return getChannelById(id) || null;
      }

      return data;
    } catch (error) {
      console.error('Error in getChannelById:', error);
      // Return mock data as fallback
      const { getChannelById } = await import('@/data/channels');
      return getChannelById(id) || null;
    }
  }

  async getChannelsByCategory(category: string): Promise<Channel[]> {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching channels by category:', error);
        // Return mock data as fallback
        const { getChannelsByCategory } = await import('@/data/channels');
        return getChannelsByCategory(category);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getChannelsByCategory:', error);
      // Return mock data as fallback
      const { getChannelsByCategory } = await import('@/data/channels');
      return getChannelsByCategory(category);
    }
  }

  async getLiveChannels(): Promise<Channel[]> {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching live channels:', error);
        // Return mock data as fallback
        const { getLiveChannels } = await import('@/data/channels');
        return getLiveChannels();
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLiveChannels:', error);
      // Return mock data as fallback
      const { getLiveChannels } = await import('@/data/channels');
      return getLiveChannels();
    }
  }
}

export const ChannelService = new ChannelServiceImpl();
