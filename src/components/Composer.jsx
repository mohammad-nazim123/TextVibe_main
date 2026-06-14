import { cloneElement, useMemo, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import FormatSizeRoundedIcon from '@mui/icons-material/FormatSizeRounded';
import FontDownloadOutlinedIcon from '@mui/icons-material/FontDownloadOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import WallpaperRoundedIcon from '@mui/icons-material/WallpaperRounded';

import { api } from '../lib/api.js';
import { captureComposerCanvas, captureTextCanvas, composerSurfaceSx } from '../lib/canvasCapture.js';
import {
  FIELD_H,
  FIELD_W,
  MAX_CHARS,
  basicEmojis,
  borderColors,
  borderCss,
  borderStyles,
  composerTokenCost,
  defaultComposerState,
  durations,
  fontFamilies,
  fontSizes,
  getTextureFrame,
  legendaryImageEmojis,
  legendaryMaterials,
  normalBgSwatches,
  normalTextSwatches,
  premiumEmojis,
  premiumMaterials,
  primaryGradient,
  styleRunFromComposer,
} from '../lib/constants.js';
import {
  legendaryInputTextSx,
  legendaryTextSx,
  normalizeAssetId,
  premiumTextSx,
  textInsetsFor,
} from '../lib/materials.js';
import { moderateText } from '../lib/moderation.js';

const appPink = '#FF6B9D';
const appLavender = '#EDE9FE';
const appBorder = '#F3E8FF';
const appText = '#1A1A2E';
const appMuted = '#6B7280';
const normalBorderNames = ['None', 'Thin', 'Thick', 'Dashed', 'Double', 'Rounded'];
const premiumBorderMaterials = premiumMaterials.filter((m) =>
  ['premium_wood', 'premium_dark_wood', 'premium_glass', 'premium_marble'].includes(m.id),
);
const legendaryPickerMaterials = legendaryMaterials.filter((m) =>
  ['legendary_gold', 'legendary_diamond', 'legendary_onyx', 'legendary_platinum', 'legendary_rosy_gold'].includes(m.id),
);
const legendaryBackgroundMaterials = legendaryPickerMaterials;
const legendaryBorderMaterials = legendaryMaterials.filter((m) =>
  ['legendary_gold', 'legendary_diamond', 'legendary_platinum', 'legendary_rosy_gold'].includes(m.id),
);
const premiumTextOptions = [
  { label: 'Red', color: '#E53935' },
  { label: 'Blue', color: '#1E88E5' },
  { label: 'Grey', color: '#757575' },
  { label: 'Pink', color: '#E91E8C' },
  { label: 'Yellow', color: '#FDD835' },
  { label: 'Violet', color: '#7B1FA2' },
  { label: 'Green', color: '#43A047' },
];

function PanelDialog({ open, title, onClose, children, maxWidth = 'sm' }) {
  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      scroll="paper"
      sx={{
        '& .MuiDialog-container': {
          alignItems: { xs: 'flex-end', sm: 'center' },
        },
      }}
      PaperProps={{
        sx: {
          m: { xs: 0, sm: 4 },
          width: { xs: '100%', sm: undefined },
          maxWidth: { xs: '100%', sm: undefined },
          height: { xs: '62dvh', sm: 'min(680px, calc(100dvh - 96px))' },
          maxHeight: { xs: 'calc(100dvh - 12px)', sm: 'calc(100dvh - 96px)' },
          borderRadius: { xs: '24px 24px 0 0', sm: 4 },
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
        },
      }}
    >
      <Box
        sx={{
          flex: '0 0 auto',
          pt: { xs: 1.4, sm: 2 },
          px: { xs: 2, sm: 3 },
          pb: { xs: 0.75, sm: 1 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: { xs: 'block', sm: 'none' },
            width: 56,
            height: 5,
            mx: 'auto',
            mb: 2,
            borderRadius: 999,
            bgcolor: 'rgba(237,233,254,.95)',
          }}
        />
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: { xs: 20, sm: 22 },
              lineHeight: 1.15,
              fontWeight: 900,
              color: appText,
            }}
          >
            {title}
          </Typography>
          <IconButton aria-label="Close" onClick={onClose} sx={{ color: appMuted }}>
            <CloseRoundedIcon sx={{ fontSize: { xs: 30, sm: 28 } }} />
          </IconButton>
        </Stack>
      </Box>
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 1.25, sm: 1.5 },
          pb: 1.5,
          overflowX: 'hidden',
        }}
      >
        {children}
      </DialogContent>
      <Box
        sx={{
          flex: '0 0 auto',
          px: { xs: 2, sm: 3 },
          pt: 1,
          pb: { xs: 'calc(14px + env(safe-area-inset-bottom))', sm: 2.25 },
          bgcolor: '#FFFFFF',
        }}
      >
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={onClose}
          sx={{
            minHeight: { xs: 60, sm: 56 },
            borderRadius: 2.2,
            bgcolor: appPink,
            fontSize: { xs: 22, sm: 20 },
            fontWeight: 800,
            boxShadow: 'none',
            '&:hover': { bgcolor: appPink, filter: 'brightness(.98)' },
          }}
        >
          Done
        </Button>
      </Box>
    </Dialog>
  );
}

function TokenBadge({ cost }) {
  return (
    <Box
      sx={{
        px: 0.7,
        py: 0.25,
        borderRadius: 1,
        bgcolor: 'rgba(26,26,46,.58)',
        color: '#FFFFFF',
        fontSize: 12,
        lineHeight: 1.2,
        fontWeight: 900,
      }}
    >
      {cost}
    </Box>
  );
}

