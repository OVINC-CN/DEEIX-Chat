'use client';

import { Copy as LucideCopy } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type CopyProps = IconProps<string>;

const Copy = createStaticIcon<string>(LucideCopy);

export {
  animations,
  Copy,
  Copy as CopyIcon,
  type CopyProps,
  type CopyProps as CopyIconProps,
};
