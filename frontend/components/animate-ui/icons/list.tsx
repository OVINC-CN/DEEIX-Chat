'use client';

import { List as LucideList } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type ListProps = IconProps<string>;

const List = createStaticIcon<string>(LucideList);

export {
  animations,
  List,
  List as ListIcon,
  type ListProps,
  type ListProps as ListIconProps,
};
