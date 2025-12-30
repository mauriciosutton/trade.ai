import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, name, position } = body;

    if (!boardId || !name) {
      return NextResponse.json(
        { error: 'Board ID and name are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('lists')
      .insert({
        board_id: boardId,
        name,
        position: position || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ list: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    );
  }
}


