"use client";

import Image from "next/image";

import { useTheme } from "@/shared/components/theme-provider";
import { useBranding } from "@/shared/config/branding-provider";

type AppLogoProps = {
  alt?: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
};

export function AppLogo({
  alt,
  width,
  height,
  priority,
  className,
}: AppLogoProps) {
  const branding = useBranding();
  const { resolvedTheme } = useTheme();

  return (
    <Image
      src={
        branding.logoURL ||
        (resolvedTheme === "dark" ? "/logo-white.png" : "/logo.png")
      }
      alt={alt ?? branding.title}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}

export function DeeixLogo({
  alt = "OVINC Chat",
  width,
  height,
  priority,
  className,
}: AppLogoProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Image
      src={resolvedTheme === "dark" ? "/logo-white.png" : "/logo.png"}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
