import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/services/mail";
import { isValidStudentDomain, isValidProfessorDomain } from "@/lib/config/domains";
import { studentEmailExists } from "@/lib/services/student";
import { professorEmailExists } from "@/lib/services/professor";
import { organizationEmailExists } from "@/lib/services/organization";

// In-memory verification code store
// In production, use Redis or database
const verificationCodes = new Map<string, { code: string; expires: number }>();

/**
 * Generate a 6-digit verification code
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store verification code (with 10-minute expiry)
 */
export function storeCode(email: string, code: string) {
  verificationCodes.set(email, {
    code,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Verify code for email
 */
export function verifyCode(email: string, code: string): boolean {
  const stored = verificationCodes.get(email);
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    verificationCodes.delete(email);
    return false;
  }
  if (stored.code !== code) return false;
  verificationCodes.delete(email);
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role, purpose = "signup" } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Validate email domain based on role
    switch (role) {
      case "student":
        if (!isValidStudentDomain(email) && !process.env.NEXT_PUBLIC_TEST) {
          return NextResponse.json(
            { error: "Invalid email domain for student. Use a valid student email." },
            { status: 400 }
          );
        }
        // Check email availability for signup
        if (purpose === "signup" && await studentEmailExists(email)) {
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 409 }
          );
        }
        break;

      case "professor":
        if (!isValidProfessorDomain(email) && !process.env.NEXT_PUBLIC_TEST) {
          return NextResponse.json(
            { error: "Invalid email domain for professor. Use a valid faculty email." },
            { status: 400 }
          );
        }
        // Check email availability for signup
        if (purpose === "signup" && await professorEmailExists(email)) {
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 409 }
          );
        }
        break;

      case "organization":
        // Organizations can use any domain
        // Check email availability for signup
        if (purpose === "signup" && await organizationEmailExists(email)) {
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 409 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        );
    }

    // Generate and store code
    const code = generateCode();
    storeCode(email, code);

    // Send verification email
    await sendVerificationEmail(email, code);

    return NextResponse.json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
