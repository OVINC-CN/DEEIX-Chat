"use client";

import {
  FONT_SIZE_STORAGE_KEY,
  isFontSizeOption,
  type FontSizeOption,
} from "@/features/settings/utils/font-size";

export type AppearancePreferences = {
  fontSize: FontSizeOption;
};

export type AppearancePreferencePatch = Partial<AppearancePreferences>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseAppearancePreferences(raw: string | null | undefined): AppearancePreferencePatch {
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) {
      return {};
    }

    const result: AppearancePreferencePatch = {};
    if (isFontSizeOption(parsed.fontSize)) {
      result.fontSize = parsed.fontSize;
    }
    return result;
  } catch {
    return {};
  }
}

export function readLocalAppearancePreferences(): AppearancePreferences {
  if (typeof window === "undefined") {
    return {
      fontSize: "standard",
    };
  }

  const storedFontSize = window.localStorage.getItem(FONT_SIZE_STORAGE_KEY);
  return {
    fontSize: isFontSizeOption(storedFontSize) ? storedFontSize : "standard",
  };
}

export function resolveAppearancePreferences(
  accountPreferences: string | null | undefined,
): AppearancePreferences {
  return {
    ...readLocalAppearancePreferences(),
    ...parseAppearancePreferences(accountPreferences),
  };
}

export function serializeAppearancePreferences(preferences: AppearancePreferences): string {
  return JSON.stringify({
    fontSize: preferences.fontSize,
  });
}
