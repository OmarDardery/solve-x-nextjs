import prisma from "@/lib/prisma";
import { OpportunityType } from "@prisma/client";

/**
 * Create a new opportunity
 */
export async function createOpportunity(
  professorId: number,
  name: string,
  details: string | null,
  requirements: string | null,
  reward: string | null,
  type: OpportunityType,
  tagIds?: number[]
) {
  // Validate type
  if (!["research", "project", "internship"].includes(type)) {
    throw new Error("Invalid opportunity type");
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      professorId,
      name,
      details,
      requirements,
      reward,
      type,
      tags: tagIds?.length
        ? {
            connect: tagIds.map((id) => ({ id })),
          }
        : undefined,
    },
    include: {
      professor: true,
      tags: true,
    },
  });

  return opportunity;
}

/**
 * Get opportunity by ID
 */
export async function getOpportunityById(id: number) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      professor: true,
      tags: true,
    },
  });

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  return opportunity;
}

/**
 * Update opportunity fields
 */
export async function updateOpportunity(
  id: number,
  updates: {
    name?: string;
    details?: string;
    requirements?: string;
    reward?: string;
    type?: OpportunityType;
    tagIds?: number[];
  }
) {
  const { tagIds, ...data } = updates;

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data: {
      ...data,
      tags: tagIds
        ? {
            set: tagIds.map((id) => ({ id })),
          }
        : undefined,
    },
    include: {
      professor: true,
      tags: true,
    },
  });

  return opportunity;
}

/**
 * Delete an opportunity
 */
export async function deleteOpportunity(id: number) {
  await prisma.opportunity.delete({ where: { id } });
}

/**
 * Get all opportunities by professor ID
 */
export async function getOpportunitiesByProfessorId(professorId: number) {
  return prisma.opportunity.findMany({
    where: { professorId },
    include: {
      professor: true,
      tags: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get all opportunities
 */
export async function getAllOpportunities() {
  return prisma.opportunity.findMany({
    include: {
      professor: true,
      tags: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
