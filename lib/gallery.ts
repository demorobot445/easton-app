import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shader";

export async function initGallery(container: HTMLDivElement) {
  let scene: THREE.Scene;
  let camera: THREE.OrthographicCamera;
  let renderer: THREE.WebGLRenderer;
  let plane: THREE.Mesh;

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

  container.appendChild(renderer.domElement);

  async function loadTextures() {
    const loader = new THREE.TextureLoader();

    const promises = [...Array(64)].map(
      (p, i) =>
        new Promise<THREE.Texture>((resolve, reject) => {
          loader.load(
            `/media/${i}.jpg`,
            (texture) => resolve(texture),
            undefined,
            (err) => reject(err),
          );
        }),
    );

    return Promise.all(promises);
  }

  const atlasSize = Math.ceil(Math.sqrt(64));
  const texSize = 512;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = atlasSize * texSize;

  const ctx = canvas.getContext("2d")!;

  const textures = await loadTextures();

  textures.forEach((texture, i) => {
    const img = texture.image as HTMLImageElement;

    const x = (i % atlasSize) * texSize;
    const y = Math.floor(i / atlasSize) * texSize;

    ctx.drawImage(img, x, y, texSize, texSize);
  });

  const atlas = new THREE.CanvasTexture(canvas);

  atlas.flipY = false;
  atlas.needsUpdate = true;
  atlas.wrapS = THREE.ClampToEdgeWrapping;
  atlas.wrapT = THREE.ClampToEdgeWrapping;
  atlas.minFilter = THREE.LinearFilter;
  atlas.magFilter = THREE.LinearFilter;

  const uniforms = {
    uOffset: { value: new THREE.Vector2() },
    uResolution: {
      value: new THREE.Vector2(container.clientWidth, container.clientHeight),
    },
    uZoom: { value: 1 },
    uCellSize: {
      value: new THREE.Vector2(config.cellSize.x, config.cellSize.y),
    },
    uTextureCount: { value: textures.length },
    uImageAtlas: { value: atlas },
  };

  const geometry = new THREE.PlaneGeometry(2, 2);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });

  plane = new THREE.Mesh(geometry, material);

  scene.add(plane);

  function animate() {
    requestAnimationFrame(animate);

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

  container.addEventListener("mousedown", (e) => {
    dragging = true;
    prev.x = e.clientX;
    prev.y = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;

    targetOffset.x -= dx * 0.003;
    targetOffset.y += dy * 0.003;

    prev.x = e.clientX;
    prev.y = e.clientY;
  });

  window.addEventListener("resize", () => {
    renderer.setSize(container.clientWidth, container.clientHeight);

    material.uniforms.uResolution.value.set(
      container.clientWidth,
      container.clientHeight,
    );
  });
}
