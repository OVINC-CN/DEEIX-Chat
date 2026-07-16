'use client';

import { Binary as LucideBinary } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type BinaryProps = IconProps<string>;

const Binary = createStaticIcon<string>(LucideBinary);

export {
  animations,
  Binary,
  Binary as BinaryIcon,
  type BinaryProps,
  type BinaryProps as BinaryIconProps,
};
