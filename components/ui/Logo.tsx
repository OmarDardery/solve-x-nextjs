"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: "default" | "icon";
}

export function Logo({ className, width = 150, height = 50, variant = "default" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width, height }} />;
  }

  const isDark = resolvedTheme === "dark";

  // For icon variant: use WhiteLogo on dark, BlackLogo on light
  // For default: use Icon&Type.png (the full branding logo)
  const logoSrc = variant === "icon"
    ? (isDark ? "/WhiteLogo.png" : "/BlackLogo.png")
    : "/Icon&Type.png";

  return (
    <Image
      src={logoSrc}
      alt="SolveX Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
