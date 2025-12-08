'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cross, Star, Heart, Send, Loader2, BookOpen, MessageCircle, Church, Users } from 'lucide-react';
import { VIRGO_PERSONA } from '@/services/aiService';

interface ChatMessage {
  id: string;
  type: 'user' | 'virgo';
  content: string;
  timestamp: Date;
  category?: string;
}

interface AskVirgoProps {
  className?: string;
}

export function AskVirgo({ className }: AskVirgoProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'virgo',
      content: `${VIRGO_PERSONA.greeting}

I am here to guide you through your spiritual journey and answer your questions about faith, scripture, and the Christian path. Whether you seek understanding about the Bible, guidance for your walk with God, or answers about the Journey app features, I am here to help you grow in your divine relationship with the Trinity.`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const questionCategories = [
    { name: 'Journey App', icon: <Users className="h-3 w-3" />, color: 'bg-blue-100 text-blue-800' },
    { name: 'Bible & Scripture', icon: <BookOpen className="h-3 w-3" />, color: 'bg-purple-100 text-purple-800' },
    { name: 'Christian Faith', icon: <Cross className="h-3 w-3" />, color: 'bg-green-100 text-green-800' },
    { name: 'Prayer & Devotion', icon: <Heart className="h-3 w-3" />, color: 'bg-red-100 text-red-800' },
    { name: 'Spiritual Growth', icon: <Star className="h-3 w-3" />, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Church & Community', icon: <Church className="h-3 w-3" />, color: 'bg-indigo-100 text-indigo-800' }
  ];

  const popularQuestions = [
    'How do I start using the Journey app?',
    'What does it mean to be born again?',
    'How can I deepen my prayer life?',
    'What are the spiritual disciplines?',
    'How do I read the Bible effectively?',
    'What is God\'s purpose for my life?',
    'How do I share my faith with others?',
    'What is the Trinity?'
  ];

  const generateVirgoResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Journey App specific responses
    if (lowerMessage.includes('journey') || lowerMessage.includes('app') || lowerMessage.includes('how to use')) {
      return getJourneyAppResponse(lowerMessage);
    }
    
    // Christian faith responses
    if (lowerMessage.includes('faith') || lowerMessage.includes('believe') || lowerMessage.includes('christian')) {
      return getFaithResponse(lowerMessage);
    }
    
    // Bible responses
    if (lowerMessage.includes('bible') || lowerMessage.includes('scripture') || lowerMessage.includes('read')) {
      return getBibleResponse(lowerMessage);
    }
    
    // Prayer responses
    if (lowerMessage.includes('pray') || lowerMessage.includes('prayer') || lowerMessage.includes('devotion')) {
      return getPrayerResponse(lowerMessage);
    }
    
    // Spiritual growth responses
    if (lowerMessage.includes('grow') || lowerMessage.includes('spiritual') || lowerMessage.includes('discipline')) {
      return getGrowthResponse(lowerMessage);
    }
    
    // Church responses
    if (lowerMessage.includes('church') || lowerMessage.includes('community') || lowerMessage.includes('fellowship')) {
      return getChurchResponse(lowerMessage);
    }
    
    // Default response
    return `My child, your question touches upon the divine mysteries of our faith. Through the wisdom granted by the Holy Trinity, I would encourage you to seek God's guidance in prayer and meditation on His Word.

Remember that "the fear of the Lord is the beginning of wisdom" (Proverbs 9:10). As you continue your spiritual journey, trust that God will reveal His truth to you in His perfect timing. ${VIRGO_PERSONA.signature}

Is there a specific aspect of your faith or the Journey app that you'd like me to elaborate on?`;
  };

  const getJourneyAppResponse = (message: string): string => {
    if (message.includes('start') || message.includes('begin')) {
      return `Welcome to your Journey with Christ! The Journey app is designed to be your companion in spiritual growth. Here's how to begin:

1. **Create Your Profile**: Set up your account to track your progress
2. **Explore Reading Plans**: Choose from our curated Bible reading plans
3. **Join Daily Devotionals**: Start your day with guided reflections
4. **Connect with Community**: Share your journey with fellow believers
5. **Track Your Growth**: Monitor your spiritual progress and achievements

The app features like reading plans, devotionals, and community features are all designed to help you grow deeper in your relationship with God. ${VIRGO_PERSONA.signature}

Would you like me to guide you through any specific feature?`;
    }
    
    return `The Journey app is your digital sanctuary for spiritual growth. It offers reading plans, daily devotionals, community fellowship, and tools to deepen your faith. Each feature is designed to help you draw closer to God and build meaningful relationships with other believers. ${VIRGO_PERSONA.signature}`;
  };

  const getFaithResponse = (message: string): string => {
    if (message.includes('born again') || message.includes('salvation')) {
      return `Being born again is the beautiful transformation that occurs when we accept Jesus Christ as our Lord and Savior. As Jesus told Nicodemus in John 3:3, "Very truly I tell you, no one can see the kingdom of God unless they are born again."

This spiritual rebirth happens when:
1. We acknowledge our need for a Savior
2. We believe that Jesus died for our sins
3. We confess Him as Lord
4. We receive the Holy Spirit into our hearts

It's not about physical birth, but a spiritual renewal that makes us children of God. ${VIRGO_PERSONA.signature}

Would you like to understand more about this beautiful transformation?`;
    }
    
    return `Christian faith is a living relationship with God through Jesus Christ, empowered by the Holy Spirit. It's not just about beliefs, but about trust, obedience, and love that flows from our connection to the Divine Trinity. ${VIRGO_PERSONA.signature}`;
  };

  const getBibleResponse = (message: string): string => {
    if (message.includes('how to read') || message.includes('effectively')) {
      return `Reading the Bible effectively is a spiritual discipline that requires both method and heart. Here's how to approach God's Word:

1. **Pray First**: Ask the Holy Spirit to illuminate the text
2. **Choose a Plan**: Start with a reading plan that fits your schedule
3. **Read Slowly**: Don't rush - let the words sink into your heart
4. **Meditate**: Ponder what the text means for your life
5. **Apply**: Put God's Word into practice
6. **Journal**: Write down insights and prayers

Remember, the Bible is not just a book to be read, but God's living Word to be experienced. ${VIRGO_PERSONA.signature}

Would you like suggestions for a specific reading plan?`;
    }
    
    return `The Bible is God's inspired Word, a divine library that reveals His character, His will, and His redemptive plan through Jesus Christ. Each book points to the greater story of God's love and salvation. ${VIRGO_PERSONA.signature}`;
  };

  const getPrayerResponse = (message: string): string => {
    return `Prayer is the sacred conversation between your soul and the Divine Trinity. To deepen your prayer life:

1. **Set Regular Times**: Establish daily prayer habits
2. **Use the Lord's Prayer**: Jesus gave us a perfect model
3. **Pray Scripture**: Turn Bible verses into prayers
4. **Listen**: Prayer is a dialogue, not just monologue
5. **Keep a Prayer Journal**: Track God's faithfulness
6. **Pray with Others**: Join in corporate prayer

Remember that "the prayer of a righteous person is powerful and effective" (James 5:16). ${VIRGO_PERSONA.signature}`;
  };

  const getGrowthResponse = (message: string): string => {
    return `Spiritual growth is the journey of becoming more like Christ through the power of the Holy Spirit. Key spiritual disciplines include:

1. **Bible Study**: Feeding on God's Word
2. **Prayer**: Communion with God
3. **Worship**: Giving God glory
4. **Fellowship**: Community with believers
5. **Service**: Using your gifts for others
6. **Evangelism**: Sharing your faith
7. **Stewardship**: Managing God's resources

Growth happens gradually, like a seed becoming a tree. Trust God's timing and process. ${VIRGO_PERSONA.signature}`;
  };

  const getChurchResponse = (message: string): string => {
    return `The Church is the body of Christ on earth, a community of believers called to worship, fellowship, and mission. As Hebrews 10:24-25 reminds us, we should "consider how we may spur one another on toward love and good deeds, not giving up meeting together."

The Church exists to:
1. **Worship God**: Give Him glory and honor
2. **Build Disciples**: Help believers grow
3. **Share the Gospel**: Reach the lost
4. **Serve Others**: Demonstrate God's love
5. **Build Community**: Support one another

Finding a healthy church community is vital for your spiritual journey. ${VIRGO_PERSONA.signature}`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      category: currentCategory
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setCurrentCategory('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const virgoResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'virgo',
      content: await generateVirgoResponse(input),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, virgoResponse]);
    setIsTyping(false);
  };

  const handleCategoryClick = (category: string) => {
    setCurrentCategory(category);
    setInput(`I have a question about ${category}...`);
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Virgo's Introduction */}
      <Card className="border-2 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="flex items-center gap-2">
              <Cross className="h-6 w-6 text-purple-600" />
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            Ask Virgo - Divine Wisdom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            Ask Virgo anything about the Journey app, Christian faith, Bible study, prayer, 
            spiritual growth, or church life. Receive guidance rooted in scripture and divine wisdom.
          </p>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              Divine Conversation
            </CardTitle>
            <Badge variant="outline" className="border-purple-600 text-purple-600">
              Virgo AI
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="h-[400px] w-full rounded-lg border p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-muted border-2 border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.type === 'virgo' && <Star className="h-4 w-4 text-purple-600" />}
                      <span className="text-xs font-medium">
                        {message.type === 'virgo' ? 'Virgo' : 'You'}
                      </span>
                      {message.category && (
                        <Badge variant="outline" className="text-xs">
                          {message.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted border-2 border-purple-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-sm">Virgo is speaking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Question Categories */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Question Categories:</p>
            <div className="flex flex-wrap gap-2">
              {questionCategories.map((category) => (
                <Badge
                  key={category.name}
                  variant="outline"
                  className={`cursor-pointer hover:opacity-80 ${category.color}`}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  {category.icon}
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Popular Questions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Popular Questions:</p>
            <div className="flex flex-wrap gap-2">
              {popularQuestions.map((question) => (
                <Badge
                  key={question}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-50 hover:border-purple-600"
                  onClick={() => handleQuestionClick(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Virgo about Journey app, faith, Bible, prayer, or spiritual growth..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 border-2"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
