export type AppLocale = "en-US" | "zh-CN";

export const APP_LOCALES = ["zh-CN"] as const satisfies readonly AppLocale[];

export const DEFAULT_LOCALE: AppLocale = "zh-CN";
export const LOCALE_COOKIE_NAME = "deeix_chat_locale";

export const APP_LOCALE_LABELS: Record<(typeof APP_LOCALES)[number], string> = {
  "zh-CN": "简体中文",
};

export function normalizeAppLocale(value: string | null | undefined): AppLocale {
  void value;
  return DEFAULT_LOCALE;
}

export function resolveBrowserLocale(languages: readonly string[] | undefined): AppLocale {
  void languages;
  return DEFAULT_LOCALE;
}
