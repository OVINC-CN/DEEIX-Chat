"use client";

import * as React from "react";

import { useUserSettings } from "@/shared/model/user-settings-store";

type ChatPreferences = {
  autoGenerateTitle: boolean;
  autoGenerateLabels: boolean;
  autoExpandThinking: boolean;
  autoExpandToolCalls: boolean;
  deleteFilesByDefault: boolean;
  reuseModelOptions: boolean;
};

type ChatPreferencesState = ChatPreferences & {
  loaded: boolean;
};

const DEFAULT_CHAT_PREFERENCES: ChatPreferences = {
  autoGenerateTitle: true,
  autoGenerateLabels: true,
  autoExpandThinking: false,
  autoExpandToolCalls: false,
  deleteFilesByDefault: false,
  reuseModelOptions: false,
};

function resolveChatPreferences(settings: Record<string, string>): ChatPreferences {
  return {
    autoGenerateTitle: true,
    autoGenerateLabels: true,
    autoExpandThinking: false,
    autoExpandToolCalls: false,
    deleteFilesByDefault: settings["chat.delete_conversation_files_by_default"] === "true",
    reuseModelOptions: false,
  };
}

export function useSettingsChatPreferences(): ChatPreferencesState {
  const { settings, loaded } = useUserSettings();
  const preferences = React.useMemo(
    () => loaded ? resolveChatPreferences(settings) : DEFAULT_CHAT_PREFERENCES,
    [loaded, settings],
  );
  return { ...preferences, loaded };
}
