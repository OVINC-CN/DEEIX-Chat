"use client";

import { Download as LucideDownload } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type DownloadProps = IconProps<string>;

const Download = createStaticIcon<string>(LucideDownload);

export {
  animations,
  Download,
  Download as DownloadIcon,
  type DownloadProps,
  type DownloadProps as DownloadIconProps,
};
