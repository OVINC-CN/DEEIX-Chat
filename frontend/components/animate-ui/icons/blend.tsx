"use client";

import { Blend as LucideBlend } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type BlendProps = IconProps<string>;

const Blend = createStaticIcon<string>(LucideBlend);

export {
  animations,
  Blend,
  Blend as BlendIcon,
  type BlendProps,
  type BlendProps as BlendIconProps,
};
