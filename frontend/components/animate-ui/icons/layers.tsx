'use client';

import { Layers as LucideLayers } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type LayersProps = IconProps<string>;

const Layers = createStaticIcon<string>(LucideLayers);

export {
  animations,
  Layers,
  Layers as LayersIcon,
  type LayersProps,
  type LayersProps as LayersIconProps,
};