function SelectedMark() {
  return <CheckCircleRoundedIcon sx={{ color: appPink, fontSize: 18 }} />;
}

function relativeLuminance(hex) {
  const value = String(hex || '#000000').replace('#', '').slice(0, 6);
  const safe = value.length === 6 ? value : '000000';
  const r = parseInt(safe.slice(0, 2), 16);
  const g = parseInt(safe.slice(2, 4), 16);
  const b = parseInt(safe.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function PanelCard({ title, cost, children }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          width: '100%',
          p: { xs: 1.75, sm: 2 },
          borderRadius: 2,
          border: `1px solid ${appBorder}`,
          bgcolor: 'rgba(237,233,254,.40)',
        }}
      >
        <Typography sx={{ mb: 1.25, fontSize: { xs: 16, sm: 17 }, fontWeight: 900, color: appMuted }}>
          {title}
        </Typography>
        {children}
      </Box>
      {cost !== undefined ? (
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <TokenBadge cost={cost} />
        </Box>
      ) : null}
    </Box>
  );
}

function ColorSwatch({ color, selected, onClick, shape = 'circle' }) {
  const dark = relativeLuminance(color) < 0.35;
  return (
    <Box
      component="button"
      type="button"
      aria-label={color}
      onClick={onClick}
      sx={{
        width: shape === 'circle' ? { xs: 48, sm: 46 } : { xs: 58, sm: 60 },
        height: shape === 'circle' ? { xs: 48, sm: 46 } : { xs: 42, sm: 44 },
        p: 0,
        cursor: 'pointer',
        borderRadius: shape === 'circle' ? '50%' : 2,
        bgcolor: color,
        border: selected ? `3px solid ${appPink}` : '1px solid rgba(26,26,46,.14)',
        boxShadow: selected ? '0 0 0 2px rgba(255,107,157,.18)' : 'none',
        display: 'grid',
        placeItems: 'center',
        '&:hover': { bgcolor: color, transform: 'translateY(-1px)' },
      }}
    >
      {selected ? (
        <CheckCircleRoundedIcon sx={{ color: dark ? '#FFFFFF' : appText, fontSize: 18 }} />
      ) : null}
    </Box>
  );
}

function OptionTile({ icon, label, onClick, accent = '#8B5CF6', disabled = false }) {
  return (
    <Tooltip title={label}>
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="outlined"
        sx={{
          width: { xs: 132, sm: '100%' },
          flex: { xs: '0 0 auto', sm: 'initial' },
          minWidth: 0,
          height: { xs: 44, sm: 48 },
          justifyContent: 'flex-start',
          borderRadius: 2,
          borderColor: '#F3E8FF',
          bgcolor: 'rgba(237,233,254,.34)',
          color: 'text.primary',
          px: { xs: 1, sm: 1.2 },
          overflow: 'hidden',
          transition: 'all .15s ease',
          '&:hover': {
            borderColor: '#D9C7FF',
            bgcolor: 'rgba(237,233,254,.6)',
            transform: 'translateY(-1px)',
          },
        }}
        startIcon={cloneElement(icon, { sx: { color: accent, fontSize: 20 } })}
      >
        <Typography noWrap sx={{ minWidth: 0, fontSize: 12, fontWeight: 800 }}>
          {label}
        </Typography>
      </Button>
    </Tooltip>
  );
}

// On phones each section is a single horizontally-scrollable row; from sm up
// it stays a wrapping grid.
const optionGridSx = {
  display: { xs: 'flex', sm: 'grid' },
  gridTemplateColumns: { sm: 'repeat(auto-fit, minmax(116px, 116px))' },
  gap: 1,
  overflowX: { xs: 'auto', sm: 'visible' },
  pb: { xs: 0.75, sm: 0 },
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'thin',
  '&::-webkit-scrollbar': { height: 4 },
  '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(139,92,246,.35)', borderRadius: 999 },
  '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
};

const pickerGridSx = {
  display: 'grid',
  gridTemplateColumns: {
    xs: 'repeat(3, minmax(0, 1fr))',
    sm: 'repeat(auto-fill, minmax(120px, 1fr))',
  },
  gap: { xs: 1, sm: 1.25 },
};

function FontSizeDialog({ open, state, setState, onClose }) {
  return (
    <PanelDialog open={open} title="Font size" onClose={onClose} maxWidth="sm">
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25}>
          {[
            { label: 'B', selected: state.isBold, style: { fontWeight: 900 }, onClick: () => setState((s) => ({ ...s, isBold: !s.isBold })) },
            { label: 'I', selected: state.isItalic, style: { fontStyle: 'italic', fontWeight: 900 }, onClick: () => setState((s) => ({ ...s, isItalic: !s.isItalic })) },
          ].map((item) => (
            <Button
              key={item.label}
              onClick={item.onClick}
              variant="outlined"
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 50, sm: 52 },
                minWidth: 0,
                borderRadius: 2,
                borderColor: item.selected ? appPink : appBorder,
                borderWidth: item.selected ? 2 : 1,
                bgcolor: item.selected ? appLavender : '#FFFFFF',
                color: item.selected ? appPink : appText,
                fontSize: 24,
                ...item.style,
                '&:hover': { borderWidth: item.selected ? 2 : 1, borderColor: item.selected ? appPink : appBorder, bgcolor: item.selected ? appLavender : '#FFFFFF' },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 1.5 } }}>
          {fontSizes.map((size) => {
            const selected = state.fontSize === size;
            return (
              <Button
                key={size}
                variant="outlined"
                onClick={() => setState((s) => ({ ...s, fontSize: size }))}
                sx={{
                  width: { xs: 64, sm: 72 },
                  height: { xs: 56, sm: 60 },
                  minWidth: 0,
                  borderRadius: 2,
                  borderColor: selected ? appPink : appBorder,
                  borderWidth: selected ? 2 : 1,
                  bgcolor: selected ? appLavender : '#FFFFFF',
                  color: selected ? appPink : appText,
                  fontSize: { xs: 22, sm: 23 },
                  fontWeight: 900,
                  '&:hover': { borderWidth: selected ? 2 : 1, borderColor: selected ? appPink : appBorder, bgcolor: selected ? appLavender : '#FFFFFF' },
                }}
              >
                {size}
              </Button>
            );
          })}
        </Box>
      </Stack>
    </PanelDialog>
  );
}

