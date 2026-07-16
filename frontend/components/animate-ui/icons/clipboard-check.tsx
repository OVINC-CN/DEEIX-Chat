'use client';

import { ClipboardCheck as LucideClipboardCheck } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type ClipboardCheckProps = IconProps<string>;

const ClipboardCheck = createStaticIcon<string>(LucideClipboardCheck);

export {
  animations,
  ClipboardCheck,
  ClipboardCheck as ClipboardCheckIcon,
  type ClipboardCheckProps,
  type ClipboardCheckProps as ClipboardCheckIconProps,
};
