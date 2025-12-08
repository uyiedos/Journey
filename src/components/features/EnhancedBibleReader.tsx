'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Bookmark, 
  Share2, 
  Highlighter, 
  FileText, 
  Heart, 
  Copy, 
  Facebook, 
  Twitter,
  MoreHorizontal,
  Palette,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { bibleAPI, BibleVerse } from '@/lib/bible-api';
import { bibleService, BibleBookmark, BibleHighlight, BibleNote } from '@/services/bibleService';
import { isJesusWords, getJesusWordsRanges } from '@/data/red-letters';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface EnhancedBibleReaderProps {
  book: string;
  chapter: number;
  translation: string;
  verses: any[];
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FBBF24' },
  { name: 'Green', value: '#34D399' },
  { name: 'Blue', value: '#60A5FA' },
  { name: 'Purple', value: '#A78BFA' },
  { name: 'Pink', value: '#F472B6' },
  { name: 'Orange', value: '#FB923C' }
];

const BOOKMARK_CATEGORIES = [
  'general',
  'favorite',
  'pray',
  'study',
  'memorize',
  'share'
];

export default function EnhancedBibleReader({ book, chapter, translation, verses }: EnhancedBibleReaderProps) {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<BibleHighlight[]>([]);
  const [bookmarks, setBookmarks] = useState<BibleBookmark[]>([]);
  const [notes, setNotes] = useState<BibleNote[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [highlightColor, setHighlightColor] = useState('#FBBF24');
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkCategory, setBookmarkCategory] = useState('general');
  const [noteContent, setNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load user data for this chapter
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, book, chapter]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [highlightsData, bookmarksData, notesData] = await Promise.all([
        bibleService.getHighlights(user.id, book, chapter),
        bibleService.getBookmarks(user.id),
        bibleService.getNotes(user.id, book, chapter)
      ]);
      
      setHighlights(highlightsData);
      setBookmarks(bookmarksData);
      setNotes(notesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const isVerseHighlighted = (verse: number) => {
    return highlights.some(h => h.chapter === chapter && h.verse === verse);
  };

  const getVerseHighlight = (verse: number) => {
    return highlights.find(h => h.chapter === chapter && h.verse === verse);
  };

  const hasBookmark = (verse: number) => {
    return bookmarks.some(b => b.chapter === chapter && b.verse === verse);
  };

  const hasNote = (verse: number) => {
    return notes.some(n => n.chapter === chapter && n.verse === verse);
  };

  const handleHighlight = async (verse: number) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const existingHighlight = getVerseHighlight(verse);
      
      if (existingHighlight) {
        await bibleService.deleteHighlight(existingHighlight.id);
        setHighlights(prev => prev.filter(h => h.id !== existingHighlight.id));
      } else {
        const verseData = verses.find(v => v.verse === verse);
        if (verseData) {
          const newHighlight = await bibleService.createHighlight({
            user_id: user.id,
            book_id: book,
            chapter: chapter,
            verse: verse,
            text_content: verseData.text,
            highlight_color: highlightColor
          });
          setHighlights(prev => [...prev, newHighlight]);
        }
      }
    } catch (error) {
      console.error('Error highlighting verse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user || selectedVerse === null) return;
    
    setIsLoading(true);
    try {
      const verseData = verses.find(v => v.verse === selectedVerse);
      if (verseData) {
        const newBookmark = await bibleService.createBookmark({
          user_id: user.id,
          book_id: book,
          chapter: chapter,
          verse: selectedVerse,
          title: bookmarkTitle || `${book} ${chapter}:${selectedVerse}`,
          notes: '',
          category: bookmarkCategory,
          color: '#3B82F6',
          is_favorite: false
        });
        
        setBookmarks(prev => [...prev, newBookmark]);
        setShowBookmarkDialog(false);
        setBookmarkTitle('');
        setBookmarkCategory('general');
        setSelectedVerse(null);
      }
    } catch (error) {
      console.error('Error bookmarking verse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNote = async () => {
    if (!user || selectedVerse === null) return;
    
    setIsLoading(true);
    try {
      const verseData = verses.find(v => v.verse === selectedVerse);
      if (verseData) {
        const newNote = await bibleService.createNote({
          user_id: user.id,
          book_id: book,
          chapter: chapter,
          verse: selectedVerse,
          note_content: noteContent,
          is_private: true,
          tags: []
        });
        
        setNotes(prev => [...prev, newNote]);
        setShowNoteDialog(false);
        setNoteContent('');
        setSelectedVerse(null);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (selectedVerse === null) return;
    
    const verseData = verses.find(v => v.verse === selectedVerse);
    if (verseData && user) {
      const shareText = `${book} ${chapter}:${selectedVerse} - ${verseData.text}`;
      
      try {
        await bibleService.shareVerse({
          user_id: user.id,
          book_id: book,
          chapter: chapter,
          verse_start: selectedVerse,
          share_text: shareText,
          reflection: '',
          is_public: true
        });
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareText);
        setShowShareDialog(false);
        setSelectedVerse(null);
      } catch (error) {
        console.error('Error sharing verse:', error);
      }
    }
  };

  const copyVerse = async (verse: number) => {
    const verseData = verses.find(v => v.verse === verse);
    if (verseData) {
      const text = `${book} ${chapter}:${verse} - ${verseData.text}`;
      await navigator.clipboard.writeText(text);
    }
  };

  const shareOnSocial = (platform: string, verse: number) => {
    const verseData = verses.find(v => v.verse === verse);
    if (verseData) {
      const text = `${book} ${chapter}:${verse} - ${verseData.text}`;
      const url = window.location.href;
      
      let shareUrl = '';
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    }
  };

  const getVerseStyle = (verse: number) => {
    const highlight = getVerseHighlight(verse);
    const isJesus = isJesusWords(book, chapter, verse);
    
    let style: React.CSSProperties = {};
    
    if (highlight) {
      style.backgroundColor = highlight.highlight_color + '20'; // Add transparency
      style.borderLeft = `3px solid ${highlight.highlight_color}`;
      style.paddingLeft = '12px';
    }
    
    if (isJesus) {
      style.color = '#DC2626'; // Red color for Jesus' words
      style.fontWeight = '500';
    }
    
    return style;
  };

  const openVerseMenu = (verse: number) => {
    setSelectedVerse(verse);
  };

  return (
    <div className="space-y-4">
      {verses.map((verse) => (
        <div key={verse.verse} className="group">
          <div className="flex items-start space-x-4">
            <span className="font-semibold text-sm text-muted-foreground w-8 shrink-0">
              {verse.verse}
            </span>
            
            <div className="flex-1">
              <p 
                className="text-sm leading-relaxed cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                style={getVerseStyle(verse.verse)}
                onClick={() => openVerseMenu(verse.verse)}
              >
                {verse.text}
              </p>
              
              {/* Verse action indicators */}
              <div className="flex items-center space-x-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isVerseHighlighted(verse.verse) && (
                  <Highlighter className="h-3 w-3 text-yellow-500" />
                )}
                {hasBookmark(verse.verse) && (
                  <Bookmark className="h-3 w-3 text-blue-500" />
                )}
                {hasNote(verse.verse) && (
                  <FileText className="h-3 w-3 text-green-500" />
                )}
                {isJesusWords(book, chapter, verse.verse) && (
                  <span className="text-xs text-red-500 font-medium">Jesus</span>
                )}
              </div>
            </div>
            
            {/* Verse actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user && (
                  <>
                    <DropdownMenuItem onClick={() => handleHighlight(verse.verse)}>
                      <Highlighter className="h-4 w-4 mr-2" />
                      {isVerseHighlighted(verse.verse) ? 'Remove Highlight' : 'Highlight'}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => {
                      setSelectedVerse(verse.verse);
                      setShowBookmarkDialog(true);
                    }}>
                      <Bookmark className="h-4 w-4 mr-2" />
                      {hasBookmark(verse.verse) ? 'View Bookmark' : 'Bookmark'}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => {
                      setSelectedVerse(verse.verse);
                      setShowNoteDialog(true);
                    }}>
                      <FileText className="h-4 w-4 mr-2" />
                      {hasNote(verse.verse) ? 'View Note' : 'Add Note'}
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuItem onClick={() => copyVerse(verse.verse)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => shareOnSocial('twitter', verse.verse)}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Share on Twitter
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => shareOnSocial('facebook', verse.verse)}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Share on Facebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Show note content if exists */}
          {hasNote(verse.verse) && (
            <div className="ml-12 mt-2 p-3 bg-green-50 border-l-4 border-green-300 rounded">
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Note</span>
              </div>
              <p className="text-sm text-gray-700">
                {notes.find(n => n.verse === verse.verse)?.note_content}
              </p>
            </div>
          )}
        </div>
      ))}
      
      {/* Highlight color selector */}
      {user && (
        <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4 text-gray-500" />
            <div className="flex space-x-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  className={`w-6 h-6 rounded-full border-2 ${
                    highlightColor === color.value ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setHighlightColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Bookmark Dialog */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bookmark Verse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
                placeholder={`${book} ${chapter}:${selectedVerse}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={bookmarkCategory}
                onChange={(e) => setBookmarkCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                {BOOKMARK_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBookmarkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookmark} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Bookmark'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your Note</label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your thoughts about this verse..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleNote} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
