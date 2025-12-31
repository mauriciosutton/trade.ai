import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Fetch all posts with topics
    const { data: posts, error } = await supabase
      .from('posts')
      .select('topic')
      .not('topic', 'is', null)
      .neq('topic', '');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate topics and count occurrences
    const topicCounts = new Map<string, number>();
    
    (posts || []).forEach((post: any) => {
      if (post.topic) {
        // Handle both single topics and comma-separated topics
        const topics = post.topic.split(',').map((t: string) => t.trim()).filter(Boolean);
        topics.forEach((topic: string) => {
          // Clean up topic text (remove "Topic:" prefix if present)
          const cleanTopic = topic.replace(/^Topic:\s*/i, '').replace(/^\*\*Topic:\s*/i, '').replace(/\*\*/g, '').trim();
          if (cleanTopic) {
            topicCounts.set(cleanTopic, (topicCounts.get(cleanTopic) || 0) + 1);
          }
        });
      }
    });

    // Convert to array and sort by count descending
    const topics = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

