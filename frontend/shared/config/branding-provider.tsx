"use client";

import * as React from "react";

import { getPublicBranding, type BrandingDTO } from "@/shared/api/branding";
import {
  DEFAULT_BRANDING,
  setBrandingSnapshot,
} from "@/shared/config/branding";

const BRANDING_FALLBACK_DELAY_MS = 3_000;
const BRANDING_RETRY_DELAY_MS = 1_000;
const BrandingContext = React.createContext<BrandingDTO>(DEFAULT_BRANDING);

let brandingRequest: Promise<BrandingDTO> | null = null;

function requestBranding(): Promise<BrandingDTO> {
  brandingRequest ??= getPublicBranding().catch((error) => {
    brandingRequest = null;
    throw error;
  });
  return brandingRequest;
}

function BrandingMetadata({ branding }: { branding: BrandingDTO }) {
  return (
    <>
      <title>{branding.title}</title>
      <meta name="application-name" content={branding.title} />
      <meta name="description" content={branding.description} />
      <link rel="icon" href={branding.faviconURL} />
    </>
  );
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = React.useState(DEFAULT_BRANDING);
  const [ready, setReady] = React.useState(false);

  React.useLayoutEffect(() => {
    let active = true;
    const fallbackTimer = window.setTimeout(() => {
      if (active) {
        setReady(true);
      }
    }, BRANDING_FALLBACK_DELAY_MS);
    let retryTimer: number | undefined;
    const applyBranding = (nextBranding: BrandingDTO) => {
      setBrandingSnapshot(nextBranding);
      if (!active) {
        return;
      }
      window.clearTimeout(fallbackTimer);
      setBranding(nextBranding);
      setReady(true);
    };
    const handleLoadFailure = () => {
      if (!active) {
        return;
      }
      window.clearTimeout(fallbackTimer);
      setReady(true);
      retryTimer = window.setTimeout(() => {
        void requestBranding().then(applyBranding).catch(() => undefined);
      }, BRANDING_RETRY_DELAY_MS);
    };

    void requestBranding().then(applyBranding).catch(handleLoadFailure);

    return () => {
      active = false;
      window.clearTimeout(fallbackTimer);
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  React.useLayoutEffect(() => {
    if (ready) {
      document.documentElement.removeAttribute("data-branding-pending");
    }
  }, [ready]);

  return (
    <BrandingContext.Provider value={branding}>
      {ready ? <BrandingMetadata branding={branding} /> : null}
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingDTO {
  return React.useContext(BrandingContext);
}
