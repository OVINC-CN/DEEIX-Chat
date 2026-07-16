"use client";

import { Disc3 as LucideDisc3 } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type Disc3Props = IconProps<string>;

const Disc3 = createStaticIcon<string>(LucideDisc3);

export {
  animations,
  Disc3,
  Disc3 as Disc3Icon,
  type Disc3Props,
  type Disc3Props as Disc3IconProps,
};
