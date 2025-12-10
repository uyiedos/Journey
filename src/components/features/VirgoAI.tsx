'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, BookOpen, Calendar, User, Star, Cross } from 'lucide-react';
import { aiService, VIRGO_PERSONA } from '@/services/aiService';
import { readingPlanService } from '@/services/readingPlanService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface VirgoAIProps {
  onPlanCreated?: (plan: any) => void;
}

export function VirgoAI({ onPlanCreated }: VirgoAIProps) {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('7');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isCreating, setIsCreating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [virgoMessage, setVirgoMessage] = useState('');

  const handleCreatePlan = async () => {
    if (!user || !topic.trim()) return;

    setIsCreating(true);
    try {
      // Get Virgo's wisdom for the topic
      const wisdom = aiService.getVirgoWisdom(topic);
      setVirgoMessage(wisdom);

      // Create Virgo's divine reading plan
      const virgoPlan = await aiService.createVirgoReadingPlan(
        topic,
        parseInt(duration),
        difficulty,
        user.id
      );

      // Save to Supabase
      const savedPlan = await readingPlanService.createReadingPlan({
        title: virgoPlan.title,
        description: virgoPlan.description,
        duration: virgoPlan.duration,
        difficulty: virgoPlan.difficulty,
        readings: virgoPlan.readings,
        user_id: user.id,
        is_public: true,
      });

      setGeneratedPlan(savedPlan);
      onPlanCreated?.(savedPlan);

    } catch (error) {
      console.error('Error creating Virgo plan:', error);
      setVirgoMessage('My child, I encountered an obstacle in creating your divine reading plan. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Virgo's Introduction */}
      <Card className="border-2 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <Cross className="h-5 w-5 text-blue-600" />
            </div>
            {VIRGO_PERSONA.name} - {VIRGO_PERSONA.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            {VIRGO_PERSONA.greeting}
          </p>
          {virgoMessage && (
            <Alert className="mt-4 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
              <Sparkles className="h-4 w-4" />
              <AlertDescription className="italic">
                {virgoMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Virgo's Plan Creation */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Create Divine Reading Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sacred Topic</label>
            <Input
              placeholder="e.g., Faith, Prayer, Love, Wisdom, Hope..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isCreating}
              className="border-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (Days)</label>
              <Select value={duration} onValueChange={setDuration} disabled={isCreating}>
                <SelectTrigger className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="21">21 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="40">40 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)} disabled={isCreating}>
                <SelectTrigger className="border-2">
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

          <Button 
            onClick={handleCreatePlan}
            disabled={!topic.trim() || isCreating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Divine Plan...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Virgo's Reading Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Plan Preview */}
      {generatedPlan && (
        <Card className="border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Star className="h-5 w-5" />
              Divine Reading Plan Created!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{generatedPlan.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {generatedPlan.description}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{generatedPlan.duration} days</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{generatedPlan.readings?.length || 0} readings</span>
              </div>
              <Badge variant="outline" className="border-green-600 text-green-600">
                {generatedPlan.difficulty}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground italic">
              {VIRGO_PERSONA.signature}
            </div>

            <Button 
              variant="outline" 
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => window.location.href = `/plans/${generatedPlan.id}`}
            >
              View Your Divine Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
