import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Eye, MessageCircle, Calendar, Tag, ExternalLink, Send, EyeOff, Award, BookOpen, X } from 'lucide-react';
const patientQuestions = [{
  id: 1,
  title: 'Tôi có nên uống nhiều nước hơn khi bị suy thận không?',
  author: 'Nguyễn Văn An',
  tags: ['Chế độ ăn uống', 'CKD giai đoạn 3'],
  date: '2024-01-15',
  replies: 3,
  hasReply: true
}, {
  id: 2,
  title: 'Thuốc hạ huyết áp có ảnh hưởng đến thận không?',
  author: 'Trần Thị Bình',
  tags: ['Thuốc', 'Huyết áp'],
  date: '2024-01-14',
  replies: 1,
  hasReply: false
}, {
  id: 3,
  title: 'Chỉ số eGFR 45 có nghiêm trọng không?',
  author: 'Lê Minh Cường',
  tags: ['Xét nghiệm', 'eGFR'],
  date: '2024-01-13',
  replies: 2,
  hasReply: true
}, {
  id: 4,
  title: 'Tôi có thể tập thể dục khi bị suy thận không?',
  author: 'Phạm Thị Dung',
  tags: ['Thể dục', 'Lối sống'],
  date: '2024-01-12',
  replies: 0,
  hasReply: false
}] as any[];
const medicalArticles = [{
  id: 1,
  title: 'Những tiến bộ mới trong điều trị bệnh thận mạn tính',
  source: 'Tạp chí Y học Việt Nam',
  date: '2024-01-15',
  views: 1250,
  category: 'Nghiên cứu'
}, {
  id: 2,
  title: 'Vai trò của AI trong chẩn đoán sớm CKD',
  source: 'Journal of Nephrology',
  date: '2024-01-14',
  views: 890,
  category: 'Công nghệ'
}, {
  id: 3,
  title: 'Chế độ ăn ít protein cho bệnh nhân suy thận',
  source: 'Kidney International',
  date: '2024-01-13',
  views: 2100,
  category: 'Dinh dưỡng'
}, {
  id: 4,
  title: 'Cập nhật hướng dẫn điều trị CKD 2024',
  source: 'American Journal of Kidney Diseases',
  date: '2024-01-12',
  views: 1680,
  category: 'Hướng dẫn'
}] as any[];

// @component: ForumModule
export const ForumModule = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [showReplyModal, setShowReplyModal] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const handleReply = (questionId: number) => {
    if (replyContent.trim()) {
      // Handle reply submission
      alert('Đã gửi câu trả lời thành công');
      setReplyContent('');
      setShowReplyModal(null);
    }
  };
  const handleHideQuestion = (questionId: number) => {
    // Handle hiding question
    alert('Đã ẩn câu hỏi');
  };
  const renderQuestions = () => <div className="space-y-4">
      {patientQuestions.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-[#334155]">Chưa có nội dung trong mục này</p>
        </div> : patientQuestions.map((question, index) => <motion.div key={question.id} initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: index * 0.1
    }} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{question.title}</h3>
                <div className="flex items-center gap-4 text-sm text-[#334155] mb-3">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{question.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(question.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} />
                    <span>{question.replies} trả lời</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag: string) => <span key={tag} className="px-3 py-1 bg-[#1E75FF]/10 text-[#1E75FF] rounded-full text-sm font-medium flex items-center gap-1">
                      <Tag size={12} />
                      {tag}
                    </span>)}
                </div>
                {question.hasReply && <div className="flex items-center gap-2 mb-4">
                    <Award size={16} className="text-[#10B981]" />
                    <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-sm font-medium">
                      Trả lời của bác sĩ
                    </span>
                  </div>}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowReplyModal(question.id)} className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
                <MessageCircle size={16} />
                <span>Trả lời</span>
              </button>
              <button onClick={() => handleHideQuestion(question.id)} className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
                <EyeOff size={16} />
                <span>Ẩn</span>
              </button>
            </div>
          </motion.div>)}
    </div>;
  const renderArticles = () => <div className="space-y-4">
      {medicalArticles.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-[#334155]">Chưa có nội dung trong mục này</p>
        </div> : medicalArticles.map((article, index) => <motion.div key={article.id} initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: index * 0.1
    }} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-[#0F172A]">{article.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${article.category === 'Nghiên cứu' ? 'bg-[#1E75FF]/10 text-[#1E75FF]' : article.category === 'Công nghệ' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : article.category === 'Dinh dưỡng' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                    {article.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#334155] mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <span>{article.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{article.views.toLocaleString()} lượt đọc</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
                <ExternalLink size={16} />
                <span>Xem chi tiết</span>
              </button>
            </div>
          </motion.div>)}
    </div>;

  // @return
  return <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0F172A]">Diễn đàn</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button onClick={() => setActiveTab('questions')} className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${activeTab === 'questions' ? 'text-[#1E75FF] border-b-2 border-[#1E75FF]' : 'text-[#334155] hover:text-[#1E75FF]'}`}>
              <MessageSquare size={20} />
              <span>Câu hỏi bệnh nhân</span>
            </button>
            <button onClick={() => setActiveTab('articles')} className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${activeTab === 'articles' ? 'text-[#1E75FF] border-b-2 border-[#1E75FF]' : 'text-[#334155] hover:text-[#1E75FF]'}`}>
              <BookOpen size={20} />
              <span>Bài viết & bài báo</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} transition={{
            duration: 0.2
          }}>
              {activeTab === 'questions' ? renderQuestions() : renderArticles()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.95
        }} className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#0F172A]">Trả lời câu hỏi</h3>
                <button onClick={() => setShowReplyModal(null)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                  <X size={16} className="text-[#334155]" />
                </button>
              </div>

              <div className="mb-4">
                <div className="p-4 bg-gray-50 rounded-xl mb-4">
                  <h4 className="font-medium text-[#0F172A] mb-2">
                    {patientQuestions.find(q => q.id === showReplyModal)?.title}
                  </h4>
                  <p className="text-sm text-[#334155]">
                    Câu hỏi từ: {patientQuestions.find(q => q.id === showReplyModal)?.author}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Câu trả lời của bác sĩ
                    </label>
                    <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Nhập câu trả lời chuyên môn..." rows={8} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent resize-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowReplyModal(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#334155] py-3 rounded-2xl font-medium transition-colors">
                  Hủy
                </button>
                <button onClick={() => handleReply(showReplyModal)} disabled={!replyContent.trim()} className="flex-1 bg-[#1E75FF] hover:bg-[#1659C9] text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={16} />
                  <span>Gửi trả lời</span>
                </button>
              </div>
            </motion.div>
          </div>}
      </AnimatePresence>
    </div>;
};