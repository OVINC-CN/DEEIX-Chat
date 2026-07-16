'use client';

import { MessageCircleMore as LucideMessageCircleMore } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type MessageCircleMoreProps = IconProps<string>;

const MessageCircleMore = createStaticIcon<string>(LucideMessageCircleMore);

export {
  animations,
  MessageCircleMore,
  MessageCircleMore as MessageCircleMoreIcon,
  type MessageCircleMoreProps,
  type MessageCircleMoreProps as MessageCircleMoreIconProps,
};
