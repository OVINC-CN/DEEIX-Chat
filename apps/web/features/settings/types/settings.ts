import type { ChatContentWidth } from "@/shared/model/chat-content-width";
import type { PublicModelDTO } from "@/shared/api/model.types";

export type SendShortcut = "enter" | "ctrl_enter" | "meta_enter";
export type FileMode = "auto" | "full_context" | "rag";
export type ChatInputHeight = "compact" | "standard" | "loose";
export type ChatSettings = {
  defaultModel: string;
  sendShortcut: SendShortcut;
  showTokenUsage: boolean;
  showModelInfo: boolean;
  showLatency: boolean;
  showBillingCost: boolean;
  markdownRender: boolean;
  autoExpandThinking: boolean;
  autoExpandToolCalls: boolean;
  autoGenerateTitle: boolean;
  autoGenerateLabels: boolean;
  deleteFilesByDefault: boolean;
  contextCompactAuto: boolean;
  restoreDraftOnFailure: boolean;
  preserveConversationDrafts: boolean;
  reuseModelOptions: boolean;
  reasoningContentPassback: boolean;
  inputHeight: ChatInputHeight;
  contentWidth: ChatContentWidth;
  fileMode: FileMode;
};

export type ModelPresentationGroup = [groupKey: string, items: PublicModelDTO[]];

export type ProfileDraft = {
  avatarUrl: string;
  displayName: string;
  timezone: string;
  locale: string;
  profilePreferences: string;
};
