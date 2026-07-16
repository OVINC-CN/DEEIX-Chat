'use client';

import { Check as LucideCheck } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type CheckProps = IconProps<string>;

const Check = createStaticIcon<string>(LucideCheck);

export {
  animations,
  Check,
  Check as CheckIcon,
  type CheckProps,
  type CheckProps as CheckIconProps,
};
