import { Project } from "@/types/payload-types";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { CARD_SIZE, createGalleryLayout } from "./galleryLayout";
import {
  disposeGalleryMedia,
  drawGalleryMediaCover,
  GalleryMediaItem,
  loadGalleryMedia,
} from "./galleryMedia";

const ZOOM_LEVEL = 1;
const LERP_FACTOR = 0.075;
const DRAG_SPEED = 0.003;
const CLICK_THRESHOLD = 6;
const MAX_PIXEL_RATIO = 2;

const wrappedDelta = (delta: number, size: number) =>
  delta - Math.round(delta / size) * size;

export default function CanvasGallery({ projects }: { projects: Project[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const layout = createGalleryLayout(projects.length);
    const offset = { x: 0, y: 0 };
    const targetOffset = { x: 0, y: 0 };
    const previousPointer = { x: 0, y: 0 };
    let media: GalleryMediaItem[] = projects.map(() => ({ type: "empty" }));
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let animationFrameId = 0;
    let dragging = false;
    let dragDistance = 0;
    let disposed = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    };

    const draw = () => {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.fillStyle = "black";
      context.fillRect(0, 0, width, height);

      const pixelsPerWorldUnit = height / (2 * ZOOM_LEVEL);
      const cardWidth = CARD_SIZE.width * pixelsPerWorldUnit;
      const cardHeight = CARD_SIZE.height * pixelsPerWorldUnit;
      const visibleWorldWidth = width / pixelsPerWorldUnit;
      const visibleWorldHeight = height / pixelsPerWorldUnit;
      const copiesX =
        Math.ceil(visibleWorldWidth / (2 * layout.worldSize.x)) + 1;
      const copiesY =
        Math.ceil(visibleWorldHeight / (2 * layout.worldSize.y)) + 1;

      media.forEach((item, index) => {
        const position = layout.positions[index];
        if (!position || item.type === "empty") return;

        for (let copyX = -copiesX; copyX <= copiesX; copyX++) {
          for (let copyY = -copiesY; copyY <= copiesY; copyY++) {
            const worldX = position.x + copyX * layout.worldSize.x - offset.x;
            const worldY = position.y + copyY * layout.worldSize.y - offset.y;
            const x = width / 2 + worldX * pixelsPerWorldUnit - cardWidth / 2;
            const y = height / 2 - worldY * pixelsPerWorldUnit - cardHeight / 2;

            if (
              x >= width ||
              y >= height ||
              x + cardWidth <= 0 ||
              y + cardHeight <= 0
            ) {
              continue;
            }

            drawGalleryMediaCover(context, item, x, y, cardWidth, cardHeight);
          }
        }
      });
    };

    const animate = () => {
      if (disposed) return;

      offset.x += (targetOffset.x - offset.x) * LERP_FACTOR;
      offset.y += (targetOffset.y - offset.y) * LERP_FACTOR;
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };

    const getClickedProject = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const screenX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const screenY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      const worldX =
        screenX * (rect.width / rect.height) * ZOOM_LEVEL + offset.x;
      const worldY = screenY * ZOOM_LEVEL + offset.y;

      let closestIndex = -1;
      let closestDistance = Number.POSITIVE_INFINITY;

      layout.positions.forEach((position, index) => {
        const deltaX = wrappedDelta(worldX - position.x, layout.worldSize.x);
        const deltaY = wrappedDelta(worldY - position.y, layout.worldSize.y);

        if (
          Math.abs(deltaX) <= CARD_SIZE.width / 2 &&
          Math.abs(deltaY) <= CARD_SIZE.height / 2
        ) {
          const distance = deltaX * deltaX + deltaY * deltaY;
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });

      return closestIndex === -1 ? null : projects[closestIndex];
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      dragDistance = 0;
      previousPointer.x = event.clientX;
      previousPointer.y = event.clientY;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;

      const deltaX = event.clientX - previousPointer.x;
      const deltaY = event.clientY - previousPointer.y;
      dragDistance += Math.hypot(deltaX, deltaY);
      targetOffset.x -= deltaX * DRAG_SPEED;
      targetOffset.y += deltaY * DRAG_SPEED;
      previousPointer.x = event.clientX;
      previousPointer.y = event.clientY;
    };

    const endPointer = (event: PointerEvent, allowClick: boolean) => {
      if (!dragging) return;

      dragging = false;
      canvas.style.cursor = "grab";
      canvas.releasePointerCapture?.(event.pointerId);

      if (allowClick && dragDistance <= CLICK_THRESHOLD) {
        const project = getClickedProject(event.clientX, event.clientY);
        if (project?.slug) void router.push(`/projects/${project.slug}`);
      }
    };

    const onPointerUp = (event: PointerEvent) => endPointer(event, true);
    const onPointerCancel = (event: PointerEvent) => endPointer(event, false);
    const onContextMenu = (event: Event) => event.preventDefault();

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);
    canvas.addEventListener("contextmenu", onContextMenu);
    animationFrameId = requestAnimationFrame(animate);

    void loadGalleryMedia(projects, (loadedItem, index) => {
      if (disposed) {
        disposeGalleryMedia([loadedItem]);
        return;
      }
      media[index] = loadedItem;
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("contextmenu", onContextMenu);
      disposeGalleryMedia(media);
    };
  }, [projects, router]);

  return (
    <canvas
      ref={canvasRef}
      data-renderer="canvas2d"
      aria-label="Draggable project gallery"
      className="h-full w-full cursor-grab touch-none bg-black"
    />
  );
}
