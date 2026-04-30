# NIDO Supabase Auth Setup

## What was added

- Supabase-compatible auth flow for sign up, login, logout, password recovery, and session restoration.
- Profile-backed user records mapped to `public.profiles` with UUID primary keys.
- Automatic profile creation trigger on `auth.users` inserts.
- Role-based access using `ADMIN`, `LANDLORD`, and `TENANT`.
- RLS policies for profile visibility, self-service updates, and admin-controlled access.
- Backend auth middleware that validates Supabase access tokens and loads the profile record.

## Frontend flow

- `register` calls Supabase sign-up and stores the role in user metadata.
- `login` uses `signInWithPassword`.
- `logout` uses `supabase.auth.signOut()`.
- `forgot password` calls `resetPasswordForEmail()` with the reset redirect URL.
- `reset password` uses `updateUser({ password })` after the recovery link opens the app.
- Session restoration happens through Supabase session persistence and `onAuthStateChange`.

## Environment variables

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_REDIRECT_URL`

## Assumptions

- Roles remain uppercase in the app for compatibility with the existing codebase.
- The production Supabase project will use the migration in `supabase/migrations/20260423000000_auth_profiles.sql`.
- Backend domain tables still rely on the existing API and Prisma layer; this change only modernizes authentication and profile handling.
