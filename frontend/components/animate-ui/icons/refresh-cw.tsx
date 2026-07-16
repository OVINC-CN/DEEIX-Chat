'use client';

import { RefreshCw as LucideRefreshCw } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type RefreshCwProps = IconProps<string>;

const RefreshCw = createStaticIcon<string>(LucideRefreshCw);

export {
  animations,
  RefreshCw,
  RefreshCw as RefreshCwIcon,
  type RefreshCwProps,
  type RefreshCwProps as RefreshCwIconProps,
};
