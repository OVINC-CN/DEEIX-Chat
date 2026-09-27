import { Layers } from "lucide-react";
import { MessageCircleMore } from "lucide-react";
import { Plus as PlusIcon } from "lucide-react";
import { Search } from "lucide-react";
import { Blend } from "lucide-react";
import { BookOpen } from "lucide-react";
import type { NavigationItem } from "@/features/layouts/types/navigation";

export const NAVIGATION_ITEMS = [
  {
    id: "newChat",
    kind: "command",
    icon: PlusIcon,
    variant: "primary",
    group: "primary",
    shortcut: ["command", "shift", "O"],
  },
  {
    id: "search",
    kind: "command",
    icon: Search,
    group: "primary",
    shortcut: ["command", "K"],
  },
  {
    id: "recent",
    kind: "link",
    href: "/recent",
    icon: MessageCircleMore,
    group: "secondary",
  },
  {
    id: "files",
    kind: "link",
    href: "/files",
    icon: Layers,
    group: "secondary",
  },
  {
    id: "knowledgeBases",
    kind: "link",
    href: "/knowledges",
    icon: BookOpen,
    group: "secondary",
  },
  {
    id: "skillsPrompt",
    kind: "link",
    href: "/skills-prompt",
    icon: Blend,
    group: "secondary",
  },
] as const satisfies readonly NavigationItem[];
