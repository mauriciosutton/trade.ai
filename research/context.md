# Problem Radar - Application Context

## Overview

Problem Radar is a web application that visualizes AI-detected business problems scraped from Reddit. The app provides three main views: **Inbox** (browse problems), **Discover** (trigger scraping), and **Boards** (organize problems into Trello-style boards).

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Supabase (PostgreSQL)
- **External Integration**: n8n workflow for Reddit scraping and AI processing
- **Drag & Drop**: dnd-kit library

### High-Level Flow

```
User → Next.js App → API Routes → Supabase Database
                        ↓
                   n8n Webhook (Discover tab)
                        ↓
              n8n Workflow (scrapes Reddit, AI processing)
                        ↓
                   Supabase Database
```

## Application Structure

### Main Entry Point (`app/page.tsx`)

The root page component manages tab navigation between three main views:
- **Inbox**: Browse all scraped problems
- **Discover**: Trigger new scraping jobs
- **Boards**: Organize problems into boards

Uses React state (`activeTab`) to conditionally render the appropriate component.

---

## Core Components

### 1. Inbox Component (`components/Inbox.tsx`)

**Purpose**: Display all scraped Reddit posts in a card grid layout.

**How it works**:
1. On mount, fetches posts from `/api/posts?limit=50`
2. Deduplicates posts by `post_url` (keeps most recent)
3. Renders `PostCard` components in a responsive grid (1/2/3 columns)
4. Clicking a card opens `PostModal` with full post details

**Key Features**:
- Automatic deduplication (handles database duplicates)
- Responsive grid layout
- Loading states
- Empty state messaging

**Data Flow**:
```
Inbox Component
  → GET /api/posts
    → Supabase: SELECT * FROM posts ORDER BY original_post_date DESC LIMIT 50
      → Returns posts array
        → Client-side deduplication
          → Render PostCard components
```

### 2. Discover Component (`components/Discover.tsx`)

**Purpose**: Trigger the n8n scraping pipeline with user-defined parameters.

**How it works**:
1. User fills form (subreddit, keywords, filters)
2. On submit, POSTs to `/api/run` with parameters
3. API route forwards request to n8n webhook
4. n8n workflow executes (scrapes Reddit, AI processing, writes to Supabase)
5. UI shows status (idle/running/success/failed)
6. On success, redirects to Inbox tab after 2 seconds

**Form Parameters**:
- `subreddit` (required): Target subreddit name
- `keywords`: Comma-separated keywords for filtering
- `maxPosts`: Maximum posts to scrape (default: 50)
- `minUpvotes`: Minimum upvote threshold (default: 0)
- `timeWindow`: Time range filter (all/day/week/month/year)

**Data Flow**:
```
Discover Component
  → User submits form
    → POST /api/run { subreddit, keywords, maxPosts, minUpvotes, timeWindow }
      → Next.js API Route
        → POST to n8n webhook URL
          → n8n workflow executes
            → Scrapes Reddit
              → AI processes posts (problem detection, summary, solution)
                → Writes to Supabase posts table
                  → Returns success to API
                    → UI updates status
```

### 3. Boards Component (`components/Boards.tsx`)

**Purpose**: Organize problems into Trello-style boards with drag-and-drop functionality.

**How it works**:
1. Fetches all boards on mount
2. When a board is selected, fetches its lists and card placements
3. Renders horizontal lists (columns) containing problem cards
4. Uses `dnd-kit` for drag-and-drop:
   - Cards can be moved between lists
   - Cards can be reordered within lists
   - Lists can be reordered
5. Clicking a card opens the same `PostModal` as Inbox
6. Can create new boards and lists

**Key Features**:
- Drag-and-drop with visual feedback
- Board selection dropdown
- Create new boards/lists inline
- Persistent card positions via `card_placements` table

**Data Flow**:
```
Boards Component
  → GET /api/boards (fetch all boards)
    → User selects board
      → GET /api/boards/[id] (fetch lists + card placements)
        → Render SortableList components (one per list)
          → Each list contains SortableCard components
            → Drag & drop events
              → POST /api/card-placement (update position)
                → Refresh board data
```

**Drag & Drop Logic**:
- Uses `@dnd-kit/core` and `@dnd-kit/sortable`
- `handleDragEnd` determines if dragging card or list
- Updates `card_placements` table with new `list_id` and `position`
- Client optimistically updates UI, then syncs with database

### 4. PostCard Component (`components/PostCard.tsx`)

**Purpose**: Display a preview of a Reddit post in card format.

**Displays**:
- Subreddit name (r/subreddit) with size indicator
- Upvote count
- Relative post date (e.g., "2 days ago")
- Post summary (truncated to 3 lines)

**Interaction**: Clicking triggers `onClick` callback to open modal.

### 5. PostModal Component (`components/PostModal.tsx`)

**Purpose**: Show full post details in a modal overlay.

