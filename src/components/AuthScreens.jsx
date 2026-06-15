import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { GoogleLogin } from '@react-oauth/google';

import dashboardLogo from '../assets/TextVibe_dasboard_logo.png';
import { api, saveSession } from '../lib/api.js';
import { primaryGradient } from '../lib/constants.js';

export default function AuthScreens({ onAuthenticated, notify }) {
  const [step, setStep] = useState('google'); // 'google' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGooglePicked(pickedEmail) {
    setEmail(pickedEmail);
    setLoading(true);
    try {
      await api.requestEmailOtp(pickedEmail);
      setStep('otp');
    } catch (err) {
      notify(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSuccess(credentialResponse) {
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      handleGooglePicked(payload.email);
    } catch {
      notify('Could not read the selected account. Please try again.');
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    if (!otp.trim()) { notify('Enter the verification code.'); return; }
    setLoading(true);
    try {
      const data = await api.verifyEmailOtp(email.trim(), otp.trim());
      saveSession({
        access: data.access,
        refresh: data.refresh,
        email: data.user?.email || email.trim(),
      });
      onAuthenticated();
    } catch (err) {
      notify(err.message);
    } finally {
      setLoading(false);
    }
  }

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
                {step === 'google' ? 'Welcome to TextVibe' : 'Check your Gmail'}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.55 }}>
                {step === 'google'
                  ? 'Sign in with your Google account. We\'ll send a verification code to your Gmail.'
                  : `Enter the 6-digit code sent to ${email}`}
              </Typography>
            </Stack>

            {step === 'google' ? (
              <Stack spacing={2}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => notify('Google Sign-In failed. Please try again.')}
                  width="368"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                  <Typography variant="caption" color="text.secondary">or</Typography>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                </Box>
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleGooglePicked(email.trim()); }}>
                  <Stack spacing={1.5}>
                    <TextField
                      label="Gmail address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      fullWidth
                      disabled={loading}
                      placeholder="you@gmail.com"
                    />
                    <Button
                      type="submit"
                      size="large"
                      variant="contained"
                      disabled={loading || !email.trim()}
                      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                      sx={{ minHeight: 48, background: primaryGradient }}
                    >
                      Send OTP
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            ) : (
              <Box component="form" onSubmit={handleVerifyOtp}>
                <Stack spacing={2}>
                  <TextField
                    label="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                    fullWidth
                    autoFocus
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
                    Verify &amp; Continue
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    disabled={loading}
                    onClick={() => { setStep('google'); setOtp(''); setEmail(''); }}
                    sx={{ color: 'text.secondary' }}
                  >
                    Wrong account? Go back
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
