import type { AppLocale } from "@/i18n/config";
import enAdminAnnouncements from "@/i18n/messages/zh-CN/admin-announcements.json";
import enAdminBilling from "@/i18n/messages/zh-CN/admin-billing.json";
import enAdminContentModeration from "@/i18n/messages/zh-CN/admin-content-moderation.json";
import enAdminConversation from "@/i18n/messages/zh-CN/admin-conversation.json";
import enAdminFiles from "@/i18n/messages/zh-CN/admin-files.json";
import enAdminGroups from "@/i18n/messages/zh-CN/admin-groups.json";
import enAdminLogin from "@/i18n/messages/zh-CN/admin-login.json";
import enAdminLogs from "@/i18n/messages/zh-CN/admin-logs.json";
import enAdminModels from "@/i18n/messages/zh-CN/admin-models.json";
import enAdminPrompts from "@/i18n/messages/zh-CN/admin-prompts.json";
import enAdminStatistics from "@/i18n/messages/zh-CN/admin-statistics.json";
import enAdminTools from "@/i18n/messages/zh-CN/admin-tools.json";
import enAdminUpstreams from "@/i18n/messages/zh-CN/admin-upstreams.json";
import enAdminUsers from "@/i18n/messages/zh-CN/admin-users.json";
import enAnnouncements from "@/i18n/messages/zh-CN/announcements.json";
import enDesktopSetup from "@/i18n/messages/zh-CN/desktop-setup.json";
import enDesktopTabs from "@/i18n/messages/zh-CN/desktop-tabs.json";
import enDesktopUpdate from "@/i18n/messages/zh-CN/desktop-update.json";
import enChat from "@/i18n/messages/zh-CN/chat.json";
import enCommon from "@/i18n/messages/zh-CN/common.json";
import enConversation from "@/i18n/messages/zh-CN/conversation.json";
import enErrors from "@/i18n/messages/zh-CN/errors.json";
import enFiles from "@/i18n/messages/zh-CN/files.json";
import enGuide from "@/i18n/messages/zh-CN/guide.json";
import enKnowledgeBases from "@/i18n/messages/zh-CN/knowledge-bases.json";
import enLogin from "@/i18n/messages/zh-CN/login.json";
import enPrompts from "@/i18n/messages/zh-CN/prompts.json";
import enUIComponents from "@/i18n/messages/zh-CN/ui-components.json";
import enRecent from "@/i18n/messages/zh-CN/recent.json";
import enSettings from "@/i18n/messages/zh-CN/settings.json";
import enShare from "@/i18n/messages/zh-CN/share.json";
import { replaceDefaultBrandTitle } from "@/shared/config/branding";

const CHINESE_MESSAGES = {
  common: enCommon,
  conversation: enConversation,
  errors: enErrors,
  login: enLogin,
  prompts: enPrompts,
  uiComponents: enUIComponents,
  guide: enGuide,
  chat: enChat,
  announcements: enAnnouncements,
  desktopSetup: enDesktopSetup,
  desktopTabs: enDesktopTabs,
  desktopUpdate: enDesktopUpdate,
  recent: enRecent,
  share: enShare,
  files: enFiles,
  knowledgeBases: enKnowledgeBases,
  settings: enSettings,
  adminAnnouncements: enAdminAnnouncements,
  adminBilling: enAdminBilling,
  adminConversation: enAdminConversation,
  adminFiles: enAdminFiles,
  adminGroups: enAdminGroups,
  adminLogin: enAdminLogin,
  adminLogs: enAdminLogs,
  adminModels: enAdminModels,
  adminPrompts: enAdminPrompts,
  adminStatistics: enAdminStatistics,
  adminTools: enAdminTools,
  adminUpstreams: enAdminUpstreams,
  adminUsers: enAdminUsers,
  adminContentModeration: enAdminContentModeration,
};

export type AppMessages = typeof CHINESE_MESSAGES;

export function applyBrandingToMessages(messages: AppMessages, brandTitle: string): AppMessages {
  return {
    ...messages,
    guide: {
      ...messages.guide,
      userWelcomeTitle: replaceDefaultBrandTitle(messages.guide.userWelcomeTitle, brandTitle),
    },
    recent: {
      ...messages.recent,
      allConversationsDescription: replaceDefaultBrandTitle(messages.recent.allConversationsDescription, brandTitle),
    },
    login: {
      ...messages.login,
      title: replaceDefaultBrandTitle(messages.login.title, brandTitle),
    },
    share: {
      ...messages.share,
      signInToContinue: replaceDefaultBrandTitle(messages.share.signInToContinue, brandTitle),
    },
    chat: {
      ...messages.chat,
      placeholder: replaceDefaultBrandTitle(messages.chat.placeholder, brandTitle),
    },
    settings: {
      ...messages.settings,
      accountPage: {
        ...messages.settings.accountPage,
        securityDialog: {
          ...messages.settings.accountPage.securityDialog,
          email: {
            ...messages.settings.accountPage.securityDialog.email,
            description: {
              ...messages.settings.accountPage.securityDialog.email.description,
              change: replaceDefaultBrandTitle(
                messages.settings.accountPage.securityDialog.email.description.change,
                brandTitle,
              ),
            },
          },
        },
      },
    },
  };
}

export const DEFAULT_MESSAGES: AppMessages = CHINESE_MESSAGES;

export async function loadLocaleMessages(_locale: AppLocale): Promise<AppMessages> {
  return DEFAULT_MESSAGES;
}
