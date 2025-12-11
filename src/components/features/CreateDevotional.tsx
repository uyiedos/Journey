'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { books } from '@/data/bibles';
import { supabaseService } from '@/services/supabaseService';
import { imageService, ImageUpload as ImageUploadType } from '@/services/imageService';
import { aiService } from '@/services/aiService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Plus, X, Save, Loader2 } from 'lucide-react';

interface CreateDevotionalProps {
  onSave?: (devotional: any) => void;
  onCancel?: () => void;
}

export function CreateDevotional({ onSave, onCancel }: CreateDevotionalProps) {
  const { user } = useAuth();
  const { refreshData } = useUserData();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Bible reference selection
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedVerseFrom, setSelectedVerseFrom] = useState('');
  const [selectedVerseTo, setSelectedVerseTo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [uploadedImages, setUploadedImages] = useState<ImageUploadType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Automatically set author to current user
  const authorName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous';

  // Derived values for chapter selection
  const selectedBook = selectedBookId ? books.find(b => b.id === selectedBookId) : undefined;
  const chapterCount = selectedBook?.chapters || 0;
  const chapterNumbers = Array.from({ length: chapterCount }, (_, i) => (i + 1).toString());

  // Human-readable verse reference for UI preview
  const verseReferenceDisplay = selectedBook && selectedChapter && selectedVerseFrom
    ? `${selectedBook.name} ${selectedChapter}:${selectedVerseFrom}${
        selectedVerseTo && selectedVerseTo !== selectedVerseFrom ? `-${selectedVerseTo}` : ''
      }`
    : '';

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAIGenerate = async () => {
    return;
  };

  const handleSave = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    if (!title.trim() || !content.trim()) {
      console.error('Title and content are required');
      return;
    }

    setIsSaving(true);
    
    try {
      // Build verse reference string if all required parts are present
      let verseReference: string | undefined = undefined;

      if (selectedBookId && selectedChapter && selectedVerseFrom) {
        const book = books.find(b => b.id === selectedBookId);
        const bookName = book?.name || selectedBookId;

        if (selectedVerseTo && selectedVerseTo !== selectedVerseFrom) {
          verseReference = `${bookName} ${selectedChapter}:${selectedVerseFrom}-${selectedVerseTo}`;
        } else {
          verseReference = `${bookName} ${selectedChapter}:${selectedVerseFrom}`;
        }
      }

      const devotionalData = {
        title: title.trim(),
        content: content.trim(),
        verse_reference: verseReference,
        // verse_text can be populated in the future from a Bible API
        author_name: authorName,
        tags: tags.length > 0 ? tags : undefined,
        image_url: imageUrl.trim() || undefined,
        is_public: true,
      };

      const result = await supabaseService.createDevotionalContent(user.id, devotionalData);
      
      if (result) {
        // Link images to the devotional
        if (uploadedImages.length > 0) {
          for (let i = 0; i < uploadedImages.length; i++) {
            await imageService.linkImageToDevotion(result.id, uploadedImages[i].id, i);
          }
        }
        
        // Refresh user data to show updated points
        await refreshData();
        
        if (onSave) {
          onSave(result);
        }
        
        // Reset form
        setTitle('');
        setContent('');
        setSelectedBookId('');
        setSelectedChapter('');
        setSelectedVerseFrom('');
        setSelectedVerseTo('');
        setTags([]);
        setNewTag('');
        setImageUrl('');
        setUploadedImages([]);
        
        console.log('Devotional created successfully:', result);
      } else {
        console.error('Failed to create devotional');
      }
    } catch (error) {
      console.error('Error creating devotional:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Create New Devotional</span>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Devotional
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Enter devotional title..."
                value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* Bible Reference */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bible Reference (Optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {/* Book */}
            <div className="space-y-1 md:col-span-2">
              <span className="text-xs text-muted-foreground">Book</span>
              <Select
                value={selectedBookId}
                onValueChange={(value) => {
                  setSelectedBookId(value);
                  setSelectedChapter('');
                  setSelectedVerseFrom('');
                  setSelectedVerseTo('');
                }}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Chapter</span>
              <Select
                value={selectedChapter}
                onValueChange={(value) => {
                  setSelectedChapter(value);
                  setSelectedVerseFrom('');
                  setSelectedVerseTo('');
                }}
                disabled={isSaving || !selectedBookId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedBookId ? 'Chapter' : 'Select book first'} />
                </SelectTrigger>
                <SelectContent>
                  {chapterNumbers.map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {ch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verses */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Verses</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  placeholder="From"
                  value={selectedVerseFrom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedVerseFrom(e.target.value)}
                  disabled={isSaving || !selectedChapter}
                  className="w-16"
                />
                <span className="text-xs text-muted-foreground">-</span>
                <Input
                  type="number"
                  min={1}
                  placeholder="To"
                  value={selectedVerseTo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedVerseTo(e.target.value)}
                  disabled={isSaving || !selectedChapter}
                  className="w-16"
                />
              </div>
            </div>
          </div>
          {selectedBook && selectedChapter && selectedVerseFrom && (
            <p className="text-xs text-muted-foreground">
              Selected: {selectedBook.name} {selectedChapter}:{selectedVerseFrom}
              {selectedVerseTo && selectedVerseTo !== selectedVerseFrom ? `-${selectedVerseTo}` : ''}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Content *</label>
          <Textarea
            placeholder="Write your devotional content..."
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            rows={8}
            disabled={isSaving}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex space-x-2">
            <Input
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              disabled={isSaving}
            />
            <Button type="button" onClick={handleAddTag} disabled={isSaving}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>#{tag}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Image URL (Optional)</label>
          <Input
            placeholder="https://example.com/your-image.jpg"
            value={imageUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* Images */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Images (Optional)</label>
          <ImageUpload
            onImagesChange={setUploadedImages}
            maxImages={3}
            maxFileSize={1 * 1024 * 1024}
            className="w-full"
          />
        </div>

        {/* Preview */}
        {(title || content) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{title || 'Untitled'}</h3>
                {verseReferenceDisplay && (
                  <div className="text-sm text-muted-foreground mb-3 italic">
                    {verseReferenceDisplay}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-3">
                  {content || 'No content...'}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>By {authorName}</span>
                  <span>Just now</span>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </CardContent>
    </Card>
  );
}
