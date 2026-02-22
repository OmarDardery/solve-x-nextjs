import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

type UserRole = "student" | "professor" | "organization";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    name?: string;
  }

  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
  }
}
