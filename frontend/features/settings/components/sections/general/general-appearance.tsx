"use client";

import { useTranslations } from "next-intl";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { FontSizeOption } from "@/features/settings/utils/font-size";
import type { FontSizePreview } from "@/features/settings/types/settings";
import { cn } from "@/lib/utils";
import { SettingsSection } from "@/shared/components/settings-layout";

const FONT_SIZE_OPTIONS: FontSizePreview[] = [
  { label: "Small", value: "small", scale: 0.88 },
  { label: "Standard", value: "standard", scale: 1 },
  { label: "Medium", value: "medium", scale: 1.12 },
  { label: "Large", value: "large", scale: 1.24 },
];

function FontSizePreviewCard({
  item,
  active,
  onSelect,
}: {
  item: FontSizePreview;
  active: boolean;
  onSelect: (value: FontSizeOption) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.value)}
      className="group text-left"
      aria-pressed={active}
    >
      <div
        className={cn(
          "flex h-24 w-full items-center justify-center rounded-xl border bg-background px-1 transition-all duration-200 hover:scale-102 hover:border-primary/60",
          active ? "border-primary/60" : "border-border/50",
        )}
      >
        <span
          className="truncate text-center font-medium leading-none text-foreground/90"
          style={{ fontSize: `calc(1rem * ${item.scale})` }}
        >
          {item.label} Aa
        </span>
      </div>
    </button>
  );
}

export function GeneralAppearanceSection({
  fontSize,
  onFontSizeChange,
}: {
  fontSize: FontSizeOption;
  onFontSizeChange: (value: FontSizeOption) => void;
}) {
  const t = useTranslations("settings");

  return (
    <SettingsSection title={t("appearance")}>
      <FieldGroup className="gap-3 md:gap-4">
        <Field>
          <FieldLabel>{t("generalPage.appearance.fontSize")}</FieldLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3 xl:gap-4">
            {FONT_SIZE_OPTIONS.map((item) => (
              <FontSizePreviewCard
                key={item.value}
                item={{ ...item, label: t(`generalPage.appearance.fontSizeOption.${item.value}`) }}
                active={fontSize === item.value}
                onSelect={onFontSizeChange}
              />
            ))}
          </div>
        </Field>
      </FieldGroup>
    </SettingsSection>
  );
}
