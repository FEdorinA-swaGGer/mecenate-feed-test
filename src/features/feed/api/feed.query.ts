import { useInfiniteQuery } from '@tanstack/react-query';

import { getPosts } from './feed.api';
import { PostsPageDto } from './feed.types';

export const FEED_QUERY_KEY = ['feed', 'posts'] as const;
export type FeedTierFilter = 'all' | 'free' | 'paid';

export const getFeedQueryKey = (tier: FeedTierFilter) =>
  [...FEED_QUERY_KEY, tier] as const;

export const useFeedInfiniteQuery = (tier: FeedTierFilter) =>
  useInfiniteQuery({
    queryKey: getFeedQueryKey(tier),
    queryFn: ({ pageParam }) =>
      getPosts({
        cursor: (pageParam as string | null) ?? null,
        limit: 10,
        tier: tier === 'all' ? null : tier,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: PostsPageDto) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });