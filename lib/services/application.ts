import prisma from "@/lib/prisma";
import { createNotification } from "./notification";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export const STATUS_PENDING = "pending" as const;
export const STATUS_ACCEPTED = "accepted" as const;
export const STATUS_REJECTED = "rejected" as const;

/**
 * Create an application for a student
 */
export async function createApplication(
  applicantType: "STUDENT" | "PROFESSOR",
  applicantId: bigint,
  opportunityId: bigint,
  message?: string,
  resumeLink?: string
): Promise<any> {
  // Check opportunity and constraints
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) throw new Error("Opportunity not found");

  // Professors may only apply to research opportunities
  if (applicantType === "PROFESSOR" && opportunity.type !== "research") {
    throw new Error("Professors can only apply to research opportunities");
  }

  // Check if application already exists for this applicant
  const existing = await prisma.application.findFirst({
    where: (applicantType === "STUDENT"
      ? { studentId: applicantId, opportunityId }
      : { professorApplicantId: applicantId, opportunityId }) as any,
  } as any);

  if (existing) {
    throw new Error("You have already applied to this opportunity");
  }

  const data: any = {
    opportunityId,
    message: message || null,
    resumeLink: resumeLink || null,
    status: STATUS_PENDING,
    applicantType: applicantType,
  };
  if (applicantType === "STUDENT") data.studentId = applicantId;
  else data.professorApplicantId = applicantId;

  try {
    const application = await prisma.application.create({
      data,
      include: {
        student: true,
        professorApplicant: true,
        opportunity: {
          include: {
            professor: true,
            student: true,
          },
        },
      },
    } as any);

    return application;
  } catch (err: any) {
    console.error("prisma.application.create failed", { err: err?.message || err });
    throw err;
  }
}

/**
 * Delete an application
 */
export async function deleteApplication(
  applicantType: "STUDENT" | "PROFESSOR",
  applicantId: bigint,
  opportunityId: bigint
): Promise<void> {
  const where: any = { opportunityId };
  if (applicantType === "STUDENT") where.studentId = applicantId;
  else where.professorApplicantId = applicantId;
  await prisma.application.deleteMany({ where: where as any } as any);
}

/**
 * Get applications by opportunity ID
 */
export async function getApplicationsByOpportunityId(opportunityId: bigint): Promise<any[]> {
  return prisma.application.findMany({
    where: { opportunityId } as any,
    include: {
      student: true,
      professorApplicant: true,
      opportunity: {
        include: { professor: true, student: true },
      },
    },
    orderBy: { createdAt: "desc" },
  } as any);
}

/**
 * Get applications by student ID
 */
export async function getApplicationsByStudentId(studentId: bigint): Promise<any[]> {
  return prisma.application.findMany({
    where: { studentId } as any,
    include: {
      student: true,
      professorApplicant: true,
      opportunity: {
        include: { professor: true, student: true },
      },
    },
    orderBy: { createdAt: "desc" },
  } as any);
}

/**
 * Get applications for all opportunities by a professor
 */
export async function getApplicationsByProfessorOpportunities(
  professorId: bigint
): Promise<any[]> {
  return prisma.application.findMany({
    where: {
      opportunity: {
        professorId,
      },
    } as any,
    include: {
      student: true,
      professorApplicant: true,
      opportunity: {
        include: { professor: true, student: true },
      },
    },
    orderBy: { createdAt: "desc" },
  } as any);
}

/**
 * Get applications for opportunities owned by a specific user.
 * For professors this returns applications for opportunities where opportunity.professorId = ownerId
 * For students this returns applications for opportunities where opportunity.studentId = ownerId
 */
export async function getApplicationsByOwnedOpportunities(
  ownerId: bigint,
  ownerRole: "professor" | "student"
): Promise<any[]> {
  if (ownerRole === "professor") {
    return getApplicationsByProfessorOpportunities(ownerId as bigint);
  }

  // student-owned opportunities
  return prisma.application.findMany({
    where: {
      opportunity: {
        studentId: ownerId,
      },
    } as any,
    include: {
      student: true,
      professorApplicant: true,
      opportunity: {
        include: { professor: true, student: true },
      },
    },
    orderBy: { createdAt: "desc" },
  } as any);
}

/**
 * Get application by ID
 */
export async function getApplicationById(id: bigint): Promise<any> {
  const application = await prisma.application.findUnique({
    where: { id } as any,
    include: {
      student: true,
      professorApplicant: true,
      opportunity: {
        include: { professor: true, student: true },
      },
    },
  } as any);

  if (!application) {
    throw new Error("Application not found");
  }

  return application as any;
}

/**
 * Get applications submitted by an applicant (student or professor)
 */
export async function getApplicationsByApplicant(applicantType: "STUDENT" | "PROFESSOR", applicantId: bigint): Promise<any[]> {
  const where: any = applicantType === "STUDENT" ? { studentId: applicantId } : { professorApplicantId: applicantId };
  return prisma.application.findMany({
    where: where as any,
    include: {
      student: true,
      professorApplicant: true,
      opportunity: { include: { professor: true, student: true } },
    },
    orderBy: { createdAt: "desc" },
  } as any);
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  id: bigint,
  status: ApplicationStatus
): Promise<any> {
  // Validate status
  if (![STATUS_PENDING, STATUS_ACCEPTED, STATUS_REJECTED].includes(status)) {
    throw new Error("Invalid status value");
  }

  const application = await getApplicationById(id);
  const oldStatus = application.status;

  const updated = await prisma.application.update({
    where: { id } as any,
    data: { status },
    include: {
      student: true,
      professorApplicant: true,
      opportunity: {
        include: { professor: true, student: true },
      },
    },
  } as any);

  // Notify student if status changed to accepted or rejected
  if (oldStatus !== status && (status === STATUS_ACCEPTED || status === STATUS_REJECTED)) {
    const updatedAny: any = updated;
    const opportunityName = updatedAny.opportunity?.name || "this opportunity";
    // Notify applicant (student or professor)
    if (updatedAny.applicantType === "STUDENT" && updatedAny.studentId) {
      await notifyApplicationStatusChange(updatedAny.studentId, opportunityName, status, "student");
    } else if (updatedAny.applicantType === "PROFESSOR" && updatedAny.professorApplicantId) {
      await notifyApplicationStatusChange(updatedAny.professorApplicantId, opportunityName, status, "professor");
    }
  }

  return updated as any;
}

/**
 * Helper to notify student of application status change
 */
async function notifyApplicationStatusChange(
  recipientId: bigint,
  opportunityName: string,
  status: string,
  recipientRole: "student" | "professor"
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

  await createNotification(recipientId, recipientRole, title, message, type);
}
