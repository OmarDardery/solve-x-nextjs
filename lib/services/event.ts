import prisma from "@/lib/prisma";

/**
 * Create a new event
 */
export async function createEvent(
  organizationId: bigint,
  title: string,
  description?: string,
  date?: string,
  link?: string,
  signUpLink?: string
) {
  const event = await prisma.event.create({
    data: {
      organizationId,
      title,
      description: description || null,
      date: date || null,
      link: link || null,
      signUpLink: signUpLink || null,
    },
    include: {
      organization: true,
    },
  });

  return event;
}

/**
 * Get event by ID
 */
export async function getEventById(id: bigint) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organization: true,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
}

/**
 * Get all events
 */
export async function getAllEvents() {
  return prisma.event.findMany({
    include: {
      organization: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get events by organization ID
 */
export async function getEventsByOrganizationId(organizationId: bigint) {
  return prisma.event.findMany({
    where: { organizationId },
    include: {
      organization: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Update an event
 */
export async function updateEvent(id: bigint, updates: any) {
  // Normalize incoming keys: support both camelCase and snake_case from the API
  const data: any = {};
  console.log("updateEvent incoming updates:", updates);
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.date !== undefined) data.date = updates.date;
  if (updates.link !== undefined) data.link = updates.link;
  // signUpLink may come as camelCase or snake_case (sign_up_link)
  if (updates.signUpLink !== undefined) data.signUpLink = updates.signUpLink;
  if (updates.sign_up_link !== undefined) data.signUpLink = updates.sign_up_link;
  console.log("updateEvent normalized data:", data);

  const event = await prisma.event.update({
    where: { id },
    data,
    include: {
      organization: true,
    },
  });

  return event;
}

/**
 * Delete an event
 */
export async function deleteEvent(id: bigint) {
  await prisma.event.delete({ where: { id } });
}

/**
 * Delete event only if it belongs to the organization
 */
export async function deleteEventByIdAndOrg(
  eventId: bigint,
  organizationId: bigint
) {
  const result = await prisma.event.deleteMany({
    where: {
      id: eventId,
      organizationId,
    },
  });

  if (result.count === 0) {
    throw new Error("Event not found or unauthorized");
  }
}
