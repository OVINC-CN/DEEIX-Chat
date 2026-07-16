'use client';

import { Brush as LucideBrush } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type BrushProps = IconProps<string>;

const Brush = createStaticIcon<string>(LucideBrush);

export {
  animations,
  Brush,
  Brush as BrushIcon,
  type BrushProps,
  type BrushProps as BrushIconProps,
};
