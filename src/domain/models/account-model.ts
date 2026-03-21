/**
 * Domain Model: AccountModel
 *
 * Represents the authenticated user and their session.
 * This is the core entity — it has ZERO dependencies on any external layer.
 */
export type AccountModel = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role?: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
};
