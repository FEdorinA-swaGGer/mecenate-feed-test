import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme/theme';

export const PaidPostPlaceholder = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="lock-closed" size={18} color={theme.colors.accent} />
      </View>
      <Text style={styles.title}>Контент доступен по подписке</Text>
      <Text style={styles.caption}>
        Оформите платный tier, чтобы открыть полный текст публикации.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.paidPostSurface,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.paidPostBorder,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: theme.typography.paidCalloutTitle,
    lineHeight: theme.typography.paidCalloutTitleLineHeight,
  },
  caption: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    lineHeight: theme.typography.body + 4,
  },
});
