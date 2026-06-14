// Canonical Premium/Legendary material registry.
//
// This mirrors the asset-based rendering used by the Flutter app
// (textvibe_app: core/theme/asset_ids.dart, premium_assets.dart, legendary.dart)
// and the billboard display (textvibe_ui: components/MessageBillboard.jsx) so a
// post composed here looks identical in the composer preview, in the captured
// image we upload, and on the billboard. Keep this in sync with the billboard's
// ASSET_* maps and per-material safe insets.

// ── Texture asset imports ──────────────────────────────────────────────────
import premiumWoodBg from '../assets/premium_wood_background.png';
import premiumWoodFrame from '../assets/premium_wood_frame.png';
import premiumDarkWoodBg from '../assets/premium_dark_wood_background.png';
import premiumDarkWoodFrame from '../assets/premium_dark_wood_frame.png';
import premiumCopperBg from '../assets/premium_copper_background.png';
import premiumCopperFrame from '../assets/premium_copper_frame.png';
import premiumGlassBg from '../assets/premium_glass_background.png';
import premiumGlassFrame from '../assets/premium_glass_frame.png';
import premiumMarbleBg from '../assets/premium_marble_background.png';
import premiumMarbleFrame from '../assets/premium_marble_frame.png';

import legendaryGoldBg from '../assets/legendary_gold_background.png';
import legendaryGoldFrame from '../assets/legendary_gold_frame.png';
import legendaryDiamondBg from '../assets/legendary_diamond_background.png';
import legendaryDiamondFrame from '../assets/legendary_diamond_frame.png';
import legendaryOnyxBg from '../assets/legendary_onyx_background.png';
import legendaryOnyxFrame from '../assets/legendary_onyx_frame.png';
import legendaryPlatinumBg from '../assets/legendary_platinum_background.png';
import legendaryPlatinumFrame from '../assets/legendary_platinum_frame.png';
import legendaryRosyGoldBg from '../assets/legendary_rosy_gold_background.png';
import legendaryRosyGoldFrame from '../assets/legendary_rosy_gold_frame.png';
import legendaryEmeraldBg from '../assets/legendary_emerald_bg.png';
import legendaryEmeraldFrame from '../assets/legendary_emerald_frame.png';

export const FIELD_W = 420;
export const FIELD_H = 420;

// Picker lists — id, label, bg/frame asset, and the text color this material
// offers in the color picker. `material` is the canonical legendary name used
// for the chrome text effect. Mirrors kPremiumLabels / kLegendaryLabels.
export const premiumMaterials = [
  { id: 'premium_wood',      label: 'Wooden',    bg: premiumWoodBg,     frame: premiumWoodFrame,     textColor: '#7A5C36' },
  { id: 'premium_dark_wood', label: 'Dark Wood', bg: premiumDarkWoodBg, frame: premiumDarkWoodFrame, textColor: '#4B2616' },
  { id: 'premium_copper',    label: 'Copper',    bg: premiumCopperBg,   frame: premiumCopperFrame,   textColor: '#5A2D17' },
  { id: 'premium_glass',     label: 'Glass',     bg: premiumGlassBg,    frame: premiumGlassFrame,    textColor: '#0E3A4A' },
  { id: 'premium_marble',    label: 'Marble',    bg: premiumMarbleBg,   frame: premiumMarbleFrame,   textColor: '#8B8680' },
];

export const legendaryMaterials = [
  { id: 'legendary_gold',      label: 'Gold',      material: 'gold',      bg: legendaryGoldBg,      frame: legendaryGoldFrame,      textColor: '#FFC53D' },
  { id: 'legendary_diamond',   label: 'Diamond',   material: 'diamond',   bg: legendaryDiamondBg,   frame: legendaryDiamondFrame,   textColor: '#D7F0FF' },
  { id: 'legendary_onyx',      label: 'Onyx',      material: 'onyx',      bg: legendaryOnyxBg,      frame: legendaryOnyxFrame,      textColor: '#525A66' },
  { id: 'legendary_platinum',  label: 'Platinum',  material: 'platinum',  bg: legendaryPlatinumBg,  frame: legendaryPlatinumFrame,  textColor: '#E4EAF0' },
  { id: 'legendary_rosy_gold', label: 'Rosy Gold', material: 'rosy_gold', bg: legendaryRosyGoldBg,  frame: legendaryRosyGoldFrame,  textColor: '#EAB29F' },
  { id: 'legendary_emerald',   label: 'Emerald',   material: 'emerald',   bg: legendaryEmeraldBg,   frame: legendaryEmeraldFrame,   textColor: '#2EA64A' },
];

