import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { theme } from '../../../shared/theme/theme';
import { useCreatePostCommentMutation } from '../api/post-detail.query';

/** Figma node 1-2868 — отправка комментария */
const ComposerSendIcon = () => (
  <Svg width={20} height={17} viewBox="0 0 20 17" fill="none">
    <Path
      d="M2.05266 0.126289C0.778242 -0.42669 -0.477861 0.942939 0.181319 2.16608L2.71916 6.87922C2.88029 7.18317 3.18059 7.38459 3.52116 7.42853L9.96647 8.2342C10.091 8.24885 10.1862 8.35505 10.1862 8.47956C10.1862 8.60407 10.091 8.71027 9.96647 8.72492L3.52116 9.53059C3.18059 9.57453 2.88029 9.77961 2.71916 10.0799L0.181319 14.8004C-0.477861 16.0235 0.778242 17.3931 2.05266 16.8402L18.2355 9.82722C19.4111 9.31818 19.4111 7.64826 18.2355 7.13923L2.05266 0.126289Z"
      fill={theme.colors.paidDonatePrimary}
    />
  </Svg>
);

/**
 * Зарезервированная высота под композер (поле + отступы, без safe area).
 * Скролл списка компенсирует это + insets.bottom, чтобы контент не прятался под бар.
 */
export const COMMENT_COMPOSER_BAR_HEIGHT = 76;

type CommentComposerProps = {
  postId: string;
  bottomInset: number;
};

export const CommentComposer = ({ postId, bottomInset }: CommentComposerProps) => {
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const mutation = useCreatePostCommentMutation();

  const trimmed = text.trim();
  const canSend = trimmed.length > 0 && !mutation.isPending;

  const onChangeText = useCallback(
    (value: string) => {
      setText(value);
      if (localError) {
        setLocalError(null);
      }
    },
    [localError],
  );

  const onSend = useCallback(() => {
    if (!canSend) {
      return;
    }
    mutation.mutate(
      { postId, text: trimmed },
      {
        onSuccess: () => {
          setText('');
          setLocalError(null);
        },
        onError: () => {
          setLocalError('Не удалось отправить. Попробуйте ещё раз.');
        },
      },
    );
  }, [canSend, mutation, postId, trimmed]);

  return (
    <View style={[styles.wrap, { paddingBottom: bottomInset }]}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Ваш комментарий"
          placeholderTextColor={theme.colors.textTertiary}
          value={text}
          onChangeText={onChangeText}
          editable={!mutation.isPending}
          multiline
          maxLength={2000}
          returnKeyType="default"
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            (!canSend || mutation.isPending) && styles.sendButtonDisabled,
            pressed && canSend && !mutation.isPending && styles.sendButtonPressed,
          ]}
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Отправить комментарий"
          hitSlop={12}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color={theme.colors.paidDonatePrimary} />
          ) : (
            <ComposerSendIcon />
          )}
        </Pressable>
      </View>
      {localError ? <Text style={styles.error}>{localError}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  /** Figma node 1-4138: 40px высота, stroke #EFF2F7, скругление «капсула» */
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: theme.colors.pillBackground,
    fontSize: theme.typography.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.38,
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
  },
});