**Displays**:
- Potential solution (primary, with copy button)
- Post summary
- Original post content
- Metadata (subreddit, upvotes, date)
- Button to open original Reddit post

**Features**:
- Copy solution to clipboard
- Open Reddit post in new tab
- Modal overlay (click outside to close)

---

## API Routes

All API routes are in `app/api/` and use Supabase for database operations.

### `/api/posts` (GET)

**Purpose**: Fetch posts for the Inbox view.

**Query Parameters**:
- `limit`: Number of posts to return (default: 50)
- `offset`: Pagination offset (default: 0)

**Response**: `{ posts: Post[] }`

**Implementation**:
- Uses Supabase client to query `posts` table
- Orders by `original_post_date` DESC
- Deduplicates by `post_url` (keeps most recent)
- Applies pagination

### `/api/run` (POST)

**Purpose**: Trigger the n8n scraping workflow.

**Request Body**:
```json
{
  "subreddit": "string",
  "keywords": ["string"],
  "maxPosts": number,
  "minUpvotes": number,
  "timeWindow": "all" | "day" | "week" | "month" | "year"
}
```

**Response**: `{ success: true, message: string, data: any }`

**Implementation**:
- Validates required fields
- Forwards request to `N8N_WEBHOOK_URL` environment variable
- Returns n8n response to client

### `/api/boards` (GET, POST)

**GET**: Fetch all boards
- Returns: `{ boards: Board[] }`

**POST**: Create new board
- Request: `{ name: string }`
- Returns: `{ board: Board }`

### `/api/boards/[id]` (GET)

**Purpose**: Fetch board details including lists and card placements.

**Response**: 
```json
{
  "board": Board,
  "lists": List[],
  "cardPlacements": CardPlacement[]
}
```

**Implementation**:
- Fetches board by ID
- Fetches all lists for the board (ordered by position)
- Fetches all card placements with joined post data
- Returns combined result

### `/api/lists` (POST)

**Purpose**: Create a new list within a board.

**Request**: `{ boardId: string, name: string, position: number }`

**Response**: `{ list: List }`

### `/api/lists/[id]` (PATCH)

**Purpose**: Update list properties (name, position).

**Request**: `{ name?: string, position?: number }`

**Response**: `{ list: List }`

### `/api/card-placement` (POST)

**Purpose**: Create or update a card placement (move card to list).

**Request**: 
```json
{
  "boardId": "string",
  "listId": "string",
  "postId": "string",
  "position": number
}
```

**Implementation**:
- Checks if placement exists for board+post combination
- If exists: updates `list_id` and `position`
- If new: creates new placement
- Enforces uniqueness constraint (one post per board)

---

## Database Schema

### `posts` Table

Source of truth for all scraped Reddit posts.

**Columns**:
- `id` (uuid, primary key)
- `subreddit` (text)
- `subreddit_size` (integer, nullable)
- `original_post_date` (timestamptz, nullable)
- `upvotes` (integer, nullable)
- `post_url` (text, unique) - Used for deduplication
- `original_post` (text, nullable)
- `post_summary` (text, nullable)
- `potential_solution` (text, nullable)
- `keyword` (text, nullable) - Added for filtering/tagging
- `created_at` (timestamptz, default: now())

**Notes**:
- `post_url` is unique to prevent duplicates (though upsert logic in n8n should handle this)
- Application performs client-side deduplication as safety measure

### `boards` Table

Workspace boards for organizing problems.

**Columns**:
- `id` (uuid, primary key)
- `name` (text)
- `created_at` (timestamptz, default: now())

### `lists` Table

Columns within boards (Trello-style lists).

**Columns**:
- `id` (uuid, primary key)
- `board_id` (uuid, foreign key → boards.id, CASCADE DELETE)
- `name` (text)
- `position` (integer, nullable) - Order of lists in board
- `created_at` (timestamptz, default: now())

### `card_placements` Table

Maps posts to lists within boards. Represents the card positions.

**Columns**:
- `id` (uuid, primary key)
- `board_id` (uuid, foreign key → boards.id, CASCADE DELETE)
- `list_id` (uuid, foreign key → lists.id, CASCADE DELETE)
- `post_id` (uuid, foreign key → posts.id, CASCADE DELETE)
- `position` (integer, nullable) - Order of cards in list

**Constraints**:
- Unique constraint on `(board_id, post_id)` - ensures one post appears once per board
- Cascade deletes: deleting board/list/post removes related placements

---

## Data Flow Examples

### Example 1: User Scrapes Reddit Posts

1. User navigates to **Discover** tab
2. Fills form: subreddit="smallbusiness", keywords="plumbing, issue"
3. Clicks "Run Pipeline"
4. `Discover` component POSTs to `/api/run`
5. API route forwards to n8n webhook
6. n8n workflow:
   - Scrapes r/smallbusiness for posts containing "plumbing" or "issue"
   - Filters posts (upvotes, time window)
   - Uses AI to detect problems
   - Generates summaries and solutions
   - Upserts into Supabase `posts` table (should use `post_url` for upsert)
