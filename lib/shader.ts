export const vertexShader = `
    precision highp float;
    precision highp int;

    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
precision highp float;
precision highp int;

uniform vec2 uOffset;
uniform vec2 uResolution;
uniform vec4 uBorderColor;
uniform vec4 uHoverColor;
uniform vec4 uBackgroundColor;
uniform vec2 uMousePos;
uniform float uZoom;
uniform vec2 uCellSize;
uniform float uTextureCount;
uniform sampler2D uImageAtlas;
uniform sampler2D uTextAtlas;

varying vec2 vUv;

void main() {
    // --- Normalize coordinates ---
    vec2 screenUV = (vUv - 0.5) * 2.0;
    float radius = length(screenUV);
    vec2 distortedUV = screenUV;
    vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 worldCoord = distortedUV * aspectRatio * uZoom + uOffset;

    // --- Pinterest stagger ---
    float staggerOffset = mod(floor(worldCoord.x / uCellSize.x), 2.0) > 0.5 ? uCellSize.y * 0.5 : 0.0;
    vec2 staggeredWorldCoord = worldCoord;
    staggeredWorldCoord.y -= staggerOffset;

    // --- Compute cell ID and UV ---
    vec2 cellPos = staggeredWorldCoord / uCellSize;
    vec2 cellId = floor(cellPos);
    vec2 cellUV = fract(cellPos);

    // --- Mouse hover ---
    vec2 mouseScreenUV = (uMousePos / uResolution) * 2.0 - 1.0;
    mouseScreenUV.y = -mouseScreenUV.y;
    vec2 mouseWorld = mouseScreenUV * aspectRatio * uZoom + uOffset;
    float mouseStagger = mod(floor(mouseWorld.x / uCellSize.x), 2.0) > 0.5 ? uCellSize.y * 0.5 : 0.0;
    mouseWorld.y -= mouseStagger;
    vec2 mouseCellPos = mouseWorld / uCellSize;
    vec2 mouseCellId = floor(mouseCellPos);

    float cellDistance = length((cellId + 0.5) - (mouseCellId + 0.5));
    float hoverIntensity = 1.0 - smoothstep(0.4, 0.7, cellDistance);
    bool isHovered = hoverIntensity > 0.0 && uMousePos.x > 0.0;

    vec3 backgroundColor = uBackgroundColor.rgb;
    if (isHovered) {
        backgroundColor = mix(uBackgroundColor.rgb, uHoverColor.rgb, hoverIntensity * uHoverColor.a);
    }

    // --- Grid / Border ---
    float lineWidth = 0.03; // thicker border for clarity
    float borderX = smoothstep(0.0, lineWidth, cellUV.x) * smoothstep(0.0, lineWidth, 1.0 - cellUV.x);
    float borderY = smoothstep(0.0, lineWidth, cellUV.y) * smoothstep(0.0, lineWidth, 1.0 - cellUV.y);
    float gridMask = borderX * borderY;

    // --- Image area ---
    float imageSize = 1.0; 
    float imageBorder = (1.1 - imageSize) * 0.5;
    vec2 imageUV = (cellUV - imageBorder) / imageSize;
    bool inImageArea = all(greaterThanEqual(imageUV, vec2(0.0))) && all(lessThanEqual(imageUV, vec2(1.0)));
    imageUV = clamp(imageUV, 0.0, 1.0);

    // --- Texture atlas index ---
    float atlasSize = ceil(sqrt(uTextureCount));
    float texIndex = mod(cellId.x + cellId.y * atlasSize, uTextureCount);

    vec3 color = backgroundColor;

    // --- Render image ---
    if (inImageArea) {
        vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));
        vec2 atlasUV = (atlasPos + imageUV) / atlasSize;
        atlasUV.y = 1.0 - atlasUV.y;
        vec3 imageColor = texture2D(uImageAtlas, atlasUV).rgb;
        color = mix(color, imageColor, 1.0);
    }

    // --- Render text on hover ---
    if (inImageArea && isHovered) {
        float textHeight = 0.08;
        float textY = 0.88;
        bool inTextArea = cellUV.x >= 0.05 && cellUV.x <= 0.95 && cellUV.y >= textY && cellUV.y <= textY + textHeight;
        if (inTextArea) {
            vec2 textCoord = vec2((cellUV.x - 0.05) / 0.9, (cellUV.y - textY) / textHeight);
            textCoord = clamp(textCoord, 0.0, 1.0);
            textCoord.y = 1.0 - textCoord.y;
            vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));
            vec2 atlasUV = (atlasPos + textCoord) / atlasSize;
            vec4 textColor = texture2D(uTextAtlas, atlasUV);
            color = mix(color, textColor.rgb, textColor.a * hoverIntensity);
        }
    }

    // --- Apply black border ---
    color = mix(color, uBorderColor.rgb, (1.0 - gridMask) * uBorderColor.a);

    // --- Fade edges ---
    float fade = 1.0 - smoothstep(1.2, 1.8, radius);
    gl_FragColor = vec4(color * fade, 1.0);
}
`;
