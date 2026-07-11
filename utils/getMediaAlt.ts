import { Media } from "@/types/payload-types";

export function getMediaAlt(media: string | Media | null | undefined): string {
  if (!media) return "";
  if (typeof media === "string") return ""; // Media ID without populated object
  if (typeof media === "object" && typeof media.alt === "string") {
    return media.alt || "";
  }
  return "";
}
