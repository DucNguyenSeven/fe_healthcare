"use client";

import React, { useState } from 'react';
import { BookOpen, Calendar, ExternalLink, Plus } from 'lucide-react';
import { User as UserType } from './HealthcarePlusApp';
import { usePosts } from '@/hooks';
import { Post } from '@/lib/api/communication/communication';
import { PostDetailModal, CreatePostModal } from '@/components';
import { useAuthContext } from '@/contexts/AuthContext';

interface CommunityPageProps {
  user: UserType;
}
type CommunityView = 'blog' | 'news';
type SortOption = 'newest' | 'popular' | 'trending';
export function CommunityPage({
  user
}: CommunityPageProps) {
  const DEFAULT_POST_IMAGE = 'https://media.sohuutritue.net.vn/files/ductai/2023/11/03/thu-truong-tran-van-thuan-doi-moi-sang-tao-y-te-16985726992911142942850-1420.jpg';

  const [currentView, setCurrentView] = useState<CommunityView>('blog');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const { user: authUser } = useAuthContext();

  // Fetch data from API
  const { data: postsData, isLoading: postsLoading, error: postsError } = usePosts({ page, size: 100 });

  // Filter posts by category on frontend
  // Filter posts by category and search query
  const blogPosts = postsData?.data?.filter((post: Post) =>
    post.category === 'BLOG' &&
    (searchQuery === '' || post.title.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  const newsPosts = postsData?.data?.filter((post: Post) =>
    post.category === 'NEW' &&
    (searchQuery === '' || post.title.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} phút đọc`;
  };

  const renderBlog = () => {
    if (postsLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      );
    }

    if (postsError) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Search Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết theo tiêu đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              Chưa có bài viết nào
            </div>
          ) : (
            blogPosts.map((post: Post) => (
              <article
                key={post.post_id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : DEFAULT_POST_IMAGE}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                    {post.content}
                  </p>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{calculateReadTime(post.content)}</span>
                      </div>
                      <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center space-x-2">
                      <img
                        src={post.author_avatar}
                        alt={post.author_name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <p className="text-xs text-gray-600">{post.author_name}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded">
              {page + 1}
            </button>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={!postsData?.data || postsData.data.length < 100}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    );
  }; const renderNews = () => {
    if (postsLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      );
    }

    if (postsError) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Search Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <input
            type="text"
            placeholder="Tìm kiếm tin tức theo tiêu đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* News List */}
        <div className="space-y-4">
          {newsPosts.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              Chưa có tin tức nào
            </div>
          ) : (
            newsPosts.map((news: Post) => (
              <article
                key={news.post_id}
                onClick={() => setSelectedPost(news)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={news.image_urls && news.image_urls.length > 0 ? news.image_urls[0] : DEFAULT_POST_IMAGE}
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {news.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <img
                          src={news.author_avatar}
                          alt={news.author_name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-xs text-gray-500">{news.author_name}</span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {news.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {news.content}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(news.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{calculateReadTime(news.content)}</span>
                        </div>
                      </div>
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                        <span>Đọc thêm</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded">
              {page + 1}
            </button>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={!postsData?.data || postsData.data.length < 100}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    );
  };
  return <div className="h-full flex flex-col">
    {/* Navigation Tabs */}
    <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-8">
          <button onClick={() => setCurrentView('blog')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'blog' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Blog
          </button>
          <button onClick={() => setCurrentView('news')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'news' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Tin tức
          </button>
        </div>

        {/* Create Post Button - Only for Doctors */}
        {authUser?.role === 'DOCTOR' && (
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bài viết</span>
          </button>
        )}
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 p-4 lg:p-6 overflow-auto">
      {currentView === 'blog' && renderBlog()}
      {currentView === 'news' && renderNews()}
    </div>

    {/* Post Detail Modal */}
    {selectedPost && (
      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    )}

    {/* Create Post Modal - Only for Doctors */}
    {showCreatePost && authUser?.role === 'DOCTOR' && (
      <CreatePostModal
        onClose={() => setShowCreatePost(false)}
      />
    )}
  </div>;
}