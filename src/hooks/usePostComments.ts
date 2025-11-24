import { useQuery } from '@tanstack/react-query';
import { getCommentByPostId } from '@/lib/api/communication/communication';

interface UsePostCommentsProps {
    postId: string | null;
    page?: number;
    size?: number;
    enabled?: boolean;
}

export const usePostComments = ({ postId, page = 0, size = 10, enabled = true }: UsePostCommentsProps) => {
    return useQuery({
        queryKey: ['postComments', postId, page, size],
        queryFn: () => {
            if (!postId) throw new Error('Post ID is required');
            return getCommentByPostId(postId, page, size);
        },
        enabled: enabled && !!postId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
