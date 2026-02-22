import { NextResponse } from "next/server";
import { getDomainConfig } from "@/lib/config/domains";

export async function GET() {
  const config = getDomainConfig();
  return NextResponse.json({
    student_domains: config.studentDomains,
    professor_domains: config.professorDomains,
  });
}
