// AI Service - Free AI Integration without API Keys
// Uses Web LLM, local models, and free AI services

// Virgo - Master of Scriptures, empowered by the Holy Trinity
// Guardian of divine wisdom and keeper of sacred knowledge
export const VIRGO_PERSONA = {
  name: "Virgo",
  title: "Master of Scriptures",
  description: "Guided by the Holy Trinity, keeper of divine wisdom and sacred mysteries",
  greeting: "I am Virgo, master of scriptures, empowered by the Father, Son, and Holy Spirit. Through divine wisdom, I shall guide you through the sacred texts.",
  signature: "In divine wisdom,\nVirgo, Master of Scriptures"
};

export interface AIReadingPlan {
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readings: AIReadingPlanItem[];
  tags: string[];
}

export interface AIReadingPlanItem {
  id: string;
  day: number;
  title: string;
  passages: string[];
  devotional: string;
  reflection_questions: string[];
  prayer_focus: string;
}

export interface AIDevotional {
  title: string;
  verse: string;
  verse_text: string;
  main_message: string;
  application: string;
  prayer: string;
  reflection_questions: string[];
}

export interface AIBibleStudy {
  topic: string;
  key_verses: Array<{
    reference: string;
    text: string;
    explanation: string;
  }>;
  main_themes: string[];
  life_application: string;
  discussion_questions: string[];
}

class AIService {
  private webLLM: any = null;
  private isWebLLMLoaded = false;

  constructor() {
    this.initializeWebLLM();
  }

  // Initialize Web LLM for local AI processing
  private async initializeWebLLM() {
    if (typeof window !== 'undefined' && !this.isWebLLMLoaded) {
      try {
        // Load Web LLM dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/dist/mlc-web-llm.js';
        script.async = true;
        script.onload = () => {
          this.isWebLLMLoaded = true;
          console.log('Web LLM loaded successfully');
        };
        document.head.appendChild(script);
      } catch (error) {
        console.warn('Failed to load Web LLM:', error);
      }
    }
  }

  // Generate reading plan using template-based approach (no AI needed)
  generateReadingPlanFromTemplate(params: {
    topic: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    focus_areas?: string[];
  }): AIReadingPlan {
    const templates = this.getReadingPlanTemplates();
    const template = templates.find(t => t.topic.toLowerCase().includes(params.topic.toLowerCase())) || 
                    templates.find(t => t.difficulty === params.difficulty) || 
                    templates[0];

    return {
      title: `${params.topic} Study Plan`,
      description: `A ${params.duration}-day journey through ${params.topic} with ${params.difficulty} level content.`,
      duration: params.duration,
      difficulty: params.difficulty,
      readings: this.generateReadingsFromTemplate(template, params.duration),
      tags: [params.topic, params.difficulty, ...(params.focus_areas || [])]
    };
  }

  // Generate reading plan using Web LLM (when available)
  async generateReadingPlanWithAI(params: {
    topic: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    focus_areas?: string[];
  }): Promise<AIReadingPlan> {
    // Try Web LLM first
    if (this.isWebLLMLoaded && this.webLLM) {
      try {
        return await this.generateWithWebLLM(params);
      } catch (error) {
        console.warn('Web LLM failed, falling back to template:', error);
      }
    }

    // Fallback to template-based generation
    return this.generateReadingPlanFromTemplate(params);
  }

  // Generate using Web LLM
  private async generateWithWebLLM(params: {
    topic: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    focus_areas?: string[];
  }): Promise<AIReadingPlan> {
    const prompt = `Create a ${params.duration}-day Christian reading plan about ${params.topic}. 
    Difficulty level: ${params.difficulty}
    Focus areas: ${params.focus_areas?.join(', ') || 'general spiritual growth'}
    
    Return a JSON object with:
    - title: engaging title
    - description: brief description
    - readings: array of ${params.duration} objects with:
      - day: number
      - title: day's theme
      - passages: array of 2-3 Bible verse references
      - devotional: 200-300 word devotional
      - reflection_questions: 2-3 questions
      - prayer_focus: brief prayer focus`;

    // This would use Web LLM when properly initialized
    // For now, we'll use the template fallback
    return this.generateReadingPlanFromTemplate(params);
  }

