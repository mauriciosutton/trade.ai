# trade.ai

A lightweight web app that visualizes AI-detected business problems scraped from Reddit. Built with Next.js, Supabase, and n8n.

## Features

- **Inbox**: Browse all incoming problems in a visual card grid
- **Discover**: Run scraping jobs to find new problems from Reddit
- **Boards**: Organize problems into Trello-style boards with drag-and-drop

## Tech Stack

- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Supabase (Postgres + REST)
- Prisma (optional)
- dnd-kit (drag and drop)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. The database schema has already been created via migrations:
   - `posts` - Stores scraped Reddit posts
   - `boards` - Workspace boards
   - `lists` - Columns within boards
   - `card_placements` - Maps posts to lists

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (for Prisma - optional)
DATABASE_URL=your_supabase_connection_string

# n8n Webhooks (use test in development, production in production)
N8N_WEBHOOK_URL_TEST=your_test_n8n_webhook_url
N8N_WEBHOOK_URL_PRODUCTION=your_production_n8n_webhook_url
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The database schema includes:

- **posts**: Source of truth for scraped Reddit posts
- **boards**: Workspace boards for organizing problems
- **lists**: Columns within boards (like Trello lists)
- **card_placements**: Maps posts to lists with positions

## n8n Integration

The app expects an n8n webhook that:
1. Accepts POST requests with subreddit, keywords, and filters
2. Scrapes Reddit posts
3. Detects problems using AI
4. Generates summaries and solutions
5. Upserts results into Supabase `posts` table

## Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page with tabs
├── components/        # React components
│   ├── Inbox.tsx
│   ├── Discover.tsx
│   ├── Boards.tsx
│   ├── PostCard.tsx
│   └── PostModal.tsx
├── lib/              # Utilities
│   ├── supabase.ts   # Supabase client
│   └── prisma.ts     # Prisma client
└── types/            # TypeScript types
```

## Development

- Run `npm run dev` for development
- Run `npm run build` for production build
- Run `npm run lint` for linting

## License

MIT


