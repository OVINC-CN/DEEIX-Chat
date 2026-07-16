import type { ChatContentWidth } from "@/shared/model/chat-content-width";
import type { FontSizeOption } from "@/features/settings/utils/font-size";

export type SendShortcut = "enter" | "ctrl_enter" | "meta_enter";
export type ChatInputHeight = "compact" | "standard" | "loose";
export type ChatSettings = {
  sendShortcut: SendShortcut;
  deleteFilesByDefault: boolean;
  restoreDraftOnFailure: boolean;
  preserveConversationDrafts: boolean;
  inputHeight: ChatInputHeight;
  contentWidth: ChatContentWidth;
};

export type ProfileDraft = {
  avatarUrl: string;
  displayName: string;
  timezone: string;
  locale: string;
  profilePreferences: string;
};

export type FontSizePreview = {
  label: string;
  value: FontSizeOption;
  scale: number;
};