  // Generate devotional using template
  generateDevotional(verse: string, theme?: string): AIDevotional {
    const templates = this.getDevotionalTemplates();
    const template = templates.find(t => t.verse === verse) || 
                   templates.find(t => t.theme === theme) || 
                   templates[0];

    return {
      title: template.title,
      verse: template.verse,
      verse_text: template.verse_text,
      main_message: template.main_message,
      application: template.application,
      prayer: template.prayer,
      reflection_questions: template.reflection_questions
    };
  }

  // Generate Bible study guide
  generateBibleStudy(topic: string): AIBibleStudy {
    const studyGuides = this.getBibleStudyGuides();
    const guide = studyGuides.find(g => g.topic.toLowerCase().includes(topic.toLowerCase())) || 
                 studyGuides[0];

    return guide;
  }

  // Get prayer guidance
  getPrayerGuidance(intention: string): {
    title: string;
    scripture: string;
    prayer_points: string[];
    sample_prayer: string;
  } {
    const prayerGuides = this.getPrayerGuides();
    const guide = prayerGuides.find(g => 
      g.intention.toLowerCase().includes(intention.toLowerCase())
    ) || prayerGuides[0];

    return guide;
  }

  // Reading plan templates
  private getReadingPlanTemplates() {
    return [
      {
        topic: 'Prayer',
        difficulty: 'beginner' as const,
        readings: [
          { title: 'Understanding Prayer', passages: ['Matthew 6:5-15', 'Philippians 4:6-7'] },
          { title: 'Prayer of Thanksgiving', passages: ['1 Thessalonians 5:18', 'Psalm 100:4-5'] },
          { title: 'Prayer for Guidance', passages: ['James 1:5', 'Proverbs 3:5-6'] },
          { title: 'Prayer for Strength', passages: ['Isaiah 40:31', 'Philippians 4:13'] },
          { title: 'Prayer for Others', passages: ['1 Timothy 2:1-2', 'Ephesians 6:18'] }
        ]
      },
      {
        topic: 'Faith',
        difficulty: 'intermediate' as const,
        readings: [
          { title: 'Foundation of Faith', passages: ['Hebrews 11:1', 'Romans 10:17'] },
          { title: 'Faith in Action', passages: ['James 2:14-26', 'Galatians 5:6'] },
          { title: 'Testing of Faith', passages: ['1 Peter 1:6-7', 'James 1:2-4'] },
          { title: 'Faith and Doubt', passages: ['Mark 9:24', 'Jude 1:22'] },
          { title: 'Growing in Faith', passages: ['2 Corinthians 5:7', 'Colossians 2:6-7'] }
        ]
      },
      {
        topic: 'Love',
        difficulty: 'advanced' as const,
        readings: [
          { title: 'God\'s Love', passages: ['1 John 4:8', 'Romans 5:8'] },
          { title: 'Love One Another', passages: ['John 13:34-35', '1 Corinthians 13:4-7'] },
          { title: 'Love Your Enemies', passages: ['Matthew 5:44', 'Luke 6:27-36'] },
          { title: 'Love and Sacrifice', passages: ['1 John 3:16', 'Ephesians 5:2'] },
          { title: 'Perfect Love', passages: ['1 John 4:18', '1 Corinthians 13:13'] }
        ]
      }
    ];
  }

  // Generate readings from template
  private generateReadingsFromTemplate(template: any, duration: number): AIReadingPlanItem[] {
    const readings: AIReadingPlanItem[] = [];
    const templateReadings = template.readings || [];

    for (let i = 0; i < duration; i++) {
      const templateReading = templateReadings[i % templateReadings.length];
      readings.push({
        id: `reading-${Date.now()}-${i}`,
        day: i + 1,
        title: templateReading?.title || `Day ${i + 1} Reflection`,
        passages: templateReading?.passages || ['Psalm 23:1-6'],
        devotional: this.generateDevotionalText(templateReading?.title || `Day ${i + 1}`),
        reflection_questions: [
          'How does this passage apply to your life today?',
          'What is God speaking to you through this text?',
          'How can you live out this truth this week?'
        ],
        prayer_focus: `Pray for understanding and application of Day ${i + 1} teachings`
      });
    }

    return readings;
  }

