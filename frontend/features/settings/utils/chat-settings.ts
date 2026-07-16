import type { ChatSettings, SendShortcut } from "@/features/settings/types/settings";
import type { UserSettingsMap } from "@/shared/api/user-settings";
import { platformSendShortcut } from "@/shared/lib/platform-shortcuts";

const SEND_SHORTCUTS: SendShortcut[] = ["enter", "ctrl_enter", "meta_enter"];

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  sendShortcut: "ctrl_enter",
  deleteFilesByDefault: false,
  restoreDraftOnFailure: true,
  preserveConversationDrafts: true,
};

export function parseChatSettings(map: UserSettingsMap): ChatSettings {
  const sendShortcut = map["chat.send_on_enter"];

  return {
    sendShortcut: parseSendShortcut(sendShortcut),
    deleteFilesByDefault: map["chat.delete_conversation_files_by_default"] === "true",
    restoreDraftOnFailure: map["chat.restore_draft_on_failure"] !== "false",
    preserveConversationDrafts: map["chat.preserve_conversation_drafts"] !== "false",
  };
}

export function parseSendShortcut(value: string | undefined): SendShortcut {
  if (value === "enter") {
    return "enter";
  }
  if (SEND_SHORTCUTS.includes(value as SendShortcut)) {
    return platformSendShortcut();
  }
  return platformSendShortcut();
}
