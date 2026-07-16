import type { ChatContentWidth } from "@/shared/model/chat-content-width";
import type { FontSizeOption } from "@/features/settings/utils/font-size";
import type { PublicModelDTO } from "@/shared/api/model.types";

export type SendShortcut = "enter" | "ctrl_enter" | "meta_enter";
export type ChatInputHeight = "compact" | "standard" | "loose";
export type ChatSettings = {
  defaultModel: string;
  sendShortcut: SendShortcut;
  autoGenerateTitle: boolean;
  deleteFilesByDefault: boolean;
  restoreDraftOnFailure: boolean;
  preserveConversationDrafts: boolean;
  inputHeight: ChatInputHeight;
  contentWidth: ChatContentWidth;
};

export type ModelVendorGroup = [vendor: string, items: PublicModelDTO[]];

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
