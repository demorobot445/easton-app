export const MAX_PROJECTS = 64;

export const CARD_SIZE = {
  width: 0.7,
  height: 1,
};

export type GalleryPoint = {
  x: number;
  y: number;
};

export const createGalleryLayout = (count: number) => {
  const safeCount = Math.min(count, MAX_PROJECTS);
  if (safeCount <= 0) {
    return {
      positions: [] as GalleryPoint[],
      mediaIndices: [] as number[],
      worldSize: { x: 1, y: 1 },
    };
  }

  const cols =
    safeCount <= 4 ? 2 : safeCount <= 12 ? 3 : safeCount <= 24 ? 4 : 5;
  const rows = Math.ceil(safeCount / cols);
  // Always fill a complete rows x cols grid, clamped to MAX_PROJECTS so the
  // padded uniform arrays never overflow their fixed GLSL size.
  const slotCount = Math.min(rows * cols, MAX_PROJECTS);
  const spacingX = 0.75;
  const spacingY = 1.05;
  const positions: GalleryPoint[] = [];
  const mediaIndices: number[] = [];

  for (let i = 0; i < slotCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const staggerOffset = col % 2 === 0 ? 0 : spacingY * 0.5;
    const x = col * spacingX - ((cols - 1) * spacingX) / 2;
    const y = -(row * spacingY + staggerOffset) + (rows * spacingY) / 2;

    positions.push({ x, y });
    // Cycle back through the real projects so every cell in the wrapped
    // grid has something in it - an unmapped slot here is what caused the
    // permanent blank cell.
    mediaIndices.push(i % safeCount);
  }

  return {
    positions,
    mediaIndices,
    worldSize: {
      x: cols * spacingX,
      y: Math.max(rows * spacingY, spacingY),
    },
  };
};
