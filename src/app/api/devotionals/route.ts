import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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
    const { 
      title, 
      verse, 
      verse_text, 
      content, 
      application, 
      prayer, 
      reflection_questions, 
      is_public 
    } = body;

    // Validate required fields
    if (!title || !verse || !verse_text || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, verse, verse_text, content' },
        { status: 400 }
      );
    }

    // Create devotional
    const { data, error } = await supabase
      .from('devotionals')
      .insert([{
        title,
        verse,
        verse_text,
        content,
        application: application || null,
        prayer: prayer || null,
        reflection_questions: JSON.stringify(reflection_questions || []),
        user_id: user.id,
        is_public: is_public || false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error creating devotional:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create devotional',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
