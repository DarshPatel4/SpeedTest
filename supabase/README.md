# Typeflow - Supabase Setup Guide

This project has been upgraded to support **Supabase** as its primary cloud database and authentication provider.

---

### Step 1: Create a Supabase Project
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New project**, choose your organization, name it (e.g. `typeflow`), and set a strong database password.

---

### Step 2: Run the SQL Schema
1. In your Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **New query**.
3. Copy the entire contents of [`supabase/schema.sql`](./schema.sql) and paste it into the editor.
4. Click **Run**.
   - This creates:
     - `public.profiles` (linked to `auth.users`)
     - `public.scores` (typing test history & leaderboard records)
     - `public.daily_challenges`
     - `public.leaderboard_snapshots`
     - Auto-profile trigger on new user signups
     - Proper indexes and Row Level Security (RLS) policies

---

### Step 3: Configure Environment Variables
1. In Supabase, go to **Project Settings** > **API**.
2. Copy your **Project URL** and **anon / public key** (and optionally the **service_role key** for backend automation).
3. Open `.env` in the root of this project and fill them in:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

### Step 4: Run the Application
You can now start both the frontend and backend with:

```bash
npm run dev:all
```

Or just the frontend:
```bash
npm run dev
```

> **Note on Guest Mode:**
> Even before entering Supabase credentials, the app runs smoothly in offline/guest mode without crashing.

D@rsh9979099218