function ColorDialog({ open, state, setState, onClose }) {
  const backgroundColors = [...new Set([...normalBgSwatches, '#FFFFFF'])];
  const textColors = [...new Set([...normalTextSwatches, '#000000'])];

  return (
    <PanelDialog open={open} title="Normal colors" onClose={onClose} maxWidth="sm">
      <PanelCard title="Normal colors" cost={0}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: { xs: 1.5, sm: 2 }, alignItems: 'stretch' }}>
          <Box>
            <Typography sx={{ mb: 1, color: appMuted, fontSize: 14, fontWeight: 800 }}>Background</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 1.2 } }}>
              {backgroundColors.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  shape="rounded"
                  selected={!state.backgroundTexture && state.backgroundColor.toLowerCase() === color.toLowerCase()}
                  onClick={() => setState((s) => ({ ...s, backgroundColor: color, backgroundTexture: null }))}
                />
              ))}
            </Box>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderColor: appBorder }} />
          <Box>
            <Typography sx={{ mb: 1, color: appMuted, fontSize: 14, fontWeight: 800 }}>Text</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 1.2 } }}>
              {textColors.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={state.textEffect == null && state.textColor.toLowerCase() === color.toLowerCase()}
                  onClick={() => setState((s) => ({ ...s, textColor: color, textEffect: null, legendaryMaterial: null }))}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </PanelCard>
    </PanelDialog>
  );
}

function FontDialog({ open, state, setState, onClose }) {
  return (
    <PanelDialog open={open} title="Normal fonts" onClose={onClose} maxWidth="md">
      <Box sx={pickerGridSx}>
        {fontFamilies.map((family) => {
          const selected = state.fontFamily === family;
          return (
            <Button
              key={family}
              variant="outlined"
              onClick={() => setState((s) => ({ ...s, fontFamily: family }))}
              sx={{
                aspectRatio: '1 / 1',
                minWidth: 0,
                p: 1,
                borderRadius: 2,
                borderColor: selected ? appPink : appBorder,
                borderWidth: selected ? 2 : 1,
                bgcolor: selected ? appLavender : '#FFFFFF',
                color: selected ? appPink : appText,
                fontFamily: `"${family}", sans-serif`,
                fontSize: { xs: 17, sm: 18 },
                fontWeight: 800,
                lineHeight: 1.15,
                textAlign: 'center',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
                '&:hover': { borderWidth: selected ? 2 : 1, borderColor: selected ? appPink : appBorder, bgcolor: selected ? appLavender : '#FFFFFF' },
              }}
            >
              {family}
            </Button>
          );
        })}
      </Box>
    </PanelDialog>
  );
}

function BorderSample({ preset }) {
  if (!preset) {
    return <BlockRoundedIcon sx={{ color: appMuted, fontSize: { xs: 36, sm: 38 } }} />;
  }
  if (preset.style === 'texture') {
    const frame = getTextureFrame(preset.texture);
    return frame ? (
      <Box component="img" src={frame} alt="" aria-hidden="true" sx={{ width: '100%', height: '100%', objectFit: 'fill' }} />
    ) : null;
  }
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        ...borderCss({ ...preset, color: preset.color || '#8B5CF6' }, 1),
      }}
    />
  );
}

function BorderTile({ name, preset, selected, cost, onClick }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        variant="outlined"
        onClick={onClick}
        sx={{
          width: '100%',
          aspectRatio: '1 / 1',
          minWidth: 0,
          p: { xs: 1, sm: 1.2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          borderRadius: 2,
          borderColor: selected ? appPink : appBorder,
          borderWidth: selected ? 2 : 1,
          bgcolor: selected ? appLavender : '#FFFFFF',
          color: selected ? appPink : appText,
          '&:hover': { borderWidth: selected ? 2 : 1, borderColor: selected ? appPink : appBorder, bgcolor: selected ? appLavender : '#FFFFFF' },
        }}
      >
        <Box sx={{ flex: 1, width: '100%', minHeight: 0, display: 'grid', placeItems: 'center' }}>
          <BorderSample preset={preset} />
        </Box>
        <Typography sx={{ fontSize: { xs: 15, sm: 16 }, fontWeight: 900, lineHeight: 1.1, color: 'inherit' }}>
          {name}
        </Typography>
      </Button>
      <Box sx={{ position: 'absolute', top: 6, right: 6 }}>
        <TokenBadge cost={cost} />
      </Box>
    </Box>
  );
}

