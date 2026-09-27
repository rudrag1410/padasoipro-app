import type { MeResponse, MyTasksResponse, ProfileDto, TaskSelectionDto } from '@padosipro/shared';
import type { Request, Response } from 'express';
import { requireUserId } from '../helpers/request.helper';
import type { ITaskService, IUserService } from '../interfaces';

export class MeController {
  constructor(
    private readonly users: IUserService,
    private readonly tasks: ITaskService,
  ) {}

  getMe = async (req: Request, res: Response<MeResponse>) => {
    res.json({ user: await this.users.getUser(requireUserId(req)) });
  };

  saveProfile = async (req: Request, res: Response<MeResponse>) => {
    res.json({ user: await this.users.saveProfile(requireUserId(req), req.body as ProfileDto) });
  };

  getTasks = async (req: Request, res: Response<MyTasksResponse>) => {
    res.json({ tasks: await this.tasks.getSelection(requireUserId(req)) });
  };

  saveTasks = async (req: Request, res: Response<MyTasksResponse>) => {
    const { taskIds } = req.body as TaskSelectionDto;
    res.json({ tasks: await this.tasks.saveSelection(requireUserId(req), taskIds) });
  };
}
