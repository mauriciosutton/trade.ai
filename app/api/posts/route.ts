import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('original_post_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Deduplicate by post_url, keeping the most recent entry
    const uniquePosts = new Map<string, any>();
    if (data) {
      for (const post of data) {
        const existing = uniquePosts.get(post.post_url);
        if (!existing || new Date(post.created_at) > new Date(existing.created_at)) {
          uniquePosts.set(post.post_url, post);
        }
      }
    }

    return NextResponse.json({ posts: Array.from(uniquePosts.values()) });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

