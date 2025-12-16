import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      role: 'admin' | 'employee';
      roles: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: 'admin' | 'employee';
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    role?: 'admin' | 'employee';
    roles?: string[];
    error?: string;
  }
}
