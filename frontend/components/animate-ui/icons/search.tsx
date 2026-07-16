'use client';

import { Search as LucideSearch } from 'lucide-react';

import {
  createStaticIcon,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

const animations = { default: {} } as const;
type SearchProps = IconProps<string>;

const Search = createStaticIcon<string>(LucideSearch);

export {
  animations,
  Search,
  Search as SearchIcon,
  type SearchProps,
  type SearchProps as SearchIconProps,
};
