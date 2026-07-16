export type SendShortcut = "enter" | "ctrl_enter" | "meta_enter";
export type ChatInputHeight = "compact" | "standard" | "loose";
export type ChatSettings = {
  sendShortcut: SendShortcut;
  deleteFilesByDefault: boolean;
  restoreDraftOnFailure: boolean;
  preserveConversationDrafts: boolean;
  inputHeight: ChatInputHeight;
};

export type ProfileDraft = {
  avatarUrl: string;
  displayName: string;
  timezone: string;
  locale: string;
  profilePreferences: string;
};