function BorderDialog({ open, state, setState, onClose }) {
  const selectedName = normalBorderNames.find((name) => {
    const preset = borderStyles[name];
    if (!preset && !state.border) return true;
    return preset && state.border &&
      state.border.style !== 'texture' &&
      preset.width === state.border.width &&
      preset.style === state.border.style &&
      preset.radius === state.border.radius;
  }) || 'None';

  const selectedUsesColor = state.border && state.border.style !== 'texture';

  return (
    <PanelDialog open={open} title="Normal border" onClose={onClose} maxWidth="sm">
      <Stack spacing={2.5}>
        <Box>
          <Typography sx={{ mb: 1.25, color: appMuted, fontSize: 16, fontWeight: 900 }}>Style</Typography>
          <Box sx={pickerGridSx}>
            {normalBorderNames.map((name) => {
              const preset = borderStyles[name];
              return (
                <BorderTile
                  key={name}
                  name={name}
                  preset={preset ? { ...preset, color: state.border?.color || preset.color } : null}
                  selected={selectedName === name}
                  cost={0}
                  onClick={() => setState((s) => ({ ...s, border: preset ? { ...preset, color: s.border?.color || preset.color } : null }))}
                />
              );
            })}
          </Box>
        </Box>
        {selectedUsesColor ? (
          <Box>
            <Typography sx={{ mb: 1.25, color: appMuted, fontSize: 16, fontWeight: 900 }}>Frame color</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {borderColors.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={(state.border?.color || '').toLowerCase() === color.toLowerCase()}
                  onClick={() => setState((s) => ({ ...s, border: { ...s.border, color } }))}
                />
              ))}
            </Box>
          </Box>
        ) : null}
      </Stack>
    </PanelDialog>
  );
}

