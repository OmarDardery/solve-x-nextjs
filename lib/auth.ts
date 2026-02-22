import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateStudent, getStudentById } from "@/lib/services/student";
import {
  authenticateProfessor,
  getProfessorById,
} from "@/lib/services/professor";
import {
  authenticateOrganization,
  getOrganizationById,
} from "@/lib/services/organization";
import {
  isValidStudentDomain,
  isValidProfessorDomain,
} from "@/lib/config/domains";

export type UserRole = "student" | "professor" | "organization";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const { email, password, role } = credentials as {
          email: string;
          password: string;
          role: UserRole;
        };

        if (!email || !password || !role) {
          throw new Error("Missing credentials");
        }

        try {
          switch (role) {
            case "student": {
              if (!isValidStudentDomain(email)) {
                throw new Error("Invalid email domain for student");
              }
              const student = await authenticateStudent(email, password);
              return {
                id: student.id.toString(),
                email: student.email,
                role: "student" as UserRole,
                firstName: student.firstName,
                lastName: student.lastName,
              };
            }
            case "professor": {
              if (!isValidProfessorDomain(email)) {
                throw new Error("Invalid email domain for professor");
              }
              const professor = await authenticateProfessor(email, password);
              return {
                id: professor.id.toString(),
                email: professor.email,
                role: "professor" as UserRole,
                firstName: professor.firstName,
                lastName: professor.lastName,
              };
            }
            case "organization": {
              const organization = await authenticateOrganization(
                email,
                password
              );
              return {
                id: organization.id.toString(),
                email: organization.email,
                role: "organization" as UserRole,
                name: organization.name,
              };
            }
            default:
              throw new Error("Invalid role");
          }
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 72 * 60 * 60, // 72 hours (matching old JWT expiry)
  },
});

/**
 * Helper to get the current user from session with full data
 */
export async function getCurrentUser(session: { user: { id: string; role: UserRole } }) {
  const { id, role } = session.user;
  const userId = parseInt(id);

  switch (role) {
    case "student":
      return { user: await getStudentById(userId), role };
    case "professor":
      return { user: await getProfessorById(userId), role };
    case "organization":
      return { user: await getOrganizationById(userId), role };
    default:
      throw new Error("Invalid role");
  }
}
