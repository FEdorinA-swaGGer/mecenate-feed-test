import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AnimatedLikePill } from '../../post-detail/components/AnimatedLikePill';
import { PostDto } from '../api/feed.types';
import { PaidPostLockedCover, PaidPostLockedSkeleton } from './PaidPostPlaceholder';
import { theme } from '../../../shared/theme/theme';

type PostCardProps = {
  post: PostDto;
  onPress?: () => void;
};

type CommentPillProps = { count: number };

const CommentPill = ({ count }: CommentPillProps) => (
  <View style={styles.actionPill}>
    <View style={styles.pillIconWrap}>
      <Svg width={15} height={14} viewBox="0 0 15 14" fill="none">
        <Path
          d="M15 6.09375C15 9.45996 11.6426 12.1875 7.50002 12.1875C6.4131 12.1875 5.38185 12 4.45021 11.6631C4.10158 11.918 3.53322 12.2666 2.85939 12.5596C2.15626 12.8643 1.30958 13.125 0.468764 13.125C0.278335 13.125 0.108413 13.0107 0.0351706 12.835C-0.0380716 12.6592 0.00294399 12.46 0.13478 12.3252L0.143569 12.3164C0.152358 12.3076 0.164077 12.2959 0.181655 12.2754C0.213882 12.2402 0.263686 12.1846 0.32521 12.1084C0.445327 11.9619 0.60646 11.7451 0.770522 11.4756C1.06349 10.9893 1.34181 10.3506 1.39748 9.63281C0.518569 8.63672 1.43097e-05 7.41504 1.43097e-05 6.09375C1.43097e-05 2.72754 3.35744 0 7.50002 0C11.6426 0 15 2.72754 15 6.09375Z"
          fill="#57626F"
        />
      </Svg>
    </View>
    <Text style={styles.actionPillText}>{count}</Text>
  </View>
);

export const PostCard = ({ post, onPress }: PostCardProps) => {
  const isPaid = post.tier === 'paid';
  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = useMemo(() => post.preview.trim().length > 110, [post.preview]);

  useEffect(() => {
    setIsExpanded(false);
  }, [post.id]);

  return (
    <View style={styles.card}>
      <Pressable disabled={!onPress} onPress={onPress}>
        <View style={styles.insetHorizontal}>
          <View style={styles.header}>
            <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
            <Text style={styles.displayName} numberOfLines={1}>
              {post.author.displayName}
            </Text>
          </View>
        </View>

        <View
          style={[styles.coverWrap, isPaid ? styles.coverWrapPaid : null]}
          collapsable={false}
        >
          {isPaid ? (
            <PaidPostLockedCover coverUrl={post.coverUrl} imageKey={`${post.id}:${post.coverUrl}`} />
          ) : (
            <Image
              key={`${post.id}:${post.coverUrl}`}
              source={{ uri: post.coverUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.insetHorizontal}>
          {!isPaid ? <Text style={styles.title}>{post.title}</Text> : null}

          {isPaid ? (
            <PaidPostLockedSkeleton />
          ) : (
            <>
              <Text
                style={styles.preview}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {post.preview}
              </Text>
              {canExpand ? (
                <Pressable
                  onPress={() => setIsExpanded((prev) => !prev)}
                  style={({ pressed }) => [
                    styles.expandButton,
                    pressed ? styles.expandButtonPressed : null,
                  ]}
                >
                  <Text style={styles.expandButtonText}>
                    {isExpanded ? 'Свернуть' : 'Показать ещё'}
                  </Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </Pressable>

      <View style={styles.insetHorizontal}>
        <View style={styles.actionsRow}>
          <AnimatedLikePill post={post} />
          <CommentPill count={post.commentsCount} />
        </View>
      </View>
    </View>
  );
};

const fc = theme.feedCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    /** Figma `content`: gap 12 between feed items */
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  insetHorizontal: {
    paddingHorizontal: fc.contentPaddingH,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingTop: fc.headerPaddingTop,
    paddingBottom: fc.headerPaddingBottom,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.imagePlaceholder,
  },
  displayName: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.authorName,
    lineHeight: theme.typography.authorNameLineHeight,
    fontWeight: '700',
  },
  coverWrap: {
    marginTop: theme.spacing.md,
    width: '100%',
    aspectRatio: theme.layout.postCoverMediaAspectRatio,
    backgroundColor: theme.colors.imagePlaceholder,
  },
  /** Figma scroll-news_content: 16px gap before media */
  coverWrapPaid: {
    marginTop: theme.spacing.lg,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: fc.titleMarginTop,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: theme.typography.postTitle,
    lineHeight: theme.typography.postTitleLineHeight,
  },
  preview: {
    marginTop: fc.previewMarginTop,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.previewSecondary,
    lineHeight: theme.typography.previewSecondaryLineHeight,
    fontWeight: '500',
  },
  expandButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  expandButtonPressed: {
    opacity: 0.8,
  },
  expandButtonText: {
    color: theme.colors.accent,
    fontSize: theme.typography.authorName,
    lineHeight: theme.typography.authorNameLineHeight,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: fc.actionsMarginTop,
    marginBottom: fc.actionsMarginBottom,
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
});
