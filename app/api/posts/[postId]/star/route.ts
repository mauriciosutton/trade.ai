import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = createServerClient();
    const { postId } = params;
    const body = await request.json();
    const { starred } = body;

    const { data, error } = await supabase
      .from('posts')
      .update({ starred: starred })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update star status' },
      { status: 500 }
    );
  }
}

