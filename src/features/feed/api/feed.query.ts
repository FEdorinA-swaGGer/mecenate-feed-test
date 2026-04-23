import { useInfiniteQuery } from '@tanstack/react-query';

import { getPosts } from './feed.api';
import { PostsPageDto } from './feed.types';

export const FEED_QUERY_KEY = ['feed', 'posts'] as const;

export const useFeedInfiniteQuery = () =>
  useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) =>
      getPosts({
        cursor: (pageParam as string | null) ?? null,
        limit: 10,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: PostsPageDto) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });