"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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

  const isStudent = session?.user?.role === USER_ROLES.STUDENT;

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      research: "Research",
      project: "Project",
      internship: "Internship",
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
            {isStudent && (
              <Button onClick={() => setShowApplyModal(true)}>Apply Now</Button>
            )}
          </div>

          <div className="space-y-4 text-sm text-muted mb-6">
            {opportunity.professor && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{opportunity.professor.first_name} {opportunity.professor.last_name}</span>
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
                  <Badge key={idx} variant="default">
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
    </div>
  );
}
