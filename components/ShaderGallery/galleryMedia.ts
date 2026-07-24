import { Project } from "@/types/payload-types";
import { getProxiedMediaUrl } from "@/utils/getMediaUrl";

export type GalleryMediaItem =
  | { type: "image"; image: HTMLImageElement }
  | { type: "video"; video: HTMLVideoElement }
  | { type: "empty" };

const MEDIA_LOAD_TIMEOUT_MS = 12_000;

const loadImage = (url: string): Promise<GalleryMediaItem> =>
  new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = (item: GalleryMediaItem) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      image.onload = null;
      image.onerror = null;
      resolve(item);
    };

    const timeoutId = window.setTimeout(() => {
      finish({ type: "empty" });
      image.removeAttribute("src");
    }, MEDIA_LOAD_TIMEOUT_MS);

    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => finish({ type: "image", image });
    image.onerror = () => finish({ type: "empty" });
    image.src = url;
  });

const loadVideo = (url: string): Promise<GalleryMediaItem> =>
  new Promise((resolve) => {
    const video = document.createElement("video");
    let settled = false;

    const finish = (item: GalleryMediaItem) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      video.onloadeddata = null;
      video.onerror = null;
      resolve(item);
    };

    const timeoutId = window.setTimeout(() => {
      finish({ type: "empty" });
      video.pause();
      video.removeAttribute("src");
      video.load();
    }, MEDIA_LOAD_TIMEOUT_MS);

    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadeddata = () => {
      void video.play().catch(() => undefined);
      finish({ type: "video", video });
    };
    video.onerror = () => finish({ type: "empty" });
    video.src = url;
    video.load();
  });

export const loadGalleryMedia = async (
  projects: Project[],
  onItemLoaded?: (item: GalleryMediaItem, index: number) => void,
): Promise<GalleryMediaItem[]> =>
  Promise.all(
    projects.map(async (project, index) => {
      let item: GalleryMediaItem;

      if (typeof project.heroMedia === "string") {
        item = { type: "empty" };
      } else {
        const url = getProxiedMediaUrl(project.heroMedia);

        if (!url) {
          item = { type: "empty" };
        } else {
          item = await (project.heroMedia.mimeType?.startsWith("video/")
            ? loadVideo(url)
            : loadImage(url));
        }
      }

      onItemLoaded?.(item, index);
      return item;
    }),
  );

export const disposeGalleryMedia = (media: GalleryMediaItem[]) => {
  media.forEach((item) => {
    if (item.type === "image") {
      item.image.onload = null;
      item.image.onerror = null;
      item.image.removeAttribute("src");
    } else if (item.type === "video") {
      item.video.pause();
      item.video.onloadeddata = null;
      item.video.onerror = null;
      item.video.removeAttribute("src");
      item.video.load();
    }
  });
};

export const drawGalleryMediaCover = (
  context: CanvasRenderingContext2D,
  item: GalleryMediaItem,
  destinationX: number,
  destinationY: number,
  destinationWidth: number,
  destinationHeight: number,
) => {
  if (item.type === "empty") return false;

  const source = item.type === "image" ? item.image : item.video;
  const sourceWidth =
    item.type === "image" ? item.image.naturalWidth : item.video.videoWidth;
  const sourceHeight =
    item.type === "image" ? item.image.naturalHeight : item.video.videoHeight;

  if (sourceWidth <= 0 || sourceHeight <= 0) return false;

  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = destinationWidth / destinationHeight;
  let sourceX = 0;
  let sourceY = 0;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceAspect > targetAspect) {
    cropWidth = sourceHeight * targetAspect;
    sourceX = (sourceWidth - cropWidth) / 2;
  } else if (sourceAspect < targetAspect) {
    cropHeight = sourceWidth / targetAspect;
    sourceY = (sourceHeight - cropHeight) / 2;
  }

  context.drawImage(
    source,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    destinationX,
    destinationY,
    destinationWidth,
    destinationHeight,
  );

  return true;
};
