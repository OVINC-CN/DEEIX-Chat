"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { ChatSettings } from "@/features/settings/types/settings";
import {
  DEFAULT_CHAT_SETTINGS,
  parseChatSettings,
} from "@/features/settings/utils/chat-settings";
import { dispatchUserSettingsUpdated } from "@/features/settings/events/user-settings-events";
import { useAuthSession } from "@/shared/auth/auth-session-context";
import { getUserSettings, patchUserSettings } from "@/shared/api/user-settings";
import { useLocalizedErrorMessage } from "@/i18n/use-localized-error";

type UseSettingsChatResult = {
  settings: ChatSettings;
  loading: boolean;
  handleBool: (key: string, field: keyof ChatSettings) => (checked: boolean) => void;
  handleEnum: (key: string, field: keyof ChatSettings) => (value: string) => void;
};

export function useSettingsChat(): UseSettingsChatResult {
  const t = useTranslations("settings.chatPage.toasts");
  const translateError = useLocalizedErrorMessage();
  const { accessToken } = useAuthSession();
  const [settings, setSettings] = React.useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [loading, setLoading] = React.useState(true);
  const settingRequestSeqRef = React.useRef<Record<string, number>>({});

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const map = await getUserSettings(accessToken);

        if (cancelled) {
          return;
        }

        setSettings(parseChatSettings(map));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const persistSetting = React.useCallback(
    <K extends keyof ChatSettings>(key: string, field: K, value: string, previousValue: ChatSettings[K]) => {
      const requestSeq = (settingRequestSeqRef.current[key] ?? 0) + 1;
      settingRequestSeqRef.current[key] = requestSeq;
      void patchUserSettings(accessToken, { [key]: value })
        .then((map) => {
          if (settingRequestSeqRef.current[key] !== requestSeq) {
            return;
          }
          const saved = parseChatSettings(map);
          setSettings((current) => ({ ...current, [field]: saved[field] }));
          dispatchUserSettingsUpdated(map);
        })
        .catch((error) => {
          if (settingRequestSeqRef.current[key] !== requestSeq) {
            return;
          }
          setSettings((current) => ({ ...current, [field]: previousValue }));
          toast.error(t("saveFailed"), { description: translateError(error, t("retryLater")) });
        });
    },
    [accessToken, t, translateError],
  );

  const handleBool = React.useCallback(
    (key: string, field: keyof ChatSettings) => (checked: boolean) => {
      setSettings((previous) => {
        persistSetting(key, field, checked ? "true" : "false", previous[field]);
        return { ...previous, [field]: checked };
      });
    },
    [persistSetting],
  );

  const handleEnum = React.useCallback(
    (key: string, field: keyof ChatSettings) => (value: string) => {
      setSettings((previous) => {
        persistSetting(key, field, value, previous[field]);
        return { ...previous, [field]: value };
      });
    },
    [persistSetting],
  );

  return {
    settings,
    loading,
    handleBool,
    handleEnum,
  };
}
