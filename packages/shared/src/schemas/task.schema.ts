import { z } from 'zod';
import { TASK_SELECTION_RULES } from '../constants/validation.constants';

export const taskSelectionSchema = z.object({
  taskIds: z
    .array(z.string().trim().min(1, 'Task id cannot be empty'), { error: 'taskIds must be a list of task ids' })
    .min(TASK_SELECTION_RULES.MIN, 'Pick at least one task')
    .max(TASK_SELECTION_RULES.MAX, `You can pick at most ${TASK_SELECTION_RULES.MAX} tasks`)
    .transform((ids) => [...new Set(ids)]),
});

export type TaskSelectionDto = z.output<typeof taskSelectionSchema>;
