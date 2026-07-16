"use client";

import type { HTMLAttributes } from "react";
import { forwardRef, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";

export interface PlusIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface PlusIconProps extends HTMLAttributes<HTMLDivElement> {
  animate?: "default";
  size?: number;
  strokeWidth?: number;
}

const PlusIcon = forwardRef<PlusIconHandle, PlusIconProps>(
  ({ animate: _animate, className, size = 28, strokeWidth = 2, ...props }, ref) => {
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
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </div>
    );
  }
);

PlusIcon.displayName = "PlusIcon";

export { PlusIcon };
