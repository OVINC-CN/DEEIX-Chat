"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useSettingsGeneralProfile } from "@/features/settings/hooks/use-settings-general-profile";
import {
  disableResponseCompletionNotifications,
  enableResponseCompletionNotifications,
  getBrowserNotificationPermission,
  isBrowserNotificationSupported,
  readResponseCompletionNotificationsEnabled,
} from "@/shared/lib/browser-notifications";
import {
  SettingsPage,
  SettingsSectionSeparator,
} from "@/shared/components/settings-layout";
import { GeneralNotificationsSection } from "./general-notifications";
import { GeneralProfileSection } from "./general-profile";

export function SettingsGeneral() {
  const t = useTranslations("settings");
  const {
    viewer,
    draft,
    setDraft,
    loading,
    saving,
    hasEdits,
    canEditUsername,
    usernameDraft,
    setUsernameDraft,
    viewerInitial,
    draftAvatarSrc,
    avatarDialogOpen,
    setAvatarDialogOpen,
    avatarDialogValue,
    setAvatarDialogValue,
    avatarUploading,
    avatarDialogPreviewSrc,
    handleSave,
    handleDiscard,
    handleOpenAvatarDialog,
    handleSaveAvatarDialog,
    handleCycleGeneratedAvatar,
    handleUploadAvatarFile,
  } = useSettingsGeneralProfile();
  const [notificationRuntimeReady, setNotificationRuntimeReady] = React.useState(false);
  const [notificationSupported, setNotificationSupported] = React.useState(false);
  const [responseCompletionNotificationsEnabled, setResponseCompletionNotificationsEnabled] = React.useState(false);
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission | "unsupported">("unsupported");

  React.useEffect(() => {
    setNotificationRuntimeReady(true);
    setNotificationSupported(isBrowserNotificationSupported());
    setResponseCompletionNotificationsEnabled(readResponseCompletionNotificationsEnabled());
    setNotificationPermission(getBrowserNotificationPermission());
  }, []);


  const handleResponseCompletionNotificationsChange = React.useCallback((checked: boolean) => {
    if (!notificationSupported) {
      return;
    }

    if (!checked) {
      disableResponseCompletionNotifications();
      setResponseCompletionNotificationsEnabled(false);
      setNotificationPermission(getBrowserNotificationPermission());
      return;
    }

    void (async () => {
      const result = await enableResponseCompletionNotifications();
      setResponseCompletionNotificationsEnabled(result.enabled);
      setNotificationPermission(result.permission);

      if (result.permission === "unsupported") {
        toast.error(t("generalPage.notifications.unsupportedTitle"), {
          description: t("generalPage.notifications.unsupportedDescription"),
        });
        return;
      }

      if (result.permission === "denied") {
        toast.error(t("generalPage.notifications.deniedTitle"), {
          description: t("generalPage.notifications.deniedDescription"),
        });
        return;
      }

      if (result.enabled) {
        toast.success(t("generalPage.notifications.enabledTitle"), {
          description: t("generalPage.notifications.enabledDescription"),
        });
      }
    })();
  }, [notificationSupported, t]);

  const notificationHelpText = React.useMemo(() => {
    if (!notificationRuntimeReady) {
      return t("generalPage.notifications.defaultHelp");
    }
    if (!notificationSupported) {
      return t("generalPage.notifications.unsupportedHelp");
    }
    if (notificationPermission === "denied") {
      return t("generalPage.notifications.deniedHelp");
    }
    if (notificationPermission === "granted") {
      return t("generalPage.notifications.grantedHelp");
    }
    return t("generalPage.notifications.defaultHelp");
  }, [notificationPermission, notificationRuntimeReady, notificationSupported, t]);

  return (
    <SettingsPage>
      <GeneralProfileSection
        viewer={viewer}
        draft={draft}
        loading={loading}
        saving={saving}
        hasEdits={hasEdits}
        canEditUsername={canEditUsername}
        usernameDraft={usernameDraft}
        viewerInitial={viewerInitial}
        draftAvatarSrc={draftAvatarSrc}
        avatarDialogOpen={avatarDialogOpen}
        avatarDialogValue={avatarDialogValue}
        avatarUploading={avatarUploading}
        avatarDialogPreviewSrc={avatarDialogPreviewSrc}
        onDraftChange={setDraft}
        onUsernameDraftChange={setUsernameDraft}
        onReset={handleDiscard}
        onSave={() => void handleSave()}
        onOpenAvatarDialog={handleOpenAvatarDialog}
        onAvatarDialogOpenChange={setAvatarDialogOpen}
        onAvatarDialogValueChange={setAvatarDialogValue}
        onCycleGeneratedAvatar={handleCycleGeneratedAvatar}
        onUploadAvatarFile={(file) => void handleUploadAvatarFile(file)}
        onSaveAvatarDialog={handleSaveAvatarDialog}
      />

      <SettingsSectionSeparator />

      <GeneralNotificationsSection
        notificationRuntimeReady={notificationRuntimeReady}
        notificationSupported={notificationSupported}
        responseCompletionNotificationsEnabled={responseCompletionNotificationsEnabled}
        notificationHelpText={notificationHelpText}
        onResponseCompletionNotificationsChange={handleResponseCompletionNotificationsChange}
      />

    </SettingsPage>
  );
}
