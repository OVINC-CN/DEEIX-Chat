import { apiRequest } from "@/shared/api/http-client";

export type BrandingDTO = {
  title: string;
  shortName: string;
  description: string;
  logoURL: string;
  faviconURL: string;
};

export function getPublicBranding(): Promise<BrandingDTO> {
  return apiRequest<BrandingDTO>("/api/v1/branding");
}
