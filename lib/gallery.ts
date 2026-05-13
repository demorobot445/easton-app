import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shader";
import { projects } from "./projects";
import { NextRouter } from "next/router";

type Cate = "all" | "creative" | "commerical";

export async function initGallery(
  container: HTMLDivElement,
  router: NextRouter,
) {
  let scene: THREE.Scene;
  let camera: THREE.OrthographicCamera;
  let renderer: THREE.WebGLRenderer;
  let plane: THREE.Mesh;
  let material: THREE.ShaderMaterial;

  let rafId: number;

  let offset = { x: 0, y: 0 };
  let targetOffset = { x: 0, y: 0 };

  let zoomLevel = 1;
  let targetZoom = 1;

  const config = {
    cellSize: { x: 0.75, y: 1 },
    lerp: 0.075,
  };

  scene = new THREE.Scene();

  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);

  // remove any old canvas
  const existingCanvas = container.querySelector("canvas");
  if (existingCanvas) existingCanvas.remove();

  container.appendChild(renderer.domElement);

  const uniforms = {
    uOffset: { value: new THREE.Vector2() },
    uResolution: {
      value: new THREE.Vector2(container.clientWidth, container.clientHeight),
    },
    uZoom: { value: 1 },
    uCellSize: {
      value: new THREE.Vector2(config.cellSize.x, config.cellSize.y),
    },
    uTextureCount: { value: 0 },
    uImageAtlas: { value: null as any },
  };

  const geometry = new THREE.PlaneGeometry(2, 2);

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });

  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  function animate() {
    rafId = requestAnimationFrame(animate);

    offset.x += (targetOffset.x - offset.x) * config.lerp;
    offset.y += (targetOffset.y - offset.y) * config.lerp;
    zoomLevel += (targetZoom - zoomLevel) * config.lerp;

    material.uniforms.uOffset.value.set(offset.x, offset.y);
    material.uniforms.uZoom.value = zoomLevel;

    renderer.render(scene, camera);
  }

  animate();

  let dragging = false;
  let prev = { x: 0, y: 0 };
  let downPos = { x: 0, y: 0 };
  let moved = 0;

  function onMouseDown(e: MouseEvent) {
    dragging = true;
    moved = 0;
    prev.x = e.clientX;
    prev.y = e.clientY;
    downPos.x = e.clientX;
    downPos.y = e.clientY;
  }

  function onMouseUp(e: MouseEvent) {
    if (!dragging) return;
    dragging = false;

    const dx = e.clientX - downPos.x;
    const dy = e.clientY - downPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 6) {
      router.push("index");
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging) return;

    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;

    targetOffset.x -= dx * 0.003;
    targetOffset.y += dy * 0.003;

    prev.x = e.clientX;
    prev.y = e.clientY;
  }

  function onResize() {
    renderer.setSize(container.clientWidth, container.clientHeight);

    material.uniforms.uResolution.value.set(
      container.clientWidth,
      container.clientHeight,
    );
  }

  container.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("resize", onResize);

  async function buildAtlas(filteredProjects: typeof projects) {
    const loader = new THREE.TextureLoader();

    const textures = await Promise.all(
      filteredProjects.map(
        (p) =>
          new Promise<THREE.Texture>((resolve, reject) => {
            loader.load(p.mediaSrc, resolve, undefined, reject);
          }),
      ),
    );

    const atlasSize = Math.ceil(Math.sqrt(filteredProjects.length));
    const texSize = 512;

    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = atlasSize * texSize;

    const ctx = canvas.getContext("2d")!;

    textures.forEach((texture, i) => {
      const img = texture.image as HTMLImageElement;

      const x = (i % atlasSize) * texSize;
      const y = Math.floor(i / atlasSize) * texSize;

      ctx.drawImage(img, x, y, texSize, texSize);
    });

    const atlas = new THREE.CanvasTexture(canvas);
    atlas.flipY = false;
    atlas.minFilter = THREE.LinearFilter;
    atlas.magFilter = THREE.LinearFilter;
    atlas.needsUpdate = true;

    return {
      atlas,
      count: filteredProjects.length,
    };
  }

  async function updateCategory(cate: Cate) {
    const filtered =
      cate === "all"
        ? projects
        : projects.filter((p) => p.cate.trim() === cate.trim());

    const { atlas, count } = await buildAtlas(filtered);

    // Dispose old atlas
    const oldAtlas = material.uniforms.uImageAtlas.value;
    if (oldAtlas) oldAtlas.dispose();

    // Assign new atlas
    material.uniforms.uImageAtlas.value = atlas;
    material.uniforms.uTextureCount.value = count;

    // Force shader refresh
    material.needsUpdate = true; // <-- change here
  }

  function destroy() {
    cancelAnimationFrame(rafId);

    container.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("resize", onResize);

    renderer.dispose();
    plane.geometry.dispose();
    material.dispose();

    renderer.domElement.remove();
  }

  return {
    updateCategory,
    destroy,
  };
}
