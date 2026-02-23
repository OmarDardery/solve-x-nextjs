"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FileText, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { applicationApi, type Application } from "@/lib/api";
import { USER_ROLES, APPLICATION_STATUS } from "@/lib/types";

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, [session]);

  const fetchApplications = async () => {
    try {
      const appsData = await applicationApi.getMyApplications();
      setApplications(appsData || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, newStatus: "accepted" | "rejected") => {
    try {
      await applicationApi.updateStatus(applicationId, newStatus);
      toast.success("Application status updated");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, typeof Clock> = {
      pending: Clock,
      accepted: CheckCircle,
      rejected: XCircle,
    };
    return icons[status] || FileText;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "error"> = {
      pending: "default",
      accepted: "success",
      rejected: "error",
    };
    return variants[status] || "default";
  };

  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  const canManageStatus = userRole === USER_ROLES.PROFESSOR || userRole === USER_ROLES.ORGANIZATION;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">
            Applications
          </h1>
          <p className="text-muted mt-1 text-sm sm:text-base">
            {userRole === USER_ROLES.STUDENT
              ? "Track your applications"
              : "Manage applications"}
          </p>
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="all">All Statuses</option>
          <option value={APPLICATION_STATUS.PENDING}>Pending</option>
          <option value={APPLICATION_STATUS.ACCEPTED}>Accepted</option>
          <option value={APPLICATION_STATUS.REJECTED}>Rejected</option>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted">No applications found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const StatusIcon = getStatusIcon(application.status);
            return (
              <Card key={application.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: "rgba(100, 58, 230, 0.1)" }}
                      >
                        <StatusIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-heading">
                          {application.opportunity?.title || "Opportunity"}
                        </h3>
                        <p className="text-sm text-muted mt-1">
                          {userRole === USER_ROLES.STUDENT
                            ? `Applied on ${
                                application.created_at
                                  ? new Date(application.created_at).toLocaleDateString()
                                  : "N/A"
                              }`
                            : `${application.student?.name || "Student"} • Applied ${
                                application.created_at
                                  ? new Date(application.created_at).toLocaleDateString()
                                  : "N/A"
                              }`}
                        </p>
                        {application.cover_letter && (
                          <p className="text-sm text-muted mt-2 line-clamp-2">
                            {application.cover_letter}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusBadge(application.status)}>
                        {application.status}
                      </Badge>
                      {canManageStatus && application.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(application.id, "accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateStatus(application.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
