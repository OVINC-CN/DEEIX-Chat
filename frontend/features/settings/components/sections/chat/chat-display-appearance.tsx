"use client";

import { useTranslations } from "next-intl";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  CHAT_CONTENT_WIDTH_OPTIONS,
  type ChatContentWidth,
  type ChatContentWidthOption,
} from "@/shared/model/chat-content-width";

function ChatContentWidthPreviewCard({
  item,
  active,
  disabled,
  onSelect,
}: {
  item: ChatContentWidthOption & { label: string };
  active: boolean;
  disabled?: boolean;
  onSelect: (value: ChatContentWidth) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.value)}
      className="group text-left disabled:pointer-events-none disabled:opacity-60"
      aria-pressed={active}
      disabled={disabled}
    >
      <div
        className={cn(
          "flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border bg-background px-2 transition-all duration-200 hover:scale-102 hover:border-primary/60",
          active ? "border-primary/60" : "border-border/50",
        )}
      >
        <span className={cn("h-2 rounded-full bg-foreground/75", item.previewScaleClassName)} aria-hidden="true" />
        <span className="truncate text-center text-sm font-medium leading-none text-foreground/90">
          {item.label} - {item.width}px
        </span>
      </div>
    </button>
  );
}

export function ChatDisplayAppearance({
  contentWidth,
  onContentWidthChange,
  disabled,
}: {
  contentWidth: ChatContentWidth;
  onContentWidthChange: (value: ChatContentWidth) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("settings.chatPage.display");

  return (
    <FieldGroup className="gap-3 md:gap-4">
      <Field>
        <FieldLabel>{t("widthTitle")}</FieldLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3 xl:gap-4">
          {CHAT_CONTENT_WIDTH_OPTIONS.map((item) => (
            <ChatContentWidthPreviewCard
              key={item.value}
              item={{ ...item, label: t(`width.${item.value}`) }}
              active={contentWidth === item.value}
              onSelect={onContentWidthChange}
              disabled={disabled}
            />
          ))}
        </div>
      </Field>
    </FieldGroup>
  );
}
