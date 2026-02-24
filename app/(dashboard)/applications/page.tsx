"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FileText, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { applicationApi, type Application } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { USER_ROLES, APPLICATION_STATUS } from "@/lib/types";

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            const personName =
              userRole === USER_ROLES.PROFESSOR
                ? `${application.student?.first_name || ""} ${application.student?.last_name || ""}`.trim() || "Student"
                : application.opportunity?.professor
                ? `${application.opportunity.professor.first_name || ""} ${application.opportunity.professor.last_name || ""}`.trim()
                : "Professor";

            return (
              <Card key={application.id} onClick={() => { setSelectedApp(application); setIsModalOpen(true); }}>
                <CardContent className="p-4 sm:p-6 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-heading">
                        {application.opportunity?.name || "Opportunity"}
                      </h3>
                      <p className="text-sm text-muted mt-1">{personName}</p>
                      {application.opportunity?.id && (
                        <div className="mt-2">
                          <Link
                            href={`/opportunities/${application.opportunity.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-primary hover:underline"
                          >
                            View opportunity
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusIcon className="w-6 h-6 text-primary" />
                      <Badge variant={getStatusBadge(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {/* Application detail modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedApp?.opportunity?.name || "Application"}
        size="md"
        className="p-6 sm:p-8"
      >
        {selectedApp && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              <strong>Sender:</strong>{' '}
              {userRole === USER_ROLES.PROFESSOR
                ? `${selectedApp.student?.first_name || ""} ${selectedApp.student?.last_name || ""}`.trim()
                : selectedApp.opportunity?.professor
                ? `${selectedApp.opportunity.professor.first_name || ""} ${selectedApp.opportunity.professor.last_name || ""}`.trim()
                : "Unknown"}
            </p>

            <p className="text-sm">
              <strong>Applied at:</strong>{' '}
              {selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleString() : "N/A"}
            </p>

            <p className="text-sm">
              <strong>Opportunity created at:</strong>{' '}
              {selectedApp.opportunity?.created_at ? new Date(selectedApp.opportunity.created_at).toLocaleString() : "N/A"}
            </p>

            <div>
              <p className="font-medium">Message / Cover Letter</p>
              <p className="text-sm text-muted whitespace-pre-wrap">{selectedApp.message || "No message provided."}</p>
            </div>

            <div>
              <p className="font-medium">Resume</p>
              {selectedApp.resume_link ? (
                <a className="text-primary underline" href={selectedApp.resume_link} target="_blank" rel="noreferrer">Open resume</a>
              ) : (
                <p className="text-sm text-muted">No resume link provided.</p>
              )}

              {/* No external links for opportunities; only resume is shown */}
            </div>

            <div className="flex justify-end">
              <div className="flex gap-2">
                {canManageStatus && selectedApp.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await updateStatus(selectedApp.id, "accepted");
                          setIsModalOpen(false);
                          setSelectedApp(null);
                        } catch (e) {
                          // updateStatus shows toast on error
                        }
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await updateStatus(selectedApp.id, "rejected");
                          setIsModalOpen(false);
                          setSelectedApp(null);
                        } catch (e) {
                          // updateStatus shows toast on error
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button onClick={() => setIsModalOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
