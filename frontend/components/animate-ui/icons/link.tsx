'use client';

import { Link as LucideLink } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type LinkProps = IconProps<string>;

const Link = createStaticIcon<string>(LucideLink);

export {
  animations,
  Link,
  Link as LinkIcon,
  type LinkProps,
  type LinkProps as LinkIconProps,
};
