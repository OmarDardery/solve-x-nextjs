import prisma from "@/lib/prisma";
import { hashPassword, checkPasswordHash, generateJWT } from "./auth";

/**
 * Create a new organization
 */
export async function createOrganization(
  name: string,
  email: string,
  password: string,
  contact?: string,
  link?: string
) {
  // Check if email already exists
  const existing = await prisma.organization.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(password);

  const organization = await prisma.organization.create({
    data: {
      name,
      email,
      password: passwordHash,
      contact: contact || null,
      link: link || null,
      lastChangedPassword: new Date(),
    },
  });

  return organization;
}

/**
 * Authenticate an organization and return the organization if valid
 */
export async function authenticateOrganization(
  email: string,
  password: string
) {
  const organization = await prisma.organization.findUnique({
    where: { email },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  if (!organization.password) {
    throw new Error("Invalid credentials");
  }

  const isValid = await checkPasswordHash(password, organization.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  return organization;
}

/**
 * Get JWT for organization
 */
export function getOrganizationJWT(organization: {
  id: bigint;
  email: string | null;
}) {
  return generateJWT(organization.id, organization.email || "", "organization");
}

/**
 * Get all organizations
 */
export async function getAllOrganizations() {
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      contact: true,
      link: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return organizations;
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: bigint) {
  const organization = await prisma.organization.findUnique({
    where: { id },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return organization;
}

/**
 * Get organization by email
 */
export async function getOrganizationByEmail(email: string) {
  const organization = await prisma.organization.findUnique({
    where: { email },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return organization;
}

/**
 * Update organization fields
 */
export async function updateOrganization(
  id: bigint,
  updates: {
    name?: string;
    contact?: string;
    link?: string;
    password?: string;
    [key: string]: any;
  }
) {
  // If password is being updated, hash it
  if (updates.password) {
    updates.password = await hashPassword(updates.password);
    updates.lastChangedPassword = new Date();
  }

  const organization = await prisma.organization.update({
    where: { id },
    data: updates,
  });

  return organization;
}

/**
 * Delete an organization
 */
export async function deleteOrganization(id: bigint) {
  await prisma.organization.delete({ where: { id } });
}

/**
 * Check if organization email exists
 */
export async function organizationEmailExists(email: string): Promise<boolean> {
  const organization = await prisma.organization.findUnique({
    where: { email },
  });
  return !!organization;
}
