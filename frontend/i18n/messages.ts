import zhAdminAnnouncements from "@/i18n/messages/zh-CN/admin-announcements.json";
import zhAdminBilling from "@/i18n/messages/zh-CN/admin-billing.json";
import zhAdminConversation from "@/i18n/messages/zh-CN/admin-conversation.json";
import zhAdminFiles from "@/i18n/messages/zh-CN/admin-files.json";
import zhAdminGroups from "@/i18n/messages/zh-CN/admin-groups.json";
import zhAdminLogin from "@/i18n/messages/zh-CN/admin-login.json";
import zhAdminLogs from "@/i18n/messages/zh-CN/admin-logs.json";
import zhAdminModels from "@/i18n/messages/zh-CN/admin-models.json";
import zhAdminPrompts from "@/i18n/messages/zh-CN/admin-prompts.json";
import zhAdminStatistics from "@/i18n/messages/zh-CN/admin-statistics.json";
import zhAdminTools from "@/i18n/messages/zh-CN/admin-tools.json";
import zhAdminUpstreams from "@/i18n/messages/zh-CN/admin-upstreams.json";
import zhAdminUsers from "@/i18n/messages/zh-CN/admin-users.json";
import zhChat from "@/i18n/messages/zh-CN/chat.json";
import zhAnnouncements from "@/i18n/messages/zh-CN/announcements.json";
import zhCommon from "@/i18n/messages/zh-CN/common.json";
import zhConversation from "@/i18n/messages/zh-CN/conversation.json";
import zhErrors from "@/i18n/messages/zh-CN/errors.json";
import zhFiles from "@/i18n/messages/zh-CN/files.json";
import zhGuide from "@/i18n/messages/zh-CN/guide.json";
import zhLogin from "@/i18n/messages/zh-CN/login.json";
import zhPrompts from "@/i18n/messages/zh-CN/prompts.json";
import zhRecent from "@/i18n/messages/zh-CN/recent.json";
import zhSettings from "@/i18n/messages/zh-CN/settings.json";
import zhShare from "@/i18n/messages/zh-CN/share.json";
import type { AppLocale } from "@/i18n/config";
import { replaceDefaultBrandTitle } from "@/shared/config/branding";

const CHINESE_MESSAGES = {
  common: zhCommon,
  conversation: zhConversation,
  errors: zhErrors,
  login: zhLogin,
  prompts: zhPrompts,
  guide: zhGuide,
  chat: zhChat,
  announcements: zhAnnouncements,
  recent: zhRecent,
  share: zhShare,
  files: zhFiles,
  settings: zhSettings,
  adminAnnouncements: zhAdminAnnouncements,
  adminBilling: zhAdminBilling,
  adminConversation: zhAdminConversation,
  adminFiles: zhAdminFiles,
  adminGroups: zhAdminGroups,
  adminLogin: zhAdminLogin,
  adminLogs: zhAdminLogs,
  adminModels: zhAdminModels,
  adminPrompts: zhAdminPrompts,
  adminStatistics: zhAdminStatistics,
  adminTools: zhAdminTools,
  adminUpstreams: zhAdminUpstreams,
  adminUsers: zhAdminUsers,
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

export async function loadLocaleMessages(locale: AppLocale): Promise<AppMessages> {
  void locale;
  return DEFAULT_MESSAGES;
}
