"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { toast } from "sonner";

import type { ChatSettings } from "@/features/settings/types/settings";
import {
  DEFAULT_CHAT_SETTINGS,
  parseChatSettings,
} from "@/features/settings/utils/chat-settings";
import { useLocalizedErrorMessage } from "@/i18n/use-localized-error";
import { useAuthSession } from "@/shared/auth/auth-session-context";
import {
  updateUserSettings,
  useUserSettings,
} from "@/shared/model/user-settings-store";

type UseSettingsChatResult = {
  settings: ChatSettings;
  loading: boolean;
  handleBool: (key: string) => (checked: boolean) => void;
  handleEnum: (key: string) => (value: string) => void;
};

export function useSettingsChat(): UseSettingsChatResult {
  const t = useTranslations("settings.chatPage.toasts");
  const translateError = useLocalizedErrorMessage();
  const { accessToken } = useAuthSession();
  const userSettings = useUserSettings();
  const settings = React.useMemo(
    () => userSettings.loaded ? parseChatSettings(userSettings.settings) : DEFAULT_CHAT_SETTINGS,
    [userSettings.loaded, userSettings.settings],
  );

  const persistSetting = React.useCallback(
    (key: string, value: string) => {
      void updateUserSettings(accessToken, { [key]: value })
        .catch((error) => {
          toast.error(t("saveFailed"), { description: translateError(error, t("retryLater")) });
        });
    },
    [accessToken, t, translateError],
  );

  const handleBool = React.useCallback(
    (key: string) => (checked: boolean) => {
      persistSetting(key, checked ? "true" : "false");
    },
    [persistSetting],
  );

  const handleEnum = React.useCallback(
    (key: string) => (value: string) => {
      persistSetting(key, value);
    },
    [persistSetting],
  );


  return {
    settings,
    loading: !userSettings.loaded,
    handleBool,
    handleEnum,
  };
}
