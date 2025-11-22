"use client";

import React, { useState } from 'react';
import { X, BookOpen, Calendar, User, MessageCircle, Send } from 'lucide-react';
import { Post, Comment, postComment, CommentTargetType } from '@/lib/api/communication/communication';
import { usePostComments } from '@/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';

interface PostDetailModalProps {
    post: Post;
    onClose: () => void;
}

export function PostDetailModal({ post, onClose }: PostDetailModalProps) {
    const [commentText, setCommentText] = useState('');
    const [commentPage, setCommentPage] = useState(0);
    const queryClient = useQueryClient();
    const { user } = useAuthContext();

    const { data: commentsData, isLoading: commentsLoading } = usePostComments({
        postId: post.post_id,
        page: commentPage,
        size: 10
    });

    const comments: Comment[] = commentsData?.data || [];

    const createCommentMutation = useMutation({
        mutationFn: postComment,
        onSuccess: () => {
            // Refetch comments after successful post
            queryClient.invalidateQueries({ queryKey: ['postComments', post.post_id] });
            setCommentText('');
        },
        onError: (error) => {
            console.error('Failed to post comment:', error);
            alert('Không thể gửi bình luận. Vui lòng thử lại!');
        }
    });

    const calculateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} phút đọc`;
    };

    const handleSubmitComment = () => {
        if (!commentText.trim() || !user) return;

        createCommentMutation.mutate({
            target_id: post.post_id,
            target_type: CommentTargetType.POST,
            author_id: user.userId,
            author_name: user.name || user.fullName || 'Anonymous',
            author_avatar: user.avatar || user.avatarUrl || '',
            content: commentText.trim(),
            rating: 0,
            imageUrls: []
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">{post.title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Post Info */}
                    <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-200">
                        <img
                            src={post.author_avatar}
                            alt={post.author_name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{post.author_name}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{calculateReadTime(post.content)}</span>
                                </div>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {post.category}
                        </span>
                    </div>

                    {/* Post Images */}
                    {post.image_urls && post.image_urls.length > 0 && (
                        <div className="mb-6">
                            {post.image_urls.length === 1 ? (
                                <div className="rounded-xl overflow-hidden border-4 border-white shadow-lg">
                                    <img
                                        src={post.image_urls[0]}
                                        alt={post.title}
                                        className="w-full max-h-[500px] object-cover"
                                    />
                                </div>
                            ) : post.image_urls.length === 2 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {post.image_urls.map((url, index) => (
                                        <div key={index} className="rounded-xl overflow-hidden border-4 border-white shadow-lg">
                                            <img
                                                src={url}
                                                alt={`${post.title} - Ảnh ${index + 1}`}
                                                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(url, '_blank');
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : post.image_urls.length === 3 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                                        <img
                                            src={post.image_urls[0]}
                                            alt={`${post.title} - Ảnh 1`}
                                            className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(post.image_urls[0], '_blank');
                                            }}
                                        />
                                    </div>
                                    {post.image_urls.slice(1).map((url, index) => (
                                        <div key={index + 1} className="rounded-xl overflow-hidden border-4 border-white shadow-lg">
                                            <img
                                                src={url}
                                                alt={`${post.title} - Ảnh ${index + 2}`}
                                                className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(url, '_blank');
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {post.image_urls.map((url, index) => (
                                        <div key={index} className="rounded-xl overflow-hidden border-4 border-white shadow-lg">
                                            <img
                                                src={url}
                                                alt={`${post.title} - Ảnh ${index + 1}`}
                                                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(url, '_blank');
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Post Content */}
                    <div className="prose prose-sm max-w-none mb-8">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <MessageCircle className="w-5 h-5" />
                            <span>Bình luận ({comments.length})</span>
                        </h3>

                        {/* Comment Input */}
                        <div className="mb-6 bg-gray-50 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <img
                                    src={user?.avatar || user?.avatarUrl || '/api/placeholder/32/32'}
                                    alt={user?.name || user?.fullName || 'User'}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Viết bình luận của bạn..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={handleSubmitComment}
                                            disabled={!commentText.trim() || createCommentMutation.isPending || !user}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            <span>{createCommentMutation.isPending ? 'Đang gửi...' : 'Gửi'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        {commentsLoading ? (
                            <div className="text-center py-8 text-gray-500">Đang tải bình luận...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</div>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment: Comment) => (
                                    <div key={comment.comment_id} className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-start space-x-3">
                                            <img
                                                src={comment.author_avatar}
                                                alt={comment.author_name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium text-gray-900">{comment.author_name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>

                                                {/* Comment Images */}
                                                {comment.imageUrls && comment.imageUrls.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {comment.imageUrls.map((url, index) => (
                                                            <img
                                                                key={index}
                                                                src={url}
                                                                alt={`Comment image ${index + 1}`}
                                                                className="w-20 h-20 object-cover rounded-lg"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
