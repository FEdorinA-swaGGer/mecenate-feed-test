import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { FEED_QUERY_KEY } from '../../feed/api/feed.query';
import { PostDto, PostsPageDto } from '../../feed/api/feed.types';
import { useRootStore } from '../../../shared/model/root-store-context';
import { env } from '../../../shared/config/env';
import {
  postCommentsQueryKey,
  postDetailQueryKey,
} from '../api/post-detail.query';
import { CommentsPageDto, PostRealtimeEvent } from '../api/post-detail.types';

const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000] as const;

const createWsUrl = (token: string): string => {
  const normalizedBaseUrl = env.apiBaseUrl.replace(/\/+$/, '');
  const wsBaseUrl = normalizedBaseUrl.replace(/^http/i, 'ws');

  return `${wsBaseUrl}/ws?token=${encodeURIComponent(token)}`;
};

const parseRealtimeEvent = (rawData: unknown): PostRealtimeEvent | null => {
  if (typeof rawData !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(rawData) as { type?: string };

    if (parsed.type === 'ping') {
      return { type: 'ping' };
    }

    if (
      parsed.type === 'like_updated' &&
      typeof (parsed as { postId?: unknown }).postId === 'string' &&
      typeof (parsed as { likesCount?: unknown }).likesCount === 'number'
    ) {
      return {
        type: 'like_updated',
        postId: (parsed as { postId: string }).postId,
        likesCount: (parsed as { likesCount: number }).likesCount,
      };
    }

    if (
      parsed.type === 'comment_added' &&
      typeof (parsed as { postId?: unknown }).postId === 'string' &&
      typeof (parsed as { comment?: unknown }).comment === 'object' &&
      (parsed as { comment?: unknown }).comment !== null
    ) {
      return parsed as PostRealtimeEvent;
    }

    return null;
  } catch {
    return null;
  }
};

type UsePostDetailRealtimeParams = {
  postId: string;
  enabled?: boolean;
};

export const usePostDetailRealtime = ({
  postId,
  enabled = true,
}: UsePostDetailRealtimeParams) => {
  const queryClient = useQueryClient();
  const { sessionStore } = useRootStore();
  const sessionId = sessionStore.sessionId;

  useEffect(() => {
    if (!enabled || !postId || !sessionId) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempt = 0;
    let isStopped = false;

    const updateFeedPostCounters = ({
      targetPostId,
      likesCount,
      commentsDelta,
    }: {
      targetPostId: string;
      likesCount?: number;
      commentsDelta?: number;
    }) => {
      queryClient.setQueriesData<InfiniteData<PostsPageDto, string | null>>(
        { queryKey: FEED_QUERY_KEY },
        (oldFeed) => {
          if (!oldFeed) {
            return oldFeed;
          }

          return {
            ...oldFeed,
            pages: oldFeed.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) => {
                if (post.id !== targetPostId) {
                  return post;
                }

                return {
                  ...post,
                  likesCount: likesCount ?? post.likesCount,
                  commentsCount:
                    typeof commentsDelta === 'number'
                      ? post.commentsCount + commentsDelta
                      : post.commentsCount,
                };
              }),
            })),
          };
        },
      );
    };

    const handleEvent = (event: PostRealtimeEvent) => {
      if (event.type === 'ping') {
        return;
      }

      if (event.type === 'like_updated') {
        queryClient.setQueryData<PostDto>(postDetailQueryKey(event.postId), (oldPost) => {
          if (!oldPost) {
            return oldPost;
          }

          return {
            ...oldPost,
            likesCount: event.likesCount,
          };
        });

        updateFeedPostCounters({
          targetPostId: event.postId,
          likesCount: event.likesCount,
        });

        return;
      }

      const commentsKey = postCommentsQueryKey(event.postId);
      const existing = queryClient.getQueryData<
        InfiniteData<CommentsPageDto, string | null>
      >(commentsKey);
      const duplicate =
        existing?.pages[0]?.comments.some((c) => c.id === event.comment.id) ??
        false;

      /** Мутация уже вставила тот же id — не дублируем счётчики и строку */
      if (duplicate) {
        return;
      }

      if (existing && existing.pages.length > 0) {
        queryClient.setQueryData<InfiniteData<CommentsPageDto, string | null>>(
          commentsKey,
          (oldComments) => {
            if (!oldComments || oldComments.pages.length === 0) {
              return oldComments;
            }
            const [firstPage, ...restPages] = oldComments.pages;
            return {
              ...oldComments,
              pages: [
                {
                  ...firstPage,
                  comments: [event.comment, ...firstPage.comments],
                },
                ...restPages,
              ],
            };
          },
        );
      } else {
        void queryClient.invalidateQueries({ queryKey: commentsKey });
      }

      queryClient.setQueryData<PostDto>(postDetailQueryKey(event.postId), (oldPost) => {
        if (!oldPost) {
          return oldPost;
        }

        return {
          ...oldPost,
          commentsCount: oldPost.commentsCount + 1,
        };
      });

      updateFeedPostCounters({
        targetPostId: event.postId,
        commentsDelta: 1,
      });
    };

    const scheduleReconnect = () => {
      if (isStopped) {
        return;
      }

      const delay =
        RECONNECT_DELAYS_MS[
          Math.min(reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)
        ];
      reconnectAttempt += 1;

      reconnectTimer = setTimeout(connect, delay);
    };

    const connect = () => {
      if (isStopped || !sessionId) {
        return;
      }

      socket = new WebSocket(createWsUrl(sessionId));

      socket.onopen = () => {
        reconnectAttempt = 0;
      };

      socket.onmessage = (message) => {
        const parsedEvent = parseRealtimeEvent(message.data);

        if (!parsedEvent) {
          return;
        }

        handleEvent(parsedEvent);
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onclose = () => {
        socket = null;
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      isStopped = true;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      socket?.close();
      socket = null;
    };
  }, [enabled, postId, queryClient, sessionId]);
};
