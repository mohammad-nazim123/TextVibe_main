import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { api } from '../lib/api.js';
import { defaultComposerState, isUnsupportedPostStyle, normalizeAssetId } from '../lib/constants.js';
import DialogHeader from './DialogHeader.jsx';
import PostPreview from './PostPreview.jsx';
import {
  responsiveDialogContentSx,
  useResponsiveDialogProps,
} from './responsiveDialog.js';

function composerFromPost(post) {
  const firstRun = Array.isArray(post.style_runs) ? post.style_runs[0] : null;
  const frameTextureId = normalizeAssetId(
    post.frame_id || (post.border?.style === 'texture' ? post.border.texture : null),
  );
  const bgTextureId = normalizeAssetId(post.background_id || post.background_texture?.texture);
  const isLegendaryRun = Boolean(
    firstRun &&
      (firstRun.effect === 'legendary' || firstRun.legendaryMaterial || firstRun.legendaryColor),
  );
  return {
    ...defaultComposerState,
    text: post.text || '',
    backgroundColor: post.background_color || '#FFFFFF',
    backgroundTexture: bgTextureId ? { style: 'texture', texture: bgTextureId } : null,
    textColor: firstRun?.legendaryColor || firstRun?.color || '#000000',
    textEffect: isLegendaryRun ? 'legendary' : null,
    legendaryMaterial: isLegendaryRun ? firstRun?.legendaryMaterial || 'gold' : null,
    fontSize: Number(firstRun?.fontSize) || 18,
    fontFamily: firstRun?.fontFamily || 'Roboto',
    isBold: Number(firstRun?.fontWeight) === 700,
    isItalic: firstRun?.fontStyle === 'italic',
    border: frameTextureId
      ? { style: 'texture', texture: frameTextureId }
      : post.border?.style === 'texture'
        ? null
        : post.border || null,
    durationSeconds: Number(post.duration_seconds) || 5,
  };
}

export default function HistoryDialog({ open, onClose, onUseTemplate, notify }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dialogProps } = useResponsiveDialogProps({ maxWidth: 'sm' });

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    api.getPosts()
      .then((data) => setPosts(Array.isArray(data) ? data.slice(0, 10) : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  function useTemplate(post) {
    if (isUnsupportedPostStyle(post)) {
      notify('That template uses coming-soon styles, so only supported normal settings will be reused.');
    }
    onUseTemplate(composerFromPost(post));
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} {...dialogProps}>
      <DialogHeader title="History" onClose={onClose} />
      <DialogContent sx={{ ...responsiveDialogContentSx, pb: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 3 } }}>
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : posts.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 900, fontSize: 20 }}>History</Typography>
            <Typography color="text.secondary">Your sent messages will appear here.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {posts.map((post) => (
              <Box
                key={post.id}
                sx={{
                  p: 1.5,
                  border: '1px solid #F3E8FF',
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <PostPreview post={post} height={112} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', overflowWrap: 'anywhere' }}>
                      {post.created_at || ''}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
                      {post.text || 'Untitled message'}
                    </Typography>
                    <Button size="small" onClick={() => useTemplate(post)} sx={{ mt: 0.5, width: { xs: '100%', sm: 'auto' } }}>
                      Tap to reuse style
                    </Button>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
