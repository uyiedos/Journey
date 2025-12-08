'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { AIReadingPlanGenerator } from '@/components/features/AIReadingPlanGenerator';
import { AIDevotionalGenerator } from '@/components/features/AIDevotionalGenerator';
import { AIBibleStudyHelper } from '@/components/features/AIBibleStudyHelper';
import { VirgoAI } from '@/components/features/VirgoAI';
import { AskVirgo } from '@/components/features/AskVirgo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Heart, BookOpen, Lightbulb, Cross, Star, MessageCircle } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AIToolsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Cross className="h-8 w-8 text-purple-600" />
            Virgo AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Meet Virgo, Master of Scriptures - Your divine guide for personalized spiritual content creation
          </p>
        </div>

        <AuthGuard action="ai-tools">
          <Tabs defaultValue="virgo" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ask-virgo" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Ask Virgo
              </TabsTrigger>
              <TabsTrigger value="virgo" className="flex items-center gap-2">
                <Cross className="h-4 w-4" />
                Divine Plans
              </TabsTrigger>
              <TabsTrigger value="devotionals" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Devotionals
              </TabsTrigger>
              <TabsTrigger value="bible-study" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Bible Study
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ask-virgo">
              <AskVirgo />
            </TabsContent>

            <TabsContent value="virgo">
              <VirgoAI />
            </TabsContent>

            <TabsContent value="devotionals">
              <AIDevotionalGenerator />
            </TabsContent>

            <TabsContent value="bible-study">
              <AIBibleStudyHelper />
            </TabsContent>
          </Tabs>
        </AuthGuard>
      </div>
    </Layout>
  );
}
