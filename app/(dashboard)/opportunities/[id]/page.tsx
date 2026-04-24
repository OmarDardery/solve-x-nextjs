"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { opportunityApi, applicationApi, type Opportunity } from "@/lib/api";
import { USER_ROLES } from "@/lib/types";

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [showReceivedModal, setShowReceivedModal] = useState(false);
  const [receivedApplications, setReceivedApplications] = useState<any[]>([]);

  const isStudent = session?.user?.role === USER_ROLES.STUDENT;
  const isProfessor = session?.user?.role === USER_ROLES.PROFESSOR;
  const isOwner = (() => {
    const userId = session?.user?.id;
    if (!userId) return false;
    if (isProfessor && opportunity?.professor) return opportunity.professor.id?.toString() === userId;
    if (isStudent && opportunity?.student) return opportunity.student.id?.toString() === userId;
    return false;
  })();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  useEffect(() => {
    // If ?view=applications and user is owner, fetch received applications and open modal
    const view = searchParams?.get?.("view");
    if (view === "applications" && isOwner) {
      (async () => {
        try {
          const apps = await applicationApi.getForOpportunity(id);
          setReceivedApplications(apps || []);
          setShowReceivedModal(true);
        } catch (err) {
          console.error("Failed to fetch received applications:", err);
        }
      })();
    }
  }, [searchParams, isOwner, id]);

  useEffect(() => {
    if (isStudent || isProfessor) checkIfApplied();
  }, [isStudent, isProfessor, id]);

  const fetchOpportunity = async () => {
    try {
      const data = await opportunityApi.getById(id);
      setOpportunity(data);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      toast.error("Failed to load opportunity");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      toast.error("Please write a cover letter");
      return;
    }

    if (!resumeLink.trim()) {
      toast.error("Please provide a resume link");
      return;
    }

    setApplying(true);
    try {
      await applicationApi.apply(id, {
        message: coverLetter,
        resume_link: resumeLink,
      });
      toast.success("Application submitted successfully!");
      setShowApplyModal(false);
      router.push("/applications");
    } catch (error) {
      toast.error("Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const res = await applicationApi.getMyApplications();
      const apps = res.submitted || [];
      const found = apps.some((a: any) => {
        const oppId = a.opportunity?.id || a.opportunity_id;
        return oppId === id;
      });
      setHasApplied(found);
    } catch (err) {
      console.error("Failed to check applications:", err);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      research: "Research",
      project: "Project",
      internship: "Internship",
      competition: "Competition",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted">Opportunity not found.</p>
          <Button as={Link} href="/opportunities" variant="ghost" className="mt-4">
            Back to Opportunities
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        as={Link}
        href="/opportunities"
        variant="ghost"
        className="inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Opportunities
      </Button>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between mb-6">
            <div>
              <Badge variant="primary" className="mb-3">
                {getTypeLabel(opportunity.type)}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-heading">
                {opportunity.name}
              </h1>
            </div>
            {isOwner ? (
              <Button onClick={() => router.push(`/opportunities/${opportunity.id}?view=applications`)}>
                View Applications
              </Button>
            ) : (
              (isStudent || isProfessor) && (
                <Button onClick={() => setShowApplyModal(true)} disabled={hasApplied}>
                  {hasApplied ? "Already Applied" : "Apply Now"}
                </Button>
              )
            )}
          </div>

          <div className="space-y-4 text-sm text-muted mb-6">
            {opportunity.professor && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <div>
                  <div className="text-sm font-medium text-heading">
                    {opportunity.professor.first_name} {opportunity.professor.last_name}
                  </div>
                  {opportunity.professor.email && (
                    <div className="text-xs text-muted">{opportunity.professor.email}</div>
                  )}
                </div>
              </div>
            )}
            {opportunity.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Posted:{" "}
                  {new Date(opportunity.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
            <h3 className="text-lg font-semibold text-heading mb-2">
              Description
            </h3>
            <p className="text-muted whitespace-pre-wrap">
              {opportunity.details}
            </p>
          </div>

          {opportunity.requirements && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-heading mb-2">
                Requirements
              </h3>
              <p className="text-muted whitespace-pre-wrap">
                {opportunity.requirements}
              </p>
            </div>
          )}

          {opportunity.reward && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-heading mb-2">
                Reward
              </h3>
              <p className="text-muted whitespace-pre-wrap">
                {opportunity.reward}
              </p>
            </div>
          )}

          {opportunity.requirement_tags && opportunity.requirement_tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-heading mb-2">
                Skills & Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.requirement_tags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="default"
                    className="rounded-full px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-muted"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply: ${opportunity.name}`}
        className="p-6 sm:p-8"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-heading mb-2">
              Cover Letter
            </label>
            <Textarea
              placeholder="Explain why you're interested in this opportunity and what makes you a good fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-2">
              Resume Link (make sure it's accessible by the professor)
            </label>
            <Input
              placeholder="Paste the link to your resume here..."
              value={resumeLink}
              onChange={(e) => setResumeLink(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowApplyModal(false)}
              disabled={applying}
            >
              Cancel
            </Button>
            <Button onClick={handleApply} loading={applying}>
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Received Applications Modal (owner only) */}
      <Modal
        isOpen={showReceivedModal}
        onClose={() => setShowReceivedModal(false)}
        title={`Applications: ${opportunity.name}`}
        size="lg"
      >
        <div className="space-y-4 p-4">
          {receivedApplications.length === 0 ? (
            <p className="text-muted">No applications yet.</p>
          ) : (
            receivedApplications.map((app) => (
              <Card key={app.id}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{app.student ? `${app.student.first_name} ${app.student.last_name}` : app.professor_applicant ? `${app.professor_applicant.first_name} ${app.professor_applicant.last_name}` : "Applicant"}</div>
                      <div className="text-xs text-muted">Status: {app.status}</div>
                    </div>
                    <div className="text-right">
                      {app.resume_link && (
                        <a href={app.resume_link} target="_blank" rel="noreferrer" className="text-sm text-primary">View Resume</a>
                      )}
                    </div>
                  </div>
                  {app.message && <p className="mt-2 text-sm text-muted whitespace-pre-wrap">{app.message}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
