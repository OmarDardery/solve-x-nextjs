"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, BookOpen, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const features = [
  {
    icon: Search,
    title: "Research Opportunities",
    description:
      "Discover and apply to research projects from professors, TAs, and fellow students",
  },
  {
    icon: BookOpen,
    title: "Skill Development",
    description:
      "Access courses, workshops, and training programs from student organizations",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "Connect with peers, professors, and organizations to advance your academic journey",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Submit weekly reports and track your progress on accepted projects",
  },
];

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40" style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--card-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Logo width={120} height={40} />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {session ? (
                <Button as={Link} href="/dashboard" size="sm">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button as={Link} href="/login" variant="ghost" size="sm">
                    Sign In
                  </Button>
                  <Button as={Link} href="/signup" size="sm">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 sm:space-y-16 py-8 sm:py-12">
            {/* Hero Section */}
            <div className="text-center py-8 sm:py-16 px-4">
              <div className="flex justify-center mb-6 sm:mb-8">
                <Logo width={200} height={80} className="h-16 sm:h-20 md:h-24 object-contain" />
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-heading mb-4 sm:mb-6">
                Welcome to SolveX
              </h1>
              <p className="text-base sm:text-xl text-muted max-w-2xl mx-auto mb-6 sm:mb-8">
                The premium platform for student research, academic collaboration,
                and skill development
              </p>
              {!session ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button as={Link} href="/signup" size="lg" className="w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    as={Link}
                    href="/login"
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Sign In
                  </Button>
                </div>
              ) : (
                <Button as={Link} href="/opportunities" size="lg">
                  Browse Opportunities
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 px-4 sm:px-0">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="card text-center"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4"
                      style={{ backgroundColor: "rgba(100, 58, 230, 0.1)" }}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-heading mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted text-sm sm:text-base">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: "var(--card-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo width={100} height={32} />
              <span className="text-muted text-sm">
                © {new Date().getFullYear()} SolveX
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted">
              <Link href="/opportunities" className="hover:text-heading transition-colors">
                Opportunities
              </Link>
              <Link href="/events" className="hover:text-heading transition-colors">
                Events
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
