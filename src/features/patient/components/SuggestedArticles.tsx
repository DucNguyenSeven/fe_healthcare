"use client";

import React from 'react';
import { BookOpen } from 'lucide-react';
import { Article } from '../types';

interface SuggestedArticlesProps {
  articles: Article[];
  onNavigate: (page: string) => void;
}

export function SuggestedArticles({ articles, onNavigate }: SuggestedArticlesProps) {
  const mockArticles: Article[] = [
    {
      id: '1',
      title: 'Chế độ ăn cho người bệnh thận mạn',
      excerpt: 'Hướng dẫn chi tiết về chế độ dinh dưỡng phù hợp...',
      image: '/api/placeholder/300/200',
      readTime: '5 phút đọc'
    },
    {
      id: '2',
      title: 'Tập thể dục an toàn với CKD',
      excerpt: 'Các bài tập phù hợp cho từng giai đoạn bệnh...',
      image: '/api/placeholder/300/200',
      readTime: '7 phút đọc'
    },
    {
      id: '3',
      title: 'Hiểu về chỉ số eGFR',
      excerpt: 'Ý nghĩa và cách theo dõi chỉ số quan trọng này...',
      image: '/api/placeholder/300/200',
      readTime: '4 phút đọc'
    }
  ];

  const displayArticles = articles.length > 0 ? articles : mockArticles;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bài viết đề xuất</h2>
        <button 
          onClick={() => onNavigate('community')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Xem thêm →
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayArticles.map(article => (
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
