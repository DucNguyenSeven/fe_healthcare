"use client";

import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost, CreatePostRequest } from '@/lib/api/communication/communication';
import { uploadMultipleImage } from '@/lib/api/upload';
import { useAuthContext } from '@/contexts/AuthContext';

interface CreatePostModalProps {
    onClose: () => void;
}

export function CreatePostModal({ onClose }: CreatePostModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<'BLOG' | 'NEW'>('BLOG');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const { user } = useAuthContext();
    const queryClient = useQueryClient();

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            onClose();
        },
        onError: (error) => {
            console.error('Failed to create post:', error);
            alert('Không thể tạo bài viết. Vui lòng thử lại!');
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setSelectedFiles([...selectedFiles, ...newFiles]);

            // Create preview URLs
            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        setImageUrls(prev => [...prev, e.target!.result as string]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveImage = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim() || !user) return;

        try {
            setIsUploading(true);

            // Upload images first if any
            let uploadedImageUrls: string[] = [];
            if (selectedFiles.length > 0) {
                const uploadResult = await uploadMultipleImage(selectedFiles);
                uploadedImageUrls = uploadResult.imageUrls;
            }

            const postData: CreatePostRequest = {
                author_id: user.userId,
                author_name: user.name || user.fullName || 'Doctor',
                author_avatar: user.avatar || user.avatarUrl || '',
                title: title.trim(),
                content: content.trim(),
                image_urls: uploadedImageUrls,
                category: category
            };

            createPostMutation.mutate(postData);
        } catch (error) {
            console.error('Failed to upload images:', error);
            alert('Không thể tải ảnh lên. Vui lòng thử lại!');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-semibold text-gray-900">Tạo bài viết mới</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Danh mục <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setCategory('BLOG')}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${category === 'BLOG'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                Blog
                            </button>
                            <button
                                onClick={() => setCategory('NEW')}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${category === 'NEW'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                Tin tức
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề bài viết..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={200}
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                            {title.length}/200
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Viết nội dung bài viết của bạn..."
                            rows={10}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                            {content.length} ký tự
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="file"
                                id="image-upload"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="image-upload"
                                className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Chọn hình ảnh từ thiết bị</span>
                            </label>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Bạn có thể chọn nhiều ảnh cùng lúc
                        </div>

                        {/* Image Preview */}
                        {imageUrls.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {imageUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/api/placeholder/100/100';
                                            }}
                                        />
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={createPostMutation.isPending || isUploading}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || !content.trim() || createPostMutation.isPending || isUploading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        <Send className="w-4 h-4" />
                        <span>
                            {isUploading ? 'Đang tải ảnh...' : createPostMutation.isPending ? 'Đang đăng...' : 'Đăng bài'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
