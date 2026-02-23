"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { User, Mail, Save, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { studentApi, professorApi, organizationApi } from "@/lib/api";
import { USER_ROLES } from "@/lib/types";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const userRole = session?.user?.role;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{
    name: string;
    bio: string;
    skills: string;
    major: string;
    department: string;
    website: string;
    description: string;
  }>({
    name: "",
    bio: "",
    skills: "",
    major: "",
    department: "",
    website: "",
    description: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user) return;

    try {
      let data;
      switch (userRole) {
        case USER_ROLES.STUDENT:
          data = await studentApi.getProfile();
          setProfile({
            name: data.name || "",
            bio: data.bio || "",
            skills: data.skills?.join(", ") || "",
            major: data.major || "",
            department: "",
            website: "",
            description: "",
          });
          break;
        case USER_ROLES.PROFESSOR:
          data = await professorApi.getProfile();
          setProfile({
            name: data.name || "",
            bio: data.bio || "",
            skills: "",
            major: "",
            department: data.department || "",
            website: "",
            description: "",
          });
          break;
        case USER_ROLES.ORGANIZATION:
          data = await organizationApi.getProfile();
          setProfile({
            name: data.name || "",
            bio: "",
            skills: "",
            major: "",
            department: "",
            website: data.website_url || "",
            description: data.description || "",
          });
          break;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      switch (userRole) {
        case USER_ROLES.STUDENT:
          await studentApi.updateProfile({
            name: profile.name,
            bio: profile.bio,
            skills: profile.skills.split(",").map((s) => s.trim()).filter(Boolean),
            major: profile.major,
          });
          break;
        case USER_ROLES.PROFESSOR:
          await professorApi.updateProfile({
            name: profile.name,
            bio: profile.bio,
            department: profile.department,
          });
          break;
        case USER_ROLES.ORGANIZATION:
          await organizationApi.updateProfile({
            name: profile.name,
            website_url: profile.website,
            description: profile.description,
          });
          break;
      }
      toast.success("Profile updated successfully!");
      updateSession();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">Profile</h1>
        <p className="text-muted mt-1 text-sm sm:text-base">
          Manage your account settings
        </p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: "var(--card-border)" }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(100, 58, 230, 0.1)" }}
            >
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-heading">
                {session?.user?.name || "User"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Mail className="w-4 h-4" />
                {session?.user?.email}
              </div>
              <Badge variant="primary" className="mt-2">
                {userRole}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Display Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your name"
            />

            {userRole === USER_ROLES.STUDENT && (
              <>
                <Textarea
                  label="Bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                <Input
                  label="Skills (comma-separated)"
                  value={profile.skills}
                  onChange={(e) =>
                    setProfile({ ...profile, skills: e.target.value })
                  }
                  placeholder="Python, Machine Learning, Data Analysis"
                />
                <Input
                  label="Major"
                  value={profile.major}
                  onChange={(e) =>
                    setProfile({ ...profile, major: e.target.value })
                  }
                  placeholder="Computer Science"
                />
              </>
            )}

            {userRole === USER_ROLES.PROFESSOR && (
              <>
                <Textarea
                  label="Bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Your research interests and background..."
                  rows={4}
                />
                <Input
                  label="Department"
                  value={profile.department}
                  onChange={(e) =>
                    setProfile({ ...profile, department: e.target.value })
                  }
                  placeholder="Computer Science"
                />
              </>
            )}

            {userRole === USER_ROLES.ORGANIZATION && (
              <>
                <Textarea
                  label="Description"
                  value={profile.description}
                  onChange={(e) =>
                    setProfile({ ...profile, description: e.target.value })
                  }
                  placeholder="About your organization..."
                  rows={4}
                />
                <Input
                  label="Website"
                  value={profile.website}
                  onChange={(e) =>
                    setProfile({ ...profile, website: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </>
            )}

            <div className="pt-4">
              <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
