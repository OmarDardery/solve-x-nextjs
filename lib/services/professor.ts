import prisma from "@/lib/prisma";
import { hashPassword, checkPasswordHash, generateJWT } from "./auth";

/**
 * Create a new professor
 */
export async function createProfessor(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  // Check if email already exists
  const existing = await prisma.professor.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(password);

  const professor = await prisma.professor.create({
    data: {
      firstName,
      lastName,
      email,
      password: passwordHash,
      lastChangedPassword: new Date(),
    },
  });

  return professor;
}

/**
 * Authenticate a professor and return the professor if valid
 */
export async function authenticateProfessor(email: string, password: string) {
  const professor = await prisma.professor.findUnique({ where: { email } });

  if (!professor) {
    throw new Error("Professor not found");
  }

  const isValid = await checkPasswordHash(password, professor.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  return professor;
}

/**
 * Get JWT for professor
 */
export function getProfessorJWT(professor: { id: number; email: string }) {
  return generateJWT(professor.id, professor.email, "professor");
}

/**
 * Get professor by ID
 */
export async function getProfessorById(id: number) {
  const professor = await prisma.professor.findUnique({
    where: { id },
  });

  if (!professor) {
    throw new Error("Professor not found");
  }

  return professor;
}

/**
 * Update professor fields
 */
export async function updateProfessor(
  id: number,
  updates: {
    firstName?: string;
    lastName?: string;
    password?: string;
    [key: string]: any;
  }
) {
  // If password is being updated, hash it
  if (updates.password) {
    updates.password = await hashPassword(updates.password);
    updates.lastChangedPassword = new Date();
  }

  const professor = await prisma.professor.update({
    where: { id },
    data: updates,
  });

  return professor;
}

/**
 * Delete a professor
 */
export async function deleteProfessor(id: number) {
  await prisma.professor.delete({ where: { id } });
}

/**
 * Check if professor email exists
 */
export async function professorEmailExists(email: string): Promise<boolean> {
  const professor = await prisma.professor.findUnique({ where: { email } });
  return !!professor;
}
