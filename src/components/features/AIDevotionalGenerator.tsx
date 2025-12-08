'use client';

import React, { useState } from 'react';
import { aiService, AIDevotional, VIRGO_PERSONA } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Heart, BookOpen, MessageSquare, Cross, Star } from 'lucide-react';

interface AIDevotionalGeneratorProps {
  onDevotionalGenerated?: (devotional: AIDevotional) => void;
}

export function AIDevotionalGenerator({ onDevotionalGenerated }: AIDevotionalGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    verse: '',
    theme: '',
    custom_request: ''
  });
  const [generatedDevotional, setGeneratedDevotional] = useState<AIDevotional | null>(null);
  const [virgoWisdom, setVirgoWisdom] = useState('');

  const popularVerses = [
    'Philippians 4:6-7',
    'Jeremiah 29:11',
    'Isaiah 41:10',
    'Romans 8:28',
    'Proverbs 3:5-6',
    'Matthew 11:28',
    '2 Corinthians 12:9',
    'Psalm 23:1-6'
  ];

  const popularThemes = [
    'Peace', 'Trust', 'Strength', 'Hope', 'Guidance',
    'Comfort', 'Wisdom', 'Courage', 'Forgiveness', 'Joy'
  ];

  const handleGenerate = async () => {
    if (!formData.verse.trim() && !formData.theme.trim()) {
      alert('Please enter a verse or theme for the devotional');
      return;
    }

    setIsGenerating(true);
    try {
      // Get Virgo's wisdom for the theme
      const wisdom = aiService.getVirgoWisdom(formData.theme || 'devotional');
      setVirgoWisdom(wisdom);

      const devotional = aiService.generateDevotional(
        formData.verse || '',
        formData.theme || ''
      );

      // Enhance devotional with Virgo's signature
      const virgoDevotional = {
        ...devotional,
        main_message: `${devotional.main_message}\n\n${VIRGO_PERSONA.signature}`,
        prayer: `${devotional.prayer}\n\n${VIRGO_PERSONA.signature}`,
        application: `${devotional.application}\n\nGuided by Virgo, Master of Scriptures`
      };

      setGeneratedDevotional(virgoDevotional);
      onDevotionalGenerated?.(virgoDevotional);
    } catch (error) {
      console.error('Error generating devotional:', error);
      alert('Failed to generate devotional. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDevotional = async () => {
    if (!generatedDevotional) return;

    try {
      const response = await fetch('/api/devotionals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: generatedDevotional.title,
          verse: generatedDevotional.verse,
          verse_text: generatedDevotional.verse_text,
          content: generatedDevotional.main_message,
          application: generatedDevotional.application,
          prayer: generatedDevotional.prayer,
          reflection_questions: generatedDevotional.reflection_questions,
          is_public: false
        }),
      });

      if (response.ok) {
        alert('Devotional saved successfully!');
      } else {
        throw new Error('Failed to save devotional');
      }
    } catch (error) {
      console.error('Error saving devotional:', error);
      alert('Failed to save devotional');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Virgo's Introduction */}
      <Card className="border-2 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="flex items-center gap-2">
              <Cross className="h-6 w-6 text-purple-600" />
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            Virgo's Devotional Ministry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            {VIRGO_PERSONA.greeting}
          </p>
          {virgoWisdom && (
            <Alert className="mt-4 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
              <Star className="h-4 w-4" />
              <AlertDescription className="italic">
                {virgoWisdom}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Divine Devotional Generator
          </CardTitle>
          <CardDescription>
            Create meaningful devotionals guided by Virgo's divine wisdom and scripture knowledge.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="verse">Scripture Verse</Label>
              <Input
                id="verse"
                placeholder="e.g., Philippians 4:6-7"
                value={formData.verse}
                onChange={(e) => setFormData(prev => ({ ...prev, verse: e.target.value }))}
              />
              <div className="flex flex-wrap gap-1">
                {popularVerses.map((verse) => (
                  <Badge
                    key={verse}
                    variant="outline"
                    className="cursor-pointer text-xs"
                    onClick={() => setFormData(prev => ({ ...prev, verse }))}
                  >
                    {verse}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                placeholder="e.g., Peace, Trust, Strength"
                value={formData.theme}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
              />
              <div className="flex flex-wrap gap-1">
                {popularThemes.map((theme) => (
                  <Badge
                    key={theme}
                    variant="outline"
                    className="cursor-pointer text-xs"
                    onClick={() => setFormData(prev => ({ ...prev, theme }))}
                  >
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_request">Custom Request (optional)</Label>
            <Textarea
              id="custom_request"
              placeholder="Any specific focus, audience, or style preferences..."
              value={formData.custom_request}
              onChange={(e) => setFormData(prev => ({ ...prev, custom_request: e.target.value }))}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || (!formData.verse.trim() && !formData.theme.trim())}
            className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Virgo is creating...
              </>
            ) : (
              <>
                <Cross className="mr-2 h-4 w-4" />
                Generate Divine Devotional
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Devotional Preview */}
      {generatedDevotional && (
        <Card className="border-2 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                {generatedDevotional.title}
              </span>
              <Button onClick={handleSaveDevotional} size="sm" className="bg-purple-600 hover:bg-purple-700">
                Save Devotional
              </Button>
            </CardTitle>
            <CardDescription>
              <Badge variant="outline" className="border-purple-600 text-purple-600">{generatedDevotional.verse}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scripture */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Scripture
              </h4>
              <p className="text-sm italic text-gray-700 dark:text-gray-300">
                "{generatedDevotional.verse_text}"
              </p>
              <p className="text-xs text-gray-500 mt-2">— {generatedDevotional.verse}</p>
            </div>

            {/* Main Message */}
            <div>
              <h4 className="font-semibold mb-2">Main Message</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {generatedDevotional.main_message}
              </p>
            </div>

            {/* Application */}
            <div>
              <h4 className="font-semibold mb-2">Life Application</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {generatedDevotional.application}
              </p>
            </div>

            {/* Reflection Questions */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Reflection Questions
              </h4>
              <ul className="space-y-2">
                {generatedDevotional.reflection_questions.map((question, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {question}
                  </li>
                ))}
              </ul>
            </div>

            {/* Prayer */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Prayer</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                {generatedDevotional.prayer}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
