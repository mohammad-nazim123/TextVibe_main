import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';

import dashboardLogo from '../assets/TextVibe_dasboard_logo.png';
import { api, saveSession } from '../lib/api.js';
import { primaryGradient } from '../lib/constants.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';
const DIRECT_DASHBOARD_EMAIL = 'textvibe!7865990@example.com';

let googleIdentityScriptPromise = null;

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleIdentityScriptPromise) return googleIdentityScriptPromise;

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Sign-In could not be loaded.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Google Sign-In could not be loaded.'));
    document.head.appendChild(script);
  });

  return googleIdentityScriptPromise;
}

function decodeGoogleCredential(credential) {
  if (!credential) return null;
  const [, payload] = credential.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function AuthScreens({ onAuthenticated, notify }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [googleStatus, setGoogleStatus] = useState(GOOGLE_CLIENT_ID ? 'idle' : 'missing-client');
  const googleButtonRef = useRef(null);
  const googleCallbackRef = useRef(null);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const id = setTimeout(() => setResendIn((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  useEffect(() => {
    googleCallbackRef.current = async (credentialResponse) => {
      const profile = decodeGoogleCredential(credentialResponse?.credential);
      const selectedEmail = profile?.email?.trim().toLowerCase();

      if (!selectedEmail) {
        notify('Could not read the selected Google account. Please try again.');
        return;
      }
      if (profile.email_verified === false) {
        notify('Choose a verified Google account to continue.');
        return;
      }

      const outcome = await sendCode(selectedEmail);
      if (outcome !== 'failed') {
        setEmail(selectedEmail);
        setOtp('');
        setStep('otp');
      }
    };
  });

  useEffect(() => {
    if (step !== 'email' || !GOOGLE_CLIENT_ID || !googleButtonRef.current) return undefined;

    let cancelled = false;
    setGoogleStatus('loading');

    loadGoogleIdentityScript()
      .then((google) => {
        if (cancelled || !google?.accounts?.id || !googleButtonRef.current) return;

        googleButtonRef.current.replaceChildren();
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (credentialResponse) => googleCallbackRef.current?.(credentialResponse),
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const buttonWidth = Math.min(
          400,
          Math.max(240, Math.floor(googleButtonRef.current.getBoundingClientRect().width) || 320),
        );

        google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: buttonWidth,
        });

        setGoogleStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setGoogleStatus('failed');
      });

    return () => {
      cancelled = true;
      googleButtonRef.current?.replaceChildren();
    };
  }, [step]);

  // Returns 'sent' | 'cooldown' | 'failed'. A cooldown means a code is already
  // active for this email, so the OTP step is still usable.
  async function sendCode(targetEmail) {
    setLoading(true);
    try {
      await api.requestEmailOtp(targetEmail);
      setResendIn(60);
      notify(`OTP email accepted for delivery to ${targetEmail}.`);
      return 'sent';
    } catch (err) {
      if (err.status === 429 && err.data?.retry_after) {
        setResendIn(Number(err.data.retry_after) || 0);
        notify(err.message);
        return 'cooldown';
      }
      notify(err.message);
      return 'failed';
    } finally {
      setLoading(false);
    }
  }

  async function directLogin(targetEmail) {
    setLoading(true);
    try {
      saveSession({ access: 'demo', refresh: 'demo', email: targetEmail });
      onAuthenticated();
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function requestOtp(event) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      notify('Enter your email address.');
      return;
    }
    const normalizedEmail = trimmed.toLowerCase();
    if (normalizedEmail === DIRECT_DASHBOARD_EMAIL) {
      await directLogin(normalizedEmail);
      return;
    }
    const outcome = await sendCode(normalizedEmail);
    if (outcome !== 'failed') {
      setEmail(normalizedEmail);
      setStep('otp');
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    if (otp.trim().length !== 6) {
      notify('Please enter the 6-digit code.');
      return;
    }
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
      setOtp('');
    } finally {
      setLoading(false);
    }
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isDirectDashboardEmail = normalizedEmail === DIRECT_DASHBOARD_EMAIL;

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
              <Typography color="text.secondary" sx={{ lineHeight: 1.55, overflowWrap: 'anywhere' }}>
                {step === 'email'
                  ? 'Choose your Google account or enter your email. We will send a verification code to that inbox.'
                  : `Enter the 6-digit code sent to ${email.trim()}. It expires in 10 minutes.`}
              </Typography>
            </Stack>

            {step === 'email' ? (
              <Box component="form" onSubmit={requestOtp}>
                <Stack spacing={2}>
                  <Box
                    ref={googleButtonRef}
                    sx={{
                      minHeight: 44,
                      display: 'flex',
                      '& > div': { width: '100% !important' },
                      '& iframe': { width: '100% !important' },
                    }}
                  />
                  {googleStatus === 'loading' ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        Loading Google account chooser...
                      </Typography>
                    </Stack>
                  ) : null}
                  {googleStatus === 'missing-client' ? (
                    <Alert severity="warning">
                      Add `VITE_GOOGLE_CLIENT_ID` to enable Google account selection.
                    </Alert>
                  ) : null}
                  {googleStatus === 'failed' ? (
                    <Alert severity="warning">
                      Google account selection could not load. You can still send the OTP manually.
                    </Alert>
                  ) : null}
                  <Divider>or</Divider>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    fullWidth
                    autoFocus
                    helperText={isDirectDashboardEmail ? 'This address can open the dashboard directly.' : ' '}
                  />
                  <Button
                    type="submit"
                    size="large"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <MarkEmailReadRoundedIcon />}
                    sx={{ minHeight: 52, background: primaryGradient }}
                  >
                    {isDirectDashboardEmail ? 'Enter Dashboard' : 'Send OTP'}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box component="form" onSubmit={verifyOtp}>
                <Stack spacing={2}>
                  <TextField
                    label="Verification code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                    autoComplete="one-time-code"
                    fullWidth
                    autoFocus
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    Codes can take a minute to arrive and expire in 10 minutes. Check spam,
                    promotions, or all mail if you do not see it in the inbox.
                  </Typography>
                  <Button
                    type="submit"
                    size="large"
                    variant="contained"
                    disabled={loading}
                    sx={{ minHeight: 52, background: primaryGradient }}
                  >
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify & Continue'}
                  </Button>
                  <Button
                    disabled={loading || resendIn > 0}
                    onClick={() => sendCode(email)}
                  >
                    {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                  </Button>
                  <Button
                    disabled={loading}
                    onClick={() => {
                      setOtp('');
                      setResendIn(0);
                      setStep('email');
                    }}
                  >
                    Use a different email
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
