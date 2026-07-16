"use client";

import { ChevronLeft as LucideChevronLeft } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type ChevronLeftProps = IconProps<string>;

const ChevronLeft = createStaticIcon<string>(LucideChevronLeft);

export {
  animations,
  ChevronLeft,
  ChevronLeft as ChevronLeftIcon,
  type ChevronLeftProps,
  type ChevronLeftProps as ChevronLeftIconProps,
};
