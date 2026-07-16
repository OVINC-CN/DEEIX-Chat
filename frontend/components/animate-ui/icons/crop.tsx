"use client";

import { Crop as LucideCrop } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type CropProps = IconProps<string>;

const Crop = createStaticIcon<string>(LucideCrop);

export {
  animations,
  Crop,
  Crop as CropIcon,
  type CropProps,
  type CropProps as CropIconProps,
};
