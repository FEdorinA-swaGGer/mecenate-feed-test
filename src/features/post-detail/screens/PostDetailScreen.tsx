import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { RootStackParamList } from '../../../app/navigation/types';
import { PaidPostLockedCover } from '../../feed/components/PaidPostPlaceholder';
import { PostDto } from '../../feed/api/feed.types';
import { theme } from '../../../shared/theme/theme';
import { usePostCommentsInfiniteQuery, usePostDetailQuery } from '../api/post-detail.query';
import { CommentDto } from '../api/post-detail.types';
import { AnimatedLikePill } from '../components/AnimatedLikePill';
import {
  COMMENT_COMPOSER_BAR_HEIGHT,
  CommentComposer,
} from '../components/CommentComposer';
import { usePostDetailRealtime } from '../realtime/usePostDetailRealtime';

/** Figma post-detail pills — comment bubble 15×14 */
const PostDetailCommentIcon = () => (
  <Svg width={15} height={14} viewBox="0 0 15 14" fill="none">
    <Path
      d="M15 6.09375C15 9.45996 11.6426 12.1875 7.50002 12.1875C6.4131 12.1875 5.38185 12 4.45021 11.6631C4.10158 11.918 3.53322 12.2666 2.85939 12.5596C2.15626 12.8643 1.30958 13.125 0.468764 13.125C0.278335 13.125 0.108413 13.0107 0.0351706 12.835C-0.0380716 12.6592 0.00294399 12.46 0.13478 12.3252L0.143569 12.3164C0.152358 12.3076 0.164077 12.2959 0.181655 12.2754C0.213882 12.2402 0.263686 12.1846 0.32521 12.1084C0.445327 11.9619 0.60646 11.7451 0.770522 11.4756C1.06349 10.9893 1.34181 10.3506 1.39748 9.63281C0.518569 8.63672 1.43097e-05 7.41504 1.43097e-05 6.09375C1.43097e-05 2.72754 3.35744 0 7.50002 0C11.6426 0 15 2.72754 15 6.09375Z"
      fill={theme.colors.pillIconLike}
    />
  </Svg>
);

type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;
type PostDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PostDetail'
>;

type PostDetailScreenProps = {
  route: PostDetailRouteProp;
};

const pd = theme.postDetail;
const fc = theme.feedCard;

const commentsCountLabel = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) {
    return `${n} комментариев`;
  }
  if (mod10 === 1) {
    return `${n} комментарий`;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return `${n} комментария`;
  }
  return `${n} комментариев`;
};

type CommentMetricProps = { count: number };

const CommentMetric = ({ count }: CommentMetricProps) => (
  <View style={styles.actionPill}>
    <View style={styles.pillIconWrap}>
      <PostDetailCommentIcon />
    </View>
    <Text style={styles.actionPillText}>{count}</Text>
  </View>
);

const PaidDetailLockedBody = () => (
  <View style={styles.paidBodySkeleton}>
    <View style={styles.skeletonLineTitle} />
    <View style={styles.skeletonLinePara} />
    <View style={styles.skeletonLinePara} />
    <View style={styles.skeletonLineParaShort} />
  </View>
);

type CommentRowProps = { comment: CommentDto };

const CommentRow = ({ comment }: CommentRowProps) => (
  <View style={styles.commentRow}>
    <View style={styles.commentMain}>
      <Image source={{ uri: comment.author.avatarUrl }} style={styles.avatar} />
      <View style={styles.commentTextCol}>
        <Text style={styles.commentAuthor} numberOfLines={1}>
          {comment.author.displayName}
        </Text>
        <Text style={styles.commentBody}>{comment.text}</Text>
      </View>
    </View>
  </View>
);

type PostDetailListHeaderProps = { post: PostDto };

