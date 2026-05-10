const ACCESS_KEY = "typeflow-access-token";
const REFRESH_KEY = "typeflow-refresh-token";
const EXP_KEY = "typeflow-access-exp";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY) || "";
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || "";
}

export function getAccessExpiry() {
  return Number(localStorage.getItem(EXP_KEY) || 0);
}

export function setTokens({ accessToken, refreshToken, accessTokenExpiresAt }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  if (accessTokenExpiresAt) localStorage.setItem(EXP_KEY, String(accessTokenExpiresAt));
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXP_KEY);
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  const res = await fetch("/api/auth/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return null;
  setTokens({
    accessToken: data.accessToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
  });
  return data.accessToken;
}

export async function authFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, { ...options, headers });
  if (res.status !== 401) return res;

  const renewed = await refreshAccessToken();
  if (!renewed) return res;

  const retryHeaders = new Headers(options.headers || {});
  retryHeaders.set("Authorization", `Bearer ${renewed}`);
  res = await fetch(url, { ...options, headers: retryHeaders });
  return res;
}
