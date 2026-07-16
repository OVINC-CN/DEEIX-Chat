"use client";

import { ChevronUp as LucideChevronUp } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type ChevronUpProps = IconProps<string>;

const ChevronUp = createStaticIcon<string>(LucideChevronUp);

export {
  animations,
  ChevronUp,
  ChevronUp as ChevronUpIcon,
  type ChevronUpProps,
  type ChevronUpProps as ChevronUpIconProps,
};
