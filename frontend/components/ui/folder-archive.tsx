"use client";

import type { HTMLAttributes } from "react";
import { forwardRef, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";

export interface FolderArchiveIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FolderArchiveIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  strokeWidth?: number;
}

const FolderArchiveIcon = forwardRef<FolderArchiveIconHandle, FolderArchiveIconProps>(
  ({ className, size = 28, strokeWidth = 1.5, ...props }, ref) => {
    useImperativeHandle(ref, () => ({
      startAnimation: () => undefined,
      stopAnimation: () => undefined,
    }));

    return (
      <div className={cn("icon-no-motion", className)} {...props}>
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.9 19.8A2 2 0 0 0 22 18V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h5.1" />
          <circle cx="15" cy="19" r="2" />
          <path d="M15 11v-1" />
          <path d="M15 17v-2" />
        </svg>
      </div>
    );
  }
);

FolderArchiveIcon.displayName = "FolderArchiveIcon";

export { FolderArchiveIcon };
