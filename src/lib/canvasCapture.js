import { FIELD_H, FIELD_W, TEXT_LINE_HEIGHT, borderCss } from './constants.js';
import {
  assetBackgroundFit,
  fillLegendaryText,
  fillPremiumText,
  getTextureBg,
  getTextureFrame,
  textInsetsFor,
} from './materials.js';

function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  const paragraphs = String(text || '').split('\n');
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/(\s+)/);
    let line = '';
    for (const word of words) {
      // A single token wider than the line can never fit — break it
      // character-by-character (mirrors CSS `word-break: break-word`).
      if (ctx.measureText(word).width > maxWidth) {
        if (line) {
          lines.push(line.trimEnd());
          line = '';
        }
        let buf = '';
        for (const ch of word) {
          if (buf && ctx.measureText(buf + ch).width > maxWidth) {
            lines.push(buf);
            buf = ch;
          } else {
            buf += ch;
          }
        }
        line = buf;
        continue;
      }
      const next = `${line}${word}`;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line.trimEnd());
        line = word.trimStart();
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function waitForFonts() {
  try {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready;
    }
  } catch {
    /* Font readiness is best-effort; the canvas still renders with fallback fonts. */
  }
}

function drawImageFit(ctx, img, cw, ch, fit) {
  if (fit !== 'cover') {
    // 'fill' — stretch the (already field-shaped) texture to the canvas.
    ctx.drawImage(img, 0, 0, cw, ch);
    return;
  }
  // 'cover' — scale to fill while preserving aspect ratio, crop the overflow.
  const ir = img.width / img.height;
  const cr = cw / ch;
  let dw;
  let dh;
  if (ir > cr) {
    dh = ch;
    dw = ch * ir;
  } else {
    dw = cw;
    dh = cw / ir;
  }
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

// Draw the message text honouring the per-material safe insets so it never
// bleeds under an ornate frame, and apply the legendary chrome gradient when
// the composer has a legendary text effect selected.
function drawText(ctx, state, scale, canvasW, canvasH) {
  const insets = textInsetsFor(state);
  const padL = insets.left * scale;
  const padT = insets.top * scale;
  const padR = insets.right * scale;
  const padB = insets.bottom * scale;

  const fontSize = (Number(state.fontSize) || 18) * scale;
  const weight = state.isBold ? 700 : 400;
  const style = state.isItalic ? 'italic ' : '';
  ctx.font = `${style}${weight} ${fontSize}px "${state.fontFamily || 'Roboto'}", sans-serif`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';

  const lineHeight = fontSize * TEXT_LINE_HEIGHT;
  const lines = wrapLines(ctx, state.text, canvasW - padL - padR);
  const isLegendary = state.textEffect === 'legendary';
  const isPremium = state.textEffect === 'premium';
  const material = state.legendaryMaterial || 'gold';

  // Centre the block within the safe area; when it overflows, start at the top
  // inset so the beginning is never clipped (only the tail clips).
  const centerX = padL + (canvasW - padL - padR) / 2;
  const blockH = lines.length * lineHeight;
  let y = padT + Math.max(0, (canvasH - padT - padB - blockH) / 2);
  for (const line of lines) {
    if (y + lineHeight > canvasH - padB) break;
    if (isLegendary) {
      fillLegendaryText(ctx, line, centerX, y, fontSize, material);
    } else if (isPremium) {
      fillPremiumText(ctx, line, centerX, y, fontSize, state.textColor);
    } else {
      ctx.fillStyle = state.textColor || '#000000';
      ctx.fillText(line, centerX, y);
    }
    y += lineHeight;
  }
}

function drawBorder(ctx, border, scale) {
  if (border?.style === 'texture') return; // texture frame drawn separately as image overlay
  const width = border ? (Number(border.width) || 2) * scale : 1.5 * scale;
  const radius = (border ? Number(border.radius) || 10 : 10) * scale;
  const x = width / 2;
  const y = width / 2;
  const w = FIELD_W * scale - width;
  const h = FIELD_H * scale - width;
  const color = border?.color || 'rgba(139, 92, 246, .35)';
  const style = border?.style || 'dashed';

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (style === 'dashed') ctx.setLineDash([10 * scale, 6 * scale]);

  const path = new Path2D();
  path.roundRect(x, y, w, h, radius);
  ctx.stroke(path);

  if (style === 'double') {
    const inset = width * 2;
    const inner = new Path2D();
    inner.roundRect(x + inset, y + inset, Math.max(0, w - inset * 2), Math.max(0, h - inset * 2), Math.max(0, radius - inset));
    ctx.stroke(inner);
  }
  ctx.restore();
}

export async function captureComposerCanvas(state) {
  try {
    await waitForFonts();
    const scale = 3;
    const canvas = document.createElement('canvas');
    canvas.width = FIELD_W * scale;
    canvas.height = FIELD_H * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background — solid color or texture image (matching the billboard's fit).
    const bgTextureId = state.backgroundTexture?.texture;
    if (bgTextureId) {
      const bgUrl = getTextureBg(bgTextureId);
      const bgImg = bgUrl ? await loadImage(bgUrl) : null;
      if (bgImg) {
        ctx.fillStyle = state.backgroundColor || '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawImageFit(ctx, bgImg, canvas.width, canvas.height, assetBackgroundFit(bgTextureId));
      } else {
        ctx.fillStyle = state.backgroundColor || '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      ctx.fillStyle = state.backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawText(ctx, state, scale, canvas.width, canvas.height);

    drawBorder(ctx, state.border, scale);

    // Texture frame overlay — drawn on top of text.
    const isTextureBorder = state.border?.style === 'texture';
    if (isTextureBorder) {
      const frameUrl = getTextureFrame(state.border.texture);
      const frameImg = frameUrl ? await loadImage(frameUrl) : null;
      if (frameImg) {
        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
      }
    }

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  } catch {
    return null;
  }
}

export async function captureTextCanvas(state) {
  try {
    await waitForFonts();
    const scale = 3;
    const canvas = document.createElement('canvas');
    canvas.width = FIELD_W * scale;
    canvas.height = FIELD_H * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Transparent background — bg texture is layered separately on the billboard.
    drawText(ctx, state, scale, canvas.width, canvas.height);

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  } catch {
    return null;
  }
}

export function composerSurfaceSx(state) {
  const bgTextureId = state.backgroundTexture?.texture;
  const isTextureBorder = state.border?.style === 'texture';

  const bgSx = bgTextureId
    ? {
        backgroundImage: `url(${getTextureBg(bgTextureId)})`,
        backgroundSize: assetBackgroundFit(bgTextureId) === 'fill' ? '100% 100%' : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : { backgroundColor: state.backgroundColor || '#FFFFFF' };

  const borderSx = isTextureBorder ? { border: 'none' } : borderCss(state.border);

  return { ...bgSx, ...borderSx };
}
