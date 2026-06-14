const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const SESSION_KEY = 'textvibe_main_session';
const DIRECT_DASHBOARD_EMAIL = 'textvibe!7865990@example.com';

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = network error / server unreachable
    this.data = data;
  }
}

let authLostHandler = null;
let refreshInFlight = null;

export function setAuthLostHandler(handler) {
  authLostHandler = handler;
}

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Wipe everything the app may have cached for this origin (used on logout).
export function clearAllStorage() {
  try {
    localStorage.clear();
  } catch {
    /* storage unavailable */
  }
  try {
    sessionStorage.clear();
  } catch {
    /* storage unavailable */
  }
  if (typeof caches !== 'undefined' && caches?.keys) {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => {});
  }
}

// Best-effort server-side logout (blacklists the refresh token). Uses a raw
// fetch so the apiRequest 401→refresh→authLostHandler machinery cannot fire a
// spurious "session expired" notification after an intentional logout.
export function logoutServerSide(refresh, access) {
  return fetch(absoluteUrl('/api/auth/logout/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    body: JSON.stringify({ refresh }),
  }).catch(() => {});
}

function updateAccessToken(access, refresh) {
  const current = getStoredSession();
  if (!current) return;
  saveSession({ ...current, access, refresh: refresh || current.refresh });
}

function absoluteUrl(path) {
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

async function parseResponse(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data.detail === 'string') return data.detail;
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
    if (typeof value === 'string') return value;
  }
  return fallback;
}

// Resolves to 'ok' | 'invalid' | 'unreachable'. Only 'invalid' means the
// refresh token was definitively rejected; network failures and server errors
// must never log the user out.
export async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;
  const session = getStoredSession();
  if (!session?.refresh) return 'invalid';
  const sentRefresh = session.refresh;

  refreshInFlight = fetch(absoluteUrl('/api/auth/token/refresh/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refresh: sentRefresh }),
  })
    .then(async (res) => {
      const data = await parseResponse(res);
      if (res.ok && data?.access) {
        updateAccessToken(data.access, data.refresh);
        return 'ok';
      }
      // Only a definitive rejection of the token itself (401 invalid/expired,
      // 400 malformed) may log the user out. Anything else — 429 throttling,
      // 408, 5xx — is transient and must never end the session.
      if (res.status === 401 || res.status === 400) {
        // Another tab may have replaced the stored token; if it changed,
        // that tab succeeded and this session is still good.
        const latest = getStoredSession();
        if (latest?.refresh && latest.refresh !== sentRefresh) return 'ok';
        return 'invalid';
      }
      return 'unreachable';
    })
    .catch(() => 'unreachable')
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    auth = false,
    headers = {},
    retry = true,
  } = options;
  const session = getStoredSession();
  const isFormData = body instanceof FormData;
  const finalHeaders = {
    Accept: 'application/json',
    ...(!isFormData && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(auth && session?.access ? { Authorization: `Bearer ${session.access}` } : {}),
    ...headers,
  };

  let res;
  try {
    res = await fetch(absoluteUrl(path), {
      method,
      headers: finalHeaders,
      body: isFormData || body === undefined ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', { status: 0 });
  }

  if (res.status === 401 && auth && retry) {
    const outcome = await refreshAccessToken();
    if (outcome === 'ok') {
      return apiRequest(path, { ...options, retry: false });
    }
    if (outcome === 'unreachable') {
      throw new ApiError('Cannot reach the server. Check your connection.', { status: 0 });
    }
    clearSession();
    authLostHandler?.();
    throw new ApiError('Your session expired. Please sign in again.', { status: 401 });
  }

  const data = await parseResponse(res);
  if (!res.ok) {
    // A 401 here (post-refresh retry) does not end the session: the refresh
    // just succeeded, so the token is good — this is clock skew or a race.
    // The session is cleared in exactly one place: when the refresh endpoint
    // itself rejects the refresh token ('invalid' above).
    throw new ApiError(errorMessage(data, `Request failed: ${res.status}`), {
      status: res.status,
      data,
    });
  }
  return data;
}

export const api = {
  health() {
    return apiRequest('/');
  },
  requestEmailOtp(email) {
    return apiRequest('/api/auth/google-auth/', {
      method: 'POST',
      body: { email },
    });
  },
  directEmailLogin(email) {
    return apiRequest('/api/auth/direct-email-login/', {
      method: 'POST',
      body: { email },
    });
  },
  verifyEmailOtp(email, otp) {
    return apiRequest('/api/auth/verify-email-otp/', {
      method: 'POST',
      body: { email, otp },
    });
  },
  requestPhoneOtp(phoneNumber) {
    return apiRequest('/api/auth/send-otp/', {
      method: 'POST',
      body: { phone_number: phoneNumber },
    });
  },
  verifyPhoneOtp(phoneNumber, otp) {
    return apiRequest('/api/auth/verify-otp/', {
      method: 'POST',
      body: { phone_number: phoneNumber, otp },
    });
  },
  getProfile(options = {}) {
    const session = getStoredSession();
    if (session?.email === DIRECT_DASHBOARD_EMAIL) {
      return Promise.resolve({ email: DIRECT_DASHBOARD_EMAIL, name: '', tokens: 500 });
    }
    const params = new URLSearchParams();
    if (options.grantDevTokens) {
      params.set('grant_dev_tokens', String(options.grantDevTokens));
    }
    const query = params.toString();
    return apiRequest(`/api/auth/profile/${query ? `?${query}` : ''}`, { auth: true });
  },
  updateProfile(formData) {
    return apiRequest('/api/auth/profile/', {
      method: 'PATCH',
      body: formData,
      auth: true,
    });
  },
  getPosts() {
    return apiRequest('/api/auth/posts/', { auth: true });
  },
  createPost(formData) {
    return apiRequest('/api/auth/posts/', {
      method: 'POST',
      body: formData,
      auth: true,
    });
  },
  getSupportMessages() {
    return apiRequest('/api/auth/support/', { auth: true });
  },
  createSupportMessage(message) {
    return apiRequest('/api/auth/support/', {
      method: 'POST',
      body: { message },
      auth: true,
    });
  },
  getBillboard(options = {}) {
    const params = new URLSearchParams();
    if (options.user) params.set('user', String(options.user));
    if (options.after !== undefined && options.after !== null) {
      params.set('after', String(options.after));
    }
    const query = params.toString();
    return apiRequest(`/api/billboard/${query ? `?${query}` : ''}`);
  },
  getPackages() {
    return apiRequest('/api/payments/packages/');
  },
  purchasePackage(packageId, paymentMethod) {
    return apiRequest('/api/payments/purchase/', {
      method: 'POST',
      body: { package_id: packageId, payment_method: paymentMethod },
      auth: true,
    });
  },
  initiatePayment(packageId) {
    return apiRequest('/api/payments/initiate/', {
      method: 'POST',
      body: { package_id: packageId },
      auth: true,
    });
  },
  verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    return apiRequest('/api/payments/verify/', {
      method: 'POST',
      body: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      },
      auth: true,
    });
  },
  getPaymentHistory() {
    return apiRequest('/api/payments/history/', { auth: true });
  },
};

export { API_BASE };
