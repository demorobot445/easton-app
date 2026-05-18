// ShaderGallery.tsx
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shader";
import { useRouter } from "next/router";
import type { Project } from "./projects";
import { projects } from "./projects";
import { useSnapshot } from "valtio";
import { store } from "@/store";

type AtlasTexture = THREE.Texture & {
  source?: {
    data?: HTMLCanvasElement;
  };
  image?: HTMLImageElement & { complete?: boolean };
};

const config = {
  cellSize: 1.0,
  zoomLevel: 1.25,
  lerpFactor: 0.075,
  borderColor: "rgba(255, 255, 255, 0.15)",
  backgroundColor: "rgba(0, 0, 0, 1)",
  textColor: "rgba(128, 128, 128, 1)",
  hoverColor: "rgba(255, 255, 255, 0)",
};

let zoomLevel = 1.0;

const MAX_PROJECTS = 64;

const createLayout = (count: number) => {
  const safeCount = Math.min(count, MAX_PROJECTS);

  const cols =
    safeCount <= 4 ? 2 : safeCount <= 12 ? 3 : safeCount <= 24 ? 4 : 5;

  const spacingX = 0.75;
  const spacingY = config.cellSize;

  const positions: THREE.Vector2[] = [];

  for (let i = 0; i < safeCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    // stagger every second column
    const staggerOffset = col % 2 === 0 ? 0 : spacingY * 0.5;

    const x = col * spacingX - ((cols - 1) * spacingX) / 2;

    const y =
      -(row * spacingY + staggerOffset) +
      (Math.ceil(safeCount / cols) * spacingY) / 2;

    positions.push(new THREE.Vector2(x, y));
  }

  const rows = Math.ceil(safeCount / cols);

  const worldWidth = cols * spacingX;
  const worldHeight = rows * spacingY;

  return {
    positions: Array.from(
      { length: MAX_PROJECTS },
      (_, i) => positions[i] ?? new THREE.Vector2(0, 0),
    ),
    worldSize: new THREE.Vector2(worldWidth, worldHeight),
  };
};

const rgbaToArray = (rgba: string): [number, number, number, number] => {
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  if (!match) return [1, 1, 1, 1];

  const values = match[1].split(",").map((v) => v.trim());
  return [
    parseFloat(values[0]) / 255,
    parseFloat(values[1]) / 255,
    parseFloat(values[2]) / 255,
    values.length > 3 ? parseFloat(values[3]) : 1,
  ];
};

const createTextureAtlas = (textures: AtlasTexture[], isText = false) => {
  const atlasSize = Math.ceil(Math.sqrt(textures.length));
  const textureSize = 512;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = atlasSize * textureSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to get 2D context for texture atlas.");

  if (isText) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  textures.forEach((texture, index) => {
    const x = (index % atlasSize) * textureSize;
    const y = Math.floor(index / atlasSize) * textureSize;

    if (isText && texture.source?.data) {
      ctx.drawImage(texture.source.data, x, y, textureSize, textureSize);
    } else if (!isText && texture.image?.complete) {
      ctx.save();
      ctx.translate(x, y + textureSize);
      ctx.scale(1, -1);
      ctx.drawImage(texture.image, 0, 0, textureSize, textureSize);
      ctx.restore();
    }
  });

  const atlasTexture = new THREE.CanvasTexture(canvas);
  atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
  atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
  atlasTexture.minFilter = THREE.LinearFilter;
  atlasTexture.magFilter = THREE.LinearFilter;
  atlasTexture.flipY = false;

  return atlasTexture;
};

const loadTextures = (
  projects: Project[],
): Promise<{
  imageTextures: AtlasTexture[];
}> => {
  const textureLoader = new THREE.TextureLoader();
  const imageTextures: AtlasTexture[] = [];
  let loadedCount = 0;

  return new Promise((resolve) => {
    projects.forEach((project: Project) => {
      const texture = textureLoader.load(
        project.mediaSrc || "/placeholder-image-product.webp",
        () => {
          loadedCount += 1;
          if (loadedCount === projects.length) {
            resolve({ imageTextures });
          }
        },
      );

      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      imageTextures.push(texture as AtlasTexture);
    });
  });
};

