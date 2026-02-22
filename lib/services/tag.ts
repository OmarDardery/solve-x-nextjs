import prisma from "@/lib/prisma";

/**
 * Create a tag (or return existing if name already exists)
 */
export async function createTag(name: string, description?: string) {
  // Check if tag already exists
  const existing = await prisma.tag.findUnique({ where: { name } });
  if (existing) {
    return existing;
  }

  const tag = await prisma.tag.create({
    data: {
      name,
      description: description || null,
    },
  });

  return tag;
}

/**
 * Get all tags
 */
export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * Get tag by ID
 */
export async function getTagById(id: number) {
  const tag = await prisma.tag.findUnique({
    where: { id },
  });

  if (!tag) {
    throw new Error("Tag not found");
  }

  return tag;
}

/**
 * Update a tag
 */
export async function updateTag(
  id: number,
  updates: { name?: string; description?: string }
) {
  return prisma.tag.update({
    where: { id },
    data: updates,
  });
}

/**
 * Delete a tag
 */
export async function deleteTag(id: number) {
  await prisma.tag.delete({ where: { id } });
}
