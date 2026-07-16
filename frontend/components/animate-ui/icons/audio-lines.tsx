'use client';

import { AudioLines as LucideAudioLines } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type AudioLinesProps = IconProps<string>;

const AudioLines = createStaticIcon<string>(LucideAudioLines);

export {
  animations,
  AudioLines,
  AudioLines as AudioLinesIcon,
  type AudioLinesProps,
  type AudioLinesProps as AudioLinesIconProps,
};
