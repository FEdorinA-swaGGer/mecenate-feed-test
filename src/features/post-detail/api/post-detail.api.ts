import { apiClient } from '../../../shared/api/client';

import {
  CommentsPageDto,
  CommentsResponseDto,
  CreateCommentPayloadDto,
  CreateCommentResponseDto,
  PostDetailResponseDto,
  ToggleLikeResponseDto,
} from './post-detail.types';
import { PostDto } from '../../feed/api/feed.types';

type GetPostCommentsParams = {
  postId: string;
  cursor?: string | null;
  limit?: number;
};

export const getPostById = async (postId: string): Promise<PostDto> => {
  const response = await apiClient.get<PostDetailResponseDto>(`/posts/${postId}`);

  return response.data.data.post;
};

export const togglePostLike = async (
  postId: string,
): Promise<ToggleLikeResponseDto['data']> => {
  const response = await apiClient.post<ToggleLikeResponseDto>(`/posts/${postId}/like`);

  return response.data.data;
};

export const getPostComments = async ({
  postId,
  cursor,
  limit = 20,
}: GetPostCommentsParams): Promise<CommentsPageDto> => {
  const response = await apiClient.get<CommentsResponseDto>(`/posts/${postId}/comments`, {
    params: {
      limit,
      cursor: cursor ?? undefined,
    },
  });

  return response.data.data;
};

export const createPostComment = async (
  postId: string,
  payload: CreateCommentPayloadDto,
): Promise<CreateCommentResponseDto['data']['comment']> => {
  const response = await apiClient.post<CreateCommentResponseDto>(
    `/posts/${postId}/comments`,
    payload,
  );

  return response.data.data.comment;
};
