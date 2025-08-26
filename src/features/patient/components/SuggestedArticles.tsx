"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { Article } from "../types";

interface SuggestedArticlesProps {
  articles: Article[];
  onNavigate: (page: string) => void;
}

export function SuggestedArticles({
  articles,
  onNavigate,
}: SuggestedArticlesProps) {
  const displayArticles = articles;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Bài viết đề xuất
        </h2>
        <button
          onClick={() => onNavigate("community")}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Xem thêm →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayArticles.map((article) => (
          <div key={article.id} className="group cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>
            <div className="flex items-center text-xs text-gray-500">
              <BookOpen className="w-3 h-3 mr-1" />
              {article.readTime}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
