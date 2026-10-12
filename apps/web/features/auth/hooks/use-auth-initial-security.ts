import { useTranslations } from "next-intl";
import * as React from "react";
import { toast } from "sonner";

import { useLocalizedErrorMessage } from "@/i18n/use-localized-error";
import { completeOnboarding, isPasswordReuseNotAllowedError, patchMe, patchUsername } from "@/shared/api/auth";
import type { UserDTO } from "@/shared/api/auth-types";
import { isDisplayNameLengthValid, isPasswordPolicyValid, isUsernamePolicyValid } from "@/shared/auth/account-policy";
import { useAuthSession } from "@/shared/auth/auth-session-context";
import { clearSessionAndRedirectToLogin } from "@/shared/auth/session";
import { dispatchUserProfileUpdated } from "@/shared/auth/user-profile-events";
import { detectCurrentTimeZone } from "@/shared/lib/time-zone";

/** Saves the welcome → account → timezone → finish onboarding flow. */
export function useAuthInitialSecurity() {
  const t = useTranslations("guide");
  const tCommonErrors = useTranslations("common.errors");
  const resolveErrorMessage = useLocalizedErrorMessage();
  const { accessToken, user } = useAuthSession();
  const [viewer, setViewer] = React.useState<UserDTO | null>(null);
  const [step, setStep] = React.useState(1);
  const [guideActive, setGuideActive] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [timezone, setTimezone] = React.useState(detectCurrentTimeZone);
  const [password, setPassword] = React.useState("");
  const [savingAccount, setSavingAccount] = React.useState(false);
  const [savingPersonalization, setSavingPersonalization] = React.useState(false);
  const [finishing, setFinishing] = React.useState(false);
  const initializedTimeZoneUserRef = React.useRef<string | null>(null);
  const canEditUsername = Boolean(viewer?.initialUsernameRequired);
  const currentTimeZone = React.useMemo(() => detectCurrentTimeZone(), []);

  React.useEffect(() => {
    setViewer(user);
    setUsername(user?.username ?? "");
    setDisplayName(user?.displayName ?? "");
    if (!user) {
      setGuideActive(false);
      initializedTimeZoneUserRef.current = null;
      setStep(1);
      return;
    }
    if (user.initialSecurityRequired) {
      if (initializedTimeZoneUserRef.current !== user.publicID) {
        initializedTimeZoneUserRef.current = user.publicID;
        setTimezone(detectCurrentTimeZone());
      }
    } else {
      initializedTimeZoneUserRef.current = null;
      setTimezone(user.timezone.trim() || detectCurrentTimeZone());
    }
    setGuideActive(Boolean(user.initialSecurityRequired));
  }, [user]);

  const submitAccountStep = React.useCallback(async () => {
    if (!viewer?.initialSecurityRequired || savingAccount) {
      return;
    }
    const nextUsername = username.trim().toLowerCase();
    const currentUsername = viewer.username.trim().toLowerCase();
    const hasUsernameEdit = canEditUsername && nextUsername !== currentUsername;
    const nextDisplayName = displayName.trim();
    const nextPassword = password.trim();
    if (viewer.initialUsernameRequired && nextUsername === currentUsername) {
      toast.error(t("toasts.changeInitialUsername"));
      return;
    }
    if (hasUsernameEdit && !isUsernamePolicyValid(nextUsername)) {
      toast.error(t("toasts.usernameTooShort"));
      return;
    }
    if (!viewer.mustResetPassword && !isDisplayNameLengthValid(nextDisplayName)) {
      toast.error(t("toasts.displayNameRequired"));
      return;
    }
    if (viewer.mustResetPassword && !isPasswordPolicyValid(nextPassword)) {
      toast.error(t("toasts.passwordTooShort"));
      return;
    }

    setSavingAccount(true);
    try {
      let nextViewer = viewer;
      if (hasUsernameEdit) {
        nextViewer = await patchUsername(accessToken, { username: nextUsername });
      }
      const profilePayload: Parameters<typeof patchMe>[1] = {};
      if (!viewer.mustResetPassword && nextDisplayName !== viewer.displayName.trim()) {
        profilePayload.displayName = nextDisplayName;
      }
      if (Object.keys(profilePayload).length > 0) {
        nextViewer = await patchMe(accessToken, profilePayload);
      }
      setViewer(nextViewer);
      dispatchUserProfileUpdated(nextViewer);
      setStep(3);
    } catch (error) {
      toast.error(t("toasts.saveAccountFailed"), {
        description: resolveErrorMessage(error, tCommonErrors("unknown")),
      });
    } finally {
      setSavingAccount(false);
    }
  }, [accessToken, canEditUsername, displayName, password, resolveErrorMessage, savingAccount, t, tCommonErrors, username, viewer]);

  const savePersonalizationStep = React.useCallback(async () => {
    if (!viewer || savingPersonalization) {
      return;
    }
    const nextTimezone = timezone.trim() || currentTimeZone;
    const profilePayload: Parameters<typeof patchMe>[1] = {};

    if (nextTimezone !== (viewer.timezone.trim() || "Etc/UTC")) {
      profilePayload.timezone = nextTimezone;
    }

    if (Object.keys(profilePayload).length === 0) {
      setStep(4);
      return;
    }

    setSavingPersonalization(true);
    try {
      const nextViewer = await patchMe(accessToken, profilePayload);
      setViewer(nextViewer);
      dispatchUserProfileUpdated(nextViewer);
      setStep(4);
    } catch (error) {
      toast.error(t("toasts.savePersonalizationFailed"), {
        description: resolveErrorMessage(error, tCommonErrors("unknown")),
      });
    } finally {
      setSavingPersonalization(false);
    }
  }, [accessToken, currentTimeZone, resolveErrorMessage, savingPersonalization, t, tCommonErrors, timezone, viewer]);

  const finishInitialSecurity = React.useCallback(async () => {
    if (!viewer || finishing) {
      return;
    }
    if (viewer.mustResetPassword && !isPasswordPolicyValid(password)) {
      toast.error(t("toasts.passwordTooShort"));
      setStep(2);
      return;
    }
    setFinishing(true);
    try {
      const nextViewer = await completeOnboarding(
        accessToken,
        viewer.mustResetPassword ? { newPassword: password.trim() } : undefined,
      );
      if (nextViewer) {
        setViewer(nextViewer);
        dispatchUserProfileUpdated(nextViewer);
      }
      setGuideActive(false);
      if (viewer.mustResetPassword) {
        toast.success(t("toasts.initializedRelogin"));
        clearSessionAndRedirectToLogin();
        return;
      }
      toast.success(t("toasts.complete"));
    } catch (error) {
      if (isPasswordReuseNotAllowedError(error)) {
        setStep(2);
      }
      toast.error(t("toasts.completeFailed"), {
        description: resolveErrorMessage(error, tCommonErrors("unknown")),
      });
    } finally {
      setFinishing(false);
    }
  }, [accessToken, finishing, password, resolveErrorMessage, t, tCommonErrors, viewer]);

  return {
    viewer, step, setStep, guideActive, currentTimeZone,
    username, setUsername, displayName, setDisplayName, timezone, setTimezone,
    password, setPassword, savingAccount, savingPersonalization, finishing,
    submitAccountStep, savePersonalizationStep, finishInitialSecurity,
  };
}
