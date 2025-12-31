"use client";

import { useState } from "react";
import Inbox from "@/components/Inbox";
import DiscoverModal from "@/components/Discover";
import Topics from "@/components/Topics";

type Tab = "inbox" | "topics";

export default function Home() {
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("inbox");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 sm:py-0 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-900">trade.ai</span>
            </div>

            {/* Navigation and Actions */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Navigation */}
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("inbox")}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "inbox"
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span className="hidden sm:inline">Inbox</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("topics")}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "topics"
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="hidden sm:inline">Topics</span>
                  </span>
                </button>
              </nav>

              {/* User Area */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDiscoverOpen(true)}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">Find Posts</span>
                  <span className="sm:hidden">Find</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === "inbox" && <Inbox />}
        {activeTab === "topics" && <Topics />}
      </main>

      {/* Discover Modal */}
      <DiscoverModal isOpen={isDiscoverOpen} onClose={() => setIsDiscoverOpen(false)} />
    </div>
  );
}
