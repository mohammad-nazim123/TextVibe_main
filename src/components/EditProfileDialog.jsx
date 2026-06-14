import { useEffect, useMemo, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';

import { api } from '../lib/api.js';
import DialogHeader from './DialogHeader.jsx';
import {
  responsiveDialogContentSx,
  useResponsiveDialogProps,
} from './responsiveDialog.js';

export default function EditProfileDialog({ open, profile, onClose, onSaved, notify }) {
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const { dialogProps } = useResponsiveDialogProps({ maxWidth: 'xs' });

  useEffect(() => {
    if (open) {
      setName(profile?.name || '');
      setAvatarFile(null);
    }
  }, [open, profile]);

  const previewUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : null), [avatarFile]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function save() {
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      if (avatarFile) form.append('avatar', avatarFile);
      const updated = await api.updateProfile(form);
      onSaved(updated);
      notify('Profile updated.');
      onClose();
    } catch (err) {
      notify(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} {...dialogProps}>
      <DialogHeader title="Edit profile" onClose={onClose} disabled={saving} />
      <DialogContent sx={responsiveDialogContentSx}>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Box sx={{ display: 'grid', placeItems: 'center' }}>
            <Button component="label" sx={{ borderRadius: '50%', p: 0 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={previewUrl || profile?.avatar || undefined}
                  sx={{ width: 92, height: 92, bgcolor: 'rgba(255,107,157,.12)', color: '#FF6B9D', fontSize: 34 }}
                >
                  {(name || profile?.email || 'T')[0]?.toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#FFFFFF',
                    bgcolor: '#FF6B9D',
                    border: '2px solid #FFFFFF',
                  }}
                >
                  <CameraAltRoundedIcon sx={{ fontSize: 17 }} />
                </Box>
              </Box>
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Tap to change photo
            </Typography>
          </Box>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 2.5 },
          pt: 0,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1, sm: 0 },
          '& > :not(style) ~ :not(style)': {
            ml: { xs: 0, sm: 1 },
          },
        }}
      >
        <Button onClick={onClose} disabled={saving} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={saving} sx={{ minWidth: 96, width: { xs: '100%', sm: 'auto' } }}>
          {saving ? <CircularProgress size={20} color="inherit" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
