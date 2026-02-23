"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  BookOpen,
  FileText,
  TrendingUp,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  applicationApi,
  publicApi,
  type Application,
  type Opportunity,
} from "@/lib/api";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      // Fetch applications submitted by this student
      const appsData = await applicationApi.getMyApplications().catch(() => []);
      setApplications(appsData || []);

      // Fetch featured opportunities
      const oppsData = await publicApi.getOpportunities().catch(() => []);
      setOpportunities(oppsData?.slice(0, 3) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "My Applications",
      value: applications.length,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      label: "Accepted",
      value: applications.filter((a) => a.status === "accepted").length,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Featured Opportunities",
      value: opportunities.length,
      icon: BookOpen,
      color: "text-purple-500",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "error"> = {
      pending: "default",
      accepted: "success",
      rejected: "error",
    };
    return variants[status] || "default";
  };

  return (
    <div className="page-bg space-y-6 sm:space-y-8 -m-4 sm:-m-6 p-4 sm:p-6">
      <div className="card flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-heading">
            Student Dashboard
          </h1>
          <p className="text-body mt-1 text-sm sm:text-base">
            Track your applications and opportunities
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            as={Link}
            href="/opportunities"
            variant="secondary"
            className="text-sm sm:text-base"
          >
            Browse Opportunities
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-body mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-heading">
                      {stat.value}
                    </p>
                  </div>
                  <Icon
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color}`}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Featured Opportunities */}
      {opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Featured Opportunities</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                as={Link}
                href="/opportunities"
              >
                View All
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-4 border rounded-lg border-default hover:border-brand transition-colors cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/opportunities/${opportunity.id}`)
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="primary">Research Project</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-heading">
                    {opportunity.name}
                  </h3>
                  <p className="text-body text-sm mb-3 line-clamp-2">
                    {opportunity.details}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-default">
                    <div className="text-xs text-muted">
                      {opportunity.requirement_tags?.length || 0} tags
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      as={Link}
                      href={`/opportunities/${opportunity.id}`}
                    >
                      View
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" as={Link} href="/applications">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 icon-muted mx-auto mb-4" />
              <p className="text-body mb-4">No applications yet</p>
              <Button as={Link} href="/opportunities">
                Browse Opportunities
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => {
                return (
                  <div
                    key={application.id}
                    className="p-4 border rounded-lg border-default hover:border-brand transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-heading">
                            {application.opportunity?.name || "Opportunity"}
                          </h3>
                          <Badge variant={getStatusBadge(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted">
                          Applied on{" "}
                          {application.created_at
                            ? new Date(
                                application.created_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        as={Link}
                        href="/applications"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
