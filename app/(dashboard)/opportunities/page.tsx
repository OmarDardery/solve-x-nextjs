"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { opportunityApi, applicationApi, type Opportunity } from "@/lib/api";
import { USER_ROLES } from "@/lib/types";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isStudent = session?.user?.role === USER_ROLES.STUDENT;
  const [appliedIds, setAppliedIds] = useState<Record<string, true>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (isStudent) fetchMyApplications();
  }, [isStudent]);

  useEffect(() => {
    filterOpportunities();
  }, [searchTerm, typeFilter, opportunities]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await opportunityApi.getAll();
      setOpportunities(data || []);
      setFilteredOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast.error("Failed to fetch opportunities");
    } finally {
      setLoading(false);
    }
  };

  const filterOpportunities = () => {
    let filtered = [...opportunities];

    if (searchTerm) {
      filtered = filtered.filter(
        (opp) =>
          opp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((opp) => opp.type === typeFilter);
    }

    setFilteredOpportunities(filtered);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      research: "Research",
      project: "Project",
      internship: "Internship",
    };
    return labels[type] || type;
  };

  const fetchMyApplications = async () => {
    try {
      const apps = await applicationApi.getMyApplications();
      const map: Record<string, true> = {};
      (apps || []).forEach((a: any) => {
        const oppId = a.opportunity?.id || a.opportunity_id;
        if (oppId) map[oppId] = true;
      });
      setAppliedIds(map);
    } catch (err) {
      console.error("Failed to fetch my applications:", err);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">
          Research Opportunities
        </h1>
        <p className="text-muted mt-1 text-sm sm:text-base">
          Browse and apply to research projects and opportunities
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="research">Research</option>
              <option value="project">Project</option>
              <option value="internship">Internship</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted">
              No opportunities found. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} hover>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="primary" className="text-xs">
                    {getTypeLabel(opportunity.type)}
                  </Badge>
                  {isStudent && appliedIds[opportunity.id] && (
                    <Badge variant="success" className="text-xs">
                      Applied
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 text-heading">
                  {opportunity.name}
                </h3>
                <p className="text-muted text-sm mb-4 line-clamp-3">
                  {opportunity.details}
                </p>

                {opportunity.requirement_tags && opportunity.requirement_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {opportunity.requirement_tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="default" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                    {opportunity.requirement_tags.length > 3 && (
                      <Badge variant="default" className="text-xs">
                        +{opportunity.requirement_tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t" style={{ borderColor: "var(--card-border)" }}>
                  <Button
                    as={Link}
                    href={`/opportunities/${opportunity.id}`}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
