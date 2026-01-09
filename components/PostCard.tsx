"use client";

import { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  onClick: () => void;
  onStarChange?: (postId: string, starred: boolean) => void;
}

export default function PostCard({ post, onClick, onStarChange }: PostCardProps) {
  const [starred, setStarred] = useState(post.starred || false);
  const [isToggling, setIsToggling] = useState(false);
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

  const handleStarClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (isToggling) return;
    
    setIsToggling(true);
    const newStarred = !starred;
    
    try {
      const response = await fetch(`/api/posts/${post.id}/star`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: newStarred }),
      });
      
      if (response.ok) {
        setStarred(newStarred);
        if (onStarChange) {
          onStarChange(post.id, newStarred);
        }
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const priority = getPriority();
  const tags = getTags();

  return (
    <div onClick={onClick} className="post-card relative">
      {/* Star Button */}
      <button
        onClick={handleStarClick}
        className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label={starred ? "Unstar" : "Star"}
      >
        <svg
          className={`w-5 h-5 transition-colors ${
            starred
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-slate-400 hover:text-yellow-400"
          }`}
          fill={starred ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>

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
