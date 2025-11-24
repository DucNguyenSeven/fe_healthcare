import api from '../client';

export interface Comment {
    comment_id: string;
    target_id: string;
    target_type: CommentTargetType;
    author_id: string;
    author_name: string;
    author_avatar: string;
    content: string;
    rating: number;
    imageUrls: string[];
    createdAt: string;
    updatedAt: string;
}

export enum CommentTargetType {
    POST, DOCTOR
}

export interface CreateCommentRequest {
    target_id: string
    target_type: CommentTargetType
    author_id: string,
    author_name: string,
    author_avatar: string,
    content: string,
    rating: number,
    imageUrls: string[]
}

export interface UploadFile {
    imageUrls: string[];
    publicIds: string[];
}

export interface Post {
    post_id: string;
    author_id: string;
    author_name: string;
    author_avatar: string;
    title: string;
    content: string;
    image_urls: string[];
    category: 'BLOG' | 'NEW';
    createdAt: string;
    updatedAt: string;
}

export interface CreatePostRequest {
    author_id: string;
    author_name: string;
    author_avatar: string;
    title: string;
    content: string;
    image_urls: string[];
    category: string;
}

export interface CreatePostResponse {
    statusCode: number;
    message: string;
    success: boolean;
    data: Post;
}

export interface CreatePostRequest {
    author_id: string;
    author_name: string;
    author_avatar: string;
    title: string;
    content: string;
    image_urls: string[];
    category: string;
}

export enum PostCategory {
    BLOG = 'BLOG',
    NEW = 'NEW'
}

export interface PostsResponse {
    statusCode: number;
    message: string;
    success: boolean;
    data: Post[];
}

export interface CommentsResponse {
    statusCode: number;
    message: string;
    success: boolean;
    data: Comment[];
}

const api_url = '/api/v1/comments';
export const getCommentsByDoctorId = async (doctorId: string, page: number, size: number): Promise<Comment[]> => {
    const params = { page, size }
    const result = await api.get(`${api_url}/doctor/${doctorId}`, { params });
    return result.data.content;
}

export const postComment = async (comment: CreateCommentRequest): Promise<any> => {
    const result = await api.post(`${api_url}/create`, comment);
    return result;
}

export const getCommentByPostId = async (postId: string, page: number, size: number): Promise<CommentsResponse> => {
    const params = { page, size }
    const result = await api.get(`${api_url}/byPost/${postId}`, { params });
    return result.data;
}

const api_url_post = '/api/v1/posts'

export const getPosts = async (page: number = 0, size: number = 10): Promise<PostsResponse> => {
    const params = { page, size }
    const result = await api.get(`${api_url_post}/getPostWithPagination`, { params });
    return result.data;
}

export const createPost = async (post: CreatePostRequest): Promise<CreatePostResponse> => {
    const result = await api.post(`${api_url_post}/create`, post);
    return result.data;
}