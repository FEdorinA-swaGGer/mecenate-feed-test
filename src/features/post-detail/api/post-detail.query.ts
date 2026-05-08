import {
  InfiniteData,
  type QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { PostDto, PostsPageDto } from '../../feed/api/feed.types';
import {
  createPostComment,
  getPostById,
  getPostComments,
  togglePostLike,
} from './post-detail.api';
import { CommentsPageDto, ToggleLikeResponseDto } from './post-detail.types';
import { FEED_QUERY_KEY } from '../../feed/api/feed.query';

export const postDetailQueryKey = (postId: string) =>
  ['post-detail', 'post', postId] as const;
export const postCommentsQueryKey = (postId: string) =>
  ['post-detail', 'comments', postId] as const;

type ToggleLikeVariables = {
  postId: string;
};

type CreateCommentVariables = {
  postId: string;
  text: string;
};

export const usePostDetailQuery = (postId: string) =>
  useQuery({
    queryKey: postDetailQueryKey(postId),
    queryFn: () => getPostById(postId),
    enabled: Boolean(postId),
  });

export const usePostCommentsInfiniteQuery = (postId: string) =>
  useInfiniteQuery({
    queryKey: postCommentsQueryKey(postId),
    queryFn: ({ pageParam }) =>
      getPostComments({
        postId,
        cursor: (pageParam as string | null) ?? null,
        limit: 20,
      }),
    enabled: Boolean(postId),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: CommentsPageDto) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

type ToggleLikeRollbackContext = {
  previousPost: PostDto | undefined;
  previousFeeds: [QueryKey, InfiniteData<PostsPageDto, string | null> | undefined][];
  /** Был ли кэш деталки создан из элемента ленты в этом onMutate (нет отката через previousPost) */
  didSeedDetailFromFeed: boolean;
};

export const useTogglePostLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ToggleLikeResponseDto['data'],
    Error,
    ToggleLikeVariables,
    ToggleLikeRollbackContext
  >({
    mutationFn: ({ postId }: ToggleLikeVariables) => togglePostLike(postId),
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: postDetailQueryKey(postId) });
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });

      const previousPost = queryClient.getQueryData<PostDto>(postDetailQueryKey(postId));
      const previousFeeds = queryClient.getQueriesData<InfiniteData<PostsPageDto, string | null>>({
        queryKey: FEED_QUERY_KEY,
      });

      let detailSource: PostDto | undefined = previousPost;
      if (!detailSource) {
        for (const [, feedData] of previousFeeds) {
          if (!feedData) {
            continue;
          }
          for (const page of feedData.pages) {
            const fromFeed = page.posts.find((p) => p.id === postId);
            if (fromFeed) {
              detailSource = fromFeed;
              break;
            }
          }
          if (detailSource) {
            break;
          }
        }
      }

      const didSeedDetailFromFeed = !previousPost && Boolean(detailSource);

      if (detailSource) {
        const nextLiked = !detailSource.isLiked;
        const nextCount = Math.max(
          0,
          detailSource.likesCount + (nextLiked ? 1 : -1),
        );
        queryClient.setQueryData<PostDto>(postDetailQueryKey(postId), {
          ...detailSource,
          isLiked: nextLiked,
          likesCount: nextCount,
        });
      }

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
                if (post.id !== postId) {
                  return post;
                }
                const nextLiked = !post.isLiked;
                const nextCount = Math.max(0, post.likesCount + (nextLiked ? 1 : -1));
                return {
                  ...post,
                  isLiked: nextLiked,
                  likesCount: nextCount,
                };
              }),
            })),
          };
        },
      );

      return { previousPost, previousFeeds, didSeedDetailFromFeed };
    },
    onError: (_err, { postId }, context) => {
      if (!context) {
        return;
      }
      if (context.previousPost !== undefined) {
        queryClient.setQueryData(postDetailQueryKey(postId), context.previousPost);
      } else if (context.didSeedDetailFromFeed) {
        queryClient.removeQueries({ queryKey: postDetailQueryKey(postId) });
      }
      context.previousFeeds.forEach(([queryKey, snapshot]) => {
        queryClient.setQueryData(queryKey, snapshot);
      });
    },
    onSuccess: (likeData, { postId }) => {
      queryClient.setQueryData<PostDto>(postDetailQueryKey(postId), (oldPost) =>
        oldPost
          ? {
              ...oldPost,
              isLiked: likeData.isLiked,
              likesCount: likeData.likesCount,
            }
          : oldPost,
      );

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
              posts: page.posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: likeData.isLiked,
                      likesCount: likeData.likesCount,
                    }
                  : post,
              ),
            })),
          };
        },
      );
    },
  });
};

export const useCreatePostCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, text }: CreateCommentVariables) =>
      createPostComment(postId, { text }),
    onSuccess: (newComment, { postId }) => {
      const commentsKey = postCommentsQueryKey(postId);
      const before = queryClient.getQueryData<
        InfiniteData<CommentsPageDto, string | null>
      >(commentsKey);
      const duplicate =
        before?.pages[0]?.comments.some((c) => c.id === newComment.id) ?? false;

      if (before && before.pages.length > 0) {
        queryClient.setQueryData<InfiniteData<CommentsPageDto, string | null>>(
          commentsKey,
          (oldComments) => {
            if (!oldComments || oldComments.pages.length === 0) {
              return oldComments;
            }

            const [firstPage, ...restPages] = oldComments.pages;
            const alreadyExists = firstPage.comments.some(
              (comment) => comment.id === newComment.id,
            );

            if (alreadyExists) {
              return oldComments;
            }

            return {
              ...oldComments,
              pages: [
                {
                  ...firstPage,
                  comments: [newComment, ...firstPage.comments],
                },
                ...restPages,
              ],
            };
          },
        );
      } else {
        void queryClient.invalidateQueries({ queryKey: commentsKey });
      }

      /** WS мог прийти раньше ответа REST — список уже с тем же id */
      if (duplicate) {
        return;
      }

      queryClient.setQueryData<PostDto>(postDetailQueryKey(postId), (oldPost) =>
        oldPost
          ? {
              ...oldPost,
              commentsCount: oldPost.commentsCount + 1,
            }
          : oldPost,
      );

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
              posts: page.posts.map((post) =>
                post.id === postId
                  ? { ...post, commentsCount: post.commentsCount + 1 }
                  : post,
              ),
            })),
          };
        },
      );
    },
  });
};
