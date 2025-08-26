"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  User,
  MessageCircle,
  ThumbsUp,
  Share2,
  Plus,
  Send,
  Flag,
  Award,
  ExternalLink,
  Calendar,
  Tag,
  Eye,
  TrendingUp,
} from "lucide-react";
import { User as UserType } from "./HealthcarePlusApp";
interface CommunityPageProps {
  user: UserType;
}
type CommunityView = "blog" | "news" | "forum";
type ForumTab = "all" | "doctor" | "experience";
type SortOption = "newest" | "popular" | "trending";
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  readTime: string;
  publishDate: string;
  tags: string[];
  author: string;
  views: number;
}
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  source: string;
  publishDate: string;
  views: number;
  category: string;
}
interface ForumPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    role: "patient" | "doctor" | "moderator";
    avatar: string;
  };
  category: string;
  tags: string[];
  replies: number;
  upvotes: number;
  publishDate: string;
  isAnswered?: boolean;
  hasExpertReply?: boolean;
}
interface Comment {
  id: string;
  author: {
    name: string;
    role: "patient" | "doctor" | "moderator";
    avatar: string;
  };
  content: string;
  publishDate: string;
  upvotes: number;
  isExpertAnswer?: boolean;
}
export function CommunityPage({ user }: CommunityPageProps) {
  const [currentView, setCurrentView] = useState<CommunityView>("blog");
  const [forumTab, setForumTab] = useState<ForumTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const blogTags = [
    "Dinh dưỡng",
    "Huyết áp",
    "Lọc máu",
    "Ghép thận",
    "Thuốc",
    "Tập thể dục",
    "Tâm lý",
    "Chế độ ăn",
  ];
  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "Chế độ ăn uống khoa học cho người bệnh thận mạn",
      excerpt:
        "Hướng dẫn chi tiết về cách xây dựng thực đơn phù hợp, cân bằng dinh dưỡng và kiểm soát các chỉ số quan trọng...",
      coverImage: "/api/placeholder/400/250",
      readTime: "8 phút đọc",
      publishDate: "2024-01-15",
      tags: ["Dinh dưỡng", "Chế độ ăn"],
      author: "BS. Nguyễn Thị Lan",
      views: 1250,
    },
    {
      id: "2",
      title: "Tập thể dục an toàn với CKD: Những điều cần biết",
      excerpt:
        "Các bài tập phù hợp cho từng giai đoạn bệnh thận mạn, cách theo dõi cường độ và dấu hiệu cần dừng lại...",
      coverImage: "/api/placeholder/400/250",
      readTime: "6 phút đọc",
      publishDate: "2024-01-12",
      tags: ["Tập thể dục", "CKD"],
      author: "ThS. Trần Văn Minh",
      views: 980,
    },
    {
      id: "3",
      title: "Hiểu rõ về chỉ số eGFR và ý nghĩa lâm sàng",
      excerpt:
        "Giải thích chi tiết về chỉ số eGFR, cách tính toán, ý nghĩa của từng mức độ và cách theo dõi hiệu quả...",
      coverImage: "/api/placeholder/400/250",
      readTime: "5 phút đọc",
      publishDate: "2024-01-10",
      tags: ["Xét nghiệm", "eGFR"],
      author: "BS. Lê Hoàng Nam",
      views: 1580,
    },
    {
      id: "4",
      title: "Quản lý stress và sức khỏe tâm lý với CKD",
      excerpt:
        "Tác động của stress lên chức năng thận, các kỹ thuật thư giãn và cách duy trì tinh thần tích cực...",
      coverImage: "/api/placeholder/400/250",
      readTime: "7 phút đọc",
      publishDate: "2024-01-08",
      tags: ["Tâm lý", "Stress"],
      author: "ThS. Phạm Thị Hoa",
      views: 750,
    },
    {
      id: "5",
      title: "Thuốc điều trị CKD: Tác dụng và lưu ý",
      excerpt:
        "Tổng quan về các nhóm thuốc chính trong điều trị CKD, cách sử dụng đúng và theo dõi tác dụng phụ...",
      coverImage: "/api/placeholder/400/250",
      readTime: "10 phút đọc",
      publishDate: "2024-01-05",
      tags: ["Thuốc", "Điều trị"],
      author: "BS. Võ Minh Tuấn",
      views: 1120,
    },
    {
      id: "6",
      title: "Chuẩn bị cho lọc máu: Hướng dẫn toàn diện",
      excerpt:
        "Những điều cần biết trước khi bắt đầu lọc máu, cách chuẩn bị tâm lý và thể chất, chế độ sinh hoạt...",
      coverImage: "/api/placeholder/400/250",
      readTime: "12 phút đọc",
      publishDate: "2024-01-03",
      tags: ["Lọc máu", "Chuẩn bị"],
      author: "BS. Đặng Thị Mai",
      views: 2100,
    },
  ];
  const newsItems: NewsItem[] = [
    {
      id: "1",
      title: "Phát hiện mới về liệu pháp tế bào gốc trong điều trị CKD",
      summary:
        "Nghiên cứu gần đây cho thấy tiềm năng to lớn của liệu pháp tế bào gốc trong việc phục hồi chức năng thận...",
      thumbnail: "/api/placeholder/300/200",
      source: "Tạp chí Y học Việt Nam",
      publishDate: "2024-01-14",
      views: 850,
      category: "Nghiên cứu",
    },
    {
      id: "2",
      title: "Bộ Y tế công bố hướng dẫn mới về chăm sóc CKD",
      summary:
        "Hướng dẫn cập nhật các tiêu chuẩn chẩn đoán, điều trị và theo dõi bệnh nhân CKD tại Việt Nam...",
      thumbnail: "/api/placeholder/300/200",
      source: "Bộ Y tế",
      publishDate: "2024-01-12",
      views: 1200,
      category: "Chính sách",
    },
    {
      id: "3",
      title: "Công nghệ AI hỗ trợ dự đoán tiến triển CKD",
      summary:
        "Ứng dụng trí tuệ nhân tạo trong việc phân tích dữ liệu và dự đoán nguy cơ tiến triển bệnh thận mạn...",
      thumbnail: "/api/placeholder/300/200",
      source: "VnExpress Sức khỏe",
      publishDate: "2024-01-10",
      views: 650,
      category: "Công nghệ",
    },
    {
      id: "4",
      title: "Chương trình tầm soát CKD miễn phí tại TP.HCM",
      summary:
        "Sở Y tế TP.HCM triển khai chương trình tầm soát bệnh thận mạn miễn phí cho người dân...",
      thumbnail: "/api/placeholder/300/200",
      source: "Sở Y tế TP.HCM",
      publishDate: "2024-01-08",
      views: 920,
      category: "Sự kiện",
    },
  ];
  const forumPosts: ForumPost[] = [
    {
      id: "1",
      title: "eGFR 35, có nên bắt đầu chuẩn bị cho lọc máu không?",
      excerpt:
        "Mình 45 tuổi, eGFR giảm xuống 35 trong 6 tháng qua. Bác sĩ nói nên chuẩn bị tâm lý cho lọc máu. Mọi người có kinh nghiệm gì chia sẻ không ạ?",
      author: {
        name: "Nguyễn Văn A",
        role: "patient",
        avatar: "/api/placeholder/40/40",
      },
      category: "Hỏi bác sĩ",
      tags: ["eGFR", "Lọc máu", "Tư vấn"],
      replies: 12,
      upvotes: 8,
      publishDate: "2024-01-15T10:30:00",
      hasExpertReply: true,
    },
    {
      id: "2",
      title: "Chia sẻ thực đơn ít muối cho CKD giai đoạn 3",
      excerpt:
        "Sau 2 năm thử nghiệm, mình đã tìm ra được những món ăn vừa ngon vừa phù hợp với chế độ ít muối. Chia sẻ với mọi người...",
      author: {
        name: "Trần Thị B",
        role: "patient",
        avatar: "/api/placeholder/40/40",
      },
      category: "Chia sẻ kinh nghiệm",
      tags: ["Dinh dưỡng", "Thực đơn", "CKD3"],
      replies: 25,
      upvotes: 34,
      publishDate: "2024-01-14T15:20:00",
    },
    {
      id: "3",
      title: "Huyết áp tăng đột ngột sau khi thay thuốc, có nguy hiểm không?",
      excerpt:
        "Bác sĩ vừa thay thuốc huyết áp cho mình, nhưng 3 ngày nay huyết áp tăng lên 160/95. Có nên liên hệ bác sĩ ngay không ạ?",
      author: {
        name: "Lê Văn C",
        role: "patient",
        avatar: "/api/placeholder/40/40",
      },
      category: "Hỏi bác sĩ",
      tags: ["Huyết áp", "Thuốc", "Cấp cứu"],
      replies: 8,
      upvotes: 15,
      publishDate: "2024-01-14T09:15:00",
      hasExpertReply: true,
      isAnswered: true,
    },
  ];
  const comments: Comment[] = [
    {
      id: "1",
      author: {
        name: "BS. Trần Minh Hoàng",
        role: "doctor",
        avatar: "/api/placeholder/40/40",
      },
      content:
        "Với eGFR 35, bạn đang ở giai đoạn 3b của CKD. Việc chuẩn bị cho liệu pháp thay thế thận là cần thiết, nhưng không có nghĩa là phải bắt đầu ngay. Tôi khuyên bạn nên:\n\n1. Tối ưu hóa điều trị nội khoa\n2. Kiểm soát chặt chẽ huyết áp và đường huyết\n3. Tham khảo bác sĩ thận học về thời điểm phù hợp\n\nHãy đặt lịch khám để được tư vấn cụ thể nhé.",
      publishDate: "2024-01-15T11:00:00",
      upvotes: 12,
      isExpertAnswer: true,
    },
    {
      id: "2",
      author: {
        name: "Phạm Thị D",
        role: "patient",
        avatar: "/api/placeholder/40/40",
      },
      content:
        "Mình cũng từng ở tình trạng tương tự. Quan trọng là không nên quá lo lắng, hãy tuân thủ điều trị và theo dõi chặt chẽ. Mình đã duy trì được eGFR ổn định trong 2 năm qua.",
      publishDate: "2024-01-15T12:30:00",
      upvotes: 5,
    },
  ];
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  const getRoleColor = (role: "patient" | "doctor" | "moderator") => {
    switch (role) {
      case "doctor":
        return "bg-blue-100 text-blue-800";
      case "moderator":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getRoleLabel = (role: "patient" | "doctor" | "moderator") => {
    switch (role) {
      case "doctor":
        return "Bác sĩ";
      case "moderator":
        return "Quản trị";
      default:
        return "Bệnh nhân";
    }
  };
  const renderBlog = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTags([])}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTags.length === 0
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tất cả
          </button>
          {blogTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="aspect-video bg-gray-200 overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                {post.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{post.views}</span>
                  </div>
                </div>
                <span>
                  {new Date(post.publishDate).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">Tác giả: {post.author}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
            Trước
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded">
            1
          </button>
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
            2
          </button>
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
            3
          </button>
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
  const renderNews = () => (
    <div className="space-y-6">
      {/* Sort Options */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Tin tức sức khỏe
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="popular">Nhiều người đọc</option>
            <option value="trending">Xu hướng</option>
          </select>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {newsItems.map((news) => (
          <article
            key={news.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={news.thumbnail}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {news.category}
                  </span>
                  <span className="text-xs text-gray-500">{news.source}</span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  {news.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {news.summary}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(news.publishDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{news.views}</span>
                    </div>
                  </div>
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                    <ExternalLink className="w-3 h-3" />
                    <span>Đọc thêm</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
  const renderForum = () => (
    <div className="space-y-6">
      {/* Forum Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setForumTab("all")}
              className={`flex-1 px-6 py-4 text-center font-medium ${
                forumTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setForumTab("doctor")}
              className={`flex-1 px-6 py-4 text-center font-medium ${
                forumTab === "doctor"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Hỏi bác sĩ
            </button>
            <button
              onClick={() => setForumTab("experience")}
              className={`flex-1 px-6 py-4 text-center font-medium ${
                forumTab === "experience"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Chia sẻ kinh nghiệm
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Lọc</span>
              </button>
            </div>

            <button
              onClick={() => setShowNewPost(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng bài</span>
            </button>
          </div>

          {/* Forum Posts */}
          <div className="space-y-4">
            {forumPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      {post.isAnswered && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center space-x-1">
                          <Award className="w-3 h-3" />
                          <span>Đã giải đáp</span>
                        </span>
                      )}
                      {post.hasExpertReply && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Bác sĩ trả lời
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          <Tag className="w-3 h-3 inline mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">
                            {post.author.name}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full ${getRoleColor(
                              post.author.role
                            )}`}
                          >
                            {getRoleLabel(post.author.role)}
                          </span>
                        </div>
                        <span>{post.category}</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.replies}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{post.upvotes}</span>
                        </div>
                        <span>
                          {new Date(post.publishDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Đăng bài mới
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Chọn danh mục</option>
                  <option value="question">Hỏi bác sĩ</option>
                  <option value="experience">Chia sẻ kinh nghiệm</option>
                  <option value="discussion">Thảo luận</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tags, cách nhau bằng dấu phẩy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung
                </label>
                <textarea
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Viết nội dung bài viết của bạn..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="agree-rules" className="rounded" />
                <label htmlFor="agree-rules" className="text-sm text-gray-600">
                  Tôi đồng ý với{" "}
                  <button className="text-blue-600 hover:underline">
                    quy tắc cộng đồng
                  </button>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewPost(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Handle post creation
                  setShowNewPost(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedPost.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <img
                        src={selectedPost.author.avatar}
                        alt={selectedPost.author.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{selectedPost.author.name}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getRoleColor(
                          selectedPost.author.role
                        )}`}
                      >
                        {getRoleLabel(selectedPost.author.role)}
                      </span>
                    </div>
                    <span>
                      {new Date(selectedPost.publishDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="prose prose-sm max-w-none mb-6">
                <p>{selectedPost.excerpt}</p>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <button className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{selectedPost.upvotes}</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Share2 className="w-4 h-4" />
                  <span>Chia sẻ</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Flag className="w-4 h-4" />
                  <span>Báo cáo</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Bình luận ({comments.length})
                </h3>

                <div className="space-y-4 mb-6">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-xl ${
                        comment.isExpertAnswer
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">
                              {comment.author.name}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getRoleColor(
                                comment.author.role
                              )}`}
                            >
                              {getRoleLabel(comment.author.role)}
                            </span>
                            {comment.isExpertAnswer && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center space-x-1">
                                <Award className="w-3 h-3" />
                                <span>Giải đáp chuyên gia</span>
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                            {comment.content}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              {new Date(comment.publishDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                            <button className="flex items-center space-x-1 hover:text-blue-600">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{comment.upvotes}</span>
                            </button>
                            <button className="hover:text-blue-600">
                              Trả lời
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-start space-x-3">
                  <img
                    src={user.avatar || "/api/placeholder/32/32"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <textarea
                      rows={3}
                      placeholder="Viết bình luận..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-end mt-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Gửi</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  return (
    <div className="h-full flex flex-col">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setCurrentView("blog")}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === "blog"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Blog
          </button>
          <button
            onClick={() => setCurrentView("news")}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === "news"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Tin tức
          </button>
          <button
            onClick={() => setCurrentView("forum")}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === "forum"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Diễn đàn
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {currentView === "blog" && renderBlog()}
        {currentView === "news" && renderNews()}
        {currentView === "forum" && renderForum()}
      </div>
    </div>
  );
}
