import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, position } = body;

    const supabase = createServerClient();
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (position !== undefined) updateData.position = position;

    const { data, error } = await supabase
      .from('lists')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ list: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    );
  }
}


