"use client";

import { Post } from "@/types";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
}

type TabType = "solution" | "summary" | "original" | "notes";

export default function PostModal({ post, onClose }: PostModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("solution");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  // Fetch notes when post changes
  useEffect(() => {
    if (!post) return;

    isInitialLoadRef.current = true;
    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/posts/${post.id}/notes`);
        const data = await response.json();
        if (data.note) {
          setNotes(data.note);
        } else {
          setNotes("");
        }
        // Mark initial load as complete after a short delay
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 100);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        isInitialLoadRef.current = false;
      }
    };

    fetchNotes();
  }, [post]);

  // Save notes with debouncing
  useEffect(() => {
    if (!post || isInitialLoadRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second of no typing
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/posts/${post.id}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ note: notes }),
        });
      } catch (error) {
        console.error("Failed to save notes:", error);
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, post]);

  if (!post) return null;

  const copySolution = async () => {
    if (post.potential_solution) {
      await navigator.clipboard.writeText(post.potential_solution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openRedditPost = () => {
    window.open(post.post_url, "_blank");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
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

  // Get priority based on upvotes
  const getPriority = () => {
    const upvotes = post.upvotes || 0;
    if (upvotes >= 50) return { label: "High", class: "badge-high" };
    if (upvotes >= 20) return { label: "Medium", class: "badge-medium" };
    return { label: "Low", class: "badge-low" };
  };

  // Generate title
  const getTitle = () => {
    const summary = post.post_summary || post.original_post || "";
    const firstSentence = summary.split(/[.!?]/)[0];
    if (firstSentence.length > 80) {
      return firstSentence.substring(0, 77) + "...";
    }
    return firstSentence || "Untitled Problem";
  };

  // Get tags
  const getTags = () => {
    if (post.keyword) {
      return post.keyword.split(",").map(k => k.trim()).filter(Boolean);
    }
    return ["general"];
  };

  const getComments = () => Math.floor(Math.random() * 30) + 1;

  const priority = getPriority();
  const tags = getTags();

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-blue-600">
                r/{post.subreddit}
              </span>
              <span className="text-xs text-slate-400">
                {formatSubredditSize(post.subreddit_size)}
              </span>
              <span className={`badge ${priority.class}`}>
                {priority.label}
              </span>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            {getTitle()}
          </h2>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {post.upvotes || 0} upvotes
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {getComments()} comments
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(post.original_post_date)}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("solution")}
              className={`tab-button ${activeTab === "solution" ? "active" : ""}`}
            >
              Potential Solution
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`tab-button ${activeTab === "summary" ? "active" : ""}`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab("original")}
              className={`tab-button ${activeTab === "original" ? "active" : ""}`}
            >
              Original Post
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`tab-button ${activeTab === "notes" ? "active" : ""}`}
            >
              Research Notes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[300px] overflow-y-auto">
          {activeTab === "solution" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">AI-Generated Solution</h3>
                <button
                  onClick={copySolution}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied ? "Copied!" : "Copy Solution"}
                </button>
              </div>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {post.potential_solution || "No solution available for this post."}
              </p>
            </div>
          )}

          {activeTab === "summary" && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Problem Summary</h3>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {post.post_summary || "No summary available for this post."}
              </p>
            </div>
          )}

          {activeTab === "original" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Original Reddit Post</h3>
                <button
                  onClick={openRedditPost}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open on Reddit
                </button>
              </div>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {post.original_post || "Original post content not available."}
              </p>
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Research Notes</h3>
                {saving && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your research notes here..."
                className="w-full h-40 p-4 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-600"
              />
              <p className="text-xs text-slate-400 mt-2">
                Notes are automatically saved to the database.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 flex-wrap">
            {tags.map((tag, index) => (
              <span key={index} className="tag-chip">
                #{tag.replace("#", "")}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
