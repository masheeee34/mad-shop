import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink select-none";

const variants = {
  primary:
    "bg-gold text-ink hover:bg-gold-bright hover:-translate-y-0.5 shadow-[0_10px_30px_-12px_rgba(198,164,106,0.6)]",
  outline:
    "border border-line-strong text-cream hover:border-gold/60 hover:text-gold-bright hover:-translate-y-0.5",
  ghost: "text-cream hover:text-gold-bright",
  dark: "bg-elevated text-cream border border-line hover:border-gold/40 hover:-translate-y-0.5",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-11 px-6 text-sm rounded-full",
  lg: "h-14 px-8 text-base rounded-full",
} as const;

type Common = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  full?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  className,
  ...props
}: Common & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  full = false,
  className,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
      {...props}
    />
  );
}
