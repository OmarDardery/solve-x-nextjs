"use client";

import { useSession } from "next-auth/react";
import { USER_ROLES } from "@/lib/types";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import ProfessorDashboard from "@/components/dashboard/ProfessorDashboard";
import OrganizationDashboard from "@/components/dashboard/OrganizationDashboard";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  switch (userRole) {
    case USER_ROLES.STUDENT:
      return <StudentDashboard />;
    case USER_ROLES.PROFESSOR:
      return <ProfessorDashboard />;
    case USER_ROLES.ORGANIZATION:
      return <OrganizationDashboard />;
    default:
      return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-heading">Welcome to SolveX</h1>
          <p className="text-muted mt-2">Loading your dashboard...</p>
        </div>
      );
  }
}