function DurationDialog({ open, state, setState, onClose }) {
  return (
    <PanelDialog open={open} title="Display time" onClose={onClose} maxWidth="xs">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {durations.map((duration) => {
          const selected = state.durationSeconds === duration;
          return (
            <Box key={duration} sx={{ position: 'relative' }}>
              <Button
                variant="outlined"
                onClick={() => setState((s) => ({ ...s, durationSeconds: duration }))}
                sx={{
                  width: { xs: 88, sm: 96 },
                  height: { xs: 58, sm: 62 },
                  minWidth: 0,
                  borderRadius: 2,
                  border: selected ? 'none' : `1px solid ${appBorder}`,
                  background: selected ? primaryGradient : '#FFFFFF',
                  color: selected ? '#FFFFFF' : appText,
                  fontSize: 24,
                  fontWeight: 900,
                  '&:hover': { border: selected ? 'none' : `1px solid ${appBorder}`, background: selected ? primaryGradient : '#FFFFFF' },
                }}
              >
                {duration}s
              </Button>
              <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                <TokenBadge cost={composerTokenCost({ durationSeconds: duration, hasImage: false })} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </PanelDialog>
  );
}

function EmojiDialog({ open, onClose, onInsert, notify }) {
  const [tab, setTab] = useState(0);
  const tabs = ['Basic', 'Premium', 'Legendary'];

  return (
    <PanelDialog open={open} title="Add an emoji" onClose={onClose}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={0.75}>
          {tabs.map((label, i) => (
            <Button
              key={label}
              size="small"
              variant={tab === i ? 'contained' : 'outlined'}
              onClick={() => setTab(i)}
              sx={{ minWidth: 0, flex: 1, fontSize: 12, fontWeight: 800 }}
            >
              {label}
            </Button>
          ))}
        </Stack>

        {tab < 2 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(5, minmax(0, 1fr))', sm: 'repeat(8, 1fr)' }, gap: 0.6 }}>
            {(tab === 0 ? basicEmojis : premiumEmojis).map((emoji) => (
              <Button
                key={emoji}
                onClick={() => { onInsert(emoji); onClose(); }}
                sx={{ minWidth: 0, height: { xs: 44, sm: 42 }, p: 0, fontSize: 24 }}
              >
                {emoji}
              </Button>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 1 }}>
            {legendaryImageEmojis.map((emoji) => (
              <Box
                key={emoji.label}
                onClick={() => notify('Legendary emojis are coming soon.')}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.4,
                  p: 0.5,
                  borderRadius: 1.5,
                  '&:hover': { bgcolor: 'rgba(139,92,246,.08)' },
                }}
              >
                <Box
                  component="img"
                  src={emoji.asset}
                  alt={emoji.label}
                  sx={{
                    width: 44,
                    height: 44,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 6px #FFD24DBB) drop-shadow(0 2px 4px #0006)',
                  }}
                />
                <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#B8860B', textAlign: 'center', lineHeight: 1.1 }}>
                  {emoji.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Stack>
    </PanelDialog>
  );
}

// ── Premium dialogs ────────────────────────────────────────────────────────

function materialPreviewLabel(material) {
  return material?.material === 'gold' ? 'Golden' : material.label;
}

function materialBgColor(material) {
  switch (material.id) {
    case 'premium_wood':
      return '#E0AE72';
    case 'premium_dark_wood':
      return '#2B1608';
    case 'premium_copper':
      return '#E38A56';
    case 'premium_glass':
      return '#E8FCFF';
    case 'premium_marble':
      return '#F7F6F3';
    case 'legendary_gold':
      return '#F4C84B';
    case 'legendary_diamond':
      return '#F2FAFF';
    case 'legendary_platinum':
      return '#F4F7FA';
    case 'legendary_onyx':
      return '#111827';
    case 'legendary_rosy_gold':
      return '#FFEFE8';
    default:
      return '#FFFFFF';
  }
}

function BackgroundOptionCard({ material, tier, selected, cost, onClick }) {
  const label = materialPreviewLabel(material);
  const base = materialBgColor(material);
  const darkText = relativeLuminance(base) > 0.55;
  return (
    <PanelCard title={`${tier} ${label}`} cost={cost}>
      <Box
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          height: { xs: 128, sm: 170 },
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          backgroundImage: `url(${material.bg})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: selected ? '3px solid #FFFFFF' : '1px solid rgba(255,255,255,.45)',
          boxShadow: selected ? '0 0 0 3px rgba(255,107,157,.45)' : 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            px: 1,
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              color: darkText ? 'rgba(0,0,0,.88)' : '#FFFFFF',
              fontSize: { xs: 20, sm: 24 },
              fontWeight: 900,
              textShadow: '0 2px 5px rgba(0,0,0,.44)',
            }}
          >
            {label}
          </Typography>
        </Box>
        {selected ? (
          <Box sx={{ position: 'absolute', right: 10, bottom: 10 }}>
            <SelectedMark />
          </Box>
        ) : null}
      </Box>
    </PanelCard>
  );
}

function BackgroundDialog({ open, title, tier, materials, cost, state, setState, onClose }) {
  const current = normalizeAssetId(state.backgroundTexture?.texture);
  return (
    <PanelDialog open={open} title={title} onClose={onClose} maxWidth="md">
      <Stack spacing={2}>
        {materials.map((m) => (
          <BackgroundOptionCard
            key={m.id}
            material={m}
            tier={tier}
            cost={cost}
            selected={current === m.id}
            onClick={() => setState((s) => ({
              ...s,
              backgroundColor: materialBgColor(m),
              backgroundTexture: { style: 'texture', texture: m.id },
            }))}
          />
        ))}
      </Stack>
    </PanelDialog>
  );
}

function PremiumBackgroundDialog({ open, state, setState, onClose }) {
  return (
    <BackgroundDialog
      open={open}
      title="Premium backgrounds"
      tier="Premium"
      materials={premiumMaterials}
      cost={20}
      state={state}
      setState={setState}
      onClose={onClose}
    />
  );
}

function PremiumColorDialog({ open, state, setState, onClose }) {
  return (
    <PanelDialog open={open} title="Premium colors" onClose={onClose} maxWidth="sm">
      <PanelCard title="Premium colors" cost={20}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.25 }}>
          {premiumTextOptions.map((option) => {
            const selected = state.textEffect === 'premium' &&
              state.textColor.toLowerCase() === option.color.toLowerCase();
            return (
              <Box
                key={option.label}
                onClick={() => setState((s) => ({
                  ...s,
                  textColor: option.color,
                  textEffect: 'premium',
                  legendaryMaterial: null,
                }))}
                sx={{
                  cursor: 'pointer',
                  p: 1.4,
                  minHeight: 106,
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  border: `2px solid ${selected ? appPink : option.color}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: option.color, flex: '0 0 auto' }} />
                  <Typography sx={{ minWidth: 0, flex: 1, color: appText, fontSize: 16, fontWeight: 900 }}>
                    {option.label}
                  </Typography>
                  {selected ? <SelectedMark /> : null}
                </Stack>
                <Typography sx={{ mt: 1.25, color: option.color, fontSize: 25, fontWeight: 900, lineHeight: 1.1 }}>
                  Text
                </Typography>
              </Box>
            );
          })}
        </Box>
      </PanelCard>
    </PanelDialog>
  );
}

function PremiumBorderDialog({ open, state, setState, onClose }) {
  const current = state.border?.style === 'texture' ? normalizeAssetId(state.border.texture) : null;
  return (
    <PanelDialog open={open} title="Premium border" onClose={onClose} maxWidth="sm">
      <Typography sx={{ mb: 1.25, color: appMuted, fontSize: 16, fontWeight: 900 }}>Style</Typography>
      <Box sx={pickerGridSx}>
        {premiumBorderMaterials.map((m) => (
          <BorderTile
            key={m.id}
            label={m.label}
            name={m.label}
            preset={{ style: 'texture', texture: m.id, width: 22, radius: 8, color: '#8B5CF6' }}
            selected={current === m.id}
            cost={20}
            onClick={() => setState((s) => ({ ...s, border: { style: 'texture', texture: m.id, width: 22, radius: 8, color: '#8B5CF6' } }))}
          />
        ))}
      </Box>
    </PanelDialog>
  );
}

// ── Legendary dialogs ──────────────────────────────────────────────────────

function LegendaryBackgroundDialog({ open, state, setState, onClose }) {
  return (
    <BackgroundDialog
      open={open}
      title="Legendary backgrounds"
      tier="Legendary"
      materials={legendaryBackgroundMaterials}
      cost={30}
      state={state}
      setState={setState}
      onClose={onClose}
    />
  );
}

function legendaryOptionBackground(material) {
  switch (material) {
    case 'diamond':
      return 'linear-gradient(135deg, #F7FBFF 0%, #DCE9F4 100%)';
    case 'platinum':
      return 'linear-gradient(135deg, #F8FAFC 0%, #E1E7EC 100%)';
    case 'onyx':
      return 'linear-gradient(135deg, #11151B 0%, #2A313C 100%)';
    case 'rosy_gold':
      return 'linear-gradient(135deg, #FFF1EB 0%, #F1D2C5 100%)';
    case 'gold':
    default:
      return 'linear-gradient(135deg, #FFF7D7 0%, #F6D478 100%)';
  }
}

function LegendaryDot({ material }) {
  const palette = {
    diamond: ['#FFFFFF', '#BBD8EA', '#24384A'],
    platinum: ['#FFFFFF', '#B7C0CA', '#58616C'],
    onyx: ['#9AA3AF', '#333A45', '#07090D'],
    rosy_gold: ['#FFE7DC', '#D89478', '#704130'],
    gold: ['#FFF3A8', '#D8A633', '#74500D'],
  }[material] || ['#FFF3A8', '#D8A633', '#74500D'];
  return (
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: `radial-gradient(circle at 32% 30%, ${palette[0]} 0 18%, ${palette[1]} 38%, ${palette[2]} 100%)`,
        boxShadow: 'inset -5px -5px 8px rgba(0,0,0,.28), inset 4px 4px 8px rgba(255,255,255,.72), 0 2px 4px rgba(0,0,0,.18)',
      }}
    />
  );
}

