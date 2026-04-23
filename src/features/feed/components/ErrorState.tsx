import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme/theme';

type ErrorStateProps = {
  onRetry: () => void;
};

export const ErrorState = ({ onRetry }: ErrorStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Не удалось загрузить публикации</Text>
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Повторить</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  text: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  buttonText: {
    color: theme.colors.accentText,
    fontWeight: '600',
  },
});
