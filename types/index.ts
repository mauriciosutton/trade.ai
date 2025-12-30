export interface Post {
  id: string;
  subreddit: string;
  subreddit_size: number | null;
  original_post_date: string | null;
  upvotes: number | null;
  post_url: string;
  original_post: string | null;
  post_summary: string | null;
  potential_solution: string | null;
  keyword: string | null;
  topic: string | null;
  created_at: string;
}

export interface Board {
  id: string;
  name: string;
  created_at: string;
}

export interface List {
  id: string;
  board_id: string;
  name: string;
  position: number | null;
  created_at: string;
}

export interface CardPlacement {
  id: string;
  board_id: string;
  list_id: string;
  post_id: string;
  position: number | null;
  posts?: Post;
}

