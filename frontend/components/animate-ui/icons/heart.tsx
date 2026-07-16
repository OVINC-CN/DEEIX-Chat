'use client';

import { Heart as LucideHeart } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type HeartProps = IconProps<string>;

const Heart = createStaticIcon<string>(LucideHeart);

export {
  animations,
  Heart,
  Heart as HeartIcon,
  type HeartProps,
  type HeartProps as HeartIconProps,
};
