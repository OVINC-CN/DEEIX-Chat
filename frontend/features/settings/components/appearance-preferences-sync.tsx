"use client";

import * as React from "react";

import { resolveAppearancePreferences } from "@/features/settings/utils/appearance-preferences";
import {
  readFontSizePreference,
  writeFontSizePreference,
} from "@/features/settings/utils/font-size";
import { useAuthSession } from "@/shared/auth/auth-session-context";

export function AppearancePreferencesSync() {
  const { user, userStatus } = useAuthSession();
  const syncedAppearanceRef = React.useRef<string>("");

  React.useEffect(() => {
    if (userStatus !== "ready" || !user) {
      syncedAppearanceRef.current = "";
      return;
    }

    const raw = user?.appearancePreferences?.trim() ?? "";
    const syncKey = `${user.publicID}:${raw}`;
    if (syncKey === syncedAppearanceRef.current) {
      return;
    }
    syncedAppearanceRef.current = syncKey;

    const next = resolveAppearancePreferences(raw);
    if (next.fontSize !== readFontSizePreference()) {
      writeFontSizePreference(next.fontSize);
    }
  }, [user, userStatus]);

  return null;
}
