'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Save, Calendar, Clock, Users, Sparkles, Loader2 } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { aiService } from '@/services/aiService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface CreateReadingPlanProps {
  onSave?: (plan: any) => void;
  onCancel?: () => void;
}

export function CreateReadingPlan({ onSave, onCancel }: CreateReadingPlanProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [readings, setReadings] = useState<any[]>([]);
  const [newReading, setNewReading] = useState({ title: '', passages: '', devotional: '' });
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  
  const { user } = useAuth();

  const handleAddReading = () => {
    if (newReading.title && newReading.passages) {
      setReadings([...readings, {
        id: 'reading-' + Date.now(),
        day: readings.length + 1,
        title: newReading.title,
        passages: newReading.passages.split(',').map((p: string) => p.trim()),
        devotional: newReading.devotional,
        completed: false
      }]);
      setNewReading({ title: '', passages: '', devotional: '' });
    }
  };

  const handleRemoveReading = (index: number) => {
    setReadings(readings.filter((_, i) => i !== index));
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) return;

    setIsGenerating(true);
    try {
      const readingPlan = aiService.generateReadingPlanFromTemplate({
        topic: aiTopic,
        duration: parseInt(duration) || 7,
        difficulty: difficulty
      });
      
      setTitle(readingPlan.title);
      setDescription(readingPlan.description);
      setDuration(readingPlan.duration.toString());
      setDifficulty(readingPlan.difficulty);
      
      // Convert AI readings to component format
      const formattedReadings = readingPlan.readings.map((reading, index) => ({
        id: 'reading-' + Date.now() + index,
        day: reading.day,
        title: reading.title,
        passages: reading.passages,
        devotional: reading.devotional,
        completed: false
      }));
      
      setReadings(formattedReadings);
      
    } catch (error) {
      console.error('Error generating AI reading plan:', error);
      alert('Failed to generate reading plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    if (!title || !duration || readings.length === 0) {
      alert('Please fill in all required fields and add at least one reading');
      return;
    }

    try {
      setLoading(true);
      
      // Create reading plan in Supabase
      const result = await supabaseService.createReadingPlan(user.id, {
        title,
        description,
        duration: parseInt(duration),
        difficulty,
        is_public: true
      });

      if (result) {
        // Award points for creating reading plan
        await supabaseService.addPoints(user.id, 15);
        
        if (onSave) {
          onSave(result);
        }
      } else {
        console.error('Failed to create reading plan');
      }
    } catch (error) {
      console.error('Error creating reading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Create Reading Plan</span>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Plan'}
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
              <label className="text-sm font-medium">Title</label>
              <Input
            placeholder="Enter plan title..."
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="Describe your reading plan..."
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Duration and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (days)</label>
            <Input
              type="number"
              placeholder="30"
              value={duration}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Readings */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Daily Readings</label>
          
          {/* Add new reading */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Day title..."
                value={newReading.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReading({...newReading, title: e.target.value})}
              />
              <Input
                placeholder="Bible passages (e.g., John 3:1-21, Romans 8:28-39)"
                value={newReading.passages}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReading({...newReading, passages: e.target.value})}
              />
              <Textarea
                placeholder="Optional devotional thought..."
                value={newReading.devotional}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewReading({...newReading, devotional: e.target.value})}
                rows={2}
              />
              <Button type="button" onClick={handleAddReading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Reading
              </Button>
            </CardContent>
          </Card>

          {/* Existing readings */}
          {readings.map((reading, index) => (
            <Card key={reading.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Day {reading.day}</Badge>
                      <h4 className="font-semibold">{reading.title}</h4>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Passages:</strong> {reading.passages.join(', ')}
                    </div>
                    {reading.devotional && (
                      <div className="text-sm text-muted-foreground italic">
                        {reading.devotional}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveReading(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview */}
        {(title || description || readings.length > 0) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{title || 'Untitled Plan'}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {description || 'No description...'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{duration || 0} days</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{difficulty}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>0 participants</span>
                  </div>
                </div>
                <Badge variant="secondary">
                  {readings.length} reading{readings.length !== 1 ? 's' : ''}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Input
                    placeholder="e.g., Prayer, Faith, Forgiveness..."
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (days)</label>
                  <Input
                    type="number"
                    placeholder="7"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
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
                    Generate Reading Plan
                  </>
                )}
              </Button>

              {(title || readings.length > 0) && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Generated Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Generated title will appear here..."
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Generated Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Generated description will appear here..."
                      className="min-h-[100px]"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Generated Readings ({readings.length})</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {readings.map((reading, index) => (
                        <Card key={reading.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">Day {reading.day}</Badge>
                                  <h4 className="font-semibold text-sm">{reading.title}</h4>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <strong>Passages:</strong> {reading.passages.join(', ')}
                                </div>
                                {reading.devotional && (
                                  <div className="text-xs text-muted-foreground italic mt-1">
                                    {reading.devotional.substring(0, 100)}...
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveReading(index)}
                                disabled={loading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
