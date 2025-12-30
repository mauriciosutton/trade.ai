# Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - The database schema has already been created via Supabase migrations
   - You need to get your Supabase credentials from your project dashboard

3. **Configure environment variables:**
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Database Schema

The following tables have been created in Supabase:

- **posts**: Stores scraped Reddit posts with summaries and solutions
- **boards**: Workspace boards for organizing problems
- **lists**: Columns within boards (Trello-style)
- **card_placements**: Maps posts to lists with positions

## Features Implemented

✅ **Inbox Tab**
- Card grid layout showing all posts
- Click cards to view details in modal
- Shows subreddit, upvotes, date, and summary

✅ **Discover Tab**
- Form to trigger n8n scraping pipeline
- Configurable subreddit, keywords, filters
- Pipeline status tracking

✅ **Boards Tab**
- Create and manage boards
- Create lists within boards
- Drag and drop cards between lists
- Trello-style interface

## Next Steps

1. Set up your n8n workflow to:
   - Accept webhook requests from `/api/run`
   - Scrape Reddit posts
   - Detect problems using AI
   - Generate summaries and solutions
   - Upsert into Supabase `posts` table

2. Configure Supabase RLS (Row Level Security) if needed for multi-user support

3. Customize the UI styling to match your brand

## Troubleshooting

- **Database connection issues**: Verify your Supabase credentials in `.env.local`
- **API errors**: Check browser console and server logs
- **Drag and drop not working**: Ensure dnd-kit is properly installed


