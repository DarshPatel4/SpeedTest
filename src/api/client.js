const ACCESS_KEY = "typeflow-access-token";
const REFRESH_KEY = "typeflow-refresh-token";
const EXP_KEY = "typeflow-access-exp";

/** Backend origin on Render (no trailing slash). */
const DEFAULT_PROD_API_ORIGIN = "https://speedtest-76ft.onrender.com";

function trimTrailingSlash(s) {
  return s.replace(/\/$/, "");
}

function normalizeApiOrigin(url) {
  if (url == null || typeof url !== "string") return "";
  const t = url.trim();
  return t ? trimTrailingSlash(t) : "";
}

function readEnvApiOrigin() {
  return normalizeApiOrigin(
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
  );
}

function isLocalDevHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === ""
  );
}

/**
 * Resolves at request time (not module load) so hosted deploys never accidentally
 * use relative `/api` after a mis-tuned build. On localhost, empty means Vite proxy.
 */
function getEffectiveApiBaseUrl() {
  const fromEnv = readEnvApiOrigin();

  if (typeof window !== "undefined") {
    const { hostname } = window.location;

    if (isLocalDevHost(hostname)) {
      if (fromEnv) {
        try {
          const resolved = fromEnv.includes("://") ? fromEnv : `https://${fromEnv}`;
          if (new URL(resolved).origin === window.location.origin) {
            return DEFAULT_PROD_API_ORIGIN;
          }
          return trimTrailingSlash(fromEnv);
        } catch {
          return DEFAULT_PROD_API_ORIGIN;
        }
      }
      // `vite` dev: empty origin → Vite proxy. `vite preview` has no proxy → use default API.
      return import.meta.env.DEV ? "" : DEFAULT_PROD_API_ORIGIN;
    }

    // Deployed (Vercel, custom domain, preview URL, etc.)
    if (fromEnv) {
      try {
        const resolved = fromEnv.includes("://") ? fromEnv : `https://${fromEnv}`;
        if (new URL(resolved).origin === window.location.origin) {
          return DEFAULT_PROD_API_ORIGIN;
        }
        return trimTrailingSlash(fromEnv);
      } catch {
        return DEFAULT_PROD_API_ORIGIN;
      }
    }
    return DEFAULT_PROD_API_ORIGIN;
  }

  // No `window` (SSR/tests): follow build mode.
  if (import.meta.env.PROD) {
    return fromEnv || DEFAULT_PROD_API_ORIGIN;
  }
  return fromEnv;
}

export function apiUrl(path) {
  const base = getEffectiveApiBaseUrl();
  if (!base) return path.startsWith("/") ? path : `/${path}`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

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
  const res = await fetch(apiUrl("/api/auth/refresh-token"), {
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

  let res = await fetch(apiUrl(url), { ...options, headers });
  if (res.status !== 401) return res;

  const renewed = await refreshAccessToken();
  if (!renewed) return res;

  const retryHeaders = new Headers(options.headers || {});
  retryHeaders.set("Authorization", `Bearer ${renewed}`);
  res = await fetch(apiUrl(url), { ...options, headers: retryHeaders });
  return res;
}
