"use client";

import * as React from "react";

import type { BrandingDTO } from "@/shared/api/branding";
import { DEFAULT_BRANDING } from "@/shared/config/branding";
import { useBrandingLoader } from "@/shared/config/use-branding-loader";

const BrandingContext = React.createContext<BrandingDTO>(DEFAULT_BRANDING);

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
  const { branding, ready } = useBrandingLoader();

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
