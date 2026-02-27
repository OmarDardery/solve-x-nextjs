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
 * Create a tag and associate it to a student (if provided).
 * If the tag already exists, it will be returned and association to the student will be created.
 */
export async function createTagForStudent(studentId: bigint, name: string, description?: string) {
  // Ensure tag exists (create if missing)
  const tag = await createTag(name, description);

  // Create association in student_tags (skip duplicates)
  try {
    await prisma.studentTags.createMany({
      data: [{ studentId, tagId: tag.id }],
      skipDuplicates: true,
    } as any);
  } catch (e) {
    // ignore duplicate constraint errors or other issues
  }

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
export async function getTagById(id: bigint) {
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
  id: bigint,
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
export async function deleteTag(id: bigint) {
  await prisma.tag.delete({ where: { id } });
}
