import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subreddit, keywords } = body;

    if (!subreddit) {
      return NextResponse.json(
        { error: 'Subreddit is required' },
        { status: 400 }
      );
    }

    // Use production webhook URL
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL_PRODUCTION;
    
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'N8N_WEBHOOK_URL_PRODUCTION not configured in environment variables' },
        { status: 500 }
      );
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subreddit,
        keywords: keywords || [],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger n8n workflow');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Pipeline triggered successfully',
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to trigger pipeline' },
      { status: 500 }
    );
  }
}


