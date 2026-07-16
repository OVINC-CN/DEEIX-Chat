"use client";

import { Fingerprint as LucideFingerprint } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type FingerprintProps = IconProps<string>;

const Fingerprint = createStaticIcon<string>(LucideFingerprint);

export {
  animations,
  Fingerprint,
  Fingerprint as FingerprintIcon,
  type FingerprintProps,
  type FingerprintProps as FingerprintIconProps,
};
