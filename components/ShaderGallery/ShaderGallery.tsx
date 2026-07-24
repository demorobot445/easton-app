import { store } from "@/store";
import { Project } from "@/types/payload-types";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useSnapshot } from "valtio";
import CanvasGallery from "./CanvasGallery";
import {
  disposeGalleryMedia,
  drawGalleryMediaCover,
  GalleryMediaItem,
  loadGalleryMedia,
} from "./galleryMedia";
import { CARD_SIZE, createGalleryLayout, MAX_PROJECTS } from "./galleryLayout";
import { fragmentShader, vertexShader } from "./shader";

const ZOOM_LEVEL = 1;
const LERP_FACTOR = 0.075;
const DRAG_SPEED = 0.003;
const MAX_PIXEL_RATIO = 2;
const VIDEO_ATLAS_FPS = 24;
const ATLAS_TILE_HEIGHT = 256;
const ATLAS_TILE_WIDTH = Math.round(
  ATLAS_TILE_HEIGHT * (CARD_SIZE.width / CARD_SIZE.height),
);

const shouldPreferCanvasRenderer = () => {
  const requestedRenderer = new URLSearchParams(window.location.search).get(
    "renderer",
  );
  if (requestedRenderer === "canvas") return true;
  if (requestedRenderer === "webgl") return false;

  const { userAgent, platform, maxTouchPoints } = window.navigator;
  return (
    /Firefox|FxiOS/i.test(userAgent) ||
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
};

const createAtlas = (media: GalleryMediaItem[]) => {
  const atlasSize = Math.max(Math.ceil(Math.sqrt(media.length)), 1);
  const canvas = document.createElement("canvas");
  canvas.width = atlasSize * ATLAS_TILE_WIDTH;
  canvas.height = atlasSize * ATLAS_TILE_HEIGHT;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Unable to create the gallery texture atlas.");

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.flipY = false;

  const previousVideoTimes = new Map<number, number>();
  let previousUploadTime = Number.NEGATIVE_INFINITY;

  const drawTile = (item: GalleryMediaItem, index: number) => {
    const x = (index % atlasSize) * ATLAS_TILE_WIDTH;
    const y = Math.floor(index / atlasSize) * ATLAS_TILE_HEIGHT;

    context.save();
    context.translate(x, y + ATLAS_TILE_HEIGHT);
    context.scale(1, -1);
    const drawn = drawGalleryMediaCover(
      context,
      item,
      0,
      0,
      ATLAS_TILE_WIDTH,
      ATLAS_TILE_HEIGHT,
    );
    context.restore();
    return drawn;
  };

  const update = (timestamp: number, force = false) => {
    if (!force && timestamp - previousUploadTime < 1000 / VIDEO_ATLAS_FPS) {
      return;
    }

    let changed = false;

    media.forEach((item, index) => {
      if (item.type === "image") {
        if (force) changed = drawTile(item, index) || changed;
        return;
      }

      if (item.type !== "video" || item.video.readyState < 2) return;

      const previousTime = previousVideoTimes.get(index);
      if (!force && previousTime === item.video.currentTime) return;

      previousVideoTimes.set(index, item.video.currentTime);
      changed = drawTile(item, index) || changed;
    });

    if (changed) {
      texture.needsUpdate = true;
      previousUploadTime = timestamp;
    }
  };

  update(0, true);

  return { texture, update };
};

const wrappedDelta = (delta: number, size: number) =>
  delta - Math.round(delta / size) * size;

export default function ShaderGallery({ projects }: { projects: Project[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { activeCate } = useSnapshot(store);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);

  const filteredProjects = useMemo(() => {
    const matchingProjects =
      activeCate === "all"
        ? projects
        : projects.filter(
            (project) =>
              project.cate.trim().toLowerCase() ===
              activeCate.trim().toLowerCase(),
          );

    return matchingProjects.slice(0, MAX_PROJECTS);
  }, [activeCate, projects]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || useCanvasFallback) return;

    if (shouldPreferCanvasRenderer()) {
      setUseCanvasFallback(true);
      return;
    }

    let scene: THREE.Scene | null = null;
    let camera: THREE.OrthographicCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let plane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null =
      null;
    let atlas: ReturnType<typeof createAtlas> | null = null;
    let loadedMedia: GalleryMediaItem[] = [];
    let positions: THREE.Vector2[] = [];
    let worldSize = new THREE.Vector2(1, 1);
    let animationFrameId = 0;
    let disposed = false;
    let dragging = false;
    let clickCandidate = true;
    let pointerActive = false;

    const previousPointer = { x: 0, y: 0 };
    const offset = { x: 0, y: 0 };
    const targetOffset = { x: 0, y: 0 };

    const startDrag = (x: number, y: number) => {
      dragging = true;
      clickCandidate = true;
      pointerActive = true;
      previousPointer.x = x;
      previousPointer.y = y;
      document.body.classList.add("dragging");
    };

    const onPointerDown = (event: MouseEvent) => {
      if (!container.contains(event.target as Node)) return;
      startDrag(event.clientX, event.clientY);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!container.contains(event.target as Node)) return;
      event.preventDefault();
      const touch = event.touches[0];
      if (touch) startDrag(touch.clientX, touch.clientY);
    };

    const handleMove = (currentX?: number, currentY?: number) => {
      if (!dragging || currentX === undefined || currentY === undefined) return;

      const deltaX = currentX - previousPointer.x;
      const deltaY = currentY - previousPointer.y;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        clickCandidate = false;
      }

      targetOffset.x -= deltaX * DRAG_SPEED;
      targetOffset.y += deltaY * DRAG_SPEED;
      previousPointer.x = currentX;
      previousPointer.y = currentY;
    };

    const onPointerMove = (event: MouseEvent) =>
      handleMove(event.clientX, event.clientY);

    const onTouchMove = (event: TouchEvent) => {
      if (!pointerActive) return;
      event.preventDefault();
      const touch = event.touches[0];
      if (touch) handleMove(touch.clientX, touch.clientY);
    };

    const getEventPoint = (event: MouseEvent | TouchEvent) => {
      if ("changedTouches" in event) {
        const touch = event.changedTouches[0];
        return touch ? { x: touch.clientX, y: touch.clientY } : null;
      }
      return { x: event.clientX, y: event.clientY };
    };

    const getClickedProject = (event: MouseEvent | TouchEvent) => {
      if (!renderer) return null;
      const point = getEventPoint(event);
      if (!point) return null;

      const rect = renderer.domElement.getBoundingClientRect();
      const screenX = ((point.x - rect.left) / rect.width) * 2 - 1;
      const screenY = -(((point.y - rect.top) / rect.height) * 2 - 1);
      const worldX =
        screenX * (rect.width / rect.height) * ZOOM_LEVEL + offset.x;
      const worldY = screenY * ZOOM_LEVEL + offset.y;
      let closestIndex = -1;
      let closestDistance = Number.POSITIVE_INFINITY;

      positions.forEach((position, index) => {
        const deltaX = wrappedDelta(worldX - position.x, worldSize.x);
        const deltaY = wrappedDelta(worldY - position.y, worldSize.y);

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

      return closestIndex === -1 ? null : filteredProjects[closestIndex];
    };

    const onPointerUp = (event: MouseEvent | TouchEvent) => {
      if (!pointerActive) return;
      pointerActive = false;
      dragging = false;
      document.body.classList.remove("dragging");

      if (clickCandidate) {
        const project = getClickedProject(event);
        if (project?.slug) void router.push(`/projects/${project.slug}`);
      }
    };

    const onResize = () => {
      if (!renderer || !camera || !plane) return;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
      );
      renderer.setSize(width, height);
      camera.updateProjectionMatrix();
      plane.material.uniforms.uResolution.value.set(width, height);
    };

    const onContextMenu = (event: Event) => event.preventDefault();
    const onContextLost = (event: Event) => {
      event.preventDefault();
      if (!disposed) setUseCanvasFallback(true);
    };

    const addEventListeners = () => {
      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("mousemove", onPointerMove);
      document.addEventListener("mouseup", onPointerUp);
      document.addEventListener("mouseleave", onPointerUp);
      document.addEventListener("touchstart", onTouchStart, { passive: false });
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onPointerUp, { passive: false });
      document.addEventListener("contextmenu", onContextMenu);
      window.addEventListener("resize", onResize);
    };

    const animate = (timestamp: number) => {
      if (disposed || !renderer || !scene || !camera) return;

      offset.x += (targetOffset.x - offset.x) * LERP_FACTOR;
      offset.y += (targetOffset.y - offset.y) * LERP_FACTOR;

      if (plane) {
        plane.material.uniforms.uOffset.value.set(offset.x, offset.y);
      }

      atlas?.update(timestamp);
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    const init = async () => {
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "low-power",
      });
      renderer.domElement.dataset.renderer = "webgl2";
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
      );
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      renderer.setClearColor(0x000000, 1);
      renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
      container.appendChild(renderer.domElement);

      loadedMedia = await loadGalleryMedia(filteredProjects);
      if (disposed) {
        disposeGalleryMedia(loadedMedia);
        return;
      }

      const layout = createGalleryLayout(filteredProjects.length);
      positions = layout.positions.map(
        (position) => new THREE.Vector2(position.x, position.y),
      );
      worldSize = new THREE.Vector2(layout.worldSize.x, layout.worldSize.y);
      const uniformPositions = Array.from(
        { length: MAX_PROJECTS },
        (_, index) => positions[index] ?? new THREE.Vector2(0, 0),
      );

      atlas = createAtlas(loadedMedia);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uOffset: { value: new THREE.Vector2(0, 0) },
          uResolution: {
            value: new THREE.Vector2(
              container.offsetWidth,
              container.offsetHeight,
            ),
          },
          uBackgroundColor: { value: new THREE.Vector4(0, 0, 0, 1) },
          uZoom: { value: ZOOM_LEVEL },
          uCellSize: {
            value: new THREE.Vector2(CARD_SIZE.width, CARD_SIZE.height),
          },
          uTextureCount: { value: filteredProjects.length },
          uPositions: { value: uniformPositions },
          uWorldSize: { value: worldSize },
          uImageAtlas: { value: atlas.texture },
        },
      });

      plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(plane);
      renderer.compile(scene, camera);
      addEventListeners();
      animationFrameId = requestAnimationFrame(animate);
    };

    void init().catch((error: unknown) => {
      console.warn("WebGL2 is unavailable; using the Canvas2D gallery.", error);
      if (!disposed) setUseCanvasFallback(true);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      document.body.classList.remove("dragging");
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseup", onPointerUp);
      document.removeEventListener("mouseleave", onPointerUp);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onPointerUp);
      document.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("resize", onResize);

      if (renderer) {
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          onContextLost,
        );
      }

      plane?.geometry.dispose();
      plane?.material.dispose();
      atlas?.texture.dispose();
      disposeGalleryMedia(loadedMedia);

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [filteredProjects, router, useCanvasFallback]);

  return (
    <div
      id="gallery"
      ref={containerRef}
      data-renderer={useCanvasFallback ? "canvas2d" : "webgl2"}
      className="h-full w-full bg-black"
    >
      {useCanvasFallback && <CanvasGallery projects={filteredProjects} />}
    </div>
  );
}
