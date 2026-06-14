import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import TollRoundedIcon from '@mui/icons-material/TollRounded';

import { primaryGradient } from '../lib/constants.js';

export default function AppDrawer({
  open,
  variant = 'temporary',
  profile,
  onClose,
  onEditProfile,
  onBuyTokens,
  onHistory,
  onSupport,
  onLogout,
  sx,
}) {
  const isPermanent = variant === 'permanent';
  const name = profile?.name?.trim() || 'Add your name';
  const email = profile?.email || '';

  return (
    <Drawer
      variant={variant}
      open={isPermanent ? true : open}
      onClose={isPermanent ? undefined : onClose}
      sx={{
        flex: isPermanent ? '0 0 320px' : undefined,
        width: isPermanent ? 320 : undefined,
        ...sx,
      }}
      PaperProps={{
        sx: {
          width: 'min(320px, 92vw)',
          maxWidth: '92vw',
          overflow: 'hidden',
          ...(isPermanent
            ? {
                position: 'relative',
                width: 320,
                maxWidth: 320,
                height: '100%',
                borderRight: '1px solid #F3E8FF',
                boxShadow: '6px 0 26px rgba(139,92,246,.06)',
              }
            : null),
        },
      }}
    >
      <Box sx={{ height: isPermanent ? '100%' : '100dvh', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box sx={{ p: { xs: 2, sm: 2.5 }, color: '#FFFFFF', background: primaryGradient, flex: '0 0 auto' }}>
          <Stack spacing={1.4}>
            <Avatar
              src={profile?.avatar || undefined}
              alt={name}
              sx={{
                width: 68,
                height: 68,
                border: '3px solid rgba(255,255,255,.55)',
                bgcolor: 'rgba(255,255,255,.22)',
                fontSize: 28,
                fontWeight: 900,
              }}
            >
              {name[0]?.toUpperCase() || 'T'}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 900, overflowWrap: 'anywhere', lineHeight: 1.25 }}>
                {name}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,.78)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {email}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditRoundedIcon />}
              onClick={onEditProfile}
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255,255,255,.55)',
                alignSelf: 'flex-start',
                '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,.12)' },
              }}
            >
              Edit profile
            </Button>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                border: '1px solid #F3E8FF',
                boxShadow: '0 10px 28px rgba(139,92,246,.10)',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#FFFFFF',
                    background: primaryGradient,
                    flex: '0 0 auto',
                  }}
                >
                  <TollRoundedIcon />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900 }}>Tokens</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your current balance
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 900, fontSize: 24, color: '#8B5CF6', maxWidth: 96, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile?.tokens ?? 0}
                </Typography>
              </Stack>
            </Box>
          </Box>

          <List sx={{ px: { xs: 1.5, sm: 2 }, pb: 2 }}>
            <ListItemButton onClick={onBuyTokens} sx={{ borderRadius: 2, mb: 1, background: primaryGradient, color: '#FFFFFF' }}>
              <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 38 }}>
                <AddCircleOutlineRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Buy Tokens" primaryTypographyProps={{ fontWeight: 800 }} />
            </ListItemButton>
            <ListItemButton onClick={onHistory} sx={{ borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 38, color: '#8B5CF6' }}>
                <HistoryRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="History" primaryTypographyProps={{ fontWeight: 800 }} />
            </ListItemButton>
          </List>
        </Box>

        <Divider />
        <Box sx={{ p: { xs: 1.5, sm: 2 }, flex: '0 0 auto', pb: 'calc(16px + env(safe-area-inset-bottom))' }}>
          <Button
            fullWidth
            size="large"
            variant="outlined"
            startIcon={<SupportAgentRoundedIcon />}
            onClick={onSupport}
            sx={{ height: 48, mb: 1.25, borderColor: '#E9D5FF', color: '#8B5CF6', '&:hover': { borderColor: '#8B5CF6', bgcolor: '#FAF5FF' } }}
          >
            Support
          </Button>
          <Button
            fullWidth
            size="large"
            variant="contained"
            color="error"
            startIcon={<LogoutRoundedIcon />}
            onClick={onLogout}
            sx={{ height: 48 }}
          >
            Log out
          </Button>
          <Typography sx={{ mt: 1.5, textAlign: 'center', fontSize: 11, color: 'text.secondary' }}>
            TextVibe Version 1.0.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
