"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  USER_ROLES,
  buildEmail,
  getDomainsForRole,
  type UserRole,
} from "@/lib/types";

type SignupStep = "role" | "email" | "verify" | "details" | "password";

interface FormData {
  role: UserRole | null;
  identifier: string;
  domain: string;
  email: string;
  verificationCode: string;
  name: string;
  studentId: string;
  department: string;
  bio: string;
  password: string;
  confirmPassword: string;
  // Organization specific
  organizationName: string;
  industry: string;
  website: string;
  description: string;
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as UserRole | null;

  const [step, setStep] = useState<SignupStep>(roleParam ? "email" : "role");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    role: roleParam,
    identifier: "",
    domain: roleParam ? getDomainsForRole(roleParam)[0] || "" : "",
    email: "",
    verificationCode: "",
    name: "",
    studentId: "",
    department: "",
    bio: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    industry: "",
    website: "",
    description: "",
  });

  const isOrganization = formData.role === USER_ROLES.ORGANIZATION;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleSelect = (role: UserRole) => {
    const domains = getDomainsForRole(role);
    setFormData((prev) => ({
      ...prev,
      role,
      domain: domains[0] || "",
    }));
    setStep("email");
  };

  const handleBack = () => {
    switch (step) {
      case "email":
        setStep("role");
        break;
      case "verify":
        setStep("email");
        setCodeVerified(false);
        break;
      case "details":
        setStep("verify");
        break;
      case "password":
        setStep("details");
        break;
    }
  };

  const handleSendCode = async () => {
    if (isOrganization && !formData.email) {
      toast.error("Please enter your email");
      return;
    }
    if (!isOrganization && !formData.identifier) {
      toast.error("Please enter your identifier");
      return;
    }

    setIsLoading(true);

    try {
      let email = formData.email;
      if (!isOrganization) {
        email = buildEmail(formData.identifier, formData.domain);
        updateFormData("email", email);
      }

      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send verification code");
      }

      toast.success("Verification code sent to your email!");
      setStep("verify");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid verification code");
      }

      setCodeVerified(true);
      toast.success("Email verified!");
      setStep("details");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = () => {
    if (isOrganization) {
      if (!formData.organizationName) {
        toast.error("Please enter your organization name");
        return;
      }
    } else {
      if (!formData.name) {
        toast.error("Please enter your name");
        return;
      }
    }
    setStep("password");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare signup data based on role
      const signupData: Record<string, unknown> = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (isOrganization) {
        signupData.name = formData.organizationName;
        signupData.industry = formData.industry;
        signupData.website = formData.website;
        signupData.description = formData.description;
      } else {
        signupData.name = formData.name;
        signupData.department = formData.department;
        signupData.bio = formData.bio;
        if (formData.role === USER_ROLES.STUDENT) {
          signupData.student_id = formData.studentId || formData.identifier;
        }
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Signup failed");
      }

      // Auto-login after signup
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        redirect: false,
      });

      if (result?.error) {
        toast.success("Account created! Please log in.");
        router.push("/login");
      } else {
        toast.success("Welcome to SolveX!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Role selection screen
  if (step === "role") {
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
              <h1 className="text-2xl font-bold text-heading">
                Create Account
              </h1>
              <p className="mt-2 text-muted">
                Select your role to get started
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
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              {step === "email" && "Enter Your Email"}
              {step === "verify" && "Verify Email"}
              {step === "details" && "Your Details"}
              {step === "password" && "Create Password"}
            </h1>
            <p className="mt-2 text-muted">
              {step === "email" &&
                (isOrganization
                  ? "Enter your organization email"
                  : "Enter your university email")}
              {step === "verify" && "Enter the code sent to your email"}
              {step === "details" && "Tell us about yourself"}
              {step === "password" && "Choose a strong password"}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["email", "verify", "details", "password"].map((s, i) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  step === s
                    ? "bg-primary"
                    : i <
                      ["email", "verify", "details", "password"].indexOf(step)
                    ? "bg-green-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Email Step */}
          {step === "email" && (
            <div className="space-y-6">
              {isOrganization ? (
                <Input
                  label="Organization Email"
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                />
              ) : (
                <>
                  <Input
                    label={
                      formData.role === USER_ROLES.STUDENT
                        ? "Student ID"
                        : "Email Identifier"
                    }
                    type="text"
                    placeholder={
                      formData.role === USER_ROLES.STUDENT
                        ? "e.g., 2x-xxxxxx"
                        : "e.g., john.doe"
                    }
                    value={formData.identifier}
                    onChange={(e) =>
                      updateFormData("identifier", e.target.value)
                    }
                    required
                  />

                  {getDomainsForRole(formData.role!).length > 1 && (
                    <Select
                      label="Email Domain"
                      value={formData.domain}
                      onChange={(e) => updateFormData("domain", e.target.value)}
                    >
                      {getDomainsForRole(formData.role!).map((domain) => (
                        <option key={domain} value={domain}>
                          @{domain}
                        </option>
                      ))}
                    </Select>
                  )}

                  {formData.domain && (
                    <p className="text-sm text-muted">
                      Your email:{" "}
                      <span className="text-heading">
                        {formData.identifier
                          ? buildEmail(formData.identifier, formData.domain)
                          : `...@${formData.domain}`}
                      </span>
                    </p>
                  )}
                </>
              )}

              <Button
                onClick={handleSendCode}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </div>
          )}

          {/* Verify Step */}
          {step === "verify" && (
            <div className="space-y-6">
              <p className="text-sm text-center text-muted">
                We sent a code to{" "}
                <span className="font-medium text-heading">
                  {formData.email}
                </span>
              </p>

              <Input
                label="Verification Code"
                type="text"
                placeholder="Enter 6-digit code"
                value={formData.verificationCode}
                onChange={(e) =>
                  updateFormData("verificationCode", e.target.value)
                }
                maxLength={6}
                required
              />

              <Button
                onClick={handleVerifyCode}
                className="w-full"
                disabled={isLoading || codeVerified}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : codeVerified ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Verified
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <button
                onClick={handleSendCode}
                className="w-full text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                Resend code
              </button>
            </div>
          )}

          {/* Details Step */}
          {step === "details" && (
            <div className="space-y-6">
              {isOrganization ? (
                <>
                  <Input
                    label="Organization Name"
                    type="text"
                    placeholder="Company Inc."
                    value={formData.organizationName}
                    onChange={(e) =>
                      updateFormData("organizationName", e.target.value)
                    }
                    required
                  />

                  <Input
                    label="Industry"
                    type="text"
                    placeholder="e.g., Technology, Finance"
                    value={formData.industry}
                    onChange={(e) => updateFormData("industry", e.target.value)}
                  />

                  <Input
                    label="Website"
                    type="url"
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={(e) => updateFormData("website", e.target.value)}
                  />

                  <Textarea
                    label="Description"
                    placeholder="Tell us about your organization..."
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData("description", e.target.value)
                    }
                    rows={3}
                  />
                </>
              ) : (
                <>
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    required
                  />

                  {formData.role === USER_ROLES.STUDENT && (
                    <Input
                      label="Student ID"
                      type="text"
                      placeholder="e.g., 2x-xxxxxx"
                      value={formData.studentId || formData.identifier}
                      onChange={(e) =>
                        updateFormData("studentId", e.target.value)
                      }
                    />
                  )}

                  <Input
                    label="Department"
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={formData.department}
                    onChange={(e) =>
                      updateFormData("department", e.target.value)
                    }
                  />

                  <Textarea
                    label="Bio"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) => updateFormData("bio", e.target.value)}
                    rows={3}
                  />
                </>
              )}

              <Button onClick={handleDetailsSubmit} className="w-full">
                Continue
              </Button>
            </div>
          )}

          {/* Password Step */}
          {step === "password" && (
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
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

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    updateFormData("confirmPassword", e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-muted hover:text-heading transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {formData.password && formData.confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Passwords match</span>
                    </>
                  ) : (
                    <span className="text-red-500">Passwords do not match</span>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

function SignupFallback() {
  return (
    <div className="min-h-screen auth-bg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupContent />
    </Suspense>
  );
}
