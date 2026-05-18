export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
#define MAX_PROJECTS 64

uniform vec2 uOffset;
uniform vec2 uResolution;
uniform vec4 uBackgroundColor;
uniform float uZoom;
uniform vec2 uCellSize;
uniform float uTextureCount;
uniform vec2 uWorldSize;

uniform vec2 uPositions[MAX_PROJECTS];
uniform sampler2D uImageAtlas;

varying vec2 vUv;

vec2 wrapCoord(vec2 p, vec2 size) {
  return mod(p + size * 0.5, size) - size * 0.5;
}

void main() {
  vec2 screenUV = (vUv - 0.5) * 2.0;

  vec2 aspectRatio = vec2(
    uResolution.x / uResolution.y,
    1.0
  );

  vec2 worldCoord = screenUV * aspectRatio;
  worldCoord *= uZoom;
  worldCoord += uOffset;

  vec3 color = uBackgroundColor.rgb;

  for (int i = 0; i < MAX_PROJECTS; i++) {
    if (i >= int(uTextureCount)) break;

    vec2 center = uPositions[i];

    // Use wrapped shortest distance so edge cards do not get cut
    vec2 delta = wrapCoord(worldCoord - center, uWorldSize);

    vec2 local = delta / uCellSize + 0.5;

    bool inside =
      local.x >= 0.0 &&
      local.x <= 1.0 &&
      local.y >= 0.0 &&
      local.y <= 1.0;

    if (inside) {
      float texIndex = float(i);
      float atlasSize = ceil(sqrt(uTextureCount));

      vec2 atlasPos = vec2(
        mod(texIndex, atlasSize),
        floor(texIndex / atlasSize)
      );

      vec2 atlasUV = (atlasPos + local) / atlasSize;

      color = texture2D(uImageAtlas, atlasUV).rgb;
      break;
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
`;
