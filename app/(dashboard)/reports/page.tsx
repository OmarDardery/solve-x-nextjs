"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  FileText,
  Plus,
  Calendar,
  Loader2,
  ExternalLink,
  User,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { reportApi, professorApi, type WeeklyReport, type Professor } from "@/lib/api";
import { USER_ROLES } from "@/lib/types";

export default function ReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    recipient_id: "",
    drive_link: "",
  });
  const [errors, setErrors] = useState<{ drive_link?: string; recipient_id?: string }>({});

  const isStudent = session?.user?.role === USER_ROLES.STUDENT;
  const isProfessor = session?.user?.role === USER_ROLES.PROFESSOR;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsData, professorsData] = await Promise.all([
        reportApi.getMyReports().catch(() => []),
        isStudent ? professorApi.getAll().catch(() => []) : Promise.resolve([]),
      ]);
      setReports(reportsData || []);
      setProfessors(professorsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const validateDriveLink = (link: string): boolean => {
    if (!link) return false;
    const drivePatterns = [
      /^https:\/\/drive\.google\.com\//,
      /^https:\/\/docs\.google\.com\//,
    ];
    return drivePatterns.some((pattern) => pattern.test(link));
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};

    if (!formData.recipient_id) {
      newErrors.recipient_id = "Please select a professor";
    }

    if (!formData.drive_link) {
      newErrors.drive_link = "Please enter a Google Drive link";
    } else if (!validateDriveLink(formData.drive_link)) {
      newErrors.drive_link = "Please enter a valid Google Drive link";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await reportApi.create({
        recipient_id: formData.recipient_id,
        drive_link: formData.drive_link,
      });
      toast.success("Report submitted successfully!");
      setShowCreateModal(false);
      setFormData({ recipient_id: "", drive_link: "" });
      setErrors({});
      fetchData();
    } catch (error) {
      toast.error("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await reportApi.delete(id);
      toast.success("Report deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">
            Weekly Reports
          </h1>
          <p className="text-muted mt-1 text-sm sm:text-base">
            {isStudent
              ? "Submit weekly progress reports to your professors"
              : "View submitted reports from students"}
          </p>
        </div>
        {isStudent && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted mb-4">No reports submitted yet.</p>
            {isStudent && (
              <Button onClick={() => setShowCreateModal(true)}>
                Submit Your First Report
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted">
                        Submitted on{" "}
                        {report.created_at
                          ? new Date(report.created_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    {isProfessor && report.student && (
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-muted" />
                        <span className="text-heading font-medium">
                          {report.student.first_name} {report.student.last_name}
                        </span>
                      </div>
                    )}

                    {isStudent && report.recipient && (
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-muted" />
                        <span className="text-muted">
                          Sent to:{" "}
                          <span className="text-heading">
                            {report.recipient.first_name} {report.recipient.last_name}
                          </span>
                        </span>
                      </div>
                    )}

                    <a
                      href={report.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Report on Google Drive
                    </a>
                  </div>

                  {isStudent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(report.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Report Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Submit Weekly Report"
      >
        <div className="space-y-4">
          <Select
            label="Select Professor"
            value={formData.recipient_id}
            onChange={(e) => {
              setFormData({ ...formData, recipient_id: e.target.value });
              setErrors({ ...errors, recipient_id: undefined });
            }}
            error={errors.recipient_id}
          >
            <option value="">Choose a professor...</option>
            {professors.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.first_name} {prof.last_name}
              </option>
            ))}
          </Select>

          <Input
            label="Google Drive Link"
            placeholder="https://drive.google.com/..."
            value={formData.drive_link}
            onChange={(e) => {
              setFormData({ ...formData, drive_link: e.target.value });
              setErrors({ ...errors, drive_link: undefined });
            }}
            error={errors.drive_link}
          />

          <p className="text-xs text-muted">
            Upload your weekly report to Google Drive and share the link here.
            Make sure the link is accessible to your professor.
          </p>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
