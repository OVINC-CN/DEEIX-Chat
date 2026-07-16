'use client';

import { PanelRight as LucidePanelRight } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type PanelRightProps = IconProps<string>;

const PanelRight = createStaticIcon<string>(LucidePanelRight);

export {
  animations,
  PanelRight,
  PanelRight as PanelRightIcon,
  type PanelRightProps,
  type PanelRightProps as PanelRightIconProps,
};
