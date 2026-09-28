import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, GUTTER, sizes, spacing } from '@/theme';

interface ScreenProps extends PropsWithChildren {
  /** Pinned above the content (e.g. a back button), never centred with it. */
  header?: ReactNode;
  /** Pinned below the content (primary actions), above the keyboard. */
  footer?: ReactNode;
  /** Set false for screens that manage their own list scrolling. */
  scroll?: boolean;
  edges?: Edge[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

/** Safe area + keyboard handling + centred, width-capped content. Every screen starts here. */
export function Screen({
  children,
  header,
  footer,
  scroll = true,
  edges = ['top', 'bottom'],
  refreshControl,
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.inner, styles.fill]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header && (
          <View style={styles.header}>
            <View style={styles.headerInner}>{header}</View>
          </View>
        )}
        {body}
        {footer && (
          <View style={styles.footer}>
            <View style={styles.footerInner}>{footer}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: GUTTER,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  inner: { width: '100%', maxWidth: sizes.maxContentWidth, alignSelf: 'center' },
  header: { paddingHorizontal: GUTTER, paddingTop: spacing.xl },
  headerInner: { width: '100%', maxWidth: sizes.maxContentWidth, alignSelf: 'center' },
  footer: {
    paddingHorizontal: GUTTER,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  footerInner: { width: '100%', maxWidth: sizes.maxContentWidth, alignSelf: 'center', gap: spacing.md },
});
