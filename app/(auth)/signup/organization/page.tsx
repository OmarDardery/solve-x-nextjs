"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OrganizationSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: email, 2: code + details
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
    name: "",
    contact: "",
    link: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Navigate after signup
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        router.push("/dashboard/organization");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, router]);

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.verificationCode) {
      newErrors.verificationCode = "Verification code is required";
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = "Code must be 6 digits";
    }

    if (!formData.name) {
      newErrors.name = "Organization name is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          role: "organization",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setCodeSent(true);
      setStep(2);
      toast.success("Verification code sent to your email!");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to send verification code");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/sign-up/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.verificationCode,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          contact: formData.contact || undefined,
          link: formData.link || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Sign in after successful registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: "organization",
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create account");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="auth-bg flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 mb-4">
            <Logo className="w-full h-full object-contain" />
          </div>
          <div className="mx-auto w-12 h-12 bg-brand-light rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 icon-primary" />
          </div>
          <CardTitle className="text-2xl">Organization Sign Up</CardTitle>
          <CardDescription>
            {step === 1
              ? "Enter your organization email to get started"
              : "Complete your organization profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <Input
                label="Organization Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@organization.com"
                error={errors.email}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
              <p className="text-center text-sm text-body">
                Already have an account?{" "}
                <Link href="/login/organization" className="text-brand font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-center text-sm text-body">
                Not an organization?{" "}
                <Link href="/signup" className="text-brand font-medium">
                  Sign up as Student/Professor
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="alert-success flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Code sent to {formData.email}
                </span>
              </div>

              <Input
                label="Verification Code"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                maxLength={6}
                error={errors.verificationCode}
              />

              <Input
                label="Organization Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Acme Corporation"
                error={errors.name}
              />

              <Input
                label="Contact (optional)"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Phone, email, or other contact info"
              />

              <Input
                label="Website/Social Link (optional)"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://yourwebsite.com or LinkedIn URL"
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                error={errors.password}
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Organization Account"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Back to Email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Account Created!"
        size="sm"
      >
        <div className="text-center py-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-body mb-4">
            Your organization account has been created successfully. Redirecting to dashboard...
          </p>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        size="sm"
      >
        <div className="text-center py-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-body mb-4">{errorMessage}</p>
          <Button onClick={() => setShowErrorModal(false)}>Try Again</Button>
        </div>
      </Modal>
    </div>
  );
}
