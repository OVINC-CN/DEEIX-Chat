import type { ChatSettings, ModelPresentationGroup, SendShortcut } from "@/features/settings/types/settings";
import type { UserSettingsMap } from "@/shared/api/user-settings";
import type { PublicModelDTO } from "@/shared/api/model.types";
import { platformSendShortcut } from "@/shared/lib/platform-shortcuts";
import { resolveModelPresentationGroup } from "@/shared/lib/model-presentation";


export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  defaultModel: "",
  sendShortcut: "ctrl_enter",
  showTokenUsage: true,
  showModelInfo: true,
  showLatency: true,
  showBillingCost: true,
  markdownRender: true,
  autoExpandThinking: false,
  autoExpandToolCalls: false,
  autoGenerateTitle: true,
  autoGenerateLabels: true,
  deleteFilesByDefault: false,
  contextCompactAuto: false,
  restoreDraftOnFailure: true,
  preserveConversationDrafts: true,
  reuseModelOptions: false,
  reasoningContentPassback: true,
  inputHeight: "standard",
  contentWidth: "compact",
  fileMode: "full_context",
};

export function parseChatSettings(map: UserSettingsMap): ChatSettings {
  const sendShortcut = map["chat.send_on_enter"];

  return {
    defaultModel: map["chat.default_model"] ?? "",
    sendShortcut: parseSendShortcut(sendShortcut),
    showTokenUsage: true,
    showModelInfo: true,
    showLatency: true,
    showBillingCost: true,
    markdownRender: true,
    autoExpandThinking: false,
    autoExpandToolCalls: false,
    autoGenerateTitle: true,
    autoGenerateLabels: true,
    deleteFilesByDefault: map["chat.delete_conversation_files_by_default"] === "true",
    contextCompactAuto: false,
    restoreDraftOnFailure: map["chat.restore_draft_on_failure"] !== "false",
    preserveConversationDrafts: map["chat.preserve_conversation_drafts"] !== "false",
    reuseModelOptions: false,
    reasoningContentPassback: true,
    inputHeight: "standard",
    contentWidth: "compact",
    fileMode: "full_context",
  };
}

export function parseSendShortcut(value: string | undefined): SendShortcut {
  if (value === "enter") {
    return "enter";
  }
  return platformSendShortcut();
}

export function groupModelsForPresentation(models: PublicModelDTO[]): ModelPresentationGroup[] {
  const groups = new Map<string, PublicModelDTO[]>();

  for (const model of models) {
    const groupKey = resolveModelPresentationGroup(model).key;
    const items = groups.get(groupKey) ?? [];
    items.push(model);
    groups.set(groupKey, items);
  }

  return Array.from(groups.entries());
}