export const ASSET_BACKGROUNDS = {
  premium_wood: premiumWoodBg,
  premium_dark_wood: premiumDarkWoodBg,
  premium_copper: premiumCopperBg,
  premium_glass: premiumGlassBg,
  premium_marble: premiumMarbleBg,
  legendary_gold: legendaryGoldBg,
  legendary_diamond: legendaryDiamondBg,
  legendary_onyx: legendaryOnyxBg,
  legendary_platinum: legendaryPlatinumBg,
  legendary_rosy_gold: legendaryRosyGoldBg,
  legendary_emerald: legendaryEmeraldBg,
};

export const ASSET_FRAMES = {
  premium_wood: premiumWoodFrame,
  premium_dark_wood: premiumDarkWoodFrame,
  premium_copper: premiumCopperFrame,
  premium_glass: premiumGlassFrame,
  premium_marble: premiumMarbleFrame,
  legendary_gold: legendaryGoldFrame,
  legendary_diamond: legendaryDiamondFrame,
  legendary_onyx: legendaryOnyxFrame,
  legendary_platinum: legendaryPlatinumFrame,
  legendary_rosy_gold: legendaryRosyGoldFrame,
  legendary_emerald: legendaryEmeraldFrame,
};

// Canonical ids the billboard recognizes for its layered (text_image + bg +
// frame) render path. Matches textvibe_app/asset_ids.dart and the billboard.
// `legendary_emerald` is intentionally NOT canonical — emerald posts fall back
// to the uploaded composite canvas_image, which we render fully here.
export const CANONICAL_ASSET_IDS = new Set([
  'premium_wood',
  'premium_dark_wood',
  'premium_copper',
  'premium_glass',
  'premium_marble',
  'legendary_gold',
  'legendary_diamond',
  'legendary_onyx',
  'legendary_platinum',
  'legendary_rosy_gold',
]);

// Per-material text safe insets (px in the 420×420 field space). Text drawn
// inside these so it never bleeds under the ornate frame. Mirrors
// kPremiumSafeInsets (36/28) and kLegendarySafeInsets (40/34 or 44/38).
export const DEFAULT_FIELD_INSETS = { left: 12, top: 12, right: 12, bottom: 12 };
export const NORMAL_FIELD_INSETS = { left: 16, top: 16, right: 16, bottom: 16 };
export const DOUBLE_FIELD_INSETS = { left: 24, top: 24, right: 24, bottom: 24 };

export const ASSET_SAFE_INSETS = {
  premium_wood: { left: 36, top: 28, right: 36, bottom: 28 },
  premium_dark_wood: { left: 36, top: 28, right: 36, bottom: 28 },
  premium_copper: { left: 36, top: 28, right: 36, bottom: 28 },
  premium_glass: { left: 36, top: 28, right: 36, bottom: 28 },
  premium_marble: { left: 36, top: 28, right: 36, bottom: 28 },
  legendary_gold: { left: 44, top: 38, right: 44, bottom: 38 },
  legendary_diamond: { left: 40, top: 34, right: 40, bottom: 34 },
  legendary_onyx: { left: 40, top: 34, right: 40, bottom: 34 },
  legendary_platinum: { left: 40, top: 34, right: 40, bottom: 34 },
  legendary_rosy_gold: { left: 40, top: 34, right: 40, bottom: 34 },
  legendary_emerald: { left: 44, top: 38, right: 44, bottom: 38 },
};

// ── id normalization (mirrors asset_ids.dart / billboard normalizeAssetId) ──
export function normalizeAssetId(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  switch (trimmed) {
    case 'dark_wood':
      return 'premium_dark_wood';
    case 'glass':
      return 'premium_glass';
    case 'marble':
      return 'premium_marble';
    case 'legendary_golden':
      return 'legendary_gold';
    case 'legendary_rose_gold':
      return 'legendary_rosy_gold';
    default:
      return trimmed;
  }
}

