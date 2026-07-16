'use client';

import { X as LucideX } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type XProps = IconProps<string>;

const X = createStaticIcon<string>(LucideX);

export {
  animations,
  X,
  X as XIcon,
  type XProps,
  type XProps as XIconProps,
};
