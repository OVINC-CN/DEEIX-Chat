"use client";

import { LayoutDashboard as LucideLayoutDashboard } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type LayoutDashboardProps = IconProps<string>;

const LayoutDashboard = createStaticIcon<string>(LucideLayoutDashboard);

export {
  animations,
  LayoutDashboard,
  LayoutDashboard as LayoutDashboardIcon,
  type LayoutDashboardProps,
  type LayoutDashboardProps as LayoutDashboardIconProps,
};
