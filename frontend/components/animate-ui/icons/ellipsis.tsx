"use client";

import { Ellipsis as LucideEllipsis } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type EllipsisProps = IconProps<string>;

const Ellipsis = createStaticIcon<string>(LucideEllipsis);

export {
  animations,
  Ellipsis,
  Ellipsis as EllipsisIcon,
  type EllipsisProps,
  type EllipsisProps as EllipsisIconProps,
};
