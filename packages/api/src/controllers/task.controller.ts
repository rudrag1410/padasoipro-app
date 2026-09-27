import type { CatalogueResponse } from '@padosipro/shared';
import type { Request, Response } from 'express';
import type { ITaskService } from '../interfaces';

export class TaskController {
  constructor(private readonly tasks: ITaskService) {}

  getCatalogue = async (_req: Request, res: Response<CatalogueResponse>) => {
    res.json({ categories: await this.tasks.getCatalogue() });
  };
}
