"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FileText, Plus, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea, Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { reportApi, type WeeklyReport } from "@/lib/api";
import { USER_ROLES } from "@/lib/types";

export default function ReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    week_number: getCurrentWeekNumber(),
    hours_worked: 0,
    tasks_completed: "",
    challenges: "",
    next_week_goals: "",
  });

  const isStudent = session?.user?.role === USER_ROLES.STUDENT;

  function getCurrentWeekNumber() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + 1) / 7);
  }

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await reportApi.getMyReports();
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.tasks_completed) {
      toast.error("Please fill in completed tasks");
      return;
    }

    setSubmitting(true);
    try {
      await reportApi.create({
        week_number: formData.week_number,
        year: new Date().getFullYear(),
        hours_worked: formData.hours_worked,
        tasks_completed: formData.tasks_completed,
        challenges: formData.challenges,
        next_week_goals: formData.next_week_goals,
        status: "submitted",
      });
      toast.success("Report submitted successfully!");
      setShowCreateModal(false);
      setFormData({
        week_number: getCurrentWeekNumber(),
        hours_worked: 0,
        tasks_completed: "",
        challenges: "",
        next_week_goals: "",
      });
      fetchReports();
    } catch (error) {
      toast.error("Failed to submit report");
    } finally {
      setSubmitting(false);
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
              ? "Track your progress with weekly reports"
              : "View student weekly reports"}
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-heading">
                      Week {report.week_number}, {report.year}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {report.created_at
                          ? new Date(report.created_at).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <Badge
                        variant={
                          report.status === "approved"
                            ? "success"
                            : report.status === "rejected"
                            ? "error"
                            : "default"
                        }
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                  {report.hours_worked > 0 && (
                    <Badge variant="primary">{report.hours_worked} hours</Badge>
                  )}
                </div>
                
                {report.tasks_completed && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-heading mb-1">Tasks Completed</h4>
                    <p className="text-muted text-sm whitespace-pre-wrap">{report.tasks_completed}</p>
                  </div>
                )}
                
                {report.challenges && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-heading mb-1">Challenges</h4>
                    <p className="text-muted text-sm whitespace-pre-wrap">{report.challenges}</p>
                  </div>
                )}
                
                {report.next_week_goals && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-heading mb-1">Next Week Goals</h4>
                    <p className="text-muted text-sm whitespace-pre-wrap">{report.next_week_goals}</p>
                  </div>
                )}
                
                {report.supervisor_feedback && (
                  <div
                    className="mt-4 p-3 rounded-lg"
                    style={{ backgroundColor: "rgba(100, 58, 230, 0.1)" }}
                  >
                    <p className="text-sm font-medium text-heading mb-1">
                      Supervisor Feedback
                    </p>
                    <p className="text-sm text-muted">{report.supervisor_feedback}</p>
                  </div>
                )}
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Week Number"
              type="number"
              value={formData.week_number}
              onChange={(e) =>
                setFormData({ ...formData, week_number: parseInt(e.target.value) || 1 })
              }
            />
            <Input
              label="Hours Worked"
              type="number"
              value={formData.hours_worked}
              onChange={(e) =>
                setFormData({ ...formData, hours_worked: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <Textarea
            label="Tasks Completed"
            placeholder="What did you accomplish this week?"
            value={formData.tasks_completed}
            onChange={(e) =>
              setFormData({ ...formData, tasks_completed: e.target.value })
            }
            rows={4}
          />
          <Textarea
            label="Challenges (optional)"
            placeholder="Any challenges or blockers you faced?"
            value={formData.challenges}
            onChange={(e) =>
              setFormData({ ...formData, challenges: e.target.value })
            }
            rows={3}
          />
          <Textarea
            label="Next Week Goals (optional)"
            placeholder="What do you plan to work on next week?"
            value={formData.next_week_goals}
            onChange={(e) =>
              setFormData({ ...formData, next_week_goals: e.target.value })
            }
            rows={3}
          />
          <div className="flex gap-3 justify-end">
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