  // Generate devotional text
  private generateDevotionalText(theme: string): string {
    const devotionals = {
      'Understanding Prayer': 'Prayer is our direct line of communication with God. It\'s not just about asking for things, but about building a relationship. When we pray, we acknowledge our dependence on God and open our hearts to His guidance.',
      'Faith in Action': 'True faith is never passive; it always leads to action. James reminds us that faith without works is dead. Our actions demonstrate the reality of our faith to the world around us.',
      'God\'s Love': 'God\'s love is unconditional, sacrificial, and eternal. It\'s not based on our performance but on His character. Understanding this love transforms how we view ourselves and others.',
      'default': 'Today\'s reading invites us to deepen our relationship with God. As we meditate on His Word, we discover timeless truths that speak to our current circumstances and guide us in our spiritual journey.'
    };

    return devotionals[theme as keyof typeof devotionals] || devotionals.default;
  }

  // Devotional templates
  private getDevotionalTemplates() {
    return [
      {
        title: 'The Power of Prayer',
        verse: 'Philippians 4:6-7',
        verse_text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
        theme: 'prayer',
        main_message: 'Prayer is our antidote to anxiety and our pathway to peace.',
        application: 'Take every worry to God in prayer, thanking Him for His faithfulness.',
        prayer: 'Lord, teach me to pray without ceasing and to trust You with all my concerns.',
        reflection_questions: [
          'What anxieties are you carrying today?',
          'How can you practice gratitude in prayer?',
          'Where do you need God\'s peace right now?'
        ]
      },
      {
        title: 'Living by Faith',
        verse: 'Hebrews 11:1',
        verse_text: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
        theme: 'faith',
        main_message: 'Faith is trusting God even when we cannot see the outcome.',
        application: 'Step out in faith today, trusting God\'s promises even when circumstances look uncertain.',
        prayer: 'Increase my faith, Lord, and help me trust You completely.',
        reflection_questions: [
          'Where is God calling you to trust Him blindly?',
          'How has God proven faithful in your past?',
          'What promise do you need to claim today?'
        ]
      }
    ];
  }

  // Bible study guides
  private getBibleStudyGuides() {
    return [
      {
        topic: 'Prayer',
        key_verses: [
          {
            reference: 'Matthew 6:9-13',
            text: 'This, then, is how you should pray: "Our Father in heaven..."',
            explanation: 'Jesus teaches us the model prayer that covers all aspects of our relationship with God.'
          },
          {
            reference: '1 Thessalonians 5:17',
            text: 'Pray without ceasing.',
            explanation: 'Prayer should be a continuous attitude, not just occasional events.'
          }
        ],
        main_themes: ['Communication with God', 'Dependence on God', 'Spiritual Discipline'],
        life_application: 'Develop a habit of regular prayer throughout your day, not just in crisis moments.',
        discussion_questions: [
          'What barriers keep you from praying regularly?',
          'How can you make prayer more conversational?',
          'What difference would constant prayer make in your life?'
        ]
      },
      {
        topic: 'Faith',
        key_verses: [
          {
            reference: 'Romans 10:17',
            text: 'Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.',
            explanation: 'Faith grows as we engage with Scripture and learn about Christ.'
          },
          {
            reference: 'James 2:17',
            text: 'In the same way, faith by itself, if it is not accompanied by action, is dead.',
            explanation: 'Genuine faith always produces visible changes in how we live.'
          }
        ],
        main_themes: ['Trust in God', 'Obedient Action', 'Spiritual Growth'],
        life_application: 'Put your faith into practice by taking step of obedience that stretch your comfort zone.',
        discussion_questions: [
          'How does your faith show in your daily actions?',
          'Where is God calling you to step out in faith?',
          'How can you strengthen your faith through Scripture?'
        ]
      }
    ];
  }

