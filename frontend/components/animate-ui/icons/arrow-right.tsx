'use client';

import { ArrowRight as LucideArrowRight } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type ArrowRightProps = IconProps<string>;

const ArrowRight = createStaticIcon<string>(LucideArrowRight);

export {
  animations,
  ArrowRight,
  ArrowRight as ArrowRightIcon,
  type ArrowRightProps,
  type ArrowRightProps as ArrowRightIconProps,
};
