"use client";

import { Terminal as LucideTerminal } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type TerminalProps = IconProps<string>;

const Terminal = createStaticIcon<string>(LucideTerminal);

export {
  animations,
  Terminal,
  Terminal as TerminalIcon,
  type TerminalProps,
  type TerminalProps as TerminalIconProps,
};
