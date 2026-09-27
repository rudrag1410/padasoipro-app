import type { User } from '@padosipro/shared';
import type { ProfileRecord, UserRecord } from '../types';
import { toIso } from '../utils';

/** The only place a UserRecord becomes an API User. Never exposes the password hash. */
export function toUserDto(user: UserRecord, profile: ProfileRecord | null, hasSelectedTasks: boolean): User {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerifiedAt !== null,
    profileCompleted: profile !== null,
    hasSelectedTasks,
    profile: profile
      ? { name: profile.name, mobile: profile.mobile, address: profile.address, businessName: profile.businessName }
      : null,
    createdAt: toIso(user.createdAt),
  };
}
