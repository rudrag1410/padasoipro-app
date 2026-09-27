import type { CategoryWithTasks, Task } from '@padosipro/shared';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppText, Button, ScreenHeader, SearchBar } from '@/components/ui';
import { CategoryHeader, TaskRow } from '@/components/tasks';
import { ROUTES } from '@/constants';
import { filterCatalogue, getErrorMessage, pluralize } from '@/helpers';
import { useAuth, useCatalogue, useDebouncedValue, useMyTasks, useTaskSelection } from '@/hooks';
import { colors, GUTTER, sizes, spacing } from '@/theme';

type Section = CategoryWithTasks & { data: Task[] };

export function TaskPickerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isEditing = Boolean(user?.hasSelectedTasks);

  const catalogue = useCatalogue();
  const myTasks = useMyTasks({ enabled: isEditing });
  const { selectedIds, isSelected, toggle, replace, clear } = useTaskSelection();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);

  // When editing, start from what's saved (once), so the user adjusts rather than starts over.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !isEditing || !myTasks.data) return;
    seeded.current = true;
    replace(myTasks.data.map((task) => task.id));
  }, [isEditing, myTasks.data, replace]);

  const sections = useMemo<Section[]>(
    () => filterCatalogue(catalogue.data ?? [], debouncedQuery).map((category) => ({ ...category, data: category.tasks })),
    [catalogue.data, debouncedQuery],
  );

  const selectedCountIn = useCallback(
    (category: CategoryWithTasks) => category.tasks.filter((task) => selectedIds.has(task.id)).length,
    [selectedIds],
  );

  const count = selectedIds.size;

  const renderBody = () => {
    if (catalogue.isPending || (isEditing && myTasks.isPending)) return <LoadingState message="Loading tasks…" />;
    if (catalogue.isError) {
      return <ErrorState message={getErrorMessage(catalogue.error)} onRetry={() => void catalogue.refetch()} />;
    }
    if (isEditing && myTasks.isError) {
      return <ErrorState message={getErrorMessage(myTasks.error)} onRetry={() => void myTasks.refetch()} />;
    }
    if ((catalogue.data?.length ?? 0) === 0) {
      return <EmptyState icon="inbox" title="No tasks available yet" message="Please check back a little later." />;
    }
    if (sections.length === 0) {
      return (
        <EmptyState
          icon="search"
          title="No matching tasks"
          message={`Nothing matches "${debouncedQuery.trim()}". Try another word, like "clean" or "doctor".`}
          actionLabel="Clear search"
          onAction={() => setQuery('')}
        />
      );
    }
    return (
      <SectionList
        sections={sections}
        keyExtractor={(task) => task.id}
        renderSectionHeader={({ section }) => {
          const selected = selectedCountIn(section);
          return <CategoryHeader category={section} meta={selected > 0 ? `${selected} selected` : undefined} />;
        }}
        renderItem={({ item }) => <TaskRow task={item} selected={isSelected(item.id)} onToggle={toggle} />}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.listContent}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <View style={styles.inner}>
          {isEditing && <ScreenHeader onBack={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.HOME))} />}
          <AppText variant="title" accessibilityRole="header">
            What should we handle?
          </AppText>
          <AppText variant="small" color="textMuted" style={styles.subtitle}>
            Pick the tasks you'd like your Lifestyle Manager to take care of. You can change these any time.
          </AppText>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search tasks, e.g. plumber" />
        </View>
      </View>

      <View style={styles.body}>{renderBody()}</View>

      <View style={styles.footer}>
        <View style={[styles.inner, styles.footerRow]}>
          <View style={styles.footerText}>
            <AppText variant="bodyStrong">{count > 0 ? pluralize(count, 'task') + ' selected' : 'No tasks selected'}</AppText>
            {count > 0 ? (
              <AppText variant="small" style={styles.clear} onPress={clear} accessibilityRole="button">
                Clear all
              </AppText>
            ) : (
              <AppText variant="small" color="textMuted">
                Select at least one
              </AppText>
            )}
          </View>
          <Button title="Continue" onPress={() => router.push(ROUTES.CONFIRM_TASKS)} disabled={count === 0} style={styles.cta} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: GUTTER, paddingTop: spacing.xl, paddingBottom: spacing.sm },
  inner: { width: '100%', maxWidth: sizes.maxContentWidth, alignSelf: 'center' },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg },
  body: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: GUTTER, paddingBottom: spacing.xxl, width: '100%', maxWidth: sizes.maxContentWidth + GUTTER * 2, alignSelf: 'center' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: GUTTER,
    paddingVertical: spacing.md,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  footerText: { flex: 1 },
  clear: { color: colors.primary, fontWeight: '600' },
  cta: { minWidth: 140 },
});
