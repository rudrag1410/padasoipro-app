import type { IClock } from '../../interfaces';

export class SystemClock implements IClock {
  now(): Date {
    return new Date();
  }
}
