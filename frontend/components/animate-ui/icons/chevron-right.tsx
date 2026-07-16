'use client';

import { ChevronRight as LucideChevronRight } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type ChevronRightProps = IconProps<string>;

const ChevronRight = createStaticIcon<string>(LucideChevronRight);

export {
  animations,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  type ChevronRightProps,
  type ChevronRightProps as ChevronRightIconProps,
};
