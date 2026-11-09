import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type PublicSite = FunctionReturnType<typeof api.content.getPublicSite>;
export type AdminSite = FunctionReturnType<typeof api.content.getAdminSite>;
export type SiteSlide = AdminSite["slides"][number];
export type SiteService = AdminSite["services"][number];
export type HospitalInfo = NonNullable<AdminSite["info"]>;

export const DEFAULT_HOSPITAL_NAME = "Kwahu Government Hospital";
export const DEFAULT_TAGLINE =
  "Government healthcare for the people of the Kwahu ridge.";

export const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1800&q=80";
