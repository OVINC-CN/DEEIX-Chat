import type { BrandingDTO } from "@/shared/api/branding";

export const DEFAULT_BRANDING: BrandingDTO = {
  title: "OVINC Chat",
  shortName: "OVINC",
  description: "OVINC Chat is a multi-model AI conversation system.",
  logoURL: "",
  faviconURL: "/favicon.png",
};

let brandingSnapshot = DEFAULT_BRANDING;

export function getBrandingSnapshot(): BrandingDTO {
  return brandingSnapshot;
}

export function setBrandingSnapshot(branding: BrandingDTO): void {
  brandingSnapshot = branding;
}

export function replaceDefaultBrandTitle(value: string, brandTitle: string): string {
  if (brandTitle === DEFAULT_BRANDING.title) {
    return value;
  }
  return value.replaceAll(DEFAULT_BRANDING.title, () => brandTitle);
}
