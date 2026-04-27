import { useEffect, useMemo, useRef } from 'react';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { FEED_QUERY_KEY, useFeedInfiniteQuery } from '../api/feed.query';
import { PostDto, PostsPageDto } from '../api/feed.types';
import { ErrorState } from '../components/ErrorState';
import { PostCard } from '../components/PostCard';
import { theme } from '../../../shared/theme/theme';

const FeedScreenBody = () => {
  const endReachedLockRef = useRef(false);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedInfiniteQuery();

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data?.pages],
  );
  const hasLoadedPosts = posts.length > 0;

  useEffect(() => {
    if (!isFetchingNextPage) {
      endReachedLockRef.current = false;
    }
  }, [isFetchingNextPage]);

  const onEndReached = () => {
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      !isRefetching &&
      !endReachedLockRef.current
    ) {
      endReachedLockRef.current = true;
      void fetchNextPage();
    }
  };

  const onRefresh = () => {
    endReachedLockRef.current = false;
    queryClient.setQueryData(
      FEED_QUERY_KEY,
      (oldData: InfiniteData<PostsPageDto, string | null> | undefined) => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,
          pages: oldData.pages.slice(0, 1),
          pageParams: [null],
        };
      },
    );

    void refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (isError && !hasLoadedPosts) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList<PostDto>
        data={posts}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 0,
            paddingBottom: theme.spacing.xxl + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={theme.colors.accent} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export const FeedScreen = () => (
  <SafeAreaProvider>
    <FeedScreenBody />
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
  },
});
