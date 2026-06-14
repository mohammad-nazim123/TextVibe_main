import { useEffect, useRef, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

import { api } from '../lib/api.js';
import { primaryGradient } from '../lib/constants.js';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

function MsgCard({ header, body }) {
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: '1px solid #F3E8FF',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(139,92,246,.07)',
        bgcolor: '#FFFFFF',
      }}
    >
      <Box sx={{ px: 2, py: 1.25, bgcolor: '#FAF5FF' }}>
        {header}
      </Box>
      <Divider sx={{ borderColor: '#F3E8FF' }} />
      <Box sx={{ px: 2, py: 1.5 }}>
        {body}
      </Box>
    </Box>
  );
}

export default function SupportPage({ profile, notify, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.getSupportMessages()
      .then((data) => {
        if (alive) setMessages(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (alive) notify(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [notify]);

  useEffect(() => {
    const el = panelRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function send() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      const created = await api.createSupportMessage(value);
      setMessages((prev) => [created, ...prev]);
      setText('');
    } catch (err) {
      notify(err.message);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const ordered = [...messages].reverse();
  const name = profile?.name?.trim() || 'You';
  const initial = (profile?.name || profile?.email || 'U')[0].toUpperCase();

  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 14% 12%, rgba(255,107,157,.14), transparent 30%), radial-gradient(circle at 86% 20%, rgba(139,92,246,.12), transparent 32%), #FFF5F8',
      }}
    >
      {/* Top app-bar */}
      <Box
        sx={{
          flex: '0 0 auto',
          px: { xs: 1, sm: 2 },
          py: { xs: 1.25, sm: 1.5 },
          color: '#FFFFFF',
          background: primaryGradient,
          boxShadow: '0 6px 20px rgba(255,107,157,.25)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={onBack} aria-label="Back" sx={{ color: '#FFFFFF' }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 900, lineHeight: 1.2 }}>
              Support
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,.82)' }} noWrap>
              We usually reply by email within a day
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 1, sm: 2 },
          py: { xs: 1.25, sm: 2 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 720,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {/* Scrollable message list */}
          <Box
            ref={panelRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              pb: 0.5,
            }}
          >
            {/* Public support message — always shown at top */}
            <MsgCard
              header={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      background: primaryGradient,
                    }}
                  >
                    <SupportAgentRoundedIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E' }}>
                    TextVibe Support
                  </Typography>
                </Stack>
              }
              body={
                <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.65 }}>
                  Hi there! Describe your issue below and we'll get back to you within a day.
                </Typography>
              }
            />

            {loading ? (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : ordered.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 5,
                  color: 'text.secondary',
                  textAlign: 'center',
                  px: 2,
                }}
              >
                <Typography variant="body2">No messages yet — send one below.</Typography>
              </Box>
            ) : (
              ordered.map((m) => (
                <MsgCard
                  key={m.id}
                  header={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={profile?.avatar || undefined}
                        sx={{
                          width: 36,
                          height: 36,
                          background: 'linear-gradient(135deg,#FF6B9D,#8B5CF6)',
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        {initial}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E', lineHeight: 1.2 }}
                          noWrap
                        >
                          {name}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0 }}>
                        {formatTime(m.created_at)}
                      </Typography>
                    </Stack>
                  }
                  body={
                    <Typography
                      sx={{
                        fontSize: 15,
                        color: '#1A1A2E',
                        lineHeight: 1.65,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {m.message}
                    </Typography>
                  }
                />
              ))
            )}
          </Box>

          {/* Input bar */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-end"
            sx={{
              mt: { xs: 1.25, sm: 1.5 },
              pb: 'calc(8px + env(safe-area-inset-bottom))',
            }}
          >
            <TextField
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message…"
              multiline
              maxRows={4}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#FFFFFF',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={send}
              disabled={sending || !text.trim()}
              aria-label="Send"
              sx={{
                minWidth: 0,
                px: 2,
                height: 44,
                borderRadius: 3,
                background: primaryGradient,
                boxShadow: '0 8px 20px rgba(255,107,157,.30)',
              }}
            >
              {sending ? <CircularProgress size={20} color="inherit" /> : <SendRoundedIcon />}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
