import { ERROR_CODES, type CategoryWithTasks, type Task } from '@padosipro/shared';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../errors';
import type { IClock, IProfileRepository, ITaskRepository, ITaskService } from '../interfaces';

export interface TaskServiceDeps {
  tasks: ITaskRepository;
  profiles: IProfileRepository;
  clock: IClock;
}

export class TaskService implements ITaskService {
  constructor(private readonly deps: TaskServiceDeps) {}

  getCatalogue(): Promise<CategoryWithTasks[]> {
    return this.deps.tasks.getCatalogue();
  }

  getSelection(userId: string): Promise<Task[]> {
    return this.deps.tasks.getSelectedTasks(userId);
  }

  async saveSelection(userId: string, taskIds: string[]): Promise<Task[]> {
    const profile = await this.deps.profiles.findByUserId(userId);
    if (!profile) {
      throw new AppError(HTTP_STATUS.CONFLICT, ERROR_CODES.PROFILE_REQUIRED, 'Please complete your profile before picking tasks.');
    }

    const existing = new Set(await this.deps.tasks.findExistingIds(taskIds));
    const unknownIds = taskIds.filter((id) => !existing.has(id));
    if (unknownIds.length > 0) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.UNKNOWN_TASKS, 'Some selected tasks are no longer available.', {
        meta: { unknownIds },
      });
    }

    await this.deps.tasks.replaceSelection(userId, taskIds, this.deps.clock.now());
    return this.deps.tasks.getSelectedTasks(userId);
  }
}
