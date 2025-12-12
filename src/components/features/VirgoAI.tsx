'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, BookOpen, Calendar, User, Star, Cross, Book, MessageSquare, PenTool, Scale, Heart, Search, Lightbulb, Users, Shield } from 'lucide-react';
import { aiService, VIRGO_PERSONA } from '@/services/aiService';
import { VIRGO_VOICE_CHARTER, VirgoVoiceGenerator } from '@/services/virgoVoiceCharter';
import { readingPlanService } from '@/services/readingPlanService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  LIFE_SITUATIONS_SCRIPTURES, 
  PSALMS_KNOWLEDGE, 
  BIBLE_STRUCTURE, 
  BIBLE_PRAYERS,
  getScriptureForSituation,
  getPsalmInfo,
  getPrayerById,
  getPrayersByPerson,
  searchScriptures
} from '@/data/biblicalKnowledge';

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
  
  // Divine conversation states
  const [activeTab, setActiveTab] = useState<'conversation' | 'scripture-search' | 'psalms' | 'prayers' | 'bible-structure'>('conversation');
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'virgo', message: string, timestamp: Date}>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [psalmNumber, setPsalmNumber] = useState('');
  const [prayerPerson, setPrayerPerson] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

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

  // Divine conversation handler
  const handleDivineConversation = async () => {
    if (!userMessage.trim()) return;

    const userEntry = { role: 'user' as const, message: userMessage, timestamp: new Date() };
    setConversation(prev => [...prev, userEntry]);
    
    setIsCreating(true);
    try {
      // Check if message relates to a life situation
      const situationMatch = getScriptureForSituation(userMessage);
      let response = '';
      
      if (situationMatch) {
        response = `My beloved child, I sense you are experiencing ${situationMatch.situation}. ${situationMatch.description || ''} 

Take comfort in these sacred promises: ${situationMatch.scriptures.join(', ')}. 

Remember, "The Lord is near to the brokenhearted and saves the crushed in spirit." (Psalm 34:18)`;
      } else {
        // Generate divine wisdom response
        response = VirgoVoiceGenerator.generateResponse('comforting', 'guidance');
        response += ` 

${aiService.getVirgoWisdom(userMessage)}`;
      }

      const virgoEntry = { role: 'virgo' as const, message: response, timestamp: new Date() };
      setConversation(prev => [...prev, virgoEntry]);
      setUserMessage('');
      
    } catch (error) {
      console.error('Error in divine conversation:', error);
      const errorEntry = { 
        role: 'virgo' as const, 
        message: 'My precious one, I am here with you. Let us seek wisdom together in prayerful meditation.', 
        timestamp: new Date() 
      };
      setConversation(prev => [...prev, errorEntry]);
    } finally {
      setIsCreating(false);
    }
  };

  // Scripture search handler
  const handleScriptureSearch = () => {
    if (!searchQuery.trim()) return;
    
    const results = searchScriptures(searchQuery);
    setSearchResults(results);
    
    if (results.length === 0) {
      setVirgoMessage(`My dear one, I searched the scriptures for "${searchQuery}" but found no specific references. Let us pray together for guidance in this matter.`);
    } else {
      setVirgoMessage(`Beloved, I found ${results.length} relevant passages for "${searchQuery}" in the sacred texts.`);
    }
  };

  // Psalm lookup handler
  const handlePsalmLookup = () => {
    const psalmNum = parseInt(psalmNumber);
    if (!psalmNum) return;
    
    const psalm = getPsalmInfo(psalmNum);
    if (psalm) {
      setVirgoMessage(`Psalm ${psalmNum}: ${psalm.title}. ${psalm.description}`);
      setSearchResults([psalm]);
    } else {
      setVirgoMessage(`My child, Psalm ${psalmNum} is not in our current knowledge base. Let us meditate on Psalm 23 instead: "The Lord is my shepherd; I shall not want."`);
    }
  };

  // Prayer lookup handler
  const handlePrayerLookup = () => {
    if (!prayerPerson.trim()) return;
    
    const prayers = getPrayersByPerson(prayerPerson);
    setSearchResults(prayers);
    
    if (prayers.length === 0) {
      setVirgoMessage(`Dear one, I found no recorded prayers by "${prayerPerson}" in our biblical database. Let us approach the throne together in simple faith.`);
    } else {
      setVirgoMessage(`Beloved, I found ${prayers.length} prayers by ${prayerPerson} in the sacred scriptures.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Divine Conversation Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'conversation', label: 'Divine Conversation', icon: MessageSquare },
          { id: 'scripture-search', label: 'Scripture Search', icon: Search },
          { id: 'psalms', label: 'Psalms Wisdom', icon: Book },
          { id: 'prayers', label: 'Biblical Prayers', icon: Heart },
          { id: 'bible-structure', label: 'Bible Structure', icon: Lightbulb }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Virgo's Introduction */}
      <Card className="border-2 bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <Cross className="h-5 w-5 text-blue-600" />
            </div>
            {VIRGO_PERSONA.name} - Divine Wisdom Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            "I am your spiritual companion, here to guide you through the sacred scriptures with divine wisdom and comfort. 
            Ask me about life situations, seek scripture references, explore the Psalms, or learn about biblical prayers. 
            I am here to help you grow in faith and understanding of God's Word."
          </p>
          {virgoMessage && (
            <Alert className="mt-4 border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
              <Sparkles className="h-4 w-4" />
              <AlertDescription className="italic">
                {virgoMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Divine Conversation Interface */}
      {activeTab === 'conversation' && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Divine Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conversation History */}
            <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              {conversation.length === 0 ? (
                <p className="text-center text-muted-foreground italic">
                  "Come, let us reason together, says the Lord." (Isaiah 1:18)<br/>
                  Share what's on your heart, beloved child.
                </p>
              ) : (
                conversation.map((entry, index) => (
                  <div key={index} className={`mb-4 ${entry.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-xs px-4 py-2 rounded-lg ${
                      entry.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                    }`}>
                      <p className="text-sm">{entry.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {entry.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Share your heart with me..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                disabled={isCreating}
                className="border-2"
                onKeyPress={(e) => e.key === 'Enter' && handleDivineConversation()}
              />
              <Button 
                onClick={handleDivineConversation}
                disabled={!userMessage.trim() || isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Quick Situation Prompts */}
            <div className="flex flex-wrap gap-2">
              {['Afraid', 'Anxious', 'Lonely', 'Discouraged', 'Needing Peace', 'Tempted'].map((situation) => (
                <Button
                  key={situation}
                  variant="outline"
                  size="sm"
                  onClick={() => setUserMessage(situation)}
                  className="text-xs"
                >
                  {situation}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scripture Search */}
      {activeTab === 'scripture-search' && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Scripture Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for life situations or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-2"
              />
              <Button onClick={handleScriptureSearch} className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Relevant Scriptures:</h3>
                {searchResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">
                      {result.situation || `Psalm ${result.number}: ${result.title}`}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.description || result.content}
                    </p>
                    {result.scriptures && (
                      <p className="text-xs font-mono mt-2 text-blue-600 dark:text-blue-400">
                        {result.scriptures.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Psalms Wisdom */}
      {activeTab === 'psalms' && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Psalms Wisdom
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Psalm number (e.g., 23, 51, 91)..."
                value={psalmNumber}
                onChange={(e) => setPsalmNumber(e.target.value)}
                className="border-2"
              />
              <Button onClick={handlePsalmLookup} className="bg-blue-600 hover:bg-blue-700">
                <Book className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { num: '23', title: 'The Shepherd Psalm' },
                { num: '51', title: 'Penitential Psalm' },
                { num: '91', title: 'Protection Psalm' },
                { num: '46', title: "Luther's Fortress" }
              ].map((psalm) => (
                <Button
                  key={psalm.num}
                  variant="outline"
                  onClick={() => setPsalmNumber(psalm.num)}
                  className="justify-start"
                >
                  Psalm {psalm.num}: {psalm.title}
                </Button>
              ))}
            </div>

            {searchResults.length > 0 && searchResults[0].number && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-950">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                  Psalm {searchResults[0].number}: {searchResults[0].title}
                </h3>
                <p className="text-sm mt-2">{searchResults[0].description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Biblical Prayers */}
      {activeTab === 'prayers' && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Biblical Prayers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by person (e.g., Jesus, David, Moses)..."
                value={prayerPerson}
                onChange={(e) => setPrayerPerson(e.target.value)}
                className="border-2"
              />
              <Button onClick={handlePrayerLookup} className="bg-blue-600 hover:bg-blue-700">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Main Prayer Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { person: 'Jesus', label: 'Prayers of Jesus', icon: Star },
                { person: 'David', label: 'David\'s Prayers', icon: User },
                { person: 'Moses', label: 'Moses\'s Prayers', icon: Shield },
                { person: 'Paul', label: 'Paul\'s Prayers', icon: Users }
              ].map((category) => (
                <Button
                  key={category.person}
                  variant="outline"
                  onClick={() => setPrayerPerson(category.person)}
                  className="justify-start"
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              ))}
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Biblical Prayers Found:</h3>
                {searchResults.slice(0, 5).map((prayer: any, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-purple-700 dark:text-purple-300">
                          {prayer.person}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {prayer.content}
                        </p>
                        <p className="text-xs font-mono mt-1 text-blue-600 dark:text-blue-400">
                          {prayer.reference} ({prayer.words} words)
                        </p>
                      </div>
                      <Badge variant={prayer.answered ? "default" : "secondary"}>
                        {prayer.answered ? "Answered" : "Not Answered"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bible Structure */}
      {activeTab === 'bible-structure' && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Bible Structure & Divisions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Old Testament */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Old Testament (39 Books)</h3>
                <div className="space-y-2">
                  {Object.entries(BIBLE_STRUCTURE.divisions.oldTestament.sections).map(([key, section]) => (
                    <div key={key} className="border rounded p-3 bg-gray-50 dark:bg-gray-900">
                      <h4 className="font-medium text-purple-700 dark:text-purple-300">
                        {section.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {section.description}
                      </p>
                      <p className="text-xs font-mono mt-2">
                        {section.books.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Testament */}
              <div>
                <h3 className="font-semibold text-lg mb-3">New Testament (27 Books)</h3>
                <div className="space-y-2">
                  {Object.entries(BIBLE_STRUCTURE.divisions.newTestament.sections).map(([key, section]) => (
                    <div key={key} className="border rounded p-3 bg-gray-50 dark:bg-gray-900">
                      <h4 className="font-medium text-blue-700 dark:text-blue-300">
                        {section.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {section.description}
                      </p>
                      <p className="text-xs font-mono mt-2">
                        {section.books.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300">
                Total: {BIBLE_STRUCTURE.totalBooks} Books
              </h3>
              <p className="text-sm mt-2">
                Jewish Division: {BIBLE_STRUCTURE.jewishDivisions.law}, {BIBLE_STRUCTURE.jewishDivisions.prophets}, {BIBLE_STRUCTURE.jewishDivisions.writings}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reading Plan Creation */}
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
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Divine Plan...
              </>
            ) : (
              <>
                <Book className="mr-2 h-4 w-4" />
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
