'use client';

import type { LucideIcon, LucideProps } from 'lucide-react';

import { cn } from '@/lib/utils';

type TriggerProp<T = string> = boolean | T;

type StaticIconOptions<T = string> = {
  animate?: TriggerProp<T>;
  animateOnHover?: TriggerProp<T>;
  animateOnTap?: TriggerProp<T>;
  animateOnView?: TriggerProp<T>;
  animateOnViewMargin?: string;
  animateOnViewOnce?: boolean;
  animation?: T;
  loop?: boolean;
  loopDelay?: number;
  initialOnAnimateEnd?: boolean;
  completeOnStop?: boolean;
  persistOnAnimateEnd?: boolean;
  delay?: number;
};

type IconProps<T = string> = StaticIconOptions<T> & LucideProps;

type IconWrapperProps<T = string> = IconProps<T> & {
  icon: LucideIcon;
};

function IconWrapper<T extends string>({
  size = 28,
  animation: _animation,
  animate: _animate,
  animateOnHover: _animateOnHover,
  animateOnTap: _animateOnTap,
  animateOnView: _animateOnView,
  animateOnViewMargin: _animateOnViewMargin,
  animateOnViewOnce: _animateOnViewOnce,
  loop: _loop,
  loopDelay: _loopDelay,
  persistOnAnimateEnd: _persistOnAnimateEnd,
  initialOnAnimateEnd: _initialOnAnimateEnd,
  delay: _delay,
  completeOnStop: _completeOnStop,
  className,
  icon: IconComponent,
  ...props
}: IconWrapperProps<T>) {
  return (
    <IconComponent
      size={size}
      className={cn('icon-no-motion', className)}
      {...props}
    />
  );
}

function createStaticIcon<T extends string = string>(icon: LucideIcon) {
  function StaticIcon(props: IconProps<T>) {
    return <IconWrapper icon={icon} {...props} />;
  }

  StaticIcon.displayName = icon.displayName ?? icon.name;
  return StaticIcon;
}

export {
  IconWrapper,
  createStaticIcon,
  type IconProps,
  type IconWrapperProps,
};
