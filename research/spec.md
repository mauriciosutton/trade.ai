# spec.md  
## Problem Radar (Supabase-backed)

### Overview
Problem Radar is a lightweight web app that visualizes AI-detected business problems scraped from Reddit.  
An n8n workflow scrapes subreddit posts, detects whether a post contains a problem, generates a summary and a potential solution, and writes results directly into Supabase.

The web app focuses on:
- Browsing problems in a **visual, card-first UI**
- Running new scraping jobs from the UI
- Organizing problem cards into **Trello-style boards and lists**

Supabase is the single source of truth. Google Sheets is not used.

---

## Goals
- Minimal development time
- Clean, intuitive, visual UX
- Easy extension later (boards, lists, tagging)
- Simple n8n → database → UI pipeline

## Non-Goals
- Editing scraped content
- Responding to Reddit posts
- Advanced analytics or ML tuning
- Complex permissions or multi-user auth (v1 is single-user)

---

## Tech Stack
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Supabase (Postgres + REST)
- Prisma (optional but recommended)
- n8n (scraping + AI pipeline)
- dnd-kit (drag and drop for boards)

---

## Core Data Model

### 1. posts (source-of-truth)
This table mirrors exactly what the pipeline produces.

**Columns (required):**
- `id` uuid primary key default gen_random_uuid()
- `subreddit` text
- `subreddit_size` integer
- `original_post_date` timestamptz
- `upvotes` integer
- `post_url` text unique
- `original_post` text
- `post_summary` text
- `potential_solution` text
- `created_at` timestamptz default now()

**SQL**
```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  subreddit text not null,
  subreddit_size integer,
  original_post_date timestamptz,
  upvotes integer,
  post_url text unique not null,
  original_post text,
  post_summary text,
  potential_solution text,
  created_at timestamptz default now()
);
n8n behavior:

Upsert on post_url

Insert only posts that pass the “problem detected” filter

2. boards
Represents a workspace for grouping similar problems.

sql
create table boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);
3. lists
Represents columns inside a board.

sql

create table lists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  name text not null,
  position integer,
  created_at timestamptz default now()
);
4. card_placements
Maps posts into lists.

sql
create table card_placements (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  list_id uuid references lists(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  position integer,
  unique (board_id, post_id)
);
App Structure
Tabs (Top Navigation)
1. Inbox
Purpose: Review all incoming problems

Card grid layout

Each card displays:

Subreddit + subreddit size

Relative post date

Upvotes

Post summary

Clicking a card opens a modal:

Potential solution (primary)

Post summary

Original post

Actions:

Copy solution

Open Reddit post

Cards can be dragged into Boards

Data source:

sql
select * from posts
order by original_post_date desc
limit 50;
2. Discover
Purpose: Run the scraping pipeline

Form inputs:

Subreddit name (required)

Keywords (comma-separated)

Optional:

Max posts

Min upvotes

Time window

Actions:

“Run pipeline” button

Pipeline status: Idle, Running, Success, Failed

Last run timestamp

Behavior:

POST request to n8n webhook

n8n writes directly to Supabase

UI refreshes Inbox on completion

3. Boards
Purpose: Group problems by theme

Board view (similar to Trello)

Each board contains lists

Lists contain problem cards

Drag and drop:

Move cards between lists

Reorder cards within lists

Clicking a card opens the same modal as Inbox

API Routes (Next.js)
Posts
GET /api/posts
Fetch posts from Supabase with filters and sorting

Pipeline
POST /api/run
Triggers n8n webhook with subreddit + keywords

Boards
GET /api/boards

POST /api/boards

GET /api/boards/:id

POST /api/lists

POST /api/card-placement

Environment Variables
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_URL=
UX Principles
Card-first, visual layout

Minimal visible controls

Same card interaction everywhere

Fast scanning over dense data tables

Implementation Plan (Lean)
Scaffold Next.js + Tailwind

Implement Inbox with mock cards

Connect Inbox to Supabase posts

Add Discover tab and n8n trigger

Add Boards schema + API

Implement drag and drop

Polish and ship

Future Extensions (Out of Scope)
Auto-clustering similar problems

AI-generated list suggestions

Multi-user collaboration

Notifications or alerts

If you want next, I can:
- Convert this into **Cursor/Lovable.dev agent instructions**
- Write the **exact n8n Supabase upsert node config**
- Add **RLS rules** for Supabase
- Or create a **Boards-only UI mock**