export default function ShaderGallery() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  const { activeCate } = useSnapshot(store);

  const filteredProjects =
    activeCate === "all"
      ? projects
      : projects.filter(
          (p) =>
            p.cate.trim().toLowerCase() === activeCate.trim().toLowerCase(),
        );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (filteredProjects.length > 64) {
      console.warn("Too many projects for MAX_PROJECTS = 64");
    }

    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    let renderer: THREE.WebGLRenderer;
    let plane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null =
      null;

    let isDragging = false;
    let isClick = true;
    let clickStartTime = 0;

    const previousMouse = { x: 0, y: 0 };
    const offset = { x: 0, y: 0 };
    const targetOffset = { x: 0, y: 0 };

    let animationFrameId = 0;
    let disposed = false;

    let positions: THREE.Vector2[] = [];
    let worldSize = new THREE.Vector2(20, 20);

    const startDrag = (x: number, y: number) => {
      isDragging = true;
      isClick = true;
      clickStartTime = Date.now();

      document.body.classList.add("dragging");

      previousMouse.x = x;
      previousMouse.y = y;
    };

    const onPointerDown = (e: MouseEvent) => startDrag(e.clientX, e.clientY);

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) startDrag(touch.clientX, touch.clientY);
    };

    const handleMove = (currentX?: number, currentY?: number) => {
      if (!isDragging || currentX === undefined || currentY === undefined)
        return;

      const deltaX = currentX - previousMouse.x;
      const deltaY = currentY - previousMouse.y;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        isClick = false;
      }

      targetOffset.x -= deltaX * 0.003;
      targetOffset.y += deltaY * 0.003;

      previousMouse.x = currentX;
      previousMouse.y = currentY;
    };

    const onPointerMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) handleMove(touch.clientX, touch.clientY);
    };

    const wrappedDelta = (delta: number, size: number) => {
      return delta - Math.round(delta / size) * size;
    };

    const onPointerUp = (event: MouseEvent | TouchEvent) => {
      isDragging = false;
      document.body.classList.remove("dragging");

      if (isClick && Date.now() - clickStartTime < 200) {
        const mouseEvent = event as MouseEvent;
        const touchEvent = event as TouchEvent;

        const endX =
          mouseEvent.clientX || touchEvent.changedTouches?.[0]?.clientX;
        const endY =
          mouseEvent.clientY || touchEvent.changedTouches?.[0]?.clientY;

        if (endX !== undefined && endY !== undefined) {
          const rect = renderer.domElement.getBoundingClientRect();
          const screenX = ((endX - rect.left) / rect.width) * 2 - 1;
          const screenY = -(((endY - rect.top) / rect.height) * 2 - 1);

          const radius = Math.sqrt(screenX * screenX + screenY * screenY);
          const distortion = 1.0 - 0.08 * radius * radius;

          const worldX =
            screenX * distortion * (rect.width / rect.height) * zoomLevel +
            offset.x;
          const worldY = screenY * distortion * zoomLevel + offset.y;

          let clickedIndex = -1;
          let minDist = Infinity;

          positions.forEach((pos, i) => {
            const dx = wrappedDelta(worldX - pos.x, worldSize.x);
            const dy = wrappedDelta(worldY - pos.y, worldSize.y);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < config.cellSize * 0.5 && dist < minDist) {
              minDist = dist;
              clickedIndex = i;
            }
          });

          if (clickedIndex !== -1) {
            const project = filteredProjects[clickedIndex] as Project;
            if (project?.slug) {
              console.log(project.slug);
              router.push(`/projects/${project.slug}`);
            }
          }
        }
      }
    };

    const onWindowResize = () => {
      const currentContainer = containerRef.current;
      if (!currentContainer) return;

      const { offsetWidth: width, offsetHeight: height } = currentContainer;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);

      plane?.material.uniforms.uResolution.value.set(width, height);
    };

    const preventContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const setupEventListeners = () => {
      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("mousemove", onPointerMove);
      document.addEventListener("mouseup", onPointerUp);
      document.addEventListener("mouseleave", onPointerUp);

      const passiveOpts: AddEventListenerOptions = { passive: false };
      document.addEventListener("touchstart", onTouchStart, passiveOpts);
      document.addEventListener("touchmove", onTouchMove, passiveOpts);
      document.addEventListener("touchend", onPointerUp, passiveOpts);

      window.addEventListener("resize", onWindowResize);
      document.addEventListener("contextmenu", preventContextMenu);

      renderer.domElement.addEventListener("dblclick", onPointerUp);
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      offset.x += (targetOffset.x - offset.x) * config.lerpFactor;
      offset.y += (targetOffset.y - offset.y) * config.lerpFactor;

      if (plane?.material.uniforms) {
        plane.material.uniforms.uOffset.value.set(offset.x, offset.y);
        plane.material.uniforms.uZoom.value = zoomLevel;
      }

      renderer.render(scene, camera);
    };

    const init = async () => {
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      const bgColor = rgbaToArray(config.backgroundColor);
      renderer.setClearColor(
        new THREE.Color(bgColor[0], bgColor[1], bgColor[2]),
        bgColor[3],
      );

      container.appendChild(renderer.domElement);

      const { imageTextures } = await loadTextures(filteredProjects);
      if (disposed) {
        imageTextures.forEach((t) => t.dispose());

        return;
      }

      const layout = createLayout(filteredProjects.length);
      positions = layout.positions;
      worldSize = layout.worldSize;

      const imageAtlas = createTextureAtlas(imageTextures, false);

      imageTextures.forEach((t) => t.dispose());

      const uniforms = {
        uOffset: { value: new THREE.Vector2(0, 0) },
        uResolution: {
          value: new THREE.Vector2(
            container.offsetWidth,
            container.offsetHeight,
          ),
        },
        // uBorderColor: {
        //   value: new THREE.Vector4(...rgbaToArray(config.borderColor)),
        // },
        // uHoverColor: {
        //   value: new THREE.Vector4(...rgbaToArray(config.hoverColor)),
        // },
        uBackgroundColor: {
          value: new THREE.Vector4(...rgbaToArray(config.backgroundColor)),
        },
        // uMousePos: { value: new THREE.Vector2(-1, -1) },
        uZoom: { value: 1.0 },
        uCellSize: {
          value: new THREE.Vector2(0.7, 0.95),
        },
        uTextureCount: { value: filteredProjects.length },
        uPositions: { value: positions },
        uWorldSize: { value: worldSize },
        uImageAtlas: { value: imageAtlas },
      };

      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
      });

      plane = new THREE.Mesh(geometry, material);
      scene.add(plane);

      setupEventListeners();
      animate();
    };

    init();

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
      renderer.domElement.removeEventListener("dblclick", onPointerUp);

      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("contextmenu", preventContextMenu);

      if (plane) {
        plane.geometry.dispose();
        plane.material.dispose();

        const uniforms = plane.material.uniforms as Record<
          string,
          { value: unknown }
        >;
        const imageAtlas = uniforms.uImageAtlas?.value as
          | THREE.Texture
          | undefined;
        const textAtlas = uniforms.uTextAtlas?.value as
          | THREE.Texture
          | undefined;

        imageAtlas?.dispose();
        textAtlas?.dispose();
      }

      renderer?.dispose();

      if (
        container &&
        renderer?.domElement &&
        container.contains(renderer.domElement)
      ) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [filteredProjects]);

  return (
    <div
      id="gallery"
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
