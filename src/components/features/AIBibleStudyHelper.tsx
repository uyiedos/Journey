'use client';

import React, { useState } from 'react';
import { aiService, AIBibleStudy, VIRGO_PERSONA } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BookOpen, Users, Target, Cross, Star, MessageSquare, Lightbulb } from 'lucide-react';

interface AIBibleStudyHelperProps {
  onStudyGenerated?: (study: AIBibleStudy) => void;
}

export function AIBibleStudyHelper({ onStudyGenerated }: AIBibleStudyHelperProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyTopic, setStudyTopic] = useState('');
  const [prayerIntention, setPrayerIntention] = useState('');
  const [generatedStudy, setGeneratedStudy] = useState<AIBibleStudy | null>(null);
  const [prayerGuide, setPrayerGuide] = useState<any>(null);
  const [virgoWisdom, setVirgoWisdom] = useState('');

  const popularTopics = [
    'Prayer', 'Faith', 'Love', 'Hope', 'Forgiveness',
    'Wisdom', 'Patience', 'Joy', 'Peace', 'Trust',
    'Grace', 'Salvation', 'Discipleship', 'Mission', 'Service'
  ];

  const prayerIntentions = [
    'guidance', 'strength', 'healing', 'wisdom', 'peace',
    'protection', 'provision', 'forgiveness', 'gratitude', 'unity'
  ];

  const handleGenerateStudy = async () => {
    if (!studyTopic.trim()) {
      alert('Please enter a topic for the Bible study');
      return;
    }

    setIsGenerating(true);
    try {
      const study = aiService.generateBibleStudy(studyTopic);
      setGeneratedStudy(study);
      alert('Bible study guide generated successfully!');
      onStudyGenerated?.(study);
    } catch (error) {
      console.error('Error generating study:', error);
      alert('Failed to generate Bible study. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePrayer = async () => {
    if (!prayerIntention.trim()) {
      alert('Please enter a prayer intention');
      return;
    }

    try {
      const guide = aiService.getPrayerGuidance(prayerIntention);
      setPrayerGuide(guide);
      alert('Prayer guide generated successfully!');
    } catch (error) {
      console.error('Error generating prayer:', error);
      alert('Failed to generate prayer guide. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Bible Study Helper
          </CardTitle>
          <CardDescription>
            Generate comprehensive Bible study guides and prayer assistance powered by AI.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="study" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="study">Bible Study</TabsTrigger>
          <TabsTrigger value="prayer">Prayer Guide</TabsTrigger>
        </TabsList>

        {/* Bible Study Tab */}
        <TabsContent value="study" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Bible Study Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="study-topic">Study Topic</Label>
                <Input
                  id="study-topic"
                  placeholder="e.g., Prayer, Faith, Love"
                  value={studyTopic}
                  onChange={(e) => setStudyTopic(e.target.value)}
                />
                <div className="flex flex-wrap gap-1">
                  {popularTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="cursor-pointer text-xs"
                      onClick={() => setStudyTopic(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerateStudy} 
                disabled={isGenerating || !studyTopic.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Study Guide...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Generate Bible Study
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Study */}
          {generatedStudy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  {generatedStudy.topic} Study Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Verses */}
                <div>
                  <h4 className="font-semibold mb-3">Key Verses</h4>
                  <div className="space-y-3">
                    {generatedStudy.key_verses.map((verse, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm">{verse.reference}</h5>
                        </div>
                        <p className="text-sm italic text-gray-700 dark:text-gray-300 mb-2">
                          "{verse.text}"
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {verse.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Themes */}
                <div>
                  <h4 className="font-semibold mb-3">Main Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedStudy.main_themes.map((theme, index) => (
                      <Badge key={index} variant="secondary">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Life Application */}
                <div>
                  <h4 className="font-semibold mb-3">Life Application</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {generatedStudy.life_application}
                  </p>
                </div>

                {/* Discussion Questions */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Discussion Questions
                  </h4>
                  <ul className="space-y-2">
                    {generatedStudy.discussion_questions.map((question, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Prayer Guide Tab */}
        <TabsContent value="prayer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Prayer Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prayer-intention">Prayer Intention</Label>
                <Input
                  id="prayer-intention"
                  placeholder="e.g., guidance, strength, healing"
                  value={prayerIntention}
                  onChange={(e) => setPrayerIntention(e.target.value)}
                />
                <div className="flex flex-wrap gap-1">
                  {prayerIntentions.map((intention) => (
                    <Badge
                      key={intention}
                      variant="outline"
                      className="cursor-pointer text-xs"
                      onClick={() => setPrayerIntention(intention)}
                    >
                      {intention}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGeneratePrayer} 
                disabled={!prayerIntention.trim()}
                className="w-full"
              >
                <Target className="mr-2 h-4 w-4" />
                Generate Prayer Guide
              </Button>
            </CardContent>
          </Card>

          {/* Generated Prayer Guide */}
          {prayerGuide && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  {prayerGuide.title}
                </CardTitle>
                <CardDescription>
                  <Badge variant="outline">{prayerGuide.scripture}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prayer Points */}
                <div>
                  <h4 className="font-semibold mb-3">Prayer Points</h4>
                  <ul className="space-y-2">
                    {prayerGuide.prayer_points.map((point: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sample Prayer */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Sample Prayer</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    {prayerGuide.sample_prayer}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
