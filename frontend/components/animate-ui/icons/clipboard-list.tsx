'use client';

import { ClipboardList as LucideClipboardList } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type ClipboardListProps = IconProps<string>;

const ClipboardList = createStaticIcon<string>(LucideClipboardList);

export {
  animations,
  ClipboardList,
  ClipboardList as ClipboardListIcon,
  type ClipboardListProps,
  type ClipboardListProps as ClipboardListIconProps,
};
