import prisma from "@/lib/prisma";
import { notifyNewReport } from "./notification";

/**
 * Create a new weekly report and notify the professor
 */
export async function createReport(
  studentId: number,
  recipientId: number,
  driveLink: string
) {
  // Validate recipient (professor) exists
  const professor = await prisma.professor.findUnique({
    where: { id: recipientId },
  });
  if (!professor) {
    throw new Error("Professor not found");
  }

  // Get student info for notification
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  if (!student) {
    throw new Error("Student not found");
  }

  const report = await prisma.weeklyReport.create({
    data: {
      studentId,
      recipientId,
      driveLink,
    },
    include: {
      student: true,
      recipient: true,
    },
  });

  // Notify professor about new report
  const studentName = `${student.firstName} ${student.lastName}`;
  await notifyNewReport(recipientId, studentName);

  return report;
}

/**
 * Get reports by student ID
 */
export async function getReportsByStudentId(studentId: number) {
  return prisma.weeklyReport.findMany({
    where: { studentId },
    include: {
      student: true,
      recipient: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get reports by recipient (professor) ID
 */
export async function getReportsByRecipientId(recipientId: number) {
  return prisma.weeklyReport.findMany({
    where: { recipientId },
    include: {
      student: true,
      recipient: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get report by ID
 */
export async function getReportById(id: number) {
  const report = await prisma.weeklyReport.findUnique({
    where: { id },
    include: {
      student: true,
      recipient: true,
    },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  return report;
}

/**
 * Delete a report (only by the student who created it)
 */
export async function deleteReport(reportId: number, studentId: number) {
  const result = await prisma.weeklyReport.deleteMany({
    where: {
      id: reportId,
      studentId,
    },
  });

  if (result.count === 0) {
    throw new Error("Report not found or unauthorized");
  }
}
