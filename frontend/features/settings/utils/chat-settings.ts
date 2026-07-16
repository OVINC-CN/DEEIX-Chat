import { parseChatContentWidth } from "@/shared/model/chat-content-width";
import type { ChatInputHeight, ChatSettings, ModelVendorGroup, SendShortcut } from "@/features/settings/types/settings";
import type { UserSettingsMap } from "@/shared/api/user-settings";
import type { PublicModelDTO } from "@/shared/api/model.types";
import { platformSendShortcut } from "@/shared/lib/platform-shortcuts";

const INPUT_HEIGHTS: ChatInputHeight[] = ["compact", "standard", "loose"];
const SEND_SHORTCUTS: SendShortcut[] = ["enter", "ctrl_enter", "meta_enter"];

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  defaultModel: "",
  sendShortcut: "enter",
  autoGenerateTitle: true,
  deleteFilesByDefault: false,
  restoreDraftOnFailure: true,
  preserveConversationDrafts: true,
  inputHeight: "standard",
  contentWidth: "compact",
};

export function parseChatSettings(map: UserSettingsMap): ChatSettings {
  const inputHeight = map["chat.input_height"];
  const contentWidth = map["chat.content_width"];
  const sendShortcut = map["chat.send_on_enter"];

  return {
    defaultModel: map["chat.default_model"] ?? "",
    sendShortcut: parseSendShortcut(sendShortcut),
    autoGenerateTitle: map["chat.auto_generate_title"] !== "false",
    deleteFilesByDefault: map["chat.delete_conversation_files_by_default"] === "true",
    restoreDraftOnFailure: map["chat.restore_draft_on_failure"] !== "false",
    preserveConversationDrafts: map["chat.preserve_conversation_drafts"] !== "false",
    inputHeight: INPUT_HEIGHTS.includes(inputHeight as ChatInputHeight) ? (inputHeight as ChatInputHeight) : "standard",
    contentWidth: parseChatContentWidth(contentWidth),
  };
}

export function parseSendShortcut(value: string | undefined): SendShortcut {
  if (value === "enter") {
    return "enter";
  }
  if (SEND_SHORTCUTS.includes(value as SendShortcut)) {
    return platformSendShortcut();
  }
  return "enter";
}

export function groupModelsByVendor(models: PublicModelDTO[]): ModelVendorGroup[] {
  const groups = new Map<string, PublicModelDTO[]>();

  for (const model of models) {
    const vendor = model.vendor || "other";
    const items = groups.get(vendor) ?? [];
    items.push(model);
    groups.set(vendor, items);
  }

  return Array.from(groups.entries());
}
