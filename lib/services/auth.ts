import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRY = "72h"; // 72 hours like the original

export interface JWTPayload {
  user_id: number; // snake_case to match Go JWT, number for JSON serialization
  email: string;
  role: "student" | "professor" | "organization";
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 14; // Same as Go implementation
  return bcrypt.hash(password, saltRounds);
}

/**
 * Check if a password matches its hash
 */
export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateJWT(
  userId: bigint,
  email: string,
  role: "student" | "professor" | "organization"
): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const payload: JWTPayload = {
    user_id: Number(userId), // Convert BigInt to number for JSON serialization
    email,
    role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Parse and verify a JWT token
 */
export function parseJWT(token: string): JWTPayload {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
