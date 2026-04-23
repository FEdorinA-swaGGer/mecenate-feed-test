import { Image, StyleSheet, Text, View } from 'react-native';

import { PostDto } from '../api/feed.types';
import { PaidPostPlaceholder } from './PaidPostPlaceholder';
import { theme } from '../../../shared/theme/theme';

type PostCardProps = {
  post: PostDto;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.username}>{post.author.displayName}</Text>
          <Text style={styles.handle}>@{post.author.username}</Text>
        </View>
      </View>

      <Text style={styles.title}>{post.title}</Text>

      {post.tier === 'paid' ? (
        <PaidPostPlaceholder />
      ) : (
        <>
          <Text style={styles.preview}>{post.preview}</Text>
          <Image source={{ uri: post.coverUrl }} style={styles.cover} />
        </>
      )}

      <View style={styles.metaRow}>
        <Text style={styles.meta}>❤️ {post.likesCount}</Text>
        <Text style={styles.meta}>💬 {post.commentsCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerText: {
    marginLeft: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.round,
    backgroundColor: '#E5E7EB',
  },
  username: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  handle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: theme.spacing.sm,
  },
  preview: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  cover: {
    width: '100%',
    height: 180,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    backgroundColor: '#E5E7EB',
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});