/** Шапка поста + заголовок блока комментариев (всё выше списка) */
const PostDetailListHeader = ({ post }: PostDetailListHeaderProps) => {
  const isPaid = post.tier === 'paid';

  return (
    <View style={styles.listHeaderInner}>
      <View style={styles.authorRow}>
        <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
        <Text style={styles.displayName} numberOfLines={1}>
          {post.author.displayName}
        </Text>
      </View>

      <View style={styles.mediaColumn}>
        <View style={styles.coverBleed}>
          {isPaid ? (
            <PaidPostLockedCover
              coverUrl={post.coverUrl}
              imageKey={`detail:${post.id}:${post.coverUrl}`}
            />
          ) : (
            <View style={styles.coverWrapFree}>
              <Image
                source={{ uri: post.coverUrl }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        {isPaid ? (
          <PaidDetailLockedBody />
        ) : (
          <>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postBody}>{post.body}</Text>
          </>
        )}
      </View>

      <View style={styles.metricsRow}>
        <AnimatedLikePill post={post} />
        <CommentMetric count={post.commentsCount} />
      </View>

      <View style={styles.commentsHeaderBlock}>
        <View style={styles.commentsHeaderRow}>
          <Text style={styles.commentsHeaderLabel}>{commentsCountLabel(post.commentsCount)}</Text>
          <Text style={styles.commentsSortLink}>Сначала новые</Text>
        </View>
      </View>
    </View>
  );
};

export const PostDetailScreen = ({ route }: PostDetailScreenProps) => {
  const { postId } = route.params;
  const navigation = useNavigation<PostDetailNavigationProp>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();
  const endReachedLockRef = useRef(false);

  usePostDetailRealtime({ postId, enabled: isFocused });

  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
    refetch: refetchPost,
    isFetching: isPostFetching,
    isRefetching: isPostRefetching,
  } = usePostDetailQuery(postId);

  const {
    data: commentsData,
    isPending: isCommentsPending,
    isError: isCommentsError,
    refetch: refetchComments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching: isCommentsRefetching,
  } = usePostCommentsInfiniteQuery(postId);

  const comments = useMemo(
    () => commentsData?.pages.flatMap((page) => page.comments) ?? [],
    [commentsData?.pages],
  );

  const hasComments = comments.length > 0;
  const commentsInitialLoading = isCommentsPending && !commentsData;

  useEffect(() => {
    if (!isFetchingNextPage) {
      endReachedLockRef.current = false;
    }
  }, [isFetchingNextPage]);

  const onEndReached = useCallback(() => {
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      !isCommentsRefetching &&
      !endReachedLockRef.current
    ) {
      endReachedLockRef.current = true;
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isCommentsRefetching]);

  const onRefresh = useCallback(() => {
    endReachedLockRef.current = false;
    void Promise.all([refetchPost(), refetchComments()]);
  }, [refetchPost, refetchComments]);

  /** Пулл-ту-рефреш: не смешиваем с подгрузкой следующей страницы */
  const listRefreshing =
    (isPostRefetching && !isPostLoading) ||
    (isCommentsRefetching && !isFetchingNextPage);

  useLayoutEffect(() => {
    const title = post?.title?.trim() ?? '';
    navigation.setOptions({
      title: title.length > 0 ? title : 'Публикация',
    });
  }, [navigation, post?.title]);

  const renderItem = useCallback(
    ({ item }: { item: CommentDto }) => <CommentRow comment={item} />,
    [],
  );

  const keyExtractor = useCallback((item: CommentDto) => item.id, []);

  const ListEmptyComponent = useMemo(() => {
    if (commentsInitialLoading) {
      return (
        <View style={styles.commentsEmptyBlock}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
        </View>
      );
    }
    if (isCommentsError) {
      return (
        <View style={styles.commentsEmptyBlock}>
          <Text style={styles.commentsErrorText}>Не удалось загрузить комментарии</Text>
          <Pressable
            style={({ pressed }) => [styles.retryCommentsButton, pressed && styles.retryButtonPressed]}
            onPress={() => void refetchComments()}
          >
            <Text style={styles.retryCommentsButtonText}>Повторить</Text>
          </Pressable>
        </View>
      );
    }
    if (!hasComments && post && post.commentsCount === 0) {
      return (
        <View style={styles.commentsEmptyBlock}>
          <Text style={styles.commentsEmptyText}>Комментариев пока нет</Text>
        </View>
      );
    }
    if (!hasComments && post && post.commentsCount > 0) {
      return (
        <View style={styles.commentsEmptyBlock}>
          <Text style={styles.commentsEmptyText}>Комментарии загружаются…</Text>
        </View>
      );
    }
    return null;
  }, [
    commentsInitialLoading,
    hasComments,
    isCommentsError,
    post,
    refetchComments,
  ]);

  const ListFooterComponent = useMemo(() => {
    if (!hasComments || !hasNextPage) {
      return null;
    }
    if (!isFetchingNextPage) {
      return null;
    }
    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
      </View>
    );
  }, [hasComments, hasNextPage, isFetchingNextPage]);

  if (isPostLoading && !post) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (isPostError || !post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Не удалось загрузить публикацию</Text>
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          onPress={() => void refetchPost()}
          disabled={isPostFetching}
        >
          <Text style={styles.retryButtonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <View style={styles.screen}>
        <View style={styles.cardOuter}>
          <FlashList<CommentDto>
            data={comments}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={<PostDetailListHeader post={post} />}
            extraData={post}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.35}
            refreshControl={
              <RefreshControl
                refreshing={listRefreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.accent}
              />
            }
            contentContainerStyle={[
              styles.flashContent,
              {
                paddingBottom:
                  insets.bottom + theme.spacing.lg + COMMENT_COMPOSER_BAR_HEIGHT,
              },
            ]}
            style={styles.flashList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
        <CommentComposer postId={post.id} bottomInset={insets.bottom} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.postDetailScreenBackground,
    paddingTop: theme.spacing.sm,
  },
  cardOuter: {
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: pd.cardRadius,
    overflow: 'hidden',
  },
  flashList: {
    flex: 1,
  },
  flashContent: {
    paddingHorizontal: pd.contentPaddingH,
    flexGrow: 1,
  },
  listHeaderInner: {
    gap: pd.sectionGap,
    paddingTop: pd.cardPaddingV,
    paddingBottom: theme.spacing.sm,
  },
  commentsHeaderBlock: {
    gap: theme.spacing.sm,
  },
  listFooter: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  commentsEmptyBlock: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  commentsErrorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    textAlign: 'center',
  },
  commentsEmptyText: {
    color: theme.colors.postDetailCommentsLabel,
    fontSize: theme.typography.body,
    textAlign: 'center',
  },
  retryCommentsButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  retryCommentsButtonText: {
    color: theme.colors.accentText,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.postDetailScreenBackground,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  retryButtonPressed: {
    opacity: 0.92,
  },
  retryButtonText: {
    color: theme.colors.accentText,
    fontWeight: '600',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: pd.authorAvatarGap,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.imagePlaceholder,
  },
  displayName: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.authorName,
    lineHeight: theme.typography.authorNameLineHeight,
    fontWeight: '700',
  },
  mediaColumn: {
    gap: pd.mediaBlockGap,
  },
  coverBleed: {
    marginHorizontal: -pd.contentPaddingH,
  },
  coverWrapFree: {
    width: '100%',
    aspectRatio: theme.layout.postCoverMediaAspectRatio,
    backgroundColor: theme.colors.imagePlaceholder,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  postTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: theme.typography.postTitle,
    lineHeight: theme.typography.postTitleLineHeight,
  },
  postBody: {
    color: theme.colors.textPrimary,
    fontSize: pd.bodyFontSize,
    lineHeight: pd.bodyLineHeight,
    fontWeight: '500',
  },
  paidBodySkeleton: {
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
    width: '100%',
  },
  skeletonLineTitle: {
    height: 26,
    width: '72%',
    maxWidth: '100%',
    borderRadius: 22,
    backgroundColor: theme.colors.paidLockedSkeleton,
  },
  skeletonLinePara: {
    height: 16,
    width: '100%',
    borderRadius: 8,
    backgroundColor: theme.colors.paidLockedSkeleton,
  },
  skeletonLineParaShort: {
    height: 16,
    width: '55%',
    borderRadius: 8,
    backgroundColor: theme.colors.paidLockedSkeleton,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fc.pillRowGap,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.pillBackground,
    borderRadius: theme.radius.pill,
    paddingVertical: fc.pillPaddingV,
    paddingLeft: 6,
    paddingRight: fc.pillPaddingH,
    gap: fc.pillIconGap,
  },
  pillIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    color: theme.colors.pillMetric,
    fontSize: theme.typography.pillMetric,
    lineHeight: theme.typography.pillMetricLineHeight,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  commentsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  commentsHeaderLabel: {
    fontSize: theme.typography.authorName,
    lineHeight: theme.typography.authorNameLineHeight,
    fontWeight: '600',
    color: theme.colors.postDetailCommentsLabel,
  },
  commentsSortLink: {
    fontSize: theme.typography.authorName,
    lineHeight: theme.typography.authorNameLineHeight,
    fontWeight: '500',
    color: theme.colors.paidDonatePrimary,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: pd.commentRowPaddingV,
    width: '100%',
  },
  commentMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: pd.commentBlockGap,
    minWidth: 0,
  },
  commentTextCol: {
    flex: 1,
    minWidth: 0,
    gap: pd.commentNameBodyGap,
  },
  commentAuthor: {
    fontSize: theme.typography.authorName,
    lineHeight: theme.typography.authorNameLineHeight,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  commentBody: {
    fontSize: theme.typography.body,
    lineHeight: theme.typography.authorNameLineHeight,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
});
