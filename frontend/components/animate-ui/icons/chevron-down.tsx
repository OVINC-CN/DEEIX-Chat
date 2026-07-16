"use client";

import { ChevronDown as LucideChevronDown } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type ChevronDownProps = IconProps<string>;

const ChevronDown = createStaticIcon<string>(LucideChevronDown);

export {
  animations,
  ChevronDown,
  ChevronDown as ChevronDownIcon,
  type ChevronDownProps,
  type ChevronDownProps as ChevronDownIconProps,
};
