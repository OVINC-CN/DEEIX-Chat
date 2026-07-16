"use client";

import { Pause as LucidePause } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type PauseProps = IconProps<string>;

const Pause = createStaticIcon<string>(LucidePause);

export {
  animations,
  Pause,
  Pause as PauseIcon,
  type PauseProps,
  type PauseProps as PauseIconProps,
};
