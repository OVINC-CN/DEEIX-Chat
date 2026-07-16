"use client";

import { ThumbsDown as LucideThumbsDown } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type ThumbsDownProps = IconProps<string>;

const ThumbsDown = createStaticIcon<string>(LucideThumbsDown);

export {
  animations,
  ThumbsDown,
  ThumbsDown as ThumbsDownIcon,
  type ThumbsDownProps,
  type ThumbsDownProps as ThumbsDownIconProps,
};
