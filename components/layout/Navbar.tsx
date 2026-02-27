"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Home,
  Briefcase,
  FileText,
  Calendar,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { USER_ROLES } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    label: "Applications",
    href: "/applications",
    icon: <FileText className="w-5 h-5" />,
    roles: [USER_ROLES.STUDENT, USER_ROLES.PROFESSOR],
  },
  {
    label: "Events",
    href: "/events",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <FileText className="w-5 h-5" />,
    roles: [USER_ROLES.STUDENT],
  },
];

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const userRole = session?.user?.role;

  // Fetch unread notifications count
  useEffect(() => {
    if (session?.user && (userRole === USER_ROLES.STUDENT || userRole === USER_ROLES.PROFESSOR)) {
      fetch("/api/notifications/me")
        .then((res) => res.json())
        .then((data) => {
          const unread = Array.isArray(data)
            ? data.filter((n: { read: boolean }) => !n.read).length
            : 0;
          setUnreadNotifications(unread);
        })
        .catch(() => {});
    }
  }, [session, userRole]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-40" style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--card-border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Logo width={120} height={40} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>

            <ThemeToggle />

            {/* Profile */}
            <Link
              href="/profile"
              className="p-2 rounded-lg text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
          <div className="px-4 py-2 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
