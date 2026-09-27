export interface Profile {
  name: string;
  /** 10-digit national number, without +91. */
  mobile: string;
  address: string;
  businessName: string | null;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  profileCompleted: boolean;
  hasSelectedTasks: boolean;
  profile: Profile | null;
  createdAt: string;
}
