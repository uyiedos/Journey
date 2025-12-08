'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { supabaseService } from '@/services/supabaseService';
import { aiService } from '@/services/aiService';
import { Plus, BookOpen, Hash, Users, Sparkles, Loader2 } from 'lucide-react';

interface CreatePostDialogProps {
  children: React.ReactNode;
  onPostCreated?: () => void;
}

export function CreatePostDialog({ children, onPostCreated }: CreatePostDialogProps) {
  const { user: authUser } = useAuth();
  const { user } = useUserData();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [verseReference, setVerseReference] = useState('');
  const [verseText, setVerseText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiType, setAiType] = useState<'devotional' | 'reflection' | 'prayer'>('devotional');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) return;

    setIsGenerating(true);
    try {
      let generatedContent = '';
      
      switch (aiType) {
        case 'devotional':
          const devotional = aiService.generateDevotional('', aiTopic);
          generatedContent = devotional.main_message + '\n\nApplication: ' + devotional.application + '\n\nPrayer: ' + devotional.prayer;
          if (devotional.verse) {
            setVerseReference(devotional.verse);
            setVerseText(devotional.verse_text);
          }
          break;
        case 'reflection':
          const bibleStudy = aiService.generateBibleStudy(aiTopic);
          generatedContent = 'Topic: ' + bibleStudy.topic + '\n\nKey Themes:\n' + bibleStudy.main_themes.join('\n') + '\n\nLife Application: ' + bibleStudy.life_application;
          break;
        case 'prayer':
          const prayer = aiService.getPrayerGuidance(aiTopic);
          generatedContent = 'Prayer Focus: ' + prayer.title + '\n\nScripture: ' + prayer.scripture + '\n\nPrayer Points:\n' + prayer.prayer_points.join('\n') + '\n\nSample Prayer: ' + prayer.sample_prayer;
          break;
      }

      setContent(generatedContent);
      setTags([...tags, aiType]);
    } catch (error) {
      console.error('Error generating AI content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !content.trim()) return;

    setIsSubmitting(true);
    try {
      // Create post in database
      const { data, error } = await supabaseService.getClient()
        .from('community_posts')
        .insert({
          user_id: authUser.id,
          content: content.trim(),
          verse_reference: verseReference.trim() || null,
          verse_text: verseText.trim() || null,
          tags: tags.length > 0 ? tags : null,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      // Update user stats
      const currentStats = await supabaseService.getUserStats(authUser.id);
      await supabaseService.updateUserStats(authUser.id, {
        community_posts: (currentStats?.community_posts || 0) + 1,
      });

      // Award points for posting
      await supabaseService.addPoints(authUser.id, 5);

      // Reset form
      setContent('');
      setVerseReference('');
      setVerseText('');
      setTags([]);
      setTagInput('');
      setOpen(false);

      // Notify parent component
      onPostCreated?.();

      console.log('Post created successfully:', data);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-background border-2 shadow-xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Create New Post
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted border-2">
            <TabsTrigger value="manual" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Manual</TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Sparkles className="h-4 w-4" />
              AI Assist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium">Share your thoughts...</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind? Share your spiritual journey, insights, or prayer requests..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] border-2 bg-background resize-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Verse Reference */}
          <div className="space-y-2">
            <Label htmlFor="verse-reference" className="text-base font-medium">
              <BookOpen className="inline h-4 w-4 mr-1" />
              Verse Reference (Optional)
            </Label>
            <Input
              id="verse-reference"
              placeholder="e.g., John 3:16"
              value={verseReference}
              onChange={(e) => setVerseReference(e.target.value)}
              className="border-2 bg-background focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Verse Text */}
          {verseReference && (
            <div className="space-y-2">
              <Label htmlFor="verse-text" className="text-base font-medium">Verse Text (Optional)</Label>
              <Textarea
                id="verse-text"
                placeholder="Enter the verse text..."
                value={verseText}
                onChange={(e) => setVerseText(e.target.value)}
                className="min-h-[60px] border-2 bg-background resize-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              <Hash className="inline h-4 w-4 mr-1" />
              Tags (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
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

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!content.trim() || isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Share Post'}
            </Button>
          </div>
            </form>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-type">Content Type</Label>
                <select 
                  id="ai-type"
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value as 'devotional' | 'reflection' | 'prayer')}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="devotional">Devotional</option>
                  <option value="reflection">Bible Reflection</option>
                  <option value="prayer">Prayer Guide</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-topic">Topic or Theme</Label>
                <Input
                  id="ai-topic"
                  placeholder="e.g., Faith, Prayer, Forgiveness, God's Love..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>

              <Button 
                type="button" 
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
                    Generate Content
                  </>
                )}
              </Button>

              {content && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <Label className="text-sm font-medium">Generated Content</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-2 min-h-[150px]"
                    placeholder="AI-generated content will appear here..."
                  />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Verse Reference */}
              <div className="space-y-2">
                <Label htmlFor="verse-reference-ai">
                  <BookOpen className="inline h-4 w-4 mr-1" />
                  Verse Reference (Optional)
                </Label>
                <Input
                  id="verse-reference-ai"
                  placeholder="e.g., John 3:16"
                  value={verseReference}
                  onChange={(e) => setVerseReference(e.target.value)}
                />
              </div>

              {/* Verse Text */}
              {verseReference && (
                <div className="space-y-2">
                  <Label htmlFor="verse-text-ai">Verse Text (Optional)</Label>
                  <Textarea
                    id="verse-text-ai"
                    placeholder="Enter the verse text..."
                    value={verseText}
                    onChange={(e) => setVerseText(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              )}

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags-ai">
                  <Hash className="inline h-4 w-4 mr-1" />
                  Tags (Optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tags-ai"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer">
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

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!content.trim() || isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Share Post'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
