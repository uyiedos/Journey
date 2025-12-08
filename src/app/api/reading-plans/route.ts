import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { readingPlanService } from '@/services/readingPlanService';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, duration, difficulty, readings, is_public } = body;

    // Validate required fields
    if (!title || !description || !duration || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, duration, difficulty' },
        { status: 400 }
      );
    }

    // Create reading plan using the service
    const readingPlan = await readingPlanService.createReadingPlan({
      title,
      description,
      duration,
      difficulty,
      user_id: user.id,
      is_public: is_public || false
    });

    return NextResponse.json({
      success: true,
      data: readingPlan
    });

  } catch (error) {
    console.error('Error creating reading plan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create reading plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
