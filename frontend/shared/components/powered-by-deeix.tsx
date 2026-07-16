"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { useBranding } from "@/shared/config/branding-provider";

export function PoweredByDeeix({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium leading-none text-muted-foreground/70",
        className,
      )}
    >
      <span>Powered by</span>
      <a
        href="https://github.com/DEEIX-AI/DEEIX-Chat"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="OVINC Chat on GitHub"
        className="inline-flex shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
      >
        <Image
          src="/logo.png"
          alt=""
          aria-hidden="true"
          width={60}
          height={14}
          className="h-3.5 w-auto opacity-65"
        />
      </a>
    </span>
  );
}

export function CustomBrandAttribution({ className }: { className?: string }) {
  const branding = useBranding();
  if (!branding.logoURL) {
    return null;
  }
  return (
    <div className={className}>
      <PoweredByDeeix />
    </div>
  );
}
