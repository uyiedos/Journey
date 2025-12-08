'use client';

import React, { useState } from 'react';
import { aiService, AIReadingPlan } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, BookOpen, Calendar, Target } from 'lucide-react';

interface AIReadingPlanGeneratorProps {
  onPlanGenerated?: (plan: AIReadingPlan) => void;
}

export function AIReadingPlanGenerator({ onPlanGenerated }: AIReadingPlanGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    duration: 7,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    focus_areas: '',
    custom_request: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState<AIReadingPlan | null>(null);
  const [aiCapabilities, setAiCapabilities] = useState<any>(null);

  React.useEffect(() => {
    // Load AI capabilities
    const capabilities = aiService.getCapabilities();
    setAiCapabilities(capabilities);
  }, []);

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      alert('Please enter a topic for your reading plan');
      return;
    }

    setIsGenerating(true);
    try {
      const plan = await aiService.generateReadingPlanWithAI({
        topic: formData.topic,
        duration: formData.duration,
        difficulty: formData.difficulty,
        focus_areas: formData.focus_areas ? formData.focus_areas.split(',').map(s => s.trim()) : []
      });

      setGeneratedPlan(plan);
      alert('Reading plan generated successfully!');
      onPlanGenerated?.(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate reading plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;

    try {
      const response = await fetch('/api/reading-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: generatedPlan.title,
          description: generatedPlan.description,
          duration: generatedPlan.duration,
          difficulty: generatedPlan.difficulty,
          readings: generatedPlan.readings.map((reading, index) => ({
            day: index + 1,
            title: reading.title,
            passages: reading.passages,
            devotional: reading.devotional
          })),
          is_public: false
        }),
      });

      if (response.ok) {
        alert('Reading plan saved successfully!');
      } else {
        throw new Error('Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save reading plan');
    }
  };

  const popularTopics = [
    'Prayer', 'Faith', 'Love', 'Hope', 'Forgiveness', 
    'Wisdom', 'Patience', 'Joy', 'Peace', 'Trust'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Reading Plan Generator
          </CardTitle>
          <CardDescription>
            Create personalized reading plans powered by AI. No API keys required!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiCapabilities && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                {aiCapabilities.localProcessing ? 'Local AI' : 'Template-based'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {aiCapabilities.readingPlanGeneration ? 'Reading Plans' : ''}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {aiCapabilities.devotionalGeneration ? 'Devotionals' : ''}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Reading Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Prayer, Faith, Love"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              />
              <div className="flex flex-wrap gap-1">
                {popularTopics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="outline"
                    className="cursor-pointer text-xs"
                    onClick={() => setFormData(prev => ({ ...prev, topic }))}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                  setFormData(prev => ({ ...prev, difficulty: value }))
                }
              >
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

            <div className="space-y-2">
              <Label htmlFor="focus_areas">Focus Areas (optional)</Label>
              <Input
                id="focus_areas"
                placeholder="e.g., patience, wisdom, gratitude"
                value={formData.focus_areas}
                onChange={(e) => setFormData(prev => ({ ...prev, focus_areas: e.target.value }))}
              />
              <p className="text-xs text-gray-500">Separate multiple areas with commas</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_request">Custom Request (optional)</Label>
            <Textarea
              id="custom_request"
              placeholder="Any specific themes, scriptures, or preferences you'd like included..."
              value={formData.custom_request}
              onChange={(e) => setFormData(prev => ({ ...prev, custom_request: e.target.value }))}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !formData.topic.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Reading Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Plan Preview */}
      {generatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                {generatedPlan.title}
              </span>
              <Button onClick={handleSavePlan} size="sm">
                Save Plan
              </Button>
            </CardTitle>
            <CardDescription>{generatedPlan.description}</CardDescription>
            <div className="flex gap-2">
              <Badge variant="outline">{generatedPlan.duration} days</Badge>
              <Badge variant="outline">{generatedPlan.difficulty}</Badge>
              {generatedPlan.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Daily Readings
              </h4>
              <div className="grid gap-3">
                {generatedPlan.readings.slice(0, 3).map((reading) => (
                  <div key={reading.day} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">Day {reading.day}: {reading.title}</h5>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Passages:</strong> {reading.passages.join(', ')}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {reading.devotional}
                    </p>
                  </div>
                ))}
                {generatedPlan.readings.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    ... and {generatedPlan.readings.length - 3} more days
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
