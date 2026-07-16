"use client";

import { Unplug as LucideUnplug } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type UnplugProps = IconProps<string>;

const Unplug = createStaticIcon<string>(LucideUnplug);

export {
  animations,
  Unplug,
  Unplug as UnplugIcon,
  type UnplugProps,
  type UnplugProps as UnplugIconProps,
};
