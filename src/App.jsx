import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

import AuthScreens from './components/AuthScreens.jsx';
import Dashboard from './components/Dashboard.jsx';
import SupportPage from './components/SupportPage.jsx';
import { api, clearAllStorage, getStoredSession, refreshAccessToken, setAuthLostHandler } from './lib/api.js';

export default function App() {
  const [sessionReady, setSessionReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [snack, setSnack] = useState('');
  const [path, setPath] = useState(() => window.location.pathname);

  const notify = useCallback((message) => {
    setSnack(String(message || 'Something happened.'));
  }, []);

  // Lightweight client-side routing: keep `path` in sync with the address bar
  // (Back/Forward) and expose `navigate` for in-app links — real URLs, no
  // page reload, no router dependency.
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, '', to);
    }
    setPath(to);
  }, []);

  const logoutLocal = useCallback(() => {
    clearAllStorage();
    setProfile(null);
    setSessionReady(true);
  }, []);

  const loadProfile = useCallback(async () => {
    const session = getStoredSession();
    if (!session?.access) {
      setProfile(null);
      setSessionReady(true);
      return;
    }
    try {
      const loaded = await api.getProfile();
      setProfile(loaded);
    } catch (err) {
      if (err.status === 401) {
        // api.js already cleared the session — the refresh token was rejected.
        setProfile(null);
      } else {
        // Server unreachable or transient error: keep the session and show an
        // offline dashboard until the connection recovers.
        setProfile((p) => p || { email: session.email, tokens: 0, offline: true });
        notify('Could not reach the server. You are still signed in.');
      }
    } finally {
      setSessionReady(true);
    }
  }, [notify]);

  useEffect(() => {
    setAuthLostHandler(() => {
      setProfile(null);
      setSessionReady(true);
      notify('Your session expired. Please sign in again.');
    });
    loadProfile();
  }, [loadProfile, notify]);

  // While offline, retry until the server is reachable again.
  const isOffline = Boolean(profile?.offline);
  useEffect(() => {
    if (!isOffline) return undefined;
    const id = setInterval(loadProfile, 10000);
    window.addEventListener('online', loadProfile);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', loadProfile);
    };
  }, [isOffline, loadProfile]);

  // Keep the session fresh while the app is open (access tokens last 24h).
  // Browsers throttle timers in background tabs, so also refresh whenever the
  // tab wakes up (visibility/focus) or the network returns. Transient refresh
  // failures never end the session — only an explicit logout does.
  const isAuthed = Boolean(profile);
  useEffect(() => {
    if (!isAuthed) return undefined;
    refreshAccessToken();
    const id = setInterval(refreshAccessToken, 6 * 60 * 60 * 1000);
    const onWake = () => {
      if (document.visibilityState !== 'hidden') refreshAccessToken();
    };
    document.addEventListener('visibilitychange', onWake);
    window.addEventListener('focus', onWake);
    window.addEventListener('online', onWake);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('focus', onWake);
      window.removeEventListener('online', onWake);
    };
  }, [isAuthed]);

  if (!sessionReady) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {profile ? (
        path === '/support' ? (
          <SupportPage profile={profile} notify={notify} onBack={() => navigate('/')} />
        ) : (
          <Dashboard
            profile={profile}
            setProfile={setProfile}
            onLoggedOut={logoutLocal}
            notify={notify}
            navigate={navigate}
          />
        )
      ) : (
        <AuthScreens onAuthenticated={loadProfile} notify={notify} />
      )}
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3600}
        onClose={() => setSnack('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack('')} severity="info" variant="filled" sx={{ width: '100%' }}>
          {snack}
        </Alert>
      </Snackbar>
    </>
  );
}
