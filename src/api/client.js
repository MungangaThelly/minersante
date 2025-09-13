// Simple API client using Fetch with automatic JSON handling and auth token injection.
// Reads base URL from Vite env: import.meta.env.VITE_API_BASE_URL
// Usage:
// import api from '../api/client';
// const data = await api.get('/patients');

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

function buildUrl(path) {
  if (!path.startsWith('/')) path = '/' + path;
  return BASE_URL + path;
}

async function request(method, path, { params, body, headers, token, raw } = {}) {
  const url = new URL(buildUrl(path), window.location.origin);

  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      url.searchParams.append(k, String(v));
    });
  }

  const finalHeaders = {
    'Accept': 'application/json',
    ...headers,
  };
  if (body && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  const authToken = token || localStorage.getItem('auth_token');
  if (authToken) finalHeaders['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(url.toString().replace(window.location.origin, ''), {
    method,
    headers: finalHeaders,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    credentials: 'include',
  });

  if (!raw) {
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const err = new Error(data?.message || res.statusText);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }
  return res; // caller handles
}

const api = {
  get: (p, opts) => request('GET', p, opts),
  post: (p, opts) => request('POST', p, opts),
  put: (p, opts) => request('PUT', p, opts),
  patch: (p, opts) => request('PATCH', p, opts),
  delete: (p, opts) => request('DELETE', p, opts),
  raw: request,
};

export default api;
