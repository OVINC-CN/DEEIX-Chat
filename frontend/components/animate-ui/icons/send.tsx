'use client';

import { Send as LucideSend } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type SendProps = IconProps<string>;

const Send = createStaticIcon<string>(LucideSend);

export {
  animations,
  Send,
  Send as SendIcon,
  type SendProps,
  type SendProps as SendIconProps,
};
