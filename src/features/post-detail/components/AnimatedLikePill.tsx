import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { PostDto } from '../../feed/api/feed.types';
import { theme } from '../../../shared/theme/theme';
import { useTogglePostLikeMutation } from '../api/post-detail.query';

const fc = theme.feedCard;

const triggerLikeHaptics = (wasLiked: boolean) => {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    if (wasLiked) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch {
    /* haptics unavailable */
  }
};

type AnimatedLikePillProps = {
  post: PostDto;
};

/** Разметка и иконка как `LikePill` в `PostCard`; лайкнуто — заливка + цвета активной пилюли */
export const AnimatedLikePill = ({ post }: AnimatedLikePillProps) => {
  const scale = useSharedValue(1);
  const mutation = useTogglePostLikeMutation();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const playBounce = () => {
    scale.value = withSequence(
      withSpring(1.05, { damping: 26, stiffness: 160 }),
      withSpring(1, { damping: 28, stiffness: 200 }),
    );
  };

  const onPress = () => {
    if (mutation.isPending) {
      return;
    }
    triggerLikeHaptics(post.isLiked);
    playBounce();
    mutation.mutate({ postId: post.id });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={post.isLiked ? 'Убрать лайк' : 'Лайк'}
      accessibilityState={{ selected: post.isLiked, busy: mutation.isPending }}
      disabled={mutation.isPending}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressablePressed]}
    >
      <Animated.View
        style={[
          styles.actionPill,
          post.isLiked && styles.actionPillActive,
          animatedStyle,
        ]}
      >
        <View style={styles.pillIconWrap}>
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={fc.pillIconSize}
            color={post.isLiked ? theme.colors.likePillActiveContent : theme.colors.pillIconLike}
          />
        </View>
        <Text style={[styles.actionPillText, post.isLiked && styles.actionPillTextActive]}>
          {post.likesCount}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressablePressed: {
    opacity: 0.92,
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
  actionPillActive: {
    backgroundColor: theme.colors.likePillActiveBackground,
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
  actionPillTextActive: {
    color: theme.colors.likePillActiveContent,
  },
});
