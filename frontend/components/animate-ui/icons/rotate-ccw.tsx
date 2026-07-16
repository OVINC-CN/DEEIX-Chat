'use client';

import { RotateCcw as LucideRotateCcw } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type RotateCcwProps = IconProps<string>;

const RotateCcw = createStaticIcon<string>(LucideRotateCcw);

export {
  animations,
  RotateCcw,
  RotateCcw as RotateCcwIcon,
  type RotateCcwProps,
  type RotateCcwProps as RotateCcwIconProps,
};