export function canonicalAssetId(value) {
  const normalized = normalizeAssetId(value);
  return normalized && CANONICAL_ASSET_IDS.has(normalized) ? normalized : null;
}

export function getTextureBg(textureId) {
  return ASSET_BACKGROUNDS[normalizeAssetId(textureId)] || null;
}

export function getTextureFrame(textureId) {
  return ASSET_FRAMES[normalizeAssetId(textureId)] || null;
}

// Diamond/onyx/platinum/rosy-gold and every premium texture are authored to
// exactly fill the field; gold-style backgrounds are cropped to cover.
export function assetBackgroundFit(textureName) {
  const id = normalizeAssetId(textureName);
  return id === 'legendary_diamond' ||
    id === 'legendary_onyx' ||
    id === 'legendary_platinum' ||
    id === 'legendary_rosy_gold' ||
    (id && id.startsWith('premium_'))
    ? 'fill'
    : 'cover';
}

function maxInsets(a, b) {
  return {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  };
}

function fieldInsetsForBorder(border) {
  if (!border) return DEFAULT_FIELD_INSETS;
  const textureId = border.style === 'texture' ? normalizeAssetId(border.texture) : null;
  if (textureId && ASSET_SAFE_INSETS[textureId]) return ASSET_SAFE_INSETS[textureId];
  return border.style === 'double' ? DOUBLE_FIELD_INSETS : NORMAL_FIELD_INSETS;
}

function fieldInsetsForTexture(textureId) {
  const id = normalizeAssetId(textureId);
  return (id && ASSET_SAFE_INSETS[id]) || DEFAULT_FIELD_INSETS;
}

/**
 * Resolve the text safe-inset (px, 420 field space) for a composer state /
 * post — the max of the frame's and the background texture's insets so text
 * clears whichever moulding is thicker. Mirrors billboard MessageCanvas.
 */
export function textInsetsFor({ border, backgroundTexture } = {}) {
  return maxInsets(
    fieldInsetsForBorder(border || null),
    fieldInsetsForTexture(backgroundTexture?.texture),
  );
}

// ── Legendary chrome text effect (mirrors billboard legendaryTextSx) ────────
export function canonicalLegendaryMaterial(material) {
  switch (material) {
    case 'diamond':
    case 'platinum':
    case 'onyx':
    case 'gold':
      return material;
    case 'rose_gold':
    case 'rosy_gold':
      return 'rosy_gold';
    default:
      return 'gold';
  }
}

export function legendaryTextMaterial(run) {
  if (run?.effect !== 'legendary' && !run?.legendaryColor && !run?.legendaryMaterial) {
    return null;
  }
  return canonicalLegendaryMaterial(run.legendaryMaterial);
}

export function legendaryTextPalette(material) {
  switch (canonicalLegendaryMaterial(material)) {
    case 'diamond':
      return ['#ffffff', '#d9eeff', '#95afc1', '#f6fbff', '#617a8d'];
    case 'platinum':
      return ['#ffffff', '#e5ebf1', '#a9b3bc', '#f8fbff', '#66707a'];
    case 'onyx':
      return ['#d8dee6', '#59616d', '#171b21', '#707987', '#0a0c10'];
    case 'rosy_gold':
      return ['#fff3ee', '#f0c3b3', '#b97e69', '#ffe4d8', '#754636'];
    case 'gold':
    default:
      return ['#fff7d8', '#f2cf72', '#b98724', '#ffeaa7', '#734a0c'];
  }
}

export function legendaryTextStroke(material) {
  return canonicalLegendaryMaterial(material) === 'onyx'
    ? 'rgba(207,213,221,.72)'
    : 'rgba(34,21,12,.68)';
}

