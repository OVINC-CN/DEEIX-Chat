"use client";

import { PanelLeft as LucidePanelLeft } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type PanelLeftProps = IconProps<string>;

const PanelLeft = createStaticIcon<string>(LucidePanelLeft);

export {
  animations,
  PanelLeft,
  PanelLeft as PanelLeftIcon,
  type PanelLeftProps,
  type PanelLeftProps as PanelLeftIconProps,
};
