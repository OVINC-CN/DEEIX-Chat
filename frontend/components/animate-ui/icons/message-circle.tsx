'use client';

import { MessageCircle as LucideMessageCircle } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type MessageCircleProps = IconProps<string>;

const MessageCircle = createStaticIcon<string>(LucideMessageCircle);

export {
  animations,
  MessageCircle,
  MessageCircle as MessageCircleIcon,
  type MessageCircleProps,
  type MessageCircleProps as MessageCircleIconProps,
};
