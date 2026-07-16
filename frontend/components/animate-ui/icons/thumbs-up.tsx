"use client";

import { ThumbsUp as LucideThumbsUp } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type ThumbsUpProps = IconProps<string>;

const ThumbsUp = createStaticIcon<string>(LucideThumbsUp);

export {
  animations,
  ThumbsUp,
  ThumbsUp as ThumbsUpIcon,
  type ThumbsUpProps,
  type ThumbsUpProps as ThumbsUpIconProps,
};
