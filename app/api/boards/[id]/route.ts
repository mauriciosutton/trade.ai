import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', params.id)
      .single();

    if (boardError) {
      return NextResponse.json({ error: boardError.message }, { status: 500 });
    }

    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select('*')
      .eq('board_id', params.id)
      .order('position', { ascending: true });

    if (listsError) {
      return NextResponse.json({ error: listsError.message }, { status: 500 });
    }

    const { data: cardPlacements, error: placementsError } = await supabase
      .from('card_placements')
      .select('*, posts(*)')
      .eq('board_id', params.id)
      .order('position', { ascending: true });

    if (placementsError) {
      return NextResponse.json(
        { error: placementsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      board,
      lists,
      cardPlacements,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}


