export interface AuthContext {
  userId: string;
}

export interface TokenPayload {
  sub: string;
}

export interface IssuedToken {
  token: string;
  expiresAt: Date;
}
