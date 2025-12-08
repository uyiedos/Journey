import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, duration, difficulty, focus_areas } = body;

    // Validate required fields
    if (!topic || !duration || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, duration, difficulty' },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be: beginner, intermediate, or advanced' },
        { status: 400 }
      );
    }

    // Validate duration
    if (duration < 1 || duration > 365) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 365 days' },
        { status: 400 }
      );
    }

    // Generate reading plan using AI service
    const readingPlan = await aiService.generateReadingPlanWithAI({
      topic,
      duration,
      difficulty,
      focus_areas: focus_areas || []
    });

    return NextResponse.json({
      success: true,
      data: readingPlan,
      capabilities: aiService.getCapabilities()
    });

  } catch (error) {
    console.error('Error generating reading plan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate reading plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return AI service capabilities and available options
    const capabilities = aiService.getCapabilities();
    const availableTopics = [
      'Prayer',
      'Faith',
      'Love',
      'Hope',
      'Forgiveness',
      'Wisdom',
      'Patience',
      'Joy',
      'Peace',
      'Trust'
    ];

    const availableDifficulties = ['beginner', 'intermediate', 'advanced'];
    
    return NextResponse.json({
      success: true,
      data: {
        capabilities,
        availableTopics,
        availableDifficulties,
        maxDuration: 365,
        minDuration: 1
      }
    });

  } catch (error) {
    console.error('Error fetching AI capabilities:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch AI capabilities',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
