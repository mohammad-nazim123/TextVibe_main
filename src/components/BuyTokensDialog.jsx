import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { api } from '../lib/api.js';
import { primaryGradient } from '../lib/constants.js';
import DialogHeader from './DialogHeader.jsx';
import {
  responsiveDialogContentSx,
  useResponsiveDialogProps,
} from './responsiveDialog.js';

function recentPayments(data) {
  return Array.isArray(data) ? data.slice(0, 5) : [];
}

const TIER_ACCENTS = {
  tokens: { accent: '#8B5CF6', tint: 'rgba(139,92,246,.07)' },
  premium: { accent: '#B78628', tint: 'rgba(183,134,40,.08)' },
  legendary: { accent: '#8B6D16', tint: 'rgba(139,109,22,.08)' },
};

export default function BuyTokensDialog({ open, onClose, notify }) {
  const [options, setOptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dialogProps } = useResponsiveDialogProps({ maxWidth: 'sm' });

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    Promise.allSettled([api.getPackages(), api.getSubscriptionPlans(), api.getPaymentHistory()])
      .then(([packagesResult, plansResult, paymentsResult]) => {
        if (packagesResult.status === 'rejected') throw packagesResult.reason;
        if (plansResult.status === 'rejected') throw plansResult.reason;

        const tokenOptions = (Array.isArray(packagesResult.value) ? packagesResult.value : []).map((pkg) => ({
          id: `tokens-${pkg.id}`,
          kind: 'tokens',
          title: `${pkg.tokens} Tokens`,
          subtitle: 'One-time purchase',
          amount: pkg.amount,
        }));
        const plans = Array.isArray(plansResult.value) ? plansResult.value : [];
        const planOptions = plans.map((plan) => ({
          id: `${plan.tier}-${plan.id}`,
          kind: plan.tier,
          title: `${plan.tier === 'legendary' ? 'Legendary' : 'Premium'} Subscription`,
          subtitle: `${plan.duration_days} days`,
          amount: plan.amount,
        }));

        const list = [...tokenOptions, ...planOptions];
        setOptions(list);
        setSelectedId(list[0]?.id || null);
        setPayments(paymentsResult.status === 'fulfilled' ? recentPayments(paymentsResult.value) : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  const selected = options.find((opt) => opt.id === selectedId);

  function buyNow() {
    if (!selected) return;
    notify('Coming soon.');
  }

  return (
    <Dialog open={open} onClose={onClose} {...dialogProps}>
      <DialogHeader title="Buy Tokens & Subscriptions" onClose={onClose} />
      <DialogContent sx={{ ...responsiveDialogContentSx, pb: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 3 } }}>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Choose an Option</Typography>
              <Grid container spacing={1.5}>
                {options.map((opt) => {
                  const isSelected = selectedId === opt.id;
                  const { accent, tint } = TIER_ACCENTS[opt.kind] || TIER_ACCENTS.tokens;
                  return (
                    <Grid item xs={12} sm={4} key={opt.id}>
                      <Button
                        fullWidth
                        onClick={() => setSelectedId(opt.id)}
                        sx={{
                          minHeight: { xs: 94, sm: 112 },
                          display: 'block',
                          textAlign: 'left',
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: 2,
                          border: isSelected ? `2px solid ${accent}` : '1px solid #F3E8FF',
                          bgcolor: isSelected ? tint : '#FFFFFF',
                          whiteSpace: 'normal',
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, color: '#FF6B9D', fontSize: { xs: 18, sm: 20 } }}>Rs {opt.amount}</Typography>
                        <Typography sx={{ fontWeight: 900, color: accent }}>{opt.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {opt.subtitle}
                        </Typography>
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            {selected ? (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.25)' }}>
                <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ overflowWrap: 'anywhere' }}>
                  <Typography>{selected.title}</Typography>
                  <Typography>Rs {selected.amount}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(139,92,246,.20)', overflowWrap: 'anywhere' }}>
                  <Typography sx={{ fontWeight: 900 }}>Total</Typography>
                  <Typography sx={{ fontWeight: 900 }}>Rs {selected.amount}</Typography>
                </Stack>
              </Box>
            ) : null}

            <Box>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Recent payments</Typography>
              {payments.length === 0 ? (
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                  No payment history yet.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {payments.map((payment) => (
                    <Box
                      key={payment.id || payment.razorpay_order_id}
                      sx={{
                        p: 1.3,
                        borderRadius: 2,
                        border: '1px solid #F3E8FF',
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 13, overflowWrap: 'anywhere' }}>
                          {payment.tokens} tokens via {payment.payment_method || 'payment'}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: 12, overflowWrap: 'anywhere' }}>
                          {payment.created_at || payment.razorpay_order_id || ''}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 900, color: payment.status === 'success' ? '#16A34A' : '#6B7280', fontSize: 12, flex: '0 0 auto' }}>
                        {payment.status || 'success'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={buyNow}
              disabled={!selectedId}
              sx={{ minHeight: 52, background: primaryGradient }}
            >
              {selected ? `Buy - Rs ${selected.amount}` : 'Buy Now'}
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
