import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import dashboardLogo from '../assets/TextVibe_dasboard_logo.png';
import { api, saveSession } from '../lib/api.js';
import { primaryGradient } from '../lib/constants.js';

export default function AuthScreens({ onAuthenticated, notify }) {
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Sign Up
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function resetFields() {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }

  function handleTabChange(_, newValue) {
    setTab(newValue);
    resetFields();
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!username.trim()) { notify('Enter your username.'); return; }
    if (!password) { notify('Enter your password.'); return; }
    setLoading(true);
    try {
      const data = await api.login(username.trim(), password);
      saveSession({
        access: data.access,
        refresh: data.refresh,
        email: data.user?.email || '',
      });
      onAuthenticated();
    } catch (err) {
      notify(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(event) {
    event.preventDefault();
    if (!username.trim()) { notify('Enter a username.'); return; }
    if (!password) { notify('Enter a password.'); return; }
    if (password !== confirmPassword) { notify('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const data = await api.register(username.trim(), password);
      saveSession({
        access: data.access,
        refresh: data.refresh,
        email: data.user?.email || '',
      });
      onAuthenticated();
    } catch (err) {
      notify(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isLogin = tab === 0;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 1.5, sm: 2 },
        py: { xs: 2, sm: 4 },
        background:
          'radial-gradient(circle at 14% 12%, rgba(255,107,157,.18), transparent 30%), radial-gradient(circle at 86% 20%, rgba(139,92,246,.16), transparent 32%), #FFF5F8',
        overflowX: 'hidden',
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.25, sm: 4 },
            border: '1px solid #F3E8FF',
            boxShadow: '0 18px 48px rgba(139,92,246,.16)',
            width: '100%',
          }}
        >
          <Stack spacing={{ xs: 2.5, sm: 3 }}>
            <Stack spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  background: '#FFFFFF',
                  border: '1px solid rgba(139,92,246,.18)',
                  boxShadow: '0 8px 24px rgba(255,107,157,.18)',
                }}
              >
                <Box component="img" src={dashboardLogo} alt="TextVibe" sx={{ width: 44, height: 44, objectFit: 'contain' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: 0, fontSize: { xs: 28, sm: 34 }, lineHeight: 1.12 }}>
                Welcome to TextVibe
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.55 }}>
                {isLogin ? 'Sign in with your username and password.' : 'Create a new account to get started.'}
              </Typography>
            </Stack>

            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': { background: primaryGradient },
                '& .Mui-selected': { fontWeight: 700 },
              }}
            >
              <Tab label="Login" disabled={loading} />
              <Tab label="Sign Up" disabled={loading} />
            </Tabs>

            {isLogin ? (
              <Box component="form" onSubmit={handleLogin}>
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    fullWidth
                    autoFocus
                    disabled={loading}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    fullWidth
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    size="large"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                    sx={{ minHeight: 52, background: primaryGradient }}
                  >
                    Login
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSignUp}>
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    fullWidth
                    autoFocus
                    disabled={loading}
                    helperText="Letters, numbers, and underscores only."
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    fullWidth
                    disabled={loading}
                    helperText="At least 6 characters."
                  />
                  <TextField
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    fullWidth
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    size="large"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                    sx={{ minHeight: 52, background: primaryGradient }}
                  >
                    Sign Up
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
