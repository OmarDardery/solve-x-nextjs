import { NextResponse } from "next/server";
import { isValidStudentDomain, isValidProfessorDomain } from "@/lib/config/domains";
import { authenticateStudent, getStudentJWT } from "@/lib/services/student";
import { authenticateProfessor, getProfessorJWT } from "@/lib/services/professor";
import { authenticateOrganization, getOrganizationJWT } from "@/lib/services/organization";

type Props = {
  params: Promise<{ role: string }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const { role } = await params;
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    let token: string;

    switch (role) {
      case "student": {
        if (!isValidStudentDomain(email) && !process.env.NEXT_PUBLIC_TEST) {
          return NextResponse.json(
            { error: "Invalid email domain for student" },
            { status: 400 }
          );
        }
        const student = await authenticateStudent(email, password);
        token = await getStudentJWT(student);
        break;
      }

      case "professor": {
        if (!isValidProfessorDomain(email) && !process.env.NEXT_PUBLIC_TEST) {
          return NextResponse.json(
            { error: "Invalid email domain for professor" },
            { status: 400 }
          );
        }
        const professor = await authenticateProfessor(email, password);
        token = await getProfessorJWT(professor);
        break;
      }

      case "organization": {
        const organization = await authenticateOrganization(email, password);
        token = await getOrganizationJWT(organization);
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        );
    }

    return NextResponse.json({ token, role });
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }
}
