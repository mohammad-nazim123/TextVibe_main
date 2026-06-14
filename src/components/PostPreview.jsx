import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { FIELD_H, FIELD_W, TEXT_LINE_HEIGHT, borderCss, styleRunFromComposer } from '../lib/constants.js';
import {
  assetBackgroundFit,
  getTextureBg,
  getTextureFrame,
  legendaryTextSx,
  normalizeAssetId,
  premiumTextSx,
  textInsetsFor,
} from '../lib/materials.js';

function normalizeRuns(postOrState) {
  if (Array.isArray(postOrState?.style_runs) && postOrState.style_runs.length > 0) {
    return postOrState.style_runs;
  }
  if (postOrState?.text !== undefined) {
    return [styleRunFromComposer(postOrState)];
  }
  return [];
}

export function PostPreview({ post, height = 150, emptyText = 'Your message preview' }) {
  const bg = post?.background_color || post?.backgroundColor || '#FFFFFF';
  const border = post?.border || null;
  const runs = normalizeRuns(post);
  const text = post?.text || '';
  const scale = height / FIELD_H;
  const fieldWidth = FIELD_W * scale;

  // Resolve texture assets the same way the billboard does (frame_id /
  // background_id take priority, falling back to border.texture / texture).
  const frameTextureId = normalizeAssetId(post?.frame_id || post?.border?.texture);
  const bgTextureId = normalizeAssetId(
    post?.background_id || post?.background_texture?.texture,
  );
  const frameAsset = getTextureFrame(frameTextureId);
  const bgAsset = getTextureBg(bgTextureId);

  const insets = textInsetsFor({
    border: frameTextureId ? { style: 'texture', texture: frameTextureId } : border,
    backgroundTexture: bgTextureId ? { texture: bgTextureId } : null,
  });

  return (
    <Box
      sx={{
        width: fieldWidth,
        height,
        maxWidth: '100%',
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: bg,
        borderRadius: `${10 * scale}px`,
        // Normal borders draw via CSS; texture frames overlay an image below.
        ...(frameAsset ? null : borderCss(border, scale)),
      }}
    >
      {bgAsset ? (
        <Box
          component="img"
          src={bgAsset}
          alt=""
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: assetBackgroundFit(bgTextureId) === 'fill' ? 'fill' : 'cover',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          p: `${insets.top * scale}px ${insets.right * scale}px ${insets.bottom * scale}px ${insets.left * scale}px`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: TEXT_LINE_HEIGHT,
          }}
        >
          {runs.length > 0 && text ? (
            runs.map((run, idx) => {
              const size = (Number(run.fontSize) || 18) * scale;
              const effectSx = run.effect === 'premium'
                ? premiumTextSx(run.color || '#000000', size)
                : legendaryTextSx(run, size);
              return (
                <Box
                  key={`${idx}-${run.text}`}
                  component="span"
                  sx={{
                    fontFamily: `"${run.fontFamily || 'Roboto'}", sans-serif`,
                    fontSize: `${size}px`,
                    fontWeight: Number(run.fontWeight) || 400,
                    fontStyle: run.fontStyle === 'italic' ? 'italic' : 'normal',
                    lineHeight: Number(run.lineHeight) || TEXT_LINE_HEIGHT,
                    ...effectSx,
                  }}
                >
                  {run.text}
                </Box>
              );
            })
          ) : (
            <Typography
              sx={{
                color: 'rgba(26,26,46,.45)',
                fontSize: `${14 * scale}px`,
                fontWeight: 700,
              }}
            >
              {emptyText}
            </Typography>
          )}
        </Box>
      </Box>

      {frameAsset ? (
        <Box
          component="img"
          src={frameAsset}
          alt=""
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </Box>
  );
}

export default PostPreview;
