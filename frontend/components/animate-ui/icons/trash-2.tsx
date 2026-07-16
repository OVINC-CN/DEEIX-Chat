'use client';

import { Trash2 as LucideTrash2 } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type Trash2Props = IconProps<string>;

const Trash2 = createStaticIcon<string>(LucideTrash2);

export {
  animations,
  Trash2,
  Trash2 as Trash2Icon,
  type Trash2Props,
  type Trash2Props as Trash2IconProps,
};