function LegendaryColorDialog({ open, state, setState, onClose }) {
  return (
    <PanelDialog open={open} title="Legendary colors" onClose={onClose} maxWidth="sm">
      <PanelCard title="Legendary colors">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.25 }}>
          {legendaryPickerMaterials.map((m) => {
            const selected = state.textEffect === 'legendary' && state.legendaryMaterial === m.material;
            return (
              <Box
                key={m.id}
                onClick={() => setState((s) => ({
                  ...s,
                  textColor: m.textColor,
                  textEffect: 'legendary',
                  legendaryMaterial: m.material,
                }))}
                sx={{
                  cursor: 'pointer',
                  minHeight: 154,
                  p: 1.4,
                  borderRadius: 2.2,
                  background: legendaryOptionBackground(m.material),
                  border: selected ? `2px solid ${appPink}` : `1px solid ${appBorder}`,
                  color: m.material === 'onyx' ? '#FFFFFF' : appText,
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 900, lineHeight: 1.1 }}>
                  {m.label}
                </Typography>
                <Typography
                  sx={{
                    mt: 1.2,
                    fontSize: { xs: 25, sm: 26 },
                    fontWeight: 1000,
                    lineHeight: 1,
                    letterSpacing: 0.8,
                    fontFamily: '"Roboto", sans-serif',
                    ...legendaryTextSx({ effect: 'legendary', legendaryMaterial: m.material, legendaryColor: m.textColor }, 26),
                  }}
                >
                  METAL
                </Typography>
                <Stack direction="row" alignItems="flex-end" sx={{ mt: 1.3 }}>
                  <LegendaryDot material={m.material} />
                  <Box sx={{ flex: 1 }} />
                  {selected ? <SelectedMark /> : null}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </PanelCard>
    </PanelDialog>
  );
}

function LegendaryBorderDialog({ open, state, setState, onClose }) {
  const current = state.border?.style === 'texture' ? normalizeAssetId(state.border.texture) : null;
  return (
    <PanelDialog open={open} title="Legendary border" onClose={onClose} maxWidth="sm">
      <Typography sx={{ mb: 1.25, color: appMuted, fontSize: 16, fontWeight: 900 }}>Style</Typography>
      <Box sx={pickerGridSx}>
        {legendaryBorderMaterials.map((m) => (
          <BorderTile
            key={m.id}
            name={`L. ${m.label}`}
            preset={{ style: 'texture', texture: m.id, width: 22, radius: 8, color: m.textColor }}
            selected={current === m.id}
            cost={30}
            onClick={() => setState((s) => ({ ...s, border: { style: 'texture', texture: m.id, width: 22, radius: 8, color: m.textColor } }))}
          />
        ))}
      </Box>
    </PanelDialog>
  );
}

export default function Composer({ state, setState, profile, setProfile, notify }) {
  const [panel, setPanel] = useState(null);
  const [sending, setSending] = useState(false);
  const [moderationError, setModerationError] = useState(null);
  const inputRef = useRef(null);
  const lastSentRef = useRef(null);

  const cost = useMemo(
    () => composerTokenCost({ durationSeconds: state.durationSeconds, hasImage: false }),
    [state.durationSeconds],
  );

  function updateText(value) {
    const next = value.slice(0, MAX_CHARS);
    setState((s) => ({ ...s, text: next }));
    const result = moderateText(next);
    setModerationError(result.isClean ? null : result.message);
  }

  function insertEmoji(emoji) {
    const input = inputRef.current;
    if (!input) {
      updateText(`${state.text}${emoji}`);
      return;
    }
    const start = input.selectionStart ?? state.text.length;
    const end = input.selectionEnd ?? state.text.length;
    const next = `${state.text.slice(0, start)}${emoji}${state.text.slice(end)}`;
    updateText(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  async function send() {
    const now = Date.now();
    if (lastSentRef.current !== null) {
      const wait = Math.ceil((lastSentRef.current + 10_000 - now) / 1000);
      if (wait > 0) {
        notify(`Please wait ${wait} seconds before sending again.`);
        return;
      }
    }

    const text = state.text.trim();
    if (!text) {
      notify('Write something to send.');
      return;
    }
    const result = moderateText(state.text);
    if (!result.isClean) {
      setModerationError(result.message);
      notify(result.message);
      return;
    }
    if (cost > (profile?.tokens || 0)) {
      notify(`Not enough tokens. This message costs ${cost} tokens but you have ${profile?.tokens || 0}.`);
      return;
    }

    setSending(true);
    try {
      const form = new FormData();
      form.append('text', state.text);
      form.append('style_runs', JSON.stringify([styleRunFromComposer(state)]));
      form.append('duration_seconds', String(state.durationSeconds));

      const frameTextureId = state.border?.style === 'texture' ? normalizeAssetId(state.border.texture) : null;
      const bgTextureId = normalizeAssetId(state.backgroundTexture?.texture);

      if (frameTextureId) {
        form.append('frame_id', frameTextureId);
      } else if (state.border) {
        form.append('border', JSON.stringify(state.border));
      }

      if (bgTextureId) {
        form.append('background_id', bgTextureId);
      } else {
        form.append('background_color', state.backgroundColor);
      }

      const canvasBlob = await captureComposerCanvas(state);
      if (canvasBlob) {
        form.append('canvas_image', canvasBlob, 'canvas.png');
      }

      const textBlob = await captureTextCanvas(state);
      if (textBlob) {
        form.append('text_image', textBlob, 'text.png');
        form.append('text_canvas_width', String(FIELD_W));
        form.append('text_canvas_height', String(FIELD_H));
      }

      const data = await api.createPost(form);
      if (typeof data?.user_tokens === 'number') {
        setProfile((p) => ({ ...p, tokens: data.user_tokens }));
      }
      lastSentRef.current = Date.now();
      setState((s) => ({ ...s, text: '' }));
      setModerationError(null);
      notify('Sent!');
    } catch (err) {
      notify(err.message);
    } finally {
      setSending(false);
    }
  }

  const isTextureBorder = state.border?.style === 'texture';
  const frameUrl = isTextureBorder ? getTextureFrame(state.border.texture) : null;

  // Per-material safe insets as percentage padding so the live field matches
  // the captured output (authored in the 420×420 field space; the field is
  // square so width-relative percentages apply equally to every side).
  const textInsets = textInsetsFor(state);
  const padPct = (v) => `${((v / FIELD_W) * 100).toFixed(3)}%`;
  const isLegendaryText = state.textEffect === 'legendary' && state.text.length > 0;
  const legendaryInputSx = isLegendaryText
    ? {
        ...legendaryInputTextSx(
          { effect: 'legendary', legendaryMaterial: state.legendaryMaterial, legendaryColor: state.textColor },
          state.fontSize,
        ),
        caretColor: state.textColor,
      }
    : null;
  const isPremiumText = state.textEffect === 'premium' && state.text.length > 0;
  const premiumInputSx = isPremiumText
    ? premiumTextSx(state.textColor, state.fontSize)
    : null;

  return (
    <>
      <Stack spacing={{ xs: 1.25, sm: 1.6 }} sx={{ height: { md: '100%' }, minHeight: 0 }}>
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: 3,
            border: '1px solid #F3E8FF',
            boxShadow: '0 16px 40px rgba(255,107,157,.10)',
            overflow: 'hidden',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              px: { xs: 1.25, sm: 2 },
              py: { xs: 1, sm: 1.3 },
              minWidth: 0,
              gap: { xs: 0.5, sm: 0.75 },
            }}
          >
            <Typography color="text.secondary" sx={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: { xs: 12, sm: 14 }, whiteSpace: 'nowrap' }}>
              {state.text.length} / {MAX_CHARS}
            </Typography>
            <Typography sx={{ mr: { xs: 0.25, sm: 1 }, color: '#8B5CF6', fontSize: { xs: 12, sm: 13 }, fontWeight: 900, whiteSpace: 'nowrap' }}>
              {cost} tokens
            </Typography>
            <Tooltip title="Add photo">
              <IconButton size="small" onClick={() => notify('Photo attachment is coming soon.')} sx={{ color: '#8B5CF6', flex: '0 0 auto' }}>
                <AddPhotoAlternateOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add emoji">
              <IconButton size="small" onClick={() => setPanel('emoji')} sx={{ color: '#8B5CF6', flex: '0 0 auto' }}>
                <SentimentSatisfiedAltOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Divider />
          <Box sx={{ p: { xs: 1.25, sm: 2 } }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: { xs: '100%', sm: 520 },
                aspectRatio: '1 / 1',
                mx: 'auto',
                p: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Author the field in the 420 design space (cqw/cqh below) so
                // the live text wraps, scales, and centres exactly like the
                // captured image and the billboard.
                containerType: 'size',
                ...composerSurfaceSx(state),
              }}
            >
              <TextField
                inputRef={inputRef}
                value={state.text}
                onChange={(e) => updateText(e.target.value)}
                placeholder="Share your thoughts, feelings, wishes or stories..."
                multiline
                minRows={1}
                variant="standard"
                fullWidth
                InputProps={{ disableUnderline: true }}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-root': {
                    p: 0,
                    width: '100%',
                    // Cap at the field height so long text scrolls inside the
                    // field instead of overflowing the frame; short text stays
                    // vertically centred by the parent flex.
                    maxHeight: '100cqh',
                    overflowY: 'auto',
                  },
                  '& .MuiInputBase-input': {
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    color: state.textColor,
                    fontSize: `calc(${state.fontSize} / ${FIELD_W} * 100cqw)`,
                    fontFamily: `"${state.fontFamily}", sans-serif`,
                    fontWeight: state.isBold ? 700 : 400,
                    fontStyle: state.isItalic ? 'italic' : 'normal',
                    lineHeight: 1.28,
                    padding: `${padPct(textInsets.top)} ${padPct(textInsets.right)} ${padPct(textInsets.bottom)} ${padPct(textInsets.left)}`,
                    ...(legendaryInputSx || premiumInputSx || {}),
                  },
                  '& textarea::placeholder': {
                    color: state.textColor,
                    opacity: 0.45,
                  },
                }}
              />
              {frameUrl ? (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${frameUrl})`,
                    backgroundSize: '100% 100%',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
              ) : null}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            // On phones the whole page (the <main> scroller) handles vertical
            // scrolling; capping + nesting a second scroller here is what
            // blocked vertical scroll. Desktop keeps the inner scroll panel.
            maxHeight: { md: 'none' },
            p: { xs: 1.25, sm: 1.6 },
            bgcolor: '#FFFFFF',
            borderRadius: 3,
            border: '1px solid #F3E8FF',
            overflowY: { xs: 'visible', md: 'auto' },
            overflowX: 'hidden',
          }}
        >
          <Stack spacing={{ xs: 1.5, sm: 1.8 }}>
            <Box>
              <Typography sx={{ color: '#8B5CF6', fontWeight: 900, fontSize: 13, mb: 1 }}>Normal</Typography>
              <Box sx={optionGridSx}>
                <OptionTile icon={<FormatSizeRoundedIcon />} label="Font size" onClick={() => setPanel('fontSize')} />
                <OptionTile icon={<PaletteOutlinedIcon />} label="Color" onClick={() => setPanel('colors')} />
                <OptionTile icon={<FontDownloadOutlinedIcon />} label="Font style" onClick={() => setPanel('font')} />
                <OptionTile icon={<CropSquareRoundedIcon />} label="Border" onClick={() => setPanel('border')} />
                <OptionTile icon={<TimerOutlinedIcon />} label="Time" onClick={() => setPanel('duration')} />
              </Box>
            </Box>
            <Box>
              <Typography sx={{ color: '#B78628', fontWeight: 900, fontSize: 13, mb: 1 }}>Premium</Typography>
              <Box sx={optionGridSx}>
                <OptionTile icon={<WallpaperRoundedIcon />} label="Background" accent="#B78628" onClick={() => notify('Premium backgrounds are coming soon.')} />
                <OptionTile icon={<PaletteOutlinedIcon />} label="Color" accent="#B78628" onClick={() => notify('Premium colors are coming soon.')} />
                <OptionTile icon={<CropSquareRoundedIcon />} label="Border" accent="#B78628" onClick={() => notify('Premium borders are coming soon.')} />
              </Box>
            </Box>
            <Box>
              <Typography sx={{ color: '#8B6D16', fontWeight: 900, fontSize: 13, mb: 1 }}>Legendary</Typography>
              <Box sx={optionGridSx}>
                <OptionTile icon={<WallpaperRoundedIcon />} label="Background" accent="#8B6D16" onClick={() => notify('Legendary backgrounds are coming soon.')} />
                <OptionTile icon={<PaletteOutlinedIcon />} label="Color" accent="#8B6D16" onClick={() => notify('Legendary colors are coming soon.')} />
                <OptionTile icon={<CropSquareRoundedIcon />} label="Border" accent="#8B6D16" onClick={() => notify('Legendary borders are coming soon.')} />
              </Box>
            </Box>
          </Stack>
        </Box>

        {moderationError ? <Alert severity="error">{moderationError}</Alert> : null}

        <Box
          sx={{
            position: { xs: 'fixed', md: 'static' },
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            px: { xs: 1, sm: 2, md: 0 },
            pt: { xs: 1, md: 0 },
            pb: { xs: 'calc(10px + env(safe-area-inset-bottom))', md: 0 },
            background: {
              xs: 'linear-gradient(180deg, rgba(255,245,248,0) 0%, rgba(255,245,248,.94) 32%, #FFF5F8 100%)',
              md: 'none',
            },
          }}
        >
          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={send}
            disabled={sending || Boolean(moderationError)}
            startIcon={sending ? null : <SendRoundedIcon />}
            sx={{
              minHeight: { xs: 50, sm: 54 },
              background: primaryGradient,
              boxShadow: '0 10px 26px rgba(255,107,157,.35)',
            }}
          >
            {sending ? <CircularProgress size={22} color="inherit" /> : 'Send Message'}
          </Button>
        </Box>
      </Stack>

      <FontSizeDialog open={panel === 'fontSize'} state={state} setState={setState} onClose={() => setPanel(null)} />
      <ColorDialog open={panel === 'colors'} state={state} setState={setState} onClose={() => setPanel(null)} />
      <FontDialog open={panel === 'font'} state={state} setState={setState} onClose={() => setPanel(null)} />
      <BorderDialog open={panel === 'border'} state={state} setState={setState} onClose={() => setPanel(null)} />
      <DurationDialog open={panel === 'duration'} state={state} setState={setState} onClose={() => setPanel(null)} />
      <EmojiDialog open={panel === 'emoji'} onInsert={insertEmoji} onClose={() => setPanel(null)} notify={notify} />

      <PremiumBackgroundDialog open={panel === 'premiumBg'} state={state} setState={setState} onClose={() => setPanel(null)} />
      <PremiumColorDialog open={panel === 'premiumColor'} state={state} setState={setState} onClose={() => setPanel(null)} />
      <PremiumBorderDialog open={panel === 'premiumBorder'} state={state} setState={setState} onClose={() => setPanel(null)} />

      <LegendaryBackgroundDialog open={panel === 'legendaryBg'} state={state} setState={setState} onClose={() => setPanel(null)} />
      <LegendaryColorDialog open={panel === 'legendaryColor'} state={state} setState={setState} onClose={() => setPanel(null)} />
      <LegendaryBorderDialog open={panel === 'legendaryBorder'} state={state} setState={setState} onClose={() => setPanel(null)} />
    </>
  );
}

export { defaultComposerState };
