import prisma from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { createNotification } from "./notification";

export const STATUS_PENDING = "pending" as const;
export const STATUS_ACCEPTED = "accepted" as const;
export const STATUS_REJECTED = "rejected" as const;

/**
 * Create an application for a student
 */
export async function createApplication(
  studentId: number,
  opportunityId: number,
  message?: string,
  resumeLink?: string
) {
  // Check if application already exists
  const existing = await prisma.application.findUnique({
    where: {
      studentId_opportunityId: { studentId, opportunityId },
    },
  });

  if (existing) {
    throw new Error("You have already applied to this opportunity");
  }

  const application = await prisma.application.create({
    data: {
      studentId,
      opportunityId,
      message: message || null,
      resumeLink: resumeLink || null,
      status: STATUS_PENDING,
    },
    include: {
      student: true,
      opportunity: {
        include: {
          professor: true,
        },
      },
    },
  });

  return application;
}

/**
 * Delete an application
 */
export async function deleteApplication(
  studentId: number,
  opportunityId: number
) {
  await prisma.application.deleteMany({
    where: { studentId, opportunityId },
  });
}

/**
 * Get applications by opportunity ID
 */
export async function getApplicationsByOpportunityId(opportunityId: number) {
  return prisma.application.findMany({
    where: { opportunityId },
    include: {
      student: true,
      opportunity: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get applications by student ID
 */
export async function getApplicationsByStudentId(studentId: number) {
  return prisma.application.findMany({
    where: { studentId },
    include: {
      student: true,
      opportunity: {
        include: {
          professor: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get applications for all opportunities by a professor
 */
export async function getApplicationsByProfessorOpportunities(
  professorId: number
) {
  return prisma.application.findMany({
    where: {
      opportunity: {
        professorId,
      },
    },
    include: {
      student: true,
      opportunity: {
        include: {
          professor: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get application by ID
 */
export async function getApplicationById(id: number) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      student: true,
      opportunity: {
        include: {
          professor: true,
        },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  return application;
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  id: number,
  status: ApplicationStatus
) {
  // Validate status
  if (![STATUS_PENDING, STATUS_ACCEPTED, STATUS_REJECTED].includes(status)) {
    throw new Error("Invalid status value");
  }

  const application = await getApplicationById(id);
  const oldStatus = application.status;

  const updated = await prisma.application.update({
    where: { id },
    data: { status },
    include: {
      student: true,
      opportunity: {
        include: {
          professor: true,
        },
      },
    },
  });

  // Notify student if status changed to accepted or rejected
  if (
    oldStatus !== status &&
    (status === STATUS_ACCEPTED || status === STATUS_REJECTED)
  ) {
    const opportunityName = updated.opportunity?.name || "this opportunity";
    await notifyApplicationStatusChange(
      updated.studentId,
      opportunityName,
      status
    );
  }

  return updated;
}

/**
 * Helper to notify student of application status change
 */
async function notifyApplicationStatusChange(
  studentId: number,
  opportunityName: string,
  status: string
) {
  let title = "Application Update";
  let message = `Your application for '${opportunityName}' has been ${status}`;
  let type: "info" | "success" | "warning" | "error" = "info";

  if (status === STATUS_ACCEPTED) {
    title = "🎉 Application Accepted!";
    type = "success";
  } else if (status === STATUS_REJECTED) {
    message = `Your application for '${opportunityName}' was not accepted this time`;
  }

  await createNotification(studentId, "student", title, message, type);
}
