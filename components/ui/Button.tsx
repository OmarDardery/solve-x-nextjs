"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonBaseProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
    as?: "button";
    href?: never;
    disabled?: boolean;
  };

type ButtonAsLink = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: typeof Link;
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(({ children, variant = "primary", size = "md", className, loading, ...props }, ref) => {
  const baseStyles =
    "btn font-medium rounded-lg transition-all duration-200 active:scale-[0.98] inline-flex items-center justify-center";

  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-danger",
    outline: "btn-secondary",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = cn(
    baseStyles, 
    variants[variant], 
    sizes[size], 
    loading && "opacity-70 cursor-not-allowed",
    className
  );

  if (props.as === Link) {
    const { as: _, ...linkProps } = props as ButtonAsLink;
    return (
      <Link
        className={classes}
        ref={ref as React.Ref<HTMLAnchorElement>}
        {...linkProps}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {children}
      </Link>
    );
  }

  const { as: _, disabled, ...buttonProps } = props as ButtonAsButton;
  return (
    <button
      className={classes}
      ref={ref as React.Ref<HTMLButtonElement>}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
