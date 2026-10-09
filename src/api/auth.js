import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { clearTokens, setTokens } from "./client.js";

const LOCAL_USER_KEY = "typeflow-guest-user-v1";

function getLocalUser() {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalUser(u) {
  try {
    if (u) localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(LOCAL_USER_KEY);
  } catch {
    // ignore
  }
}

export async function signup(name, email, password, confirmPassword) {
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() },
      },
    });

    if (error) throw new Error(error.message);

    const user = data.user;
    if (!user) throw new Error("Signup failed");

    // Upsert profile
    await supabase.from("profiles").upsert({
      id: user.id,
      name: name.trim(),
      email: user.email,
      avatar_url: "",
      xp: 0,
      level: 1,
      streak: 0,
      test_count: 0,
    });

    const safeUser = {
      _id: user.id,
      id: user.id,
      name: name.trim(),
      email: user.email,
      xp: 0,
      level: 1,
      streak: 0,
      testCount: 0,
    };

    if (data.session) {
      setTokens({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        accessTokenExpiresAt: (data.session.expires_at || 0) * 1000,
      });
    }

    return { user: safeUser };
  }

  // Local fallback mode when Supabase is not configured yet
  const localUser = {
    _id: "local-user-id",
    id: "local-user-id",
    name: name.trim(),
    email: email.trim(),
    xp: 0,
    level: 1,
    streak: 0,
    testCount: 0,
  };
  setLocalUser(localUser);
  return { user: localUser };
}

export async function login(email, password) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    const authUser = data.user;
    if (!authUser) throw new Error("Login failed");

    let profile = null;
    const { data: profData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    profile = profData;

    const safeUser = {
      _id: authUser.id,
      id: authUser.id,
      name: profile?.name || authUser.user_metadata?.name || email.split("@")[0],
      email: authUser.email,
      avatarUrl: profile?.avatar_url || "",
      xp: profile?.xp || 0,
      level: profile?.level || 1,
      streak: profile?.streak || 0,
      testCount: profile?.test_count || 0,
      wpmHistory: profile?.wpm_history || [],
      accuracyHistory: profile?.accuracy_history || [],
    };

    if (data.session) {
      setTokens({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        accessTokenExpiresAt: (data.session.expires_at || 0) * 1000,
      });
    }

    return { user: safeUser };
  }

  // Local fallback
  const localUser = {
    _id: "local-user-id",
    id: "local-user-id",
    name: email.split("@")[0] || "User",
    email: email.trim(),
    xp: 0,
    level: 1,
    streak: 0,
    testCount: 0,
  };
  setLocalUser(localUser);
  return { user: localUser };
}

export async function logout() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut().catch(() => undefined);
  }
  setLocalUser(null);
  clearTokens();
}

export async function logoutAll() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut({ scope: "global" }).catch(() => undefined);
  }
  setLocalUser(null);
  clearTokens();
}

export async function fetchMe() {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session?.user) return null;

    const authUser = session.user;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    return {
      _id: authUser.id,
      id: authUser.id,
      name: profile?.name || authUser.user_metadata?.name || authUser.email.split("@")[0],
      email: authUser.email,
      avatarUrl: profile?.avatar_url || "",
      xp: profile?.xp || 0,
      level: profile?.level || 1,
      streak: profile?.streak || 0,
      testCount: profile?.test_count || 0,
      wpmHistory: profile?.wpm_history || [],
      accuracyHistory: profile?.accuracy_history || [],
    };
  }

  return getLocalUser();
}

export async function updateProfile(payload) {
  const { name, avatarUrl } = payload || {};

  if (isSupabaseConfigured && supabase) {
    const { data: sessData } = await supabase.auth.getSession();
    const user = sessData?.session?.user;
    if (!user) throw new Error("Not authenticated");

    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof avatarUrl === "string") updates.avatar_url = avatarUrl.trim();

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      user: {
        _id: user.id,
        id: user.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatar_url,
        xp: data.xp,
        level: data.level,
        streak: data.streak,
        testCount: data.test_count,
      },
    };
  }

  const current = getLocalUser() || { id: "local-user-id", _id: "local-user-id" };
  const updated = {
    ...current,
    name: name?.trim() || current.name || "User",
    avatarUrl: avatarUrl || current.avatarUrl || "",
  };
  setLocalUser(updated);
  return { user: updated };
}

export async function getSessions() {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    if (!data?.session) return { sessions: [] };
    return {
      sessions: [
        {
          id: "current-session",
          device: navigator.userAgent || "Current Browser",
          createdAt: new Date().toISOString(),
          expiresAt: new Date((data.session.expires_at || 0) * 1000).toISOString(),
        },
      ],
    };
  }

  return {
    sessions: [
      {
        id: "local-session",
        device: navigator.userAgent || "Current Browser",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };
}

export async function forgotPassword(email) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
    return { message: "Reset password instructions sent to your email" };
  }
  return { message: "If this email exists, reset instructions were sent" };
}

export async function resetPassword(token, password) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return { message: "Password reset successful" };
  }
  return { message: "Password reset successful" };
}

export async function refreshAccessToken() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw new Error(error.message);
    const user = await fetchMe();
    return { user };
  }
  return { user: getLocalUser() };
}
