'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { communityService, CommunityPost } from '@/services/communityService';
import { Plus, Hash, X } from 'lucide-react';

interface CreatePostDialogProps {
  children: React.ReactNode;
  onPostCreated?: () => void;
}

export function CreatePostDialog({ children, onPostCreated }: CreatePostDialogProps) {
  const { user: authUser } = useAuth();
  const { user } = useUserData();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postType, setPostType] = useState<CommunityPost['post_type']>('general');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !content.trim()) return;

    setIsSubmitting(true);
    try {
      // Create post using community service
      const post = await communityService.createPost(
        authUser.id,
        content.trim(),
        postType,
        tags.length > 0 ? tags : undefined
      );

      if (post) {
        // Reset form
        setContent('');
        setPostType('general');
        setTags([]);
        setTagInput('');
        setOpen(false);

        // Notify parent component
        onPostCreated?.();

        console.log('Post created successfully:', post);
      }
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
            <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Create New Post
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="create">Create Post</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6 mt-6">
            <Card className="bg-gray-50 dark:bg-gray-800 border-0 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Create Your Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Share your thoughts *</Label>
                    <Textarea
                      id="content"
                      placeholder="What's on your mind? Share your spiritual journey, insights, or prayer requests..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[120px] resize-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 rounded-lg"
                      required
                    />
                  </div>

                  {/* Post Type */}
                  <div className="space-y-2">
                    <Label htmlFor="post-type" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Post Type</Label>
                    <Select value={postType} onValueChange={(value: CommunityPost['post_type']) => setPostType(value)}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 rounded-lg">
                        <SelectValue placeholder="Select post type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Post</SelectItem>
                        <SelectItem value="prayer_request">Prayer Request</SelectItem>
                        <SelectItem value="testimony">Testimony</SelectItem>
                        <SelectItem value="verse_share">Verse Share</SelectItem>
                        <SelectItem value="question">Question</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Tags (Optional)
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="tags"
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 rounded-lg"
                      />
                      <Button type="button" onClick={handleAddTag} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
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

                  {/* Preview */}
                  {content && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preview</Label>
                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md rounded-xl">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {postType.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm">
                              {content}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>By {user?.username || 'Guest'}</span>
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
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!content.trim() || isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold">
                      {isSubmitting ? 'Posting...' : 'Share Post'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
