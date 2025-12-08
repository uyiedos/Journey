'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { sampleVerses } from '@/data/bibles';
import { supabaseService } from '@/services/supabaseService';
import { imageService, ImageUpload as ImageUploadType } from '@/services/imageService';
import { aiService } from '@/services/aiService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Plus, X, Save, Loader2, Sparkles } from 'lucide-react';

interface CreateDevotionalProps {
  onSave?: (devotional: any) => void;
  onCancel?: () => void;
}

export function CreateDevotional({ onSave, onCancel }: CreateDevotionalProps) {
  const { user } = useAuth();
  const { refreshData } = useUserData();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedVerse, setSelectedVerse] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [uploadedImages, setUploadedImages] = useState<ImageUploadType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  // Automatically set author to current user
  const authorName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous';

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
    if (!aiTopic.trim()) return;

    setIsGenerating(true);
    try {
      const devotional = aiService.generateDevotional('', aiTopic);
      
      setTitle(devotional.title);
      setContent(devotional.main_message + '\n\nApplication: ' + devotional.application + '\n\nPrayer: ' + devotional.prayer);
      setSelectedVerse(devotional.verse);
      
      // Add relevant tags
      const newTags = ['devotional', aiTopic.toLowerCase()];
      setTags([...new Set([...tags, ...newTags])]);
      
    } catch (error) {
      console.error('Error generating AI devotional:', error);
      alert('Failed to generate devotional. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
      const selectedVerseData = sampleVerses.find(v => v.id === selectedVerse);
      
      const devotionalData = {
        title: title.trim(),
        content: content.trim(),
        verse_reference: selectedVerseData ? `Verse ${selectedVerseData.number}` : undefined,
        verse_text: selectedVerseData ? selectedVerseData.text : undefined,
        author_name: authorName,
        tags: tags.length > 0 ? tags : undefined,
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
        setSelectedVerse('');
        setTags([]);
        setNewTag('');
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
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Assist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
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

        {/* Bible Verse */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bible Verse</label>
          <Select value={selectedVerse} onValueChange={setSelectedVerse} disabled={isSaving}>
            <SelectTrigger>
              <SelectValue placeholder="Select a verse..." />
            </SelectTrigger>
            <SelectContent>
              {sampleVerses.map((verse) => (
                <SelectItem key={verse.id} value={verse.id}>
                  <div className="space-y-1">
                    <div className="font-medium">Verse {verse.number}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {verse.text}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                {selectedVerse && (
                  <div className="text-sm text-muted-foreground mb-3 italic">
                    "{sampleVerses.find(v => v.id === selectedVerse)?.text}"
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
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic or Theme</label>
                <Input
                  placeholder="e.g., Faith, Prayer, Forgiveness, God's Love..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <Button 
                onClick={handleAIGenerate}
                disabled={!aiTopic.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Devotional
                  </>
                )}
              </Button>

              {(title || content) && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Generated Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Generated title will appear here..."
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Generated Content</label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Generated devotional content will appear here..."
                      className="min-h-[200px]"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bible Verse</label>
                    <Select value={selectedVerse} onValueChange={setSelectedVerse} disabled={isSaving}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Bible verse..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleVerses.map((verse) => (
                          <SelectItem key={verse.id} value={verse.id}>
                            {verse.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        disabled={isSaving}
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag} disabled={isSaving}>
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="cursor-pointer">
                            #{tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-xs hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
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
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
