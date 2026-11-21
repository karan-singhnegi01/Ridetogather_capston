// Small helper around the Fetch API.
// Adds the access token and tries to refresh it once if the server says 401.
const BASE = import.meta.env.VITE_API_URL || '/api';

export const saveTokens = (access, refresh) => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const hasToken = () => !!localStorage.getItem('accessToken');

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    return false;
  }
  const data = await res.json();
  saveTokens(data.accessToken, data.refreshToken);
  return true;
}

export async function api(path, { method = 'GET', body } = {}) {
  const send = () => {
    const token = localStorage.getItem('accessToken');
    return fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await send();

  // access token expired -> get a new one and retry once
  if (res.status === 401 && !path.startsWith('/auth/') && (await refreshAccessToken())) {
    res = await send();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}
