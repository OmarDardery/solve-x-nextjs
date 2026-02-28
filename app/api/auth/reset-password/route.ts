import { NextResponse } from "next/server";
import { verifyCode } from "../send-code/route";
import { getStudentByEmail, updateStudent } from "@/lib/services/student";
import { getProfessorByEmail, updateProfessor } from "@/lib/services/professor";
import { getOrganizationByEmailSafe, updateOrganization } from "@/lib/services/organization";
import { signIn } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, code, password } = body as {
      email?: string;
      role?: string;
      code?: string | number;
      password?: string;
    };

    if (!email || !role || !code || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    const ok = await verifyCode(email.toLowerCase(), String(code));
    if (!ok) {
      return NextResponse.json({ message: "Invalid or expired code" }, { status: 400 });
    }

    // Use role to find user and update password via existing service helpers.
    if (role === "student") {
      const student = await getStudentByEmail(email.toLowerCase());
      if (!student) {
        // Generic response to avoid user enumeration
        return NextResponse.json({ message: "If that account exists, the password was reset" });
      }
      await updateStudent(student.id, { password });
    } else if (role === "professor") {
      const professor = await getProfessorByEmail(email.toLowerCase());
      if (!professor) {
        return NextResponse.json({ message: "If that account exists, the password was reset" });
      }
      await updateProfessor(professor.id, { password });
    } else if (role === "organization") {
      const org = await getOrganizationByEmailSafe(email.toLowerCase());
      if (!org) {
        return NextResponse.json({ message: "If that account exists, the password was reset" });
      }
      await updateOrganization(org.id, { password });
    } else {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // Optionally sign-in programmatically and return the same response shape as sign-in.
    try {
      await signIn("credentials", { redirect: false, email, password, role });
    } catch (e) {
      // ignore sign-in errors; return success for reset
    }

    return NextResponse.json({ message: "If that account exists, the password was reset" });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