7. API returns success
8. UI shows success status
9. After 2 seconds, user is redirected to Inbox tab
10. Inbox fetches new posts and displays them

### Example 2: User Organizes Posts in Board

1. User navigates to **Boards** tab
2. Creates new board: "Plumbing Issues"
3. Creates lists: "To Review", "In Progress", "Solved"
4. Views Inbox, clicks on a post card
5. Drags card from Inbox to "To Review" list (if drag-to-board from inbox is implemented)
   - OR: In Boards view, drags card between lists
6. `Boards` component detects drag end event
7. POSTs to `/api/card-placement` with new `list_id` and `position`
8. Database updates `card_placements` table
9. Board view refreshes to show updated positions

### Example 3: Viewing Post Details

1. User clicks any post card (Inbox or Boards)
2. `PostModal` opens with full post data
3. User can:
   - Read potential solution
   - Copy solution to clipboard
   - View original Reddit post (opens in new tab)
   - View full summary and original post content
4. User clicks outside modal or close button to dismiss

---

## Key Design Decisions

### 1. Deduplication Strategy

**Problem**: Database may contain duplicate posts (same `post_url`).

**Solution**: 
- API route deduplicates by `post_url`, keeping most recent
- Client component also deduplicates as safety measure
- Ideally, n8n should handle upsert properly (prevents duplicates at source)

### 2. Card Placement System

**Problem**: Need to track which posts appear in which lists/boards.

**Solution**: 
- Separate `card_placements` junction table
- Stores `board_id`, `list_id`, `post_id`, `position`
- Unique constraint ensures one post per board
- Allows same post to appear in multiple boards

### 3. Drag & Drop Implementation

**Solution**: 
- Uses `@dnd-kit` library (modern, accessible)
- Client-side optimistic updates for better UX
- Server syncs positions to database
- Handles both card and list reordering

### 4. API Route Structure

**Solution**: 
- Next.js App Router API routes (serverless functions)
- Each route is self-contained
- Uses Supabase client for all database operations
- Consistent error handling pattern

---

## Environment Variables

Required environment variables (in `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anonymous key (public)
SUPABASE_URL=                      # Supabase project URL (server-side)
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key (server-side, more permissions)
DATABASE_URL=                      # PostgreSQL connection string (for Prisma, optional)
N8N_WEBHOOK_URL=                   # n8n workflow webhook URL
```

**Note**: `NEXT_PUBLIC_*` variables are exposed to the browser. Service role key should never be exposed client-side.

---

## File Structure

```
trade.ai/
├── app/
│   ├── api/                    # API routes
│   │   ├── posts/             # Posts endpoints
│   │   ├── boards/            # Boards endpoints
│   │   ├── lists/             # Lists endpoints
│   │   ├── card-placement/    # Card placement endpoints
│   │   └── run/               # n8n trigger endpoint
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main page (tab navigation)
│   └── globals.css            # Global styles
├── components/
│   ├── Inbox.tsx              # Inbox view component
│   ├── Discover.tsx           # Discover view component
│   ├── Boards.tsx             # Boards view component
│   ├── PostCard.tsx           # Post card component
│   ├── PostModal.tsx          # Post detail modal
│   ├── SortableList.tsx       # Draggable list component
│   └── SortableCard.tsx       # Draggable card component
├── lib/
│   ├── supabase.ts            # Supabase client utilities
│   └── prisma.ts              # Prisma client (optional)
├── types/
│   └── index.ts               # TypeScript type definitions
└── prisma/
    └── schema.prisma          # Prisma schema (optional)
```

---

## Future Enhancements (Out of Scope)

As noted in the spec, these features are planned but not implemented:
- Auto-clustering similar problems
- AI-generated list suggestions
- Multi-user collaboration
- Notifications or alerts
- Editing scraped content
- Responding to Reddit posts

---

## Troubleshooting

### Duplicate Posts in Inbox

**Cause**: n8n workflow not properly upserting on `post_url`.

**Solution**: 
- Application already deduplicates in API and client
- Fix n8n workflow to use proper upsert logic
- Consider adding database constraint if needed

### Drag & Drop Not Working

**Check**:
- `@dnd-kit` packages installed
- Browser supports pointer events
- No JavaScript errors in console

### API Errors

**Common Issues**:
- Missing environment variables
- Supabase credentials incorrect
- Database connection issues
- n8n webhook URL not configured

---

## Summary

Problem Radar is a client-server application where:
- **Client** (React/Next.js): Provides UI for browsing, triggering scrapes, and organizing posts
- **API** (Next.js routes): Handles data operations and external integrations
- **Database** (Supabase): Stores posts, boards, lists, and card placements
- **External** (n8n): Performs Reddit scraping and AI processing

The application emphasizes a clean, visual UX with card-based layouts and drag-and-drop functionality, making it easy to scan and organize business problems discovered on Reddit.

