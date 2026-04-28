import { apiClient } from '../../../shared/api/client';
import { env } from '../../../shared/config/env';

import { PostsPageDto, PostsResponseDto } from './feed.types';

type GetPostsParams = {
  cursor?: string | null;
  limit?: number;
};

export const getPosts = async ({
  cursor,
  limit = 10,
}: GetPostsParams): Promise<PostsPageDto> => {
  const response = await apiClient.get<PostsResponseDto>('/posts', {
    params: {
      limit,
      cursor: cursor ?? undefined,
      simulate_error: env.simulateFeedError || undefined,
    },
  });

  return response.data.data;
};
