import { useQuery } from '@tanstack/react-query';
import { getPosts, PostsResponse } from '@/lib/api/communication/communication';

interface UsePostsOptions {
    page?: number;
    size?: number;
    enabled?: boolean;
}

export const usePosts = (options: UsePostsOptions = {}) => {
    const { page = 0, size = 100, enabled = true } = options;

    return useQuery<PostsResponse, Error>({
        queryKey: ['posts', page, size],
        queryFn: () => getPosts(page, size),
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
};
