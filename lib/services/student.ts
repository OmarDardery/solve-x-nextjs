import prisma from "@/lib/prisma";
import { hashPassword, checkPasswordHash, generateJWT } from "./auth";

/**
 * Create a new student with associated coins record
 */
export async function createStudent(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  // Check if email already exists
  const existing = await prisma.student.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(password);

  // Create student with coins in a transaction
  const student = await prisma.$transaction(async (tx) => {
    const newStudent = await tx.student.create({
      data: {
        firstName,
        lastName,
        email,
        password: passwordHash,
        lastChangedPassword: new Date(),
      },
    });

    // Create coins record for student
    await tx.coins.create({
      data: {
        amount: 0,
        studentId: newStudent.id,
      },
    });

    return newStudent;
  });

  return student;
}

/**
 * Authenticate a student and return the student if valid
 */
export async function authenticateStudent(email: string, password: string) {
  const student = await prisma.student.findUnique({ where: { email } });
  
  if (!student) {
    throw new Error("Student not found");
  }

  if (!student.password) {
    throw new Error("Invalid credentials");
  }

  const isValid = await checkPasswordHash(password, student.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  return student;
}

/**
 * Get JWT for student
 */
export function getStudentJWT(student: { id: bigint; email: string | null }) {
  return generateJWT(student.id, student.email || "", "student");
}

/**
 * Get student by ID with related data
 */
export async function getStudentById(id: bigint) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      student_tags: {
        include: { tags: true },
      },
      coins: true,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  return student;
}

/**
 * Update student fields
 */
export async function updateStudent(
  id: bigint,
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

  const student = await prisma.student.update({
    where: { id },
    data: updates,
    include: {
      student_tags: {
        include: { tags: true },
      },
      coins: true,
    },
  });

  return student;
}

/**
 * Delete a student
 */
export async function deleteStudent(id: bigint) {
  await prisma.student.delete({ where: { id } });
}

/**
 * Check if student email exists
 */
export async function studentEmailExists(email: string): Promise<boolean> {
  const student = await prisma.student.findUnique({ where: { email } });
  return !!student;
}
