"use client";

import { useState, useEffect } from "react";

type PipelineStatus = "idle" | "running" | "success" | "failed";

interface DiscoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiscoverModal({ isOpen, onClose }: DiscoverModalProps) {
  const [subreddit, setSubreddit] = useState("");
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState<PipelineStatus>("idle");
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSubreddit("");
      setKeywords("");
      setStatus("idle");
      setError(null);
      setLastRun(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("running");
    setError(null);

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subreddit,
          keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to trigger pipeline");
      }

      setStatus("success");
      setLastRun(new Date());
      
      // Close modal and refresh inbox after a delay
      setTimeout(() => {
        onClose();
        // Trigger a page refresh to show new posts
        window.location.reload();
      }, 2000);
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "success":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "failed":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl sm:rounded-2xl max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up m-0 sm:m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Find Posts</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Discover new problems from Reddit communities
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label
              htmlFor="subreddit"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              Subreddit Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subreddit"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
              placeholder="e.g., entrepreneur, startups, smallbusiness"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Enter the subreddit name without the &quot;r/&quot; prefix
            </p>
          </div>

          <div>
            <label
              htmlFor="keywords"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              Keywords
            </label>
            <input
              type="text"
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
              placeholder="e.g., problem, issue, challenge, struggle"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Separate multiple keywords with commas
            </p>
          </div>

          <button
            type="submit"
            disabled={status === "running" || !subreddit.trim()}
            className="w-full px-6 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed font-semibold transition-all shadow-sm hover:shadow-md disabled:shadow-none text-base"
          >
            {status === "running" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Finding Posts...
              </span>
            ) : (
              "Find Posts"
            )}
          </button>
        </form>

        {status !== "idle" && (
          <div className={`mt-6 p-4 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-start gap-3">
              {status === "running" && (
                <svg className="w-5 h-5 text-amber-600 mt-0.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {status === "success" && (
                <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {status === "failed" && (
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <div className="flex-1">
                <p className="font-semibold text-slate-900 mb-1">Status</p>
                <p className="text-sm capitalize font-medium">{status}</p>
                {error && (
                  <div className="mt-2 pt-2 border-t border-red-200">
                    <p className="text-sm font-medium text-red-800">
                      {error}
                    </p>
                  </div>
                )}
                {status === "success" && lastRun && (
                  <p className="text-xs text-slate-600 mt-2">
                    Started at {lastRun.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