function hexToRgbParts(hex) {
  const value = String(hex || '#000000').replace('#', '').slice(0, 6);
  const safe = value.length === 6 ? value : '000000';
  return {
    r: parseInt(safe.slice(0, 2), 16),
    g: parseInt(safe.slice(2, 4), 16),
    b: parseInt(safe.slice(4, 6), 16),
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgbParts(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function mixHex(hex, target, amount) {
  const a = hexToRgbParts(hex);
  const b = hexToRgbParts(target);
  const mix = (av, bv) => Math.round(av + (bv - av) * amount)
    .toString(16)
    .padStart(2, '0');
  return `#${mix(a.r, b.r)}${mix(a.g, b.g)}${mix(a.b, b.b)}`;
}

export function legendaryTextColorForMaterial(material) {
  switch (canonicalLegendaryMaterial(material)) {
    case 'diamond':
      return '#D7F0FF';
    case 'platinum':
      return '#E4EAF0';
    case 'onyx':
      return '#525A66';
    case 'rosy_gold':
      return '#EAB29F';
    case 'gold':
    default:
      return '#FFC53D';
  }
}

function legendaryShadowParts(material, size, color) {
  const textColor = color || legendaryTextColorForMaterial(material);
  const onDark = relativeLuminance(textColor) > 0.5;
  const depth = Math.round(Math.min(5, Math.max(2, size * 0.13)));
  const sideColor = onDark
    ? 'rgba(0,0,0,.72)'
    : rgba(mixHex(textColor, '#000000', 0.55), 0.80);
  const highlightColor = onDark
    ? 'rgba(255,255,255,.58)'
    : rgba(mixHex(textColor, '#FFFFFF', 0.55), 0.72);
  const outlineColor = onDark ? 'rgba(0,0,0,.68)' : 'rgba(0,0,0,.48)';
  const glowAlpha = onDark ? 0.38 : 0.55;
  const castAlpha = onDark ? 0.48 : 0.38;
  const bevelDarkAlpha = onDark ? 0.45 : 0.30;
  const shadows = [
    `0 0 ${Math.max(size * 0.78, 8).toFixed(2)}px ${rgba(textColor, glowAlpha)}`,
    `${(depth + 1.5).toFixed(2)}px ${(depth + 2.5).toFixed(2)}px 8px rgba(0,0,0,${castAlpha})`,
  ];
  for (let i = depth; i >= 1; i -= 1) {
    shadows.push(`${i}px ${i}px 0 ${sideColor}`);
  }
  shadows.push(`0.8px 0.8px 0 rgba(0,0,0,${bevelDarkAlpha})`);
  shadows.push(`-0.7px -1.2px 0 ${highlightColor}`);
  shadows.push(
    `-1px -1px 0 ${outlineColor}`,
    `1px -1px 0 ${outlineColor}`,
    `-1px 1px 0 ${outlineColor}`,
    `1px 1px 0 ${outlineColor}`,
  );
  return {
    shadows,
    sideColor,
    highlightColor,
    outlineColor,
    glowColor: rgba(textColor, glowAlpha),
    castColor: `rgba(0,0,0,${castAlpha})`,
    bevelDarkColor: `rgba(0,0,0,${bevelDarkAlpha})`,
    depth,
  };
}

/** MUI/React sx for chrome-gradient legendary text. Falls back to flat color. */
export function legendaryTextSx(run, size) {
  const material = legendaryTextMaterial(run);
  if (!material) {
    return { color: run.color || '#000000' };
  }
  const colors = legendaryTextPalette(material);
  const color = run.legendaryColor || run.color || '#000000';
  const chromeGradient = `linear-gradient(180deg,
      ${colors[0]} 0%,
      ${colors[1]} 18%,
      ${colors[2]} 42%,
      ${colors[3]} 68%,
      ${colors[4]} 100%)`;
  const stroke = Math.max(size * 0.018, 0.75).toFixed(2);
  const { shadows } = legendaryShadowParts(material, size, color);
  return {
    color,
    WebkitTextFillColor: 'transparent',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    backgroundImage: chromeGradient,
    WebkitTextStroke: `${stroke}px ${legendaryTextStroke(material)}`,
    textShadow: shadows.join(', '),
  };
}

/**
 * Textarea-safe Legendary treatment for the live composer input.
 *
 * CSS background-clip text is unreliable on textarea/input text in Chromium:
 * the transparent fill can disappear while shadows remain, producing the dark
 * fuzzy look seen in the composer. Match the Flutter app's live TextField by
 * keeping a solid material tint visible and reusing the same 3D shadow stack.
 */
export function legendaryInputTextSx(run, size) {
  const material = legendaryTextMaterial(run);
  if (!material) {
    return { color: run.color || '#000000' };
  }
  const mat = canonicalLegendaryMaterial(material);
  const color = run.legendaryColor || legendaryTextColorForMaterial(mat);
  const { shadows } = legendaryShadowParts(mat, size, color);
  return {
    color,
    WebkitTextFillColor: color,
    backgroundImage: 'none',
    WebkitBackgroundClip: 'initial',
    backgroundClip: 'initial',
    WebkitTextStroke: '0 transparent',
    textShadow: shadows.join(', '),
    letterSpacing: '0.4px',
  };
}

// ── Premium chrome text effect (mirrors textvibe_app premium_text.dart) ──────
// Premium text keeps its solid fill colour and gains a crisp 8-direction
// contrast ring — no blur, no glow — so it reads cleanly over any background.

function relativeLuminance(hex) {
  const value = String(hex || '#000000').replace('#', '').slice(0, 6);
  const safe = value.length === 6 ? value : '000000';
  const r = parseInt(safe.slice(0, 2), 16);
  const g = parseInt(safe.slice(2, 4), 16);
  const b = parseInt(safe.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Outline colour for a premium text fill — dark ring on light text, light on dark. */
export function premiumTextOutline(color) {
  return relativeLuminance(color) > 0.5
    ? 'rgba(0,0,0,.72)'
    : 'rgba(255,255,255,.78)';
}

/** MUI/React sx for the premium outline-only text effect. */
export function premiumTextSx(color, size) {
  const o = Math.min(1.1, Math.max(0.7, size * 0.045)).toFixed(2);
  const ring = premiumTextOutline(color);
  return {
    color,
    textShadow: [
      `-${o}px 0 ${ring}`,
      `${o}px 0 ${ring}`,
      `0 -${o}px ${ring}`,
      `0 ${o}px ${ring}`,
      `-${o}px -${o}px ${ring}`,
      `${o}px -${o}px ${ring}`,
      `-${o}px ${o}px ${ring}`,
      `${o}px ${o}px ${ring}`,
    ].join(', '),
  };
}

/**
 * Paint premium outline-only text onto a 2D canvas line. Strokes the contrast
 * ring first, then fills the solid colour on top — echoes premiumTextSx.
 */
export function fillPremiumText(ctx, text, x, y, fontSize, color) {
  // `fontSize` here is the scaled canvas size, so keep the ring proportional
  // (floor only) instead of the design-space px clamp used by premiumTextSx.
  const o = Math.max(0.75, fontSize * 0.045);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineWidth = o * 2;
  ctx.strokeStyle = premiumTextOutline(color);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color || '#000000';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Paint chrome-gradient legendary text onto a 2D canvas line. `x`/`y` is the
 * top-left of the line, `lineH` the gradient span (≈ font size). Approximates
 * the CSS background-clip gradient + stroke + shadow used on the billboard.
 */
export function fillLegendaryText(ctx, text, x, y, lineH, material) {
  const colors = legendaryTextPalette(material);
  const mat = canonicalLegendaryMaterial(material);
  const textColor = legendaryTextColorForMaterial(mat);
  const shadow = legendaryShadowParts(mat, lineH, textColor);
  const grad = ctx.createLinearGradient(0, y, 0, y + lineH);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.18, colors[1]);
  grad.addColorStop(0.42, colors[2]);
  grad.addColorStop(0.68, colors[3]);
  grad.addColorStop(1, colors[4]);

  ctx.save();
  ctx.fillStyle = textColor;
  ctx.shadowColor = shadow.glowColor;
  ctx.shadowBlur = Math.max(lineH * 0.78, 8);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillText(text, x, y);

  ctx.shadowColor = shadow.castColor;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = shadow.depth + 1.5;
  ctx.shadowOffsetY = shadow.depth + 2.5;
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = shadow.sideColor;
  for (let i = shadow.depth; i >= 1; i -= 1) {
    ctx.fillText(text, x + i, y + i);
  }

  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);

  ctx.fillStyle = shadow.bevelDarkColor;
  ctx.fillText(text, x + 0.8, y + 0.8);
  ctx.fillStyle = shadow.highlightColor;
  ctx.fillText(text, x - 0.7, y - 1.2);

  ctx.lineWidth = Math.max(lineH * 0.018, 0.75) * 2;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = legendaryTextStroke(mat);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);
  ctx.restore();
}
