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

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const RAZORPAY_LOAD_ERROR = 'Could not load Razorpay checkout. Disable blockers for checkout.razorpay.com and try again.';

let razorpayCheckoutPromise = null;

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayCheckoutPromise) return razorpayCheckoutPromise;

  razorpayCheckoutPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(RAZORPAY_LOAD_ERROR)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(RAZORPAY_LOAD_ERROR));
    document.body.appendChild(script);
  }).catch((err) => {
    razorpayCheckoutPromise = null;
    throw err;
  });

  return razorpayCheckoutPromise;
}

function recentPayments(data) {
  return Array.isArray(data) ? data.slice(0, 5) : [];
}

function userMessage(error, fallback) {
  return error?.message || fallback;
}

export default function BuyTokensDialog({ open, onClose, notify, onPurchased, profile }) {
  const [packages, setPackages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const { dialogProps } = useResponsiveDialogProps({ maxWidth: 'sm' });

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    setProcessing(false);
    Promise.allSettled([api.getPackages(), api.getPaymentHistory()])
      .then(([packagesResult, paymentsResult]) => {
        if (packagesResult.status === 'rejected') {
          throw packagesResult.reason;
        }
        const data = packagesResult.value;
        const list = Array.isArray(data) ? data : [];
        setPackages(list);
        setSelectedPackage(list[0]?.id || null);
        setPayments(paymentsResult.status === 'fulfilled' ? recentPayments(paymentsResult.value) : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  const selected = packages.find((pkg) => pkg.id === selectedPackage);

  async function refreshPaymentHistory() {
    try {
      const data = await api.getPaymentHistory();
      setPayments(recentPayments(data));
    } catch {
      // The token balance has already been updated; history can refresh later.
    }
  }

  async function purchase() {
    if (!selected || processing) return;
    setError('');
    setProcessing(true);

    try {
      await loadRazorpayCheckout();
      if (!window.Razorpay) {
        throw new Error('Razorpay checkout is unavailable.');
      }

      const order = await api.initiatePayment(selected.id);
      const prefill = {};
      if (profile?.email) prefill.email = profile.email;
      if (profile?.phone_number) prefill.contact = profile.phone_number;

      let verificationStarted = false;
      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: Number(order.amount) * 100,
        currency: order.currency || 'INR',
        name: 'TextVibe',
        description: `${order.tokens || selected.tokens} Tokens`,
        order_id: order.order_id,
        prefill,
        method: 'upi',
        theme: { color: '#8B5CF6' },
        modal: {
          ondismiss: () => {
            if (!verificationStarted) {
              setProcessing(false);
            }
          },
        },
        handler: async (response) => {
          verificationStarted = true;
          try {
            const result = await api.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );
            onPurchased?.(result.user_tokens);
            await refreshPaymentHistory();
            notify(`Payment successful. ${result.credited_tokens} tokens added.`);
            onClose();
          } catch (err) {
            setError(`Payment completed, but verification failed: ${userMessage(err, 'Please contact support.')}`);
          } finally {
            setProcessing(false);
          }
        },
      });

      checkout.on('payment.failed', (response) => {
        const message = response?.error?.description || response?.error?.reason || 'Payment failed. Please try again.';
        setError(message);
        setProcessing(false);
      });

      checkout.open();
    } catch (err) {
      setError(
        userMessage(
          err,
          'Could not open Razorpay checkout. Disable blockers for checkout.razorpay.com and try again.',
        ),
      );
      setProcessing(false);
    }
  }

  return (
    <Dialog open={open} onClose={processing ? undefined : onClose} {...dialogProps}>
      <DialogHeader title="Buy Tokens" onClose={onClose} disabled={processing} />
      <DialogContent sx={{ ...responsiveDialogContentSx, pb: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 3 } }}>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Choose a Token Package</Typography>
              <Grid container spacing={1.5}>
                {packages.map((pkg) => {
                  const selected = selectedPackage === pkg.id;
                  return (
                    <Grid item xs={12} sm={4} key={pkg.id}>
                      <Button
                        fullWidth
                        onClick={() => setSelectedPackage(pkg.id)}
                        disabled={processing}
                        sx={{
                          minHeight: { xs: 94, sm: 112 },
                          display: 'block',
                          textAlign: 'left',
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: 2,
                          border: selected ? '2px solid #8B5CF6' : '1px solid #F3E8FF',
                          bgcolor: selected ? 'rgba(139,92,246,.07)' : '#FFFFFF',
                          whiteSpace: 'normal',
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, color: '#FF6B9D', fontSize: { xs: 18, sm: 20 } }}>Rs {pkg.amount}</Typography>
                        <Typography sx={{ fontWeight: 900, color: '#8B5CF6' }}>{pkg.tokens} tokens</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rs {(pkg.amount / pkg.tokens).toFixed(2)}/token
                        </Typography>
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid #F3E8FF', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Payment via</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: 13, color: '#8B5CF6' }}>Razorpay UPI</Typography>
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                Opens secure Razorpay Checkout here with UPI QR and supported UPI apps.
              </Typography>
            </Box>

            {selected ? (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.25)' }}>
                <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ overflowWrap: 'anywhere' }}>
                  <Typography>{selected.tokens} tokens</Typography>
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
              onClick={purchase}
              disabled={!selectedPackage || processing}
              sx={{ minHeight: 52, background: primaryGradient }}
            >
              {processing ? 'Opening Razorpay...' : selected ? `Pay Rs ${selected.amount}` : 'Buy Now'}
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
