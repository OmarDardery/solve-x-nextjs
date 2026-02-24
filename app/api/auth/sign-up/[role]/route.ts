import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";
import { verifyCode } from "../../send-code/route";
import { isValidStudentDomain, isValidProfessorDomain } from "@/lib/config/domains";
import { createStudent } from "@/lib/services/student";
import { createProfessor } from "@/lib/services/professor";
import { createOrganization } from "@/lib/services/organization";

type Props = {
  params: Promise<{ role: string }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const { role } = await params;
    const body = await request.json();

    // Handle organization separately due to different fields
    if (role === "organization") {
      const { code, name, email, password, contact, link } = body;

      if (!code || !name || !email || !password) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Verify code
      if (!verifyCode(email, code.toString())) {
        return NextResponse.json(
          { error: "Invalid or expired verification code" },
          { status: 400 }
        );
      }

      // Create organization
      await createOrganization(name, email, password, contact, link);

      // Sign in and get session
      await signIn("credentials", {
        email,
        password,
        role: "organization",
        redirect: false,
      });

      return NextResponse.json({
        message: "Organization registered successfully",
        role: "organization",
      });
    }

    // Handle student and professor
    const { code, first_name, last_name, email, password } = body;

    if (!code || !first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Verify code
    if (!verifyCode(email, code.toString())) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Validate email domain and create user
    switch (role) {
      case "student":
        if (!isValidStudentDomain(email) && !process.env.NEXT_PUBLIC_TEST) {
          return NextResponse.json(
            { error: "Invalid email domain for student" },
            { status: 400 }
          );
        }
        await createStudent(first_name, last_name, email, password);
        break;

      case "professor":
        if (!isValidProfessorDomain(email) && !process.env.NEXT_PUBLIC_TEST) {
          return NextResponse.json(
            { error: "Invalid email domain for professor" },
            { status: 400 }
          );
        }
        await createProfessor(first_name, last_name, email, password);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `${role} registered successfully`,
      role,
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
