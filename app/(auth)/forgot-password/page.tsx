"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { authApi } from "@/lib/api";
import { USER_ROLES, getDomainsForRole, buildEmail, type UserRole } from "@/lib/types";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole | "">("");
  const [identifier, setIdentifier] = useState("");
  const [domain, setDomain] = useState("");
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      const domains = getDomainsForRole(role);
      setAvailableDomains(domains);
      if (domains.length > 0) setDomain(domains[0]);
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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !identifier || !domain) {
      toast.error("Please fill role and identifier");
      return;
    }

    setLoading(true);
    try {
      const email = getFullEmail();
      await authApi.sendVerificationCode(email, role, "reset");
      toast.success("Verification code sent if the account exists");
      setStep(2);
    } catch (err: any) {
      toast.error(err?.message || "Unable to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !password) {
      toast.error("Please enter the code and new password");
      return;
    }

    setLoading(true);
    try {
      const email = getFullEmail();
      await authApi.resetPassword(email, role as string, code, password);
      toast.success("Password reset — signing you in...");
      const res = await signIn("credentials", { redirect: false, email, password, role });
      if (res?.error) {
        // If sign-in failed, redirect to login
        router.push("/login");
      } else {
        const dashboardPaths: Record<string, string> = {
          [USER_ROLES.PROFESSOR]: "/dashboard/professor",
          [USER_ROLES.STUDENT]: "/dashboard/student",
          [USER_ROLES.ORGANIZATION]: "/dashboard/organization",
        };
        router.push(dashboardPaths[role as string] || "/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || "Unable to reset password");
    } finally {
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
          <CardTitle className="text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">Reset your password using a verification code.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                required
              >
                <option value="">Select your role</option>
                <option value={USER_ROLES.STUDENT}>Student</option>
                <option value={USER_ROLES.PROFESSOR}>Professor</option>
                <option value={USER_ROLES.ORGANIZATION}>Organization</option>
              </Select>

              {role && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-heading">{getIdentifierLabel()} <span className="text-red-500">*</span></label>
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder={getIdentifierPlaceholder()}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                    <div className="hidden sm:flex items-center text-muted pt-2">@</div>
                    <div className="flex-1">
                      <Select value={domain} onChange={(e) => setDomain(e.target.value)} disabled={availableDomains.length <= 1}>
                        {availableDomains.map((d) => (
                          <option key={d} value={d}>@{d}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  {identifier && domain && <p className="text-xs text-muted mt-1">Email: {getFullEmail()}</p>}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || !role}>{loading ? "Sending..." : "Send verification code"}</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <Input label="Verification code" value={code} onChange={(e) => setCode(e.target.value)} required />
              <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Resetting..." : "Reset password"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
