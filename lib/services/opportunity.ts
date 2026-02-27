import prisma from "@/lib/prisma";

export type OpportunityType = "research" | "project" | "internship" | "competition";

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
): Promise<any> {
  // Validate type
  if (!["research", "project", "internship", "competition"].includes(type)) {
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
      student: true,
      opportunity_tags: {
        include: { tags: true },
      },
    },
  } as any);

  return opportunity;
}

/**
 * Get opportunity by ID
 */
export async function getOpportunityById(id: bigint): Promise<any> {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id } as any,
    include: {
      professor: true,
      student: true,
      opportunity_tags: {
        include: { tags: true },
      },
    },
  } as any);

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
    where: { id } as any,
    data,
    include: {
      professor: true,
      student: true,
      opportunity_tags: {
        include: { tags: true },
      },
    },
  } as any);

  return opportunity as any;
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
export async function getOpportunitiesByProfessorId(professorId: bigint): Promise<any[]> {
  return prisma.opportunity.findMany({
    where: { professorId } as any,
    include: {
      professor: true,
      student: true,
      opportunity_tags: {
        include: { tags: true },
      },
    },
    orderBy: { createdAt: "desc" },
  } as any);
}

/**
 * Get all opportunities
 */
export async function getAllOpportunities(): Promise<any[]> {
  return prisma.opportunity.findMany({
    include: {
      professor: true,
      student: true,
      opportunity_tags: {
        include: { tags: true },
      },
    },
    orderBy: { createdAt: "desc" },
  } as any);
}

/**
 * Create opportunity by owner (professor or student)
 */
export async function createOpportunityByOwner(
  ownerType: "professor" | "student",
  ownerId: bigint,
  name: string,
  details: string | null,
  requirements: string | null,
  reward: string | null,
  type: OpportunityType,
  tagIds?: bigint[]
) {
  // Basic validation
  if (!name || !type) throw new Error("Name and type are required");
  if (!ownerId) throw new Error("Owner id is required");
  if (!["research", "project", "internship", "competition"].includes(type)) {
    throw new Error("Invalid opportunity type");
  }

  // sanitize tag ids: remove falsy and convert to BigInt where needed
  const validTagIds = Array.isArray(tagIds)
    ? tagIds.filter((t) => t !== null && t !== undefined).map((t: any) => BigInt(t))
    : [];
  const data: any = {
    name,
    details,
    requirements,
    reward,
    type,
    opportunity_tags: validTagIds.length
      ? {
          create: validTagIds.map((tagId) => ({ tagId })),
        }
      : undefined,
  };

  if (ownerType === "professor") data.professorId = ownerId;
  else data.studentId = ownerId;

  try {
    const opportunity = await prisma.opportunity.create({
      data,
      include: {
        professor: true,
        student: true,
        opportunity_tags: { include: { tags: true } },
      },
    } as any);

    return opportunity as any;
  } catch (err: any) {
    console.error("prisma.opportunity.create failed", {
      data,
      error: err?.message || err,
      meta: err?.meta || null,
    });
    throw err;
  }
}

export async function getOpportunitiesByOwner(ownerType: "professor" | "student", ownerId: bigint): Promise<any[]> {
  const where: any = ownerType === "professor" ? { professorId: ownerId } : { studentId: ownerId };
  return prisma.opportunity.findMany({
    where: where as any,
    include: {
      professor: true,
      student: true,
      opportunity_tags: { include: { tags: true } },
    },
    orderBy: { createdAt: "desc" },
  } as any);
}
