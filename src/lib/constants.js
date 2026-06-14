import { getTextureBg, getTextureFrame, normalizeAssetId } from './materials.js';

export const FIELD_W = 420;
export const FIELD_H = 420;
export const TEXT_LINE_HEIGHT = 1.28;
export const MAX_CHARS = 500;

export const primaryGradient = 'linear-gradient(135deg, #FF6B9D 0%, #8B5CF6 100%)';

export const categoryPresets = {
  Love: [
    { bg: '#FFE4EC', text: '#C2185B' },
    { bg: '#F8D7FF', text: '#8E244D' },
    { bg: '#FFF1E6', text: '#D9485F' },
  ],
  Wish: [
    { bg: '#E6F4FF', text: '#1E3A8A' },
    { bg: '#E8FFF6', text: '#0F766E' },
    { bg: '#F3EEFF', text: '#6D28D9' },
  ],
  Promote: [
    { bg: '#0F172A', text: '#FACC15' },
    { bg: '#FFF7E6', text: '#C2410C' },
    { bg: '#EEF2FF', text: '#1D4ED8' },
  ],
  'My Thoughts': [
    { bg: '#F5EFE6', text: '#5B4636' },
    { bg: '#EAF2F8', text: '#334155' },
    { bg: '#ECE7F6', text: '#5B21B6' },
  ],
};

export const normalBgSwatches = Object.values(categoryPresets).flatMap((items) =>
  items.map((item) => item.bg),
);

export const normalTextSwatches = Object.values(categoryPresets).flatMap((items) =>
  items.map((item) => item.text),
);

export const fontSizes = [12, 14, 16, 18, 20, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 45];

export const fontFamilies = [
  'Roboto',
  'Lato',
  'Montserrat',
  'Oswald',
  'Lobster',
  'Pacifico',
  'Dancing Script',
  'Caveat',
  'Anton',
  'Bebas Neue',
  'Playfair Display',
  'Cormorant Garamond',
  'Marcellus',
  'Cinzel',
  'Great Vibes',
  'Allura',
  'Sacramento',
  'Abril Fatface',
  'Yeseva One',
  'Tangerine',
  'Parisienne',
  'Pinyon Script',
  'Italianno',
  'Ephesis',
  'Cinzel Decorative',
  'Mr Dafoe',
  'Petit Formal Script',
];

export const durations = [3, 5, 10, 30];
export const durationTokenCosts = { 3: 5, 5: 7, 10: 12, 30: 30 };

export function composerTokenCost({ durationSeconds, hasImage = false }) {
  const base = durationTokenCosts[durationSeconds] || 7;
  return base + (hasImage ? 25 : 0);
}

export const borderStyles = {
  None: null,
  Thin: { width: 2, style: 'solid', radius: 12, color: '#8B5CF6' },
  Thick: { width: 6, style: 'solid', radius: 12, color: '#8B5CF6' },
  Dashed: { width: 3, style: 'dashed', radius: 12, color: '#8B5CF6' },
  Double: { width: 6, style: 'double', radius: 12, color: '#8B5CF6' },
  Rounded: { width: 4, style: 'solid', radius: 28, color: '#8B5CF6' },
};

export const borderColors = [
  '#FF6B9D',
  '#8B5CF6',
  '#1D4ED8',
  '#0F766E',
  '#F97316',
  '#FACC15',
  '#EF4444',
  '#1A1A2E',
  '#5B4636',
  '#16A34A',
  '#6B7280',
];

export const basicEmojis = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😍',
  '😘',
  '😎',
  '🤩',
  '🥳',
  '😇',
  '🙂',
  '😉',
  '😋',
  '😜',
  '🤗',
  '🤔',
  '😴',
  '😢',
  '😭',
  '😡',
  '🥺',
  '😱',
  '😬',
  '👍',
  '👎',
  '👏',
  '🙏',
  '💪',
  '🤝',
  '✌️',
  '🤞',
  '❤️',
  '🧡',
  '💛',
  '💚',
  '💙',
  '💜',
  '🖤',
  '💖',
  '✨',
  '🔥',
  '🎉',
  '🎊',
  '⭐',
  '🌟',
  '💫',
  '🌈',
  '🌹',
  '🌸',
  '🌻',
  '🍀',
  '🎁',
  '🏆',
  '💯',
  '💗',
];

export const paymentMethods = [
  { id: 'google_play', label: 'Google Play' },
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Cards' },
  { id: 'netbanking', label: 'Net Banking' },
  { id: 'wallet', label: 'Wallets' },
];

export const defaultComposerState = {
  text: '',
  backgroundColor: '#FFFFFF',
  backgroundTexture: null,
  textColor: '#000000',
  // textEffect: null | 'premium' | 'legendary'. 'premium' adds an 8-direction
  // contrast outline; 'legendary' renders the metallic chrome gradient for
  // legendaryMaterial (gold/diamond/onyx/…).
  textEffect: null,
  legendaryMaterial: null,
  fontSize: 18,
  fontFamily: 'Roboto',
  isBold: false,
  isItalic: false,
  border: null,
  durationSeconds: 5,
};

