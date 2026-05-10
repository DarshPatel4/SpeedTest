import { apiUrl, authFetch, clearTokens, getRefreshToken, setTokens } from "./client.js";

const API = "/api/auth";

async function parseOrThrow(res, fallback) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || fallback);
  return data;
}

export async function signup(name, email, password, confirmPassword) {
  const res = await fetch(apiUrl(`${API}/signup`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
  const data = await parseOrThrow(res, "Signup failed");
  setTokens(data);
  return data;
}

export async function login(email, password) {
  const res = await fetch(apiUrl(`${API}/login`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseOrThrow(res, "Login failed");
  setTokens(data);
  return data;
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  const res = await fetch(apiUrl(`${API}/refresh-token`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await parseOrThrow(res, "Refresh failed");
  setTokens(data);
  return data;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  await fetch(apiUrl(`${API}/logout`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => undefined);
  clearTokens();
}

export async function logoutAll() {
  const res = await authFetch(`${API}/logout-all`, { method: "POST" });
  await parseOrThrow(res, "Logout all failed");
  clearTokens();
}

export async function fetchMe() {
  const res = await authFetch(`${API}/me`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

export async function updateProfile(payload) {
  const res = await authFetch(`${API}/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "Profile update failed");
}

export async function getSessions() {
  const res = await authFetch(`${API}/sessions`);
  return parseOrThrow(res, "Sessions fetch failed");
}

export async function forgotPassword(email) {
  const res = await fetch(apiUrl(`${API}/forgot-password`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return parseOrThrow(res, "Forgot password failed");
}

export async function resetPassword(token, password) {
  const res = await fetch(apiUrl(`${API}/reset-password`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  return parseOrThrow(res, "Reset password failed");
}
