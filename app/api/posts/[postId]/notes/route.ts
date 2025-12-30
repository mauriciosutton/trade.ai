import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET notes for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const supabase = createServerClient();
    const { postId } = await params;

    const { data, error } = await supabase
      .from('post_notes')
      .select('note')
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: data?.note || '' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST/PUT notes for a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const supabase = createServerClient();
    const { postId } = await params;
    const body = await request.json();
    const { note } = body;

    // Upsert: insert or update
    const { data, error } = await supabase
      .from('post_notes')
      .upsert(
        {
          post_id: postId,
          note: note || '',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'post_id',
        }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save notes' },
      { status: 500 }
    );
  }
}

