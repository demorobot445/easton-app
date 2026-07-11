import { Media } from "@/types/payload-types";

export function getMediaUrl(media: string | Media | null | undefined): string {
  if (!media) return "";
  if (typeof media === "string") return ""; // Media ID without populated object
  if (typeof media === "object" && typeof media.url === "string") {
    return `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}${media.url}` || "";
  }
  return "";
}
