'use client';

import { Blocks as LucideBlocks } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type BlocksProps = IconProps<string>;

const Blocks = createStaticIcon<string>(LucideBlocks);

export {
  animations,
  Blocks,
  Blocks as BlocksIcon,
  type BlocksProps,
  type BlocksProps as BlocksIconProps,
};
