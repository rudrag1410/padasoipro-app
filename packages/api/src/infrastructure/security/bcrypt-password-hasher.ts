import bcrypt from 'bcryptjs';
import type { IPasswordHasher } from '../../interfaces';

export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly cost: number) {}

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.cost);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
