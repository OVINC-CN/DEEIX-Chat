"use client";

import { CircuitBoard as LucideCircuitBoard } from "lucide-react";

import {
  createStaticIcon,
  type IconProps,
} from "@/components/animate-ui/icons/icon";

const animations = { default: {} } as const;
type CircuitBoardProps = IconProps<string>;

const CircuitBoard = createStaticIcon<string>(LucideCircuitBoard);

export {
  animations,
  CircuitBoard,
  CircuitBoard as CircuitBoardIcon,
  type CircuitBoardProps,
  type CircuitBoardProps as CircuitBoardIconProps,
};
