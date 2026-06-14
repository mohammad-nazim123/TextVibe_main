import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import dashboardLogo from '../assets/TextVibe_dasboard_logo.png';
import { getStoredSession, logoutServerSide } from '../lib/api.js';
import { defaultComposerState, primaryGradient } from '../lib/constants.js';
import AppDrawer from './AppDrawer.jsx';
import BuyTokensDialog from './BuyTokensDialog.jsx';
import Composer from './Composer.jsx';
import EditProfileDialog from './EditProfileDialog.jsx';
import HistoryDialog from './HistoryDialog.jsx';

export default function Dashboard({ profile, setProfile, onLoggedOut, notify, navigate }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [composerState, setComposerState] = useState(defaultComposerState);

  function openEditProfile() {
    setDrawerOpen(false);
    setEditOpen(true);
  }

  function openBuyTokens() {
    setDrawerOpen(false);
    notify('Buying tokens is coming soon.');
  }

  function openHistory() {
    setDrawerOpen(false);
    setHistoryOpen(true);
  }

  function openSupport() {
    setDrawerOpen(false);
    navigate('/support');
  }

  function logout() {
    // Capture the tokens before onLoggedOut wipes storage, then leave
    // immediately — the server-side blacklist is best-effort and must never
    // delay or block returning to the login screen.
    const session = getStoredSession();
    onLoggedOut();
    if (session?.refresh) logoutServerSide(session.refresh, session.access);
  }

  return (
    <Box
      sx={{
        height: '100dvh',
        background:
          'radial-gradient(circle at 14% 12%, rgba(255,107,157,.14), transparent 30%), radial-gradient(circle at 86% 20%, rgba(139,92,246,.12), transparent 32%), #FFF5F8',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid #F3E8FF',
          bgcolor: 'rgba(255,255,255,.88)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar
          sx={{
            gap: { xs: 0.75, sm: 1.2 },
            px: { xs: 1, sm: 2 },
            minWidth: 0,
          }}
        >
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Box
            component="img"
            src={dashboardLogo}
            alt="TextVibe"
            sx={{
              width: { xs: 36, sm: 42 },
              height: { xs: 28, sm: 30 },
              objectFit: 'contain',
              bgcolor: '#FFFFFF',
              borderRadius: 2,
              flex: '0 0 auto',
            }}
          />
          <Typography
            noWrap
            sx={{
              fontSize: { xs: 19, sm: 22 },
              fontWeight: 900,
              flex: 1,
              minWidth: 0,
              lineHeight: 1.2,
            }}
          >
            <Box component="span" sx={{ color: '#1A1A2E' }}>Text</Box>
            <Box component="span" sx={{ color: '#FF6B9D' }}>Vibe</Box>
            <Box component="span" aria-hidden="true" sx={{ display: { xs: 'none', sm: 'inline' } }}> 💗</Box>
          </Typography>
          <Box
            sx={{
              px: 1.4,
              py: 0.7,
              borderRadius: 999,
              color: '#FFFFFF',
              background: primaryGradient,
              fontSize: { xs: 12, sm: 13 },
              fontWeight: 900,
              maxWidth: { xs: 116, sm: 160 },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: '0 0 auto',
            }}
          >
            {profile?.tokens ?? 0} tokens
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
        }}
      >
        <AppDrawer
          variant="permanent"
          open
          profile={profile}
          onEditProfile={openEditProfile}
          onBuyTokens={openBuyTokens}
          onHistory={openHistory}
          onSupport={openSupport}
          onLogout={logout}
          sx={{ display: { xs: 'none', md: 'block' } }}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            px: { xs: 1, sm: 2, md: 2.5, lg: 3 },
            py: { xs: 1.25, sm: 2, md: 2.5 },
            // Keep content clear of the fixed Send bar on phones/tablets.
            pb: {
              xs: 'calc(86px + env(safe-area-inset-bottom))',
              sm: 'calc(92px + env(safe-area-inset-bottom))',
              md: 2.5,
            },
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: 980, lg: 1040 }, minWidth: 0, minHeight: { md: 'calc(100dvh - 112px)' } }}>
            <Composer
              state={composerState}
              setState={setComposerState}
              profile={profile}
              setProfile={setProfile}
              notify={notify}
            />
          </Box>
        </Box>
      </Box>

      <AppDrawer
        open={drawerOpen}
        variant="temporary"
        profile={profile}
        onClose={() => setDrawerOpen(false)}
        onEditProfile={openEditProfile}
        onBuyTokens={openBuyTokens}
        onHistory={openHistory}
        onSupport={openSupport}
        onLogout={logout}
        sx={{ display: { xs: 'block', md: 'none' } }}
      />

      <EditProfileDialog
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSaved={setProfile}
        notify={notify}
      />
      <HistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        notify={notify}
        onUseTemplate={(next) => setComposerState(next)}
      />
      <BuyTokensDialog
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        notify={notify}
        onPurchased={(tokens) => setProfile((p) => ({ ...p, tokens }))}
        profile={profile}
      />
    </Box>
  );
}
