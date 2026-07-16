'use client';

import { ExternalLink as LucideExternalLink } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type ExternalLinkProps = IconProps<string>;

const ExternalLink = createStaticIcon<string>(LucideExternalLink);

export {
  animations,
  ExternalLink,
  ExternalLink as ExternalLinkIcon,
  type ExternalLinkProps,
  type ExternalLinkProps as ExternalLinkIconProps,
};
