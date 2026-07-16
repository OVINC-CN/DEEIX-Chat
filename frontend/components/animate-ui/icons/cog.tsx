"use client";

import { Cog as LucideCog } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type CogProps = IconProps<string>;

const Cog = createStaticIcon<string>(LucideCog);

export {
  animations,
  Cog,
  Cog as CogIcon,
  type CogProps,
  type CogProps as CogIconProps,
};
