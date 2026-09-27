import type { ProfileDto, User } from '@padosipro/shared';
import { AppError } from '../errors';
import type { IClock, IProfileRepository, ITaskRepository, IUserRepository, IUserService } from '../interfaces';
import { toUserDto } from '../mappers';

export interface UserServiceDeps {
  users: IUserRepository;
  profiles: IProfileRepository;
  tasks: ITaskRepository;
  clock: IClock;
}

export class UserService implements IUserService {
  constructor(private readonly deps: UserServiceDeps) {}

  async getUser(userId: string): Promise<User> {
    const user = await this.deps.users.findById(userId);
    // A valid token for a deleted user is treated like any other bad session.
    if (!user) throw AppError.unauthorized('Your session has ended. Please log in again.');

    const [profile, hasSelectedTasks] = await Promise.all([
      this.deps.profiles.findByUserId(userId),
      this.deps.tasks.hasSelection(userId),
    ]);
    return toUserDto(user, profile, hasSelectedTasks);
  }

  async saveProfile(userId: string, dto: ProfileDto): Promise<User> {
    await this.getUser(userId);
    await this.deps.profiles.upsert({ userId, ...dto }, this.deps.clock.now());
    return this.getUser(userId);
  }
}