export function hexToRgb(hex) {
  const value = String(hex || '#000000').replace('#', '').slice(0, 6);
  const safe = value.length === 6 ? value : '000000';
  return {
    r: parseInt(safe.slice(0, 2), 16),
    g: parseInt(safe.slice(2, 4), 16),
    b: parseInt(safe.slice(4, 6), 16),
  };
}

export function contrastTextColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.55 ? '#1A1A2E' : '#FFFFFF';
}

export function styleRunFromComposer(state) {
  const run = {
    text: state.text,
    color: state.textColor,
    fontFamily: state.fontFamily,
    fontSize: state.fontSize,
    fontWeight: state.isBold ? 700 : 400,
    fontStyle: state.isItalic ? 'italic' : 'normal',
    lineHeight: TEXT_LINE_HEIGHT,
  };
  if (state.textEffect === 'legendary') {
    run.effect = 'legendary';
    run.legendaryMaterial = state.legendaryMaterial || 'gold';
    run.legendaryColor = state.textColor;
  } else if (state.textEffect === 'premium') {
    run.effect = 'premium';
  }
  return run;
}

export function borderCss(border, scale = 1) {
  if (!border) {
    return {
      border: `${Math.max(1, 1.5 * scale)}px dashed rgba(139, 92, 246, .35)`,
      borderRadius: `${10 * scale}px`,
    };
  }

  const width = Math.max(1, Number(border.width) || 2) * scale;
  const radius = Math.max(0, Number(border.radius) || 10) * scale;
  const color = border.color || '#8B5CF6';
  const style = border.style === 'double' ? 'double' : border.style === 'dashed' ? 'dashed' : 'solid';
  return {
    border: `${width}px ${style} ${color}`,
    borderRadius: `${radius}px`,
  };
}

// Premium/Legendary material registry (shared canonical asset maps, per-material
// safe insets, and the legendary chrome text effect) lives in materials.js so
// the composer, preview, capture, and billboard all render identically.
// Re-export the pieces the rest of the app imports via constants.
export {
  premiumMaterials,
  legendaryMaterials,
  getTextureBg,
  getTextureFrame,
  normalizeAssetId,
  canonicalAssetId,
  assetBackgroundFit,
  textInsetsFor,
  legendaryTextSx,
  fillLegendaryText,
  premiumTextSx,
  fillPremiumText,
  ASSET_SAFE_INSETS,
} from './materials.js';

// ── Emoji asset imports ─────────────────────────────────────────────────────
import bowImoji from '../assets/bow_imoji.png';
import crownImoji from '../assets/crown_imoji.png';
import diamondImoji from '../assets/diamond_imoji_cutout.png';
import flowerImoji from '../assets/flower_imoji.png';
import flowersImoji from '../assets/flowers_impji.png';
import galaxyImoji from '../assets/galaxy_imoji.png';
import glassImoji from '../assets/glass_imoji.png';
import heartImoji from '../assets/heart_imoji.png';
import ringImoji from '../assets/ring_imoji.png';
import sparkleImoji from '../assets/sparkle_imoji.png';

export const legendaryImageEmojis = [
  { label: 'Bow',     asset: bowImoji },
  { label: 'Crown',   asset: crownImoji },
  { label: 'Diamond', asset: diamondImoji },
  { label: 'Flower',  asset: flowerImoji },
  { label: 'Flowers', asset: flowersImoji },
  { label: 'Galaxy',  asset: galaxyImoji },
  { label: 'Glass',   asset: glassImoji },
  { label: 'Heart',   asset: heartImoji },
  { label: 'Ring',    asset: ringImoji },
  { label: 'Sparkle', asset: sparkleImoji },
];

export const premiumEmojis = [
  '💎','👑','🦋','🌺','🌸','🌹','🌷','🌻','🌼','💐',
  '🔮','🪄','🕊️','🦚','🦜','🦩','🌙','🌛','⚡','🌠',
  '🌌','🪐','🌊','🏔️','🗻','🌅','🎑','🏯','🎭','🎨',
  '🖼️','🎯','🎠','🎡','🎪','🎀','🥂','🍾','💍','🔱',
  '⚜️','🎗️','🥇','👸','🤴','🧚','🧜','🧝','🦄','🐉',
];

// Premium, Legendary, and the legendary chrome text effect are now fully
// reproduced by the composer (see materials.js), so they are NOT unsupported.
// A reuse is only "lossy" when the single-style composer can't represent the
// post: an unknown texture we have no asset for, or multi-style / positioned
// runs (which can originate from the Flutter app's per-character styling).
export function isUnsupportedPostStyle(post) {
  if (Array.isArray(post?.style_runs)) {
    if (post.style_runs.length > 1) return true;
    if (post.style_runs.some((run) => Number.isFinite(Number(run?.x)) && Number.isFinite(Number(run?.y)))) {
      return true;
    }
  }
  const textureId = normalizeAssetId(
    post?.frame_id || post?.background_id || post?.background_texture?.texture || post?.border?.texture,
  );
  if (
    textureId &&
    (textureId.startsWith('premium_') || textureId.startsWith('legendary_')) &&
    !getTextureBg(textureId) &&
    !getTextureFrame(textureId)
  ) {
    return true;
  }
  return false;
}
