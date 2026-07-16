"use client";

import type { HTMLAttributes } from "react";
import { forwardRef, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";

export interface GripVerticalIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface GripVerticalIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const CIRCLES = [
  { cx: 9, cy: 5 },
  { cx: 9, cy: 12 },
  { cx: 9, cy: 19 },
  { cx: 15, cy: 5 },
  { cx: 15, cy: 12 },
  { cx: 15, cy: 19 },
];

const GripVerticalIcon = forwardRef<GripVerticalIconHandle, GripVerticalIconProps>(
  ({ className, size = 28, ...props }, ref) => {
    useImperativeHandle(ref, () => ({
      startAnimation: () => undefined,
      stopAnimation: () => undefined,
    }));

    return (
      <div className={cn("icon-no-motion inline-flex items-center justify-center", className)} {...props}>
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          {CIRCLES.map((circle) => (
            <circle
              cx={circle.cx}
              cy={circle.cy}
              key={`${circle.cx}-${circle.cy}`}
              r="1"
            />
          ))}
        </svg>
      </div>
    );
  },
);

GripVerticalIcon.displayName = "GripVerticalIcon";

export { GripVerticalIcon };
