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
  const cols =
    safeCount <= 4 ? 2 : safeCount <= 12 ? 3 : safeCount <= 24 ? 4 : 5;
  const spacingX = 0.75;
  const spacingY = 1.05;
  const positions: GalleryPoint[] = [];

  for (let i = 0; i < safeCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const staggerOffset = col % 2 === 0 ? 0 : spacingY * 0.5;
    const x = col * spacingX - ((cols - 1) * spacingX) / 2;
    const y =
      -(row * spacingY + staggerOffset) +
      (Math.ceil(safeCount / cols) * spacingY) / 2;

    positions.push({ x, y });
  }

  const rows = Math.ceil(safeCount / cols);

  return {
    positions,
    worldSize: {
      x: cols * spacingX,
      y: Math.max(rows * spacingY, spacingY),
    },
  };
};
