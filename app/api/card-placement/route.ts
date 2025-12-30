import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, listId, postId, position } = body;

    if (!boardId || !listId || !postId) {
      return NextResponse.json(
        { error: 'Board ID, List ID, and Post ID are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if placement already exists for this board+post
    const { data: existing } = await supabase
      .from('card_placements')
      .select('id')
      .eq('board_id', boardId)
      .eq('post_id', postId)
      .single();

    let result;
    if (existing) {
      // Update existing placement
      const { data, error } = await supabase
        .from('card_placements')
        .update({
          list_id: listId,
          position: position || 0,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    } else {
      // Create new placement
      const { data, error } = await supabase
        .from('card_placements')
        .insert({
          board_id: boardId,
          list_id: listId,
          post_id: postId,
          position: position || 0,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({ cardPlacement: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create/update card placement' },
      { status: 500 }
    );
  }
}


