'use client';

import { Sparkles as LucideSparkles } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type SparklesProps = IconProps<string>;

const Sparkles = createStaticIcon<string>(LucideSparkles);

export {
  animations,
  Sparkles,
  Sparkles as SparklesIcon,
  type SparklesProps,
  type SparklesProps as SparklesIconProps,
};
