// Enhanced Bible Service with bookmarks, highlights, and sharing
import { supabase } from '../lib/supabase';

export interface BibleBookmark {
  id: string;
  user_id: string;
  book_id: string;
  chapter: number;
  verse: number;
  verse_end?: number;
  title?: string;
  notes?: string;
  category: string;
  color: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface BibleHighlight {
  id: string;
  user_id: string;
  book_id: string;
  chapter: number;
  verse: number;
  verse_end?: number;
  text_content: string;
  highlight_color: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface BibleNote {
  id: string;
  user_id: string;
  book_id: string;
  chapter: number;
  verse: number;
  verse_end?: number;
  note_content: string;
  is_private: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SharedVerse {
  id: string;
  user_id: string;
  book_id: string;
  chapter: number;
  verse_start: number;
  verse_end?: number;
  share_text: string;
  reflection?: string;
  is_public: boolean;
  share_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  chapters_completed: number[];
  current_chapter: number;
  last_read_chapter?: number;
  last_read_verse?: number;
  reading_streak: number;
  total_verses_read: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

class BibleService {
  // Bookmark methods
  async getBookmarks(userId: string, category?: string): Promise<BibleBookmark[]> {
    let query = supabase
      .from('bible_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createBookmark(bookmark: Omit<BibleBookmark, 'id' | 'created_at' | 'updated_at'>): Promise<BibleBookmark> {
    const { data, error } = await supabase
      .from('bible_bookmarks')
      .insert([bookmark])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateBookmark(id: string, updates: Partial<BibleBookmark>): Promise<BibleBookmark> {
    const { data, error } = await supabase
      .from('bible_bookmarks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteBookmark(id: string): Promise<void> {
    const { error } = await supabase
      .from('bible_bookmarks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Highlight methods
  async getHighlights(userId: string, bookId?: string, chapter?: number): Promise<BibleHighlight[]> {
    let query = supabase
      .from('bible_highlights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (bookId) query = query.eq('book_id', bookId);
    if (chapter) query = query.eq('chapter', chapter);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createHighlight(highlight: Omit<BibleHighlight, 'id' | 'created_at' | 'updated_at'>): Promise<BibleHighlight> {
    const { data, error } = await supabase
      .from('bible_highlights')
      .insert([highlight])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateHighlight(id: string, updates: Partial<BibleHighlight>): Promise<BibleHighlight> {
    const { data, error } = await supabase
      .from('bible_highlights')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteHighlight(id: string): Promise<void> {
    const { error } = await supabase
      .from('bible_highlights')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Note methods
  async getNotes(userId: string, bookId?: string, chapter?: number): Promise<BibleNote[]> {
    let query = supabase
      .from('bible_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (bookId) query = query.eq('book_id', bookId);
    if (chapter) query = query.eq('chapter', chapter);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createNote(note: Omit<BibleNote, 'id' | 'created_at' | 'updated_at'>): Promise<BibleNote> {
    const { data, error } = await supabase
      .from('bible_notes')
      .insert([note])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateNote(id: string, updates: Partial<BibleNote>): Promise<BibleNote> {
    const { data, error } = await supabase
      .from('bible_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('bible_notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Reading progress methods
  async getReadingProgress(userId: string, bookId?: string): Promise<ReadingProgress[]> {
    let query = supabase
      .from('bible_reading_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (bookId) query = query.eq('book_id', bookId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updateReadingProgress(userId: string, bookId: string, chapter: number, verse: number): Promise<ReadingProgress> {
    const { data, error } = await supabase
      .from('bible_reading_progress')
      .upsert({
        user_id: userId,
        book_id: bookId,
        last_read_chapter: chapter,
        last_read_verse: verse,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async markChapterComplete(userId: string, bookId: string, chapter: number): Promise<ReadingProgress> {
    const { data, error } = await supabase.rpc('mark_chapter_complete', {
      p_user_id: userId,
      p_book_id: bookId,
      p_chapter: chapter
    });
    
    if (error) throw error;
    return data;
  }

  // Shared verses methods
  async shareVerse(verse: Omit<SharedVerse, 'id' | 'share_count' | 'like_count' | 'created_at' | 'updated_at'>): Promise<SharedVerse> {
    const { data, error } = await supabase
      .from('shared_verses')
      .insert([verse])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getSharedVerses(publicOnly: boolean = true, limit: number = 20): Promise<SharedVerse[]> {
    let query = supabase
      .from('shared_verses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (publicOnly) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getUserSharedVerses(userId: string): Promise<SharedVerse[]> {
    const { data, error } = await supabase
      .from('shared_verses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async likeSharedVerse(verseId: string): Promise<SharedVerse> {
    const { data, error } = await supabase.rpc('like_shared_verse', { p_verse_id: verseId });
    
    if (error) throw error;
    return data;
  }

  // Utility methods
  async getBookmarkCategories(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('bible_bookmarks')
      .select('category')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const categories = [...new Set(data?.map(b => b.category) || [])];
    return categories;
  }

  async getVerseHighlights(userId: string, bookId: string, chapter: number, verse: number): Promise<BibleHighlight[]> {
    const { data, error } = await supabase
      .from('bible_highlights')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .eq('verse', verse);
    
    if (error) throw error;
    return data || [];
  }

  async getVerseNotes(userId: string, bookId: string, chapter: number, verse: number): Promise<BibleNote[]> {
    const { data, error } = await supabase
      .from('bible_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .eq('verse', verse);
    
    if (error) throw error;
    return data || [];
  }

  async getVerseBookmarks(userId: string, bookId: string, chapter: number, verse: number): Promise<BibleBookmark[]> {
    const { data, error } = await supabase
      .from('bible_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .eq('verse', verse);
    
    if (error) throw error;
    return data || [];
  }
}

export const bibleService = new BibleService();
