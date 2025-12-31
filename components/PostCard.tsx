"use client";

import { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: false });
    } catch {
      return "Unknown";
    }
  };

  const formatSubredditSize = (size: number | null) => {
    if (!size) return "";
    if (size >= 1000000) return `(${(size / 1000000).toFixed(1)}M)`;
    if (size >= 1000) return `(${(size / 1000).toFixed(0)}K)`;
    return `(${size})`;
  };

  // Generate a title from post_summary (first sentence or first 60 chars)
  const getTitle = () => {
    const summary = post.post_summary || post.original_post || "";
    const firstSentence = summary.split(/[.!?]/)[0];
    if (firstSentence.length > 70) {
      return firstSentence.substring(0, 67) + "...";
    }
    return firstSentence || "Untitled Problem";
  };

  // Get priority based on upvotes
  const getPriority = () => {
    const upvotes = post.upvotes || 0;
    if (upvotes >= 50) return { label: "High", class: "badge-high" };
    if (upvotes >= 20) return { label: "Medium", class: "badge-medium" };
    return { label: "Low", class: "badge-low" };
  };

  // Get market size label
  const getMarketSize = () => {
    const size = post.subreddit_size || 0;
    if (size >= 1000000) return "Large Market";
    if (size >= 100000) return "Medium Market";
    return "Niche Market";
  };

  // Generate tags from keyword or dummy
  const getTags = () => {
    if (post.keyword) {
      return post.keyword.split(",").map(k => k.trim()).filter(Boolean).slice(0, 3);
    }
    // Generate dummy tags based on content
    return ["#general"];
  };

  const priority = getPriority();
  const tags = getTags();

  return (
    <div onClick={onClick} className="post-card">
      {/* Header: Subreddit */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="text-sm font-semibold text-blue-600">
          r/{post.subreddit}
        </span>
        <span className="text-xs text-slate-400">
          {formatSubredditSize(post.subreddit_size)}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 leading-snug">
        {getTitle()}
      </h3>

      {/* Summary Preview */}
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
        {post.post_summary || post.original_post || "No summary available"}
      </p>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          {post.upvotes || 0}
        </span>
        <span>{formatDate(post.original_post_date)}</span>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`badge ${priority.class}`}>
          {priority.label}
        </span>
        <span className="badge badge-market">
          {getMarketSize()}
        </span>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag, index) => (
          <span key={index} className="tag-chip">
            #{tag.replace("#", "")}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-xs text-slate-400">+{tags.length - 3}</span>
        )}
      </div>
    </div>
  );
}
