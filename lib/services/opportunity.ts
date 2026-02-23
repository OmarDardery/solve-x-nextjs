import prisma from "@/lib/prisma";

export type OpportunityType = "research" | "project" | "internship";

/**
 * Create a new opportunity
 */
export async function createOpportunity(
  professorId: bigint,
  name: string,
  details: string | null,
  requirements: string | null,
  reward: string | null,
  type: OpportunityType,
  tagIds?: bigint[]
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
      opportunity_tags: tagIds?.length
        ? {
            create: tagIds.map((tagId) => ({ tagId })),
          }
        : undefined,
    },
    include: {
      professor: true,
      opportunity_tags: {
        include: { tags: true },
      },
    },
  });

  return opportunity;
}

/**
 * Get opportunity by ID
 */
export async function getOpportunityById(id: bigint) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      professor: true,
      opportunity_tags: {
        include: { tags: true },
      },
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
  id: bigint,
  updates: {
    name?: string;
    details?: string;
    requirements?: string;
    reward?: string;
    type?: string;
    tagIds?: bigint[];
  }
) {
  const { tagIds, ...data } = updates;

  // If tagIds provided, delete existing and create new junction records
  if (tagIds !== undefined) {
    await prisma.opportunityTags.deleteMany({
      where: { opportunityId: id },
    });

    if (tagIds.length > 0) {
      await prisma.opportunityTags.createMany({
        data: tagIds.map((tagId) => ({ opportunityId: id, tagId })),
      });
    }
  }

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data,
    include: {
      professor: true,
      opportunity_tags: {
        include: { tags: true },
      },
    },
  });

  return opportunity;
}

/**
 * Delete an opportunity
 */
export async function deleteOpportunity(id: bigint) {
  await prisma.opportunity.delete({ where: { id } });
}

/**
 * Get all opportunities by professor ID
 */
export async function getOpportunitiesByProfessorId(professorId: bigint) {
  return prisma.opportunity.findMany({
    where: { professorId },
    include: {
      professor: true,
      opportunity_tags: {
        include: { tags: true },
      },
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
      opportunity_tags: {
        include: { tags: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
