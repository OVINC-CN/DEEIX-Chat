"use client";

import { Sparkle as LucideSparkle } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type SparkleProps = IconProps<string>;

const Sparkle = createStaticIcon<string>(LucideSparkle);

export {
  animations,
  Sparkle,
  Sparkle as SparkleIcon,
  type SparkleProps,
  type SparkleProps as SparkleIconProps,
};
