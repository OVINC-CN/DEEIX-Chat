"use client";

import Image from "next/image";

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

  return (
    <Image
      src={branding.logoURL || "/logo.png"}
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
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
