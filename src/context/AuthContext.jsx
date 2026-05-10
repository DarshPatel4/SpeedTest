import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  fetchMe,
  getSessions,
  login as apiLogin,
  logout as apiLogout,
  logoutAll as apiLogoutAll,
  refreshAccessToken,
  signup as apiSignup,
  updateProfile as apiUpdateProfile,
} from "../api/auth.js";
import { clearTokens, getAccessExpiry } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionWarningOpen, setSessionWarningOpen] = useState(false);
  const [sessions, setSessions] = useState([]);

  const loadUser = useCallback(async () => {
    try {
      const u = await fetchMe();
      setUser(u || null);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const expiry = getAccessExpiry();
    if (!expiry || !user) {
      setSessionWarningOpen(false);
      return undefined;
    }

    const now = Date.now();
    const warningAt = Math.max(now, expiry - 5 * 60 * 1000);
    const warnTimer = setTimeout(() => setSessionWarningOpen(true), warningAt - now);
    const logoutTimer = setTimeout(async () => {
      clearTokens();
      setSessionWarningOpen(false);
      setUser(null);
    }, Math.max(0, expiry - now));

    return () => {
      clearTimeout(warnTimer);
      clearTimeout(logoutTimer);
    };
  }, [user]);

  const login = useCallback(async (email, password) => {
    const { user: u } = await apiLogin(email, password);
    setUser(u);
    setSessionWarningOpen(false);
    return u;
  }, []);

  const signup = useCallback(async (name, email, password, confirmPassword) => {
    const { user: u } = await apiSignup(name, email, password, confirmPassword);
    setUser(u);
    setSessionWarningOpen(false);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setSessionWarningOpen(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await fetchMe();
    if (u) setUser(u);
  }, []);

  const extendSession = useCallback(async () => {
    const data = await refreshAccessToken();
    if (data.user) setUser(data.user);
    setSessionWarningOpen(false);
  }, []);

  const loadSessions = useCallback(async () => {
    const data = await getSessions();
    setSessions(data.sessions || []);
  }, []);

  const logoutAll = useCallback(async () => {
    await apiLogoutAll();
    setUser(null);
    setSessions([]);
    setSessionWarningOpen(false);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await apiUpdateProfile(payload);
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        logoutAll,
        refreshUser,
        updateProfile,
        extendSession,
        sessionWarningOpen,
        setSessionWarningOpen,
        sessions,
        loadSessions,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
