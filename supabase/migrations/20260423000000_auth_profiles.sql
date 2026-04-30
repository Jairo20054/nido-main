create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('TENANT', 'LANDLORD', 'ADMIN');
exception
  when duplicate_object then null;
end $$;

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  bio text,
  avatar_url text,
  role public.user_role not null default 'TENANT',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function private.has_role(required_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = required_role
  );
$$;

create or replace function private.prevent_unauthorized_role_changes()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.role is distinct from old.role and not private.has_role('ADMIN') then
    raise exception 'Only admins can change user roles';
  end if;

  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  metadata jsonb;
  app_metadata jsonb;
  resolved_role public.user_role;
begin
  metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  app_metadata := coalesce(new.raw_app_meta_data, '{}'::jsonb);

  resolved_role :=
    case
      when upper(coalesce(app_metadata->>'role', '')) = 'ADMIN' then 'ADMIN'::public.user_role
      when upper(coalesce(metadata->>'role', 'TENANT')) in ('TENANT', 'LANDLORD') then upper(coalesce(metadata->>'role', 'TENANT'))::public.user_role
      else 'TENANT'::public.user_role
    end;

  insert into public.profiles (
    id,
    first_name,
    last_name,
    email,
    phone,
    bio,
    avatar_url,
    role
  )
  values (
    new.id,
    coalesce(nullif(trim(metadata->>'first_name'), ''), nullif(trim(metadata->>'firstName'), ''), 'Usuario'),
    coalesce(nullif(trim(metadata->>'last_name'), ''), nullif(trim(metadata->>'lastName'), ''), 'Nido'),
    new.email,
    nullif(trim(coalesce(metadata->>'phone', new.phone, '')), ''),
    nullif(trim(coalesce(metadata->>'bio', '')), ''),
    nullif(trim(coalesce(metadata->>'avatar_url', metadata->>'avatarUrl', '')), ''),
    resolved_role
  )
  on conflict (id) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = coalesce(excluded.phone, public.profiles.phone),
        bio = coalesce(excluded.bio, public.profiles.bio),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        role = case when public.profiles.role = 'ADMIN' then public.profiles.role else excluded.role end,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

drop trigger if exists prevent_profile_role_changes on public.profiles;
create trigger prevent_profile_role_changes
before update on public.profiles
for each row
execute function private.prevent_unauthorized_role_changes();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

drop policy if exists "Profiles are visible to the owner" on public.profiles;
create policy "Profiles are visible to the owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (private.has_role('ADMIN'));

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Admins can create any profile" on public.profiles;
create policy "Admins can create any profile"
on public.profiles
for insert
to authenticated
with check (private.has_role('ADMIN'));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
on public.profiles
for update
to authenticated
using (private.has_role('ADMIN'))
with check (private.has_role('ADMIN'));

drop policy if exists "Admins can delete profiles" on public.profiles;
create policy "Admins can delete profiles"
on public.profiles
for delete
to authenticated
using (private.has_role('ADMIN'));
