"use client";

import { Post } from "@/types";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
  onStarChange?: (postId: string, starred: boolean) => void;
}

type TabType = "solution" | "summary" | "original" | "notes";

// Component to format solution text with visual cards
function FormattedSolution({ text }: { text: string }) {
  // Split by double newlines first, then process
  const sections = text.split(/\n\s*\n/).filter(s => s.trim());
  
  // Try to identify structured sections
  const structuredSections: Array<{ type: string; title: string; content: string }> = [];
  
  sections.forEach((section) => {
    const trimmed = section.trim();
    
    // Look for patterns like "**Business Idea:**", "Description:", etc.
    const headingMatch = trimmed.match(/^\*\*([^*:]+):?\*\*|^([A-Z][^:\n]+):/);
    
    if (headingMatch) {
      const title = (headingMatch[1] || headingMatch[2] || '').trim();
      const content = trimmed.replace(/^\*\*[^*:]+:?\*\*\s*/, '').replace(/^[A-Z][^:\n]+:\s*/, '').trim();
      
      // Determine section type
      let type = 'general';
      const titleLower = title.toLowerCase();
      if (titleLower.includes('idea') || titleLower.includes('business')) type = 'idea';
      else if (titleLower.includes('description')) type = 'description';
      else if (titleLower.includes('feature') || titleLower.includes('benefit')) type = 'feature';
      else if (titleLower.includes('target') || titleLower.includes('market')) type = 'market';
      
      structuredSections.push({ type, title, content });
    } else {
      // Check if it's a list
      const listItems = trimmed.split('\n').filter(line => /^[-•*]\s|^\d+\.\s/.test(line.trim()));
      if (listItems.length > 0) {
        structuredSections.push({ 
          type: 'list', 
          title: '', 
          content: trimmed 
        });
      } else {
        structuredSections.push({ 
          type: 'general', 
          title: '', 
          content: trimmed 
        });
      }
    }
  });
  
  return (
    <div className="space-y-4">
      {structuredSections.map((section, idx) => {
        if (section.type === 'idea') {
          return (
            <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{section.title}</h4>
                  <p className="text-slate-700 leading-relaxed">
                    {formatInlineText(section.content)}
                  </p>
                </div>
              </div>
            </div>
          );
        }
        
        if (section.type === 'description') {
          return (
            <div key={idx} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-400 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900 mb-3">{section.title}</h4>
                  <p className="text-slate-700 leading-relaxed">
                    {formatInlineText(section.content)}
                  </p>
                </div>
              </div>
            </div>
          );
        }
        
        if (section.type === 'list') {
          const listItems = section.content.split('\n').filter(line => /^[-•*]\s|^\d+\.\s/.test(line.trim()));
          return (
            <div key={idx} className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
              <ul className="space-y-3">
                {listItems.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700 leading-relaxed flex-1">
                      {formatInlineText(item.replace(/^[-•*]\s|^\d+\.\s/, '').trim())}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        
        // General content card
        return (
          <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200">
            {section.title && (
              <h4 className="text-lg font-bold text-slate-900 mb-3">{section.title}</h4>
            )}
            <div className="text-slate-700 leading-relaxed space-y-3">
              {section.content.split('\n').filter(line => line.trim()).map((para, paraIdx) => (
                <p key={paraIdx}>{formatInlineText(para.trim())}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to format inline text (bold, etc.)
function formatInlineText(text: string) {
  const parts: (string | JSX.Element)[] = [];
  let currentIndex = 0;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;
  let lastIndex = 0;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the bold text
    parts.push(
      <strong key={match.index} className="font-semibold text-slate-900">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
}

export default function PostModal({ post, onClose, onStarChange }: PostModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("solution");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [starred, setStarred] = useState(post?.starred || false);
  const [isTogglingStar, setIsTogglingStar] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  // Update starred state when post changes
  useEffect(() => {
    if (post) {
      setStarred(post.starred || false);
    }
  }, [post]);

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

  const handleStarClick = async () => {
    if (!post || isTogglingStar) return;
    
    setIsTogglingStar(true);
    const newStarred = !starred;
    
    try {
      const response = await fetch(`/api/posts/${post.id}/star`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: newStarred }),
      });
      
      if (response.ok) {
        setStarred(newStarred);
        // Update the post object if needed
        if (post) {
          post.starred = newStarred;
        }
        // Notify parent component
        if (onStarChange) {
          onStarChange(post.id, newStarred);
        }
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
    } finally {
      setIsTogglingStar(false);
    }
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

  const priority = getPriority();
  const tags = getTags();

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl sm:rounded-2xl max-w-5xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up m-0 sm:m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap flex-1 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-blue-600">
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
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 break-words">
            {getTitle()}
          </h2>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {post.upvotes || 0} upvotes
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
        <div className="px-4 sm:px-6 border-b border-slate-100 overflow-x-auto">
          <div className="flex gap-2 min-w-max sm:min-w-0">
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
            <div className="p-4 sm:p-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
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
              <div className="solution-content">
                {post.potential_solution ? (
                  <FormattedSolution text={post.potential_solution} />
                ) : (
                  <p className="text-slate-500 italic">No solution available for this post.</p>
                )}
              </div>
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
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 bg-slate-50/50">
              <div className="flex items-center gap-2 flex-wrap">
                {tags.map((tag, index) => (
                  <span key={index} className="tag-chip">
                    #{tag.replace("#", "")}
                  </span>
                ))}
              </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleStarClick}
              disabled={isTogglingStar}
              className={`p-2 rounded-lg transition-colors ${
                starred
                  ? "text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50"
                  : "text-slate-400 hover:text-yellow-400 hover:bg-slate-100"
              }`}
              aria-label={starred ? "Unstar" : "Star"}
            >
              <svg
                className="w-5 h-5"
                fill={starred ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
