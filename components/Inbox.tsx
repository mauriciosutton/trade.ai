"use client";

import { useEffect, useState, useMemo } from "react";
import { Post } from "@/types";
import PostCard from "./PostCard";
import PostModal from "./PostModal";

type SortOption = "upvotes" | "date" | "subreddit";

export default function Inbox() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/posts?limit=50");
      const data = await response.json();
      
      // Deduplicate by post_url
      const postsMap = new Map<string, Post>();
      (data.posts || []).forEach((post: Post) => {
        const existing = postsMap.get(post.post_url);
        if (!existing || new Date(post.created_at) > new Date(existing.created_at)) {
          postsMap.set(post.post_url, post);
        }
      });
      
      setPosts(Array.from(postsMap.values()));
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clean topic text for display
  const cleanTopicText = (topic: string) => {
    return topic
      .replace(/\*/g, '') // Remove all asterisks
      .replace(/#/g, '') // Remove all # symbols
      .replace(/topic\s*:?\s*/gi, '') // Remove "topic" (case-insensitive) and any colons/spaces
      .trim();
  };

  // Extract trending topics from posts (using topic column)
  const trendingTopics = useMemo(() => {
    const topicCounts = new Map<string, number>();
    
    posts.forEach(post => {
      if (post.topic) {
        // Handle both single topic and comma-separated topics
        const topics = post.topic.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
        topics.forEach(topic => {
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
        });
      }
    });
    
    // Sort by count and return top 6
    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([topic, count]) => ({ topic, count }));
  }, [posts]);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;
    
    // Filter by selected topic
    if (selectedTopic) {
      filtered = posts.filter(post => 
        post.topic?.toLowerCase().includes(selectedTopic.toLowerCase())
      );
    }
    
    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "upvotes":
          return (b.upvotes || 0) - (a.upvotes || 0);
        case "date":
          return new Date(b.original_post_date || 0).getTime() - 
                 new Date(a.original_post_date || 0).getTime();
        case "subreddit":
          return a.subreddit.localeCompare(b.subreddit);
        default:
          return 0;
      }
    });
  }, [posts, sortBy, selectedTopic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading problems...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trending Topics Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
          <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-900">
            <span className="text-lg sm:text-xl">🔥</span>
            Trending Topics
          </h2>
          <span className="text-xs sm:text-sm text-slate-400">Most frequently mentioned</span>
        </div>
        
        {trendingTopics.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {trendingTopics.map(({ topic, count }) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                  className={`topic-chip justify-between ${
                    selectedTopic === topic 
                      ? "bg-blue-100 border-blue-300 ring-2 ring-blue-200" 
                      : ""
                  }`}
                >
                  <div className="flex items-center">
                    <span>{cleanTopicText(topic)}</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </button>
              ))}
            </div>
            
            {selectedTopic && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-slate-500">Filtering by:</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {cleanTopicText(selectedTopic)}
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">
              No topics found. Topics will appear here once posts are processed with topic modeling.
            </p>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="text-sm sm:text-base text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filteredAndSortedPosts.length}</span> of{" "}
          <span className="font-semibold text-slate-900">{posts.length}</span> problems
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <span className="text-xs sm:text-sm text-slate-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="upvotes">Upvotes (High to Low)</option>
            <option value="date">Date (Newest First)</option>
            <option value="subreddit">Subreddit (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      {filteredAndSortedPosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No problems found</h3>
          <p className="text-sm sm:text-base text-slate-500 mb-4 px-4">
            {selectedTopic 
              ? `No problems found with topic "${selectedTopic}"`
              : "Run a scraping job from the Discover tab to get started"
            }
          </p>
          {selectedTopic && (
            <button
              onClick={() => setSelectedTopic(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAndSortedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>
          )}

      {/* Modal */}
      <PostModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
