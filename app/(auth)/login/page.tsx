"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  USER_ROLES,
  buildEmail,
  getDomainsForRole,
  type UserRole,
} from "@/lib/types";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as UserRole | null;

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(roleParam);
  const [identifier, setIdentifier] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Organization has its own login flow
  const isOrganization = selectedRole === USER_ROLES.ORGANIZATION;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Set default domain for the role
    const domains = getDomainsForRole(role);
    setSelectedDomain(domains[0] || "");
    // Clear form
    setIdentifier("");
    setPassword("");
  };

  const handleBack = () => {
    setSelectedRole(null);
    setIdentifier("");
    setSelectedDomain("");
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    if (!identifier || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      let email = identifier;

      // For students and professors, build the email
      if (!isOrganization && selectedDomain) {
        email = buildEmail(identifier, selectedDomain);
      }

      const result = await signIn("credentials", {
        email,
        password,
        role: selectedRole,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || "Login failed");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen auth-bg flex flex-col">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Logo width={180} height={60} />
              </div>
              <h1 className="text-2xl font-bold text-heading">Welcome Back</h1>
              <p className="mt-2 text-muted">
                Select your role to continue to your account
              </p>
            </div>

            <div className="space-y-4">
              <Card
                hover
                onClick={() => handleRoleSelect(USER_ROLES.STUDENT)}
                className="p-6 text-center cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="text-lg font-semibold text-heading">Student</h3>
                <p className="text-sm text-muted mt-1">
                  Find opportunities and build your career
                </p>
              </Card>

              <Card
                hover
                onClick={() => handleRoleSelect(USER_ROLES.PROFESSOR)}
                className="p-6 text-center cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="text-4xl mb-3">👨‍🏫</div>
                <h3 className="text-lg font-semibold text-heading">Professor</h3>
                <p className="text-sm text-muted mt-1">
                  Post research opportunities and mentor students
                </p>
              </Card>

              <Card
                hover
                onClick={() => handleRoleSelect(USER_ROLES.ORGANIZATION)}
                className="p-6 text-center cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-lg font-semibold text-heading">
                  Organization
                </h3>
                <p className="text-sm text-muted mt-1">
                  Connect with talented students for internships
                </p>
              </Card>
            </div>

            <p className="text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="min-h-screen auth-bg flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted hover:text-heading transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo width={150} height={50} />
            </div>
            <h1 className="text-2xl font-bold text-heading">
              {isOrganization ? "Organization Login" : "Login"}
            </h1>
            <p className="mt-2 text-muted">
              {isOrganization
                ? "Sign in to your organization account"
                : `Sign in as a ${selectedRole}`}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {isOrganization ? (
              <Input
                label="Email"
                type="email"
                placeholder="organization@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            ) : (
              <div className="space-y-4">
                <Input
                  label={
                    selectedRole === USER_ROLES.STUDENT
                      ? "Student ID"
                      : "Identifier"
                  }
                  type="text"
                  placeholder={
                    selectedRole === USER_ROLES.STUDENT
                      ? "e.g., 2x-xxxxxx"
                      : "e.g., john.doe"
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />

                {getDomainsForRole(selectedRole).length > 1 && (
                  <Select
                    label="Domain"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    required
                  >
                    {getDomainsForRole(selectedRole).map((domain) => (
                      <option key={domain} value={domain}>
                        @{domain}
                      </option>
                    ))}
                  </Select>
                )}

                {selectedDomain && (
                  <p className="text-sm text-muted">
                    Email: {identifier ? buildEmail(identifier, selectedDomain) : `...@${selectedDomain}`}
                  </p>
                )}
              </div>
            )}

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted hover:text-heading transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup?role=${selectedRole}`}
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen auth-bg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
