import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { RootStackParamList } from '../../../app/navigation/types';
import {
  FeedTierFilter,
  getFeedQueryKey,
  useFeedInfiniteQuery,
} from '../api/feed.query';
import { PostDto, PostsPageDto } from '../api/feed.types';
import { ErrorState } from '../components/ErrorState';
import { PostCard } from '../components/PostCard';
import { theme } from '../../../shared/theme/theme';

type FeedNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Feed'>;
type FeedTabItem = { value: FeedTierFilter; label: string };

const FEED_TABS: FeedTabItem[] = [
  { value: 'all', label: 'Все' },
  { value: 'free', label: 'Бесплатные' },
  { value: 'paid', label: 'Платные' },
];

const FeedScreenBody = () => {
  const endReachedLockRef = useRef(false);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FeedNavigationProp>();
  const [selectedTier, setSelectedTier] = useState<FeedTierFilter>('all');
  const {
    data,
    isLoading,
    isError,
    isFetchNextPageError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedInfiniteQuery(selectedTier);

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data?.pages],
  );
  const hasLoadedPosts = posts.length > 0;

  useEffect(() => {
    if (!isFetchingNextPage && !isFetchNextPageError) {
      endReachedLockRef.current = false;
    }
  }, [isFetchNextPageError, isFetchingNextPage]);

  const onEndReached = () => {
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetchNextPageError &&
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
      getFeedQueryKey(selectedTier),
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
      <View style={styles.tabsOuter}>
        <View style={styles.tabsTrack}>
          {FEED_TABS.map((tab) => {
            const isActive = tab.value === selectedTier;

            return (
              <Pressable
                key={tab.value}
                style={[styles.tabSegment, isActive ? styles.tabSegmentActive : null]}
                onPress={() => {
                  setSelectedTier(tab.value);
                  endReachedLockRef.current = false;
                }}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <FlatList<PostDto>
        data={posts}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          />
        )}
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
          ) : isFetchNextPageError ? (
            <View style={styles.footerErrorWrap}>
              <Text style={styles.footerErrorText}>Не удалось загрузить ещё</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.footerRetryButton,
                  pressed ? styles.footerRetryButtonPressed : null,
                ]}
                onPress={() => {
                  endReachedLockRef.current = false;
                  void fetchNextPage();
                }}
              >
                <Text style={styles.footerRetryButtonText}>Повторить</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export const FeedScreen = () => <FeedScreenBody />;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
  },
  /** Figma feed tabs area: 16px inset around the 38px track */
  tabsOuter: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  tabsTrack: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: theme.feedTierFilter.trackHeight,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.feedTierFilter.trackBackground,
    padding: theme.feedTierFilter.trackPadding,
  },
  tabSegment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.xs,
  },
  tabSegmentActive: {
    backgroundColor: theme.feedTierFilter.activeBackground,
  },
  tabLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: theme.feedTierFilter.activeLabel,
  },
  tabLabelInactive: {
    color: theme.feedTierFilter.inactiveLabel,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  footerErrorWrap: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  footerErrorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    textAlign: 'center',
  },
  footerRetryButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  footerRetryButtonPressed: {
    opacity: 0.92,
  },
  footerRetryButtonText: {
    color: theme.colors.accentText,
    fontWeight: '600',
  },
});
