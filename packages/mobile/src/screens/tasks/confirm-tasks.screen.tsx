import { ERROR_CODES } from '@padosipro/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BrandHeader } from '@/components/brand';
import { EmptyState, InlineAlert } from '@/components/feedback';
import { Button, Screen, ScreenHeader } from '@/components/ui';
import { SelectedCategoryCard } from '@/components/tasks';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { getErrorMessage, groupSelected, pluralize } from '@/helpers';
import { useCatalogue, useSaveTasks, useTaskSelection } from '@/hooks';
import { ApiError } from '@/services/api';
import { spacing } from '@/theme';

/** The confirm step: review, trim, then save. */
export function ConfirmTasksScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const catalogue = useCatalogue();
  const { selectedIds, remove } = useTaskSelection();
  const saveTasks = useSaveTasks();
  const [error, setError] = useState<string | null>(null);

  const groups = useMemo(() => groupSelected(catalogue.data ?? [], selectedIds), [catalogue.data, selectedIds]);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace(ROUTES.TASKS));

  const onConfirm = async () => {
    setError(null);
    try {
      await saveTasks.mutateAsync([...selectedIds]);
      // Leave nothing of the picker flow behind: Home becomes the only screen.
      router.dismissAll();
      router.replace(ROUTES.HOME);
    } catch (err) {
      if (err instanceof ApiError && err.code === ERROR_CODES.UNKNOWN_TASKS) {
        // Catalogue changed underneath us: drop the stale ids and refresh.
        (err.meta.unknownIds as string[] | undefined)?.forEach(remove);
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.catalogue });
      }
      setError(getErrorMessage(err));
    }
  };

  if (selectedIds.size === 0) {
    return (
      <Screen header={<ScreenHeader onBack={goBack} />}>
        <EmptyState
          icon="check-square"
          title="Nothing selected"
          message="Go back and pick at least one task for your Lifestyle Manager."
          actionLabel="Pick tasks"
          onAction={goBack}
        />
      </Screen>
    );
  }

  return (
    <Screen
      header={<ScreenHeader onBack={goBack} />}
      footer={
        <>
          <Button title={`Confirm ${pluralize(selectedIds.size, 'task')}`} onPress={onConfirm} loading={saveTasks.isPending} />
          <Button title="Add more tasks" variant="secondary" onPress={goBack} disabled={saveTasks.isPending} />
        </>
      }
    >
      <BrandHeader
        showLogo={false}
        title="Confirm your tasks"
        subtitle="Your Lifestyle Manager will start with these. Remove anything you don't need."
      />
      <View style={styles.list}>
        {error && <InlineAlert message={error} />}
        {groups.map((category) => (
          <SelectedCategoryCard key={category.id} category={category} onRemove={saveTasks.isPending ? undefined : remove} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs },
});
