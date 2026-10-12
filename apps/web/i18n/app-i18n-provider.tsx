"use client";

import * as React from "react";
import { NextIntlClientProvider } from "next-intl";
import { DEFAULT_LOCALE, type AppLocale } from "@/i18n/config";
import { applyBrandingToMessages, DEFAULT_MESSAGES } from "@/i18n/messages";
import { useBranding } from "@/shared/config/branding-provider";

type AppI18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => Promise<void>;
};
const fixedLocale: AppI18nContextValue = {
  locale: DEFAULT_LOCALE,
  setLocale: async () => undefined,
};
const AppI18nContext = React.createContext<AppI18nContextValue>(fixedLocale);

export function AppI18nProvider({ children }: { children: React.ReactNode }) {
  const branding = useBranding();
  const messages = React.useMemo(
    () => applyBrandingToMessages(DEFAULT_MESSAGES, branding.title),
    [branding.title],
  );
  return (
    <AppI18nContext.Provider value={fixedLocale}>
      <NextIntlClientProvider locale={DEFAULT_LOCALE} messages={messages} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </AppI18nContext.Provider>
  );
}

export function useAppLocale() {
  return React.useContext(AppI18nContext);
}
