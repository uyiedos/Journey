import { supabase } from '@/lib/supabase';
import { Event } from '@/types';

export class EventService {
  // Get all events
  static async getAllEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map Supabase fields to our Event interface
      return (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.type,
        videoUrl: event.video_url,
        startsAt: event.starts_at,
        endsAt: event.ends_at,
        createdAt: event.created_at,
        created_by: event.created_by,
        tags: event.tags,
        likes_count: event.likes_count,
        comments_count: event.comments_count,
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  // Get event by ID
  static async getEventById(id: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) return null;

      // Map Supabase fields to our Event interface
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.type,
        videoUrl: data.video_url,
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        createdAt: data.created_at,
        created_by: data.created_by,
        tags: data.tags,
        likes_count: data.likes_count,
        comments_count: data.comments_count,
      };
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      return null;
    }
  }

  // Create a new event
  static async createEvent(userId: string, eventData: Omit<Event, 'id' | 'created_at' | 'created_by' | 'createdAt'>): Promise<Event> {
    try {
      // Map our Event interface to Supabase fields
      const supabaseEvent = {
        title: eventData.title,
        description: eventData.description,
        type: eventData.type,
        video_url: eventData.videoUrl,
        starts_at: eventData.startsAt,
        ends_at: eventData.endsAt,
        tags: eventData.tags || [],
      };

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...supabaseEvent,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) throw new Error('Failed to create event');
      
      // Map back to our Event interface
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.type,
        videoUrl: data.video_url,
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        createdAt: data.created_at,
        created_by: data.created_by,
        tags: data.tags,
        likes_count: data.likes_count,
        comments_count: data.comments_count,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Like an event
  static async likeEvent(eventId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('event_likes')
        .insert({
          event_id: eventId,
          user_id: userId,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error liking event:', error);
      throw error;
    }
  }

  // Add comment to event
  static async addComment(eventId: string, userId: string, content: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          user_id: userId,
          content,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get event with likes and comments
  static async getEventWithDetails(eventId: string): Promise<Event & { likes: number; comments: any[] }> {
    try {
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) throw eventError || new Error('Event not found');

      // Get likes count
      const { data: likes, error: likesError } = await supabase
        .from('event_likes')
        .select('count')
        .eq('event_id', eventId);

      // Get comments with user info
      const { data: comments, error: commentsError } = await supabase
        .from('event_comments')
        .select(`
          *,
          user:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (likesError || commentsError) throw likesError || commentsError;

      return {
        ...event,
        likes: likes?.[0]?.count || 0,
        comments: comments || [],
      };
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  }
}
