import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFeedInfiniteQuery } from '../api/feed.query';
import { PostDto } from '../api/feed.types';
import { ErrorState } from '../components/ErrorState';
import { PostCard } from '../components/PostCard';
import { theme } from '../../../shared/theme/theme';

export const FeedScreen = () => {
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

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage && !isRefetching) {
      void fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList<PostDto>
        data={posts}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.content}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => void refetch()}
            tintColor={theme.colors.accent}
          />
        }
        ListHeaderComponent={<Text style={styles.headerTitle}>Лента</Text>}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
  },
});
