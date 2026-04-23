import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme/theme';

export const PaidPostPlaceholder = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Контент доступен по подписке</Text>
      <Text style={styles.caption}>
        Оформите платный tier, чтобы открыть полный текст публикации.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
    backgroundColor: '#EEF2FF',
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: theme.typography.body,
  },
  caption: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
});