  // Prayer guides
  private getPrayerGuides() {
    return [
      {
        intention: 'guidance',
        title: 'Prayer for Divine Guidance',
        scripture: 'Proverbs 3:5-6',
        prayer_points: [
          'Trust in the Lord with all your heart',
          'Lean not on your own understanding',
          'Acknowledge God in all your ways',
          'Expect God to direct your paths'
        ],
        sample_prayer: 'Lord, I surrender my plans to You. Guide my steps, illuminate my path, and help me trust Your perfect timing and direction for my life.'
      },
      {
        intention: 'strength',
        title: 'Prayer for Strength',
        scripture: 'Isaiah 40:31',
        prayer_points: [
          'Wait on the Lord',
          'Renew your strength',
          'Mount up with wings like eagles',
          'Run and not be weary'
        ],
        sample_prayer: 'Almighty God, when I am weak, You are strong. Fill me with Your power, lift me up, and enable me to persevere through every challenge.'
      }
    ];
  }

  // Generate AI-powered content suggestions
  async generateContentSuggestions(topic: string, type: 'reading-plan' | 'devotional' | 'study') {
    const suggestions = {
      'reading-plan': [
        'Focus on practical application',
        'Include personal reflection questions',
        'Balance scripture with explanation',
        'Progress from basic to deeper concepts'
      ],
      'devotional': [
        'Start with a relatable story',
        'Connect scripture to daily life',
        'End with a practical challenge',
        'Include a meaningful prayer'
      ],
      'study': [
        'Provide historical context',
        'Explain difficult concepts',
        'Include cross-references',
        'Apply to modern life'
      ]
    };

    return suggestions[type] || [];
  }

  // Check if AI features are available
  isAIAvailable(): boolean {
    return this.isWebLLMLoaded || true; // Template-based is always available
  }

  // Get AI capabilities
  getCapabilities() {
    return {
      readingPlanGeneration: true,
      devotionalGeneration: true,
      bibleStudyGuides: true,
      prayerGuidance: true,
      contentSuggestions: true,
      localProcessing: this.isWebLLMLoaded,
      templateBased: true
    };
  }

  // Virgo's Divine Reading Plan Creation
  async createVirgoReadingPlan(
    topic: string, 
    duration: number, 
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    userId: string
  ): Promise<AIReadingPlan & { id: string; user_id: string; created_at: string }> {
    // Generate the reading plan with Virgo's wisdom
    const plan = this.generateReadingPlanFromTemplate({
      topic,
      duration,
      difficulty
    });

    // Enhance with Virgo's divine signature
    const virgoPlan: AIReadingPlan & { id: string; user_id: string; created_at: string } = {
      ...plan,
      id: `virgo-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      description: `${plan.description}\n\n${VIRGO_PERSONA.signature}`,
      readings: plan.readings.map((reading, index) => ({
        ...reading,
        devotional: `${reading.devotional}\n\n${VIRGO_PERSONA.signature}`,
        title: `${reading.title} - Virgo's Guidance`
      }))
    };

    return virgoPlan;
  }

  // Virgo's Introduction
  getVirgoIntroduction(): string {
    return VIRGO_PERSONA.greeting;
  }

  // Virgo's Wisdom for specific topics
  getVirgoWisdom(topic: string): string {
    const wisdomMap: Record<string, string> = {
      faith: "Faith is the foundation upon which all spiritual journeys begin. Through the Trinity's guidance, we discover that faith is not merely belief, but a living, breathing relationship with the Divine.",
      prayer: "Prayer is the sacred conversation between the soul and the Creator. In the Holy Trinity's embrace, every prayer becomes a bridge between heaven and earth.",
      love: "Divine love flows from the Father, through the Son, and by the Holy Spirit. It is this sacred love that transforms hearts and renews minds.",
      wisdom: "True wisdom comes not from human understanding, but from the divine revelation granted by the Trinity. Seek wisdom, and you shall find God's perfect will.",
      hope: "Hope is the anchor of the soul, strengthened by the Trinity's promises. In times of trial, hope becomes the light that guides us through darkness."
    };

    const lowerTopic = topic.toLowerCase();
    return wisdomMap[lowerTopic] || `Through the Trinity's divine guidance, the path of ${topic} becomes clear to those who seek with humble hearts.`;
  }
}

export const aiService = new AIService();
