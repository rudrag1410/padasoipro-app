import { Feather } from '@expo/vector-icons';
import { formatIndianMobile } from '@padosipro/shared';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { LogoMark } from '@/components/brand';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppText, Button, Card, Screen } from '@/components/ui';
import { SelectedCategoryCard } from '@/components/tasks';
import { COPY, ROUTES } from '@/constants';
import { firstName, getErrorMessage, groupTasksByCategory, pluralize } from '@/helpers';
import { useAuth, useCatalogue, useMyTasks } from '@/hooks';
import { colors, radius, spacing } from '@/theme';

export function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const catalogue = useCatalogue();
  const myTasks = useMyTasks();
  const [refreshing, setRefreshing] = useState(false);

  const groups = useMemo(
    () => groupTasksByCategory(catalogue.data ?? [], myTasks.data ?? []),
    [catalogue.data, myTasks.data],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([catalogue.refetch(), myTasks.refetch()]);
    setRefreshing(false);
  };

  const name = firstName(user?.profile?.name);
  const taskCount = myTasks.data?.length ?? 0;

  const renderTasks = () => {
    if (catalogue.isPending || myTasks.isPending) return <LoadingState message="Loading your tasks…" />;
    const error = catalogue.error ?? myTasks.error;
    if (error) return <ErrorState message={getErrorMessage(error)} onRetry={onRefresh} />;
    if (taskCount === 0) {
      return (
        <EmptyState
          icon="clipboard"
          title="No tasks yet"
          message="Pick what you'd like your Lifestyle Manager to handle."
          actionLabel="Pick tasks"
          onAction={() => router.push(ROUTES.TASKS)}
        />
      );
    }
    return (
      <>
        <View style={styles.sectionHeader}>
          <AppText variant="heading">Your tasks</AppText>
          <Pressable onPress={() => router.push(ROUTES.TASKS)} hitSlop={8} accessibilityRole="button" style={styles.editLink}>
            <Feather name="edit-2" size={14} color={colors.primary} />
            <AppText variant="smallStrong" color="primary">
              Edit
            </AppText>
          </Pressable>
        </View>
        {groups.map((category) => (
          <SelectedCategoryCard key={category.id} category={category} />
        ))}
      </>
    );
  };

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      footer={<Button title="Log out" variant="secondary" icon="log-out" onPress={signOut} />}
    >
      <View style={styles.topBar}>
        <LogoMark size={40} />
        <AppText variant="overline" color="textMuted">
          {COPY.BRAND}
        </AppText>
      </View>

      <AppText variant="display" accessibilityRole="header">
        {name ? `Hi, ${name}` : 'Welcome'}
      </AppText>
      <AppText variant="body" color="textMuted" style={styles.subtitle}>
        Here's what your Lifestyle Manager will handle for you.
      </AppText>

      {taskCount > 0 && (
        <Card style={styles.summary}>
          <View style={styles.summaryIcon}>
            <Feather name="check" size={20} color={colors.textOnPrimary} />
          </View>
          <View style={styles.summaryText}>
            <AppText variant="bodyStrong">{pluralize(taskCount, 'task')} selected</AppText>
            <AppText variant="small" color="textMuted">
              Across {pluralize(groups.length, 'category', 'categories')}. We'll be in touch on{' '}
              {user?.profile?.mobile ? formatIndianMobile(user.profile.mobile) : 'your phone'}.
            </AppText>
          </View>
        </Card>
      )}

      <View style={styles.tasks}>{renderTasks()}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxl },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.xl },
  summary: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: { flex: 1, gap: 2 },
  tasks: { marginTop: spacing.xl, minHeight: 240 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  editLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
