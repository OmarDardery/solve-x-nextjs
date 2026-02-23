"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { USER_ROLES, getDomainsForRole, buildEmail, type UserRole } from "@/lib/types";

function LoginContent() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [domain, setDomain] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);

  // Update available domains when role changes
  useEffect(() => {
    if (role) {
      const domains = getDomainsForRole(role);
      setAvailableDomains(domains);
      if (domains.length > 0) {
        setDomain(domains[0]);
      }
    } else {
      setAvailableDomains([]);
      setDomain("");
    }
  }, [role]);

  const getIdentifierPlaceholder = () => {
    if (role === USER_ROLES.STUDENT) return "2x-xxxxxx";
    if (role === USER_ROLES.PROFESSOR) return "firstname.lastname";
    return "Enter your identifier";
  };

  const getIdentifierLabel = () => {
    if (role === USER_ROLES.STUDENT) return "Student ID";
    if (role === USER_ROLES.PROFESSOR) return "Username";
    return "Identifier";
  };

  const getFullEmail = () => buildEmail(identifier, domain);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};
    if (!role) newErrors.role = "Please select your role";
    if (!identifier) newErrors.identifier = "Identifier is required";
    if (!domain) newErrors.domain = "Domain is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const email = getFullEmail();
      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || "Invalid credentials");
        setLoading(false);
      } else {
        toast.success("Logged in successfully!");
        // Get dashboard path based on role
        const dashboardPaths: Record<string, string> = {
          [USER_ROLES.PROFESSOR]: "/dashboard/professor",
          [USER_ROLES.STUDENT]: "/dashboard/student",
          [USER_ROLES.ORGANIZATION]: "/dashboard/organization",
        };
        router.push(dashboardPaths[role] || "/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo className="h-16 sm:h-20" />
          </div>
          <CardTitle className="text-center">Welcome to SolveX</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as UserRole);
                if (errors.role) {
                  setErrors({ ...errors, role: "" });
                }
              }}
              error={errors.role}
              required
            >
              <option value="">Select your role</option>
              <option value={USER_ROLES.STUDENT}>Student</option>
              <option value={USER_ROLES.PROFESSOR}>Professor</option>
            </Select>

            {role && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-heading">
                  {getIdentifierLabel()} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder={getIdentifierPlaceholder()}
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errors.identifier) {
                          setErrors({ ...errors, identifier: "" });
                        }
                      }}
                      error={errors.identifier}
                      required
                    />
                  </div>
                  <div className="hidden sm:flex items-center text-muted pt-2">@</div>
                  <div className="flex-1">
                    <Select
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value);
                        if (errors.domain) {
                          setErrors({ ...errors, domain: "" });
                        }
                      }}
                      disabled={availableDomains.length <= 1}
                      error={errors.domain}
                    >
                      {availableDomains.map((d) => (
                        <option key={d} value={d}>@{d}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                {identifier && domain && (
                  <p className="text-xs text-muted mt-1">Email: {getFullEmail()}</p>
                )}
              </div>
            )}

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              error={errors.password}
              required
            />

            <Button type="submit" className="w-full" disabled={loading || !role}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-body">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-body">
            Are you an organization?{" "}
            <Link href="/login/organization" className="text-primary font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen auth-bg flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
