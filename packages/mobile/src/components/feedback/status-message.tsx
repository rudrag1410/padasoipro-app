import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import type { IconName } from '@/utils';
import { AppText } from '../ui/app-text';
import { Button } from '../ui/button';

interface StatusMessageProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'error';
}

/** Centered icon + title + message + optional action. Base for empty and error states. */
export function StatusMessage({ icon, title, message, actionLabel, onAction, tone = 'neutral' }: StatusMessageProps) {
  const isError = tone === 'error';
  return (
    <View style={styles.center}>
      <View style={[styles.iconWrap, { backgroundColor: isError ? colors.dangerSoft : colors.primarySoft }]}>
        <Feather name={icon} size={26} color={isError ? colors.danger : colors.primary} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {message && (
        <AppText variant="small" color="textMuted" align="center" style={styles.message}>
          {message}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} variant="secondary" compact onPress={onAction} style={styles.action} />
      )}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <StatusMessage
      tone="error"
      icon="wifi-off"
      title="Couldn't load this"
      message={message}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}

export function EmptyState(props: Omit<StatusMessageProps, 'tone'>) {
  return <StatusMessage {...props} tone="neutral" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xxl },
  iconWrap: { width: 56, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  message: { maxWidth: 320 },
  action: { marginTop: spacing.md, minWidth: 140 },
});
