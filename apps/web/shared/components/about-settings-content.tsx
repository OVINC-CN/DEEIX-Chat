"use client";

import type { ComponentType, ReactNode } from "react";

import { useTranslations } from "next-intl";

import packageMeta from "@/package.json";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DeeixLogo } from "@/shared/components/app-logo";
import {
  SettingsPage,
  SettingsSection,
} from "@/shared/components/settings-layout";

type AboutLabels = {
  details: string;
  official: string;
  website: string;
  repository: string;
  social: string;
  blog: string;
  contact: string;
  copyright: string;
  license: string;
};

type AboutSettingsContentProps = {
  title: string;
  description: string;
  consoleLabel: string;
  labels: AboutLabels;
  versionBadgeContent?: ReactNode;
  versionBadgeTooltip?: ReactNode;
  versionActions?: ReactNode;
  // Extra lines under the version (e.g. how the desktop app was distributed).
  // Supplied by the caller so this panel stays free of platform concerns.
  versionDetails?: ReactNode;
  // Extra sections appended after the product details (e.g. admin-only settings).
  extraSections?: ReactNode;
  // Renders third-party brand marks (GitHub, X) of the official links. Injected by the
  // caller so this product panel stays free of the identity-provider entity.
  brandIcon?: AboutBrandIcon;
};

export type AboutBrandIcon = ComponentType<{
  name: string;
  slug: string;
  className?: string;
  iconClassName?: string;
}>;

export function AboutSettingsContent({
  title,
  description,
  consoleLabel,
  labels,
  versionBadgeContent,
  versionBadgeTooltip,
  versionActions,
  versionDetails,
  extraSections,
}: AboutSettingsContentProps) {
  const tCommon = useTranslations("common.appVersion");
  // A "-" in the version means a pre-release build (e.g. 0.4.4-beta.1).
  const isPrerelease = packageMeta.version.includes("-");
  const versionBadge = (
    <>
      {versionBadgeContent ?? `v${packageMeta.version}`}
      <span className="text-muted-foreground">· {tCommon(isPrerelease ? "prerelease" : "stable")}</span>
    </>
  );

  return (
    <SettingsPage>
      <SettingsSection title={title}>
        <div className="space-y-5 px-0.5">
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex h-14 w-40 shrink-0 items-center sm:w-48">
              <DeeixLogo width={180} height={42} className="h-auto w-36 sm:w-44" />
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{consoleLabel}</span>
              {versionBadgeTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="cursor-default">
                      {versionBadge}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{versionBadgeTooltip}</TooltipContent>
                </Tooltip>
              ) : (
                <Badge variant="secondary">{versionBadge}</Badge>
              )}
              {versionActions ? <span className="ml-1.5 flex min-w-0 items-center gap-2">{versionActions}</span> : null}
            </div>
            {versionDetails}
          </div>

          <p className="max-w-[760px] text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </SettingsSection>

      <SettingsSection>
        <div className="space-y-1 px-0.5 pt-4 text-xs text-muted-foreground">
          <p>{labels.copyright}</p>
          <p>{labels.license}</p>
        </div>
      </SettingsSection>
      {extraSections}
    </SettingsPage>
  );
}
