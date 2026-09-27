/** Rows as the persistence layer returns them. Dates are real Date objects here, strings only at the HTTP edge. */
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
}

export interface ProfileRecord {
  userId: string;
  name: string;
  mobile: string;
  address: string;
  businessName: string | null;
  updatedAt: Date;
}

export interface OtpRecord {
  id: string;
  userId: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

export interface NewUser {
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface NewOtp {
  userId: string;
  codeHash: string;
  expiresAt: Date;
  createdAt: Date;
}
