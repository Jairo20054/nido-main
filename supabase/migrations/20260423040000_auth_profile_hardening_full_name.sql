create extension if not exists pgcrypto;
create schema if not exists private;

alter table public.profiles add column if not exists full_name text;

update public.profiles
set full_name = nullif(trim(concat_ws(' ', first_name, last_name)), '')
where full_name is null or trim(full_name) = '';

alter table public.profiles alter column full_name set default '';
alter table public.profiles alter column full_name set not null;
alter table public.profiles alter column role set default 'tenant'::user_role_enum;
alter table public.profiles alter column created_at set default timezone('utc', now());
alter table public.profiles alter column updated_at set default timezone('utc', now());

create or replace function private.sync_profile_full_name()
returns trigger
language plpgsql
security definer
set search_path = private, public, auth
as $$
begin
  new.full_name := nullif(
    trim(
      coalesce(
        concat_ws(' ', nullif(trim(new.first_name), ''), nullif(trim(new.last_name), '')),
        new.full_name,
        split_part(coalesce(new.email, ''), '@', 1)
      )
    ),
    ''
  );

  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = private, public, auth
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  app_metadata jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
  resolved_role public.user_role_enum;
  resolved_first_name text;
  resolved_last_name text;
  resolved_full_name text;
begin
  resolved_role := case lower(coalesce(app_metadata->>'role', metadata->>'role', 'tenant'))
    when 'landlord' then 'landlord'::public.user_role_enum
    else 'tenant'::public.user_role_enum
  end;

  resolved_first_name := nullif(trim(coalesce(metadata->>'first_name', metadata->>'firstName', split_part(coalesce(metadata->>'full_name', metadata->>'name', split_part(coalesce(new.email, ''), '@', 1)), ' ', 1), split_part(coalesce(new.email, ''), '@', 1))), '');
  resolved_last_name := nullif(trim(coalesce(metadata->>'last_name', metadata->>'lastName', regexp_replace(coalesce(metadata->>'full_name', metadata->>'name', ''), '^\S+\s*', ''))), '');
  resolved_full_name := nullif(trim(coalesce(metadata->>'full_name', metadata->>'name', concat_ws(' ', resolved_first_name, resolved_last_name), split_part(coalesce(new.email, ''), '@', 1))), '');

  insert into public.profiles (
    id,
    auth_id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    bio,
    avatar_url,
    role,
    country_code,
    locale,
    timezone
  )
  values (
    new.id,
    new.id,
    new.email,
    coalesce(resolved_full_name, concat_ws(' ', resolved_first_name, resolved_last_name), split_part(coalesce(new.email, ''), '@', 1)),
    resolved_first_name,
    resolved_last_name,
    nullif(trim(coalesce(metadata->>'phone', '')), ''),
    nullif(trim(coalesce(metadata->>'bio', '')), ''),
    nullif(trim(coalesce(metadata->>'avatar_url', metadata->>'avatarUrl', '')), ''),
    resolved_role,
    nullif(trim(coalesce(metadata->>'country_code', metadata->>'countryCode', '')), ''),
    nullif(trim(coalesce(metadata->>'locale', '')), ''),
    nullif(trim(coalesce(metadata->>'timezone', '')), '')
  )
  on conflict (auth_id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        first_name = coalesce(excluded.first_name, public.profiles.first_name),
        last_name = coalesce(excluded.last_name, public.profiles.last_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        bio = coalesce(excluded.bio, public.profiles.bio),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        role = case when public.profiles.role = 'admin'::public.user_role_enum then public.profiles.role else excluded.role end,
        country_code = coalesce(excluded.country_code, public.profiles.country_code),
        locale = coalesce(excluded.locale, public.profiles.locale),
        timezone = coalesce(excluded.timezone, public.profiles.timezone),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function private.prevent_unauthorized_role_changes()
returns trigger
language plpgsql
security definer
set search_path = private, public, auth
as $$
begin
  if new.role is distinct from old.role and not public.is_platform_admin(auth.uid()) then
    raise exception 'Only admins can change user roles';
  end if;

  return new;
end;
$$;

create or replace function public.get_user_role(user_id uuid)
returns user_role_enum
language sql
stable
security definer
set search_path = public, auth
as $$
  select case
    when exists (
      select 1
      from public.platform_admins pa
      where pa.auth_user_id = user_id
    ) then 'admin'::public.user_role_enum
    else coalesce(
      (
        select p.role
        from public.profiles p
        where p.auth_id = user_id
        limit 1
      ),
      'tenant'::public.user_role_enum
    )
  end;
$$;

create or replace function public.is_platform_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.auth_user_id = coalesce(user_id, auth.uid())
  );
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

drop trigger if exists prevent_profile_role_changes on public.profiles;
create trigger prevent_profile_role_changes
before update on public.profiles
for each row
execute function private.prevent_unauthorized_role_changes();

drop trigger if exists set_profiles_updated_at on public.profiles;
drop trigger if exists update_profiles_updated_at on public.profiles;
drop trigger if exists sync_profiles_full_name on public.profiles;

create trigger sync_profiles_full_name
before insert or update on public.profiles
for each row
execute function private.sync_profile_full_name();

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at();

drop policy if exists profiles_admin_all on public.profiles;
drop policy if exists admin_profiles_all on public.profiles;
drop policy if exists profiles_own_select on public.profiles;
drop policy if exists profiles_own_insert on public.profiles;
drop policy if exists profiles_own_update on public.profiles;
drop policy if exists profiles_view_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_own_select
on public.profiles
for select
to authenticated
using (auth_id = auth.uid());

create policy profiles_own_update
on public.profiles
for update
to authenticated
using (auth_id = auth.uid())
with check (auth_id = auth.uid());

create policy profiles_admin_all
on public.profiles
for all
to authenticated
using (public.is_platform_admin(auth.uid()))
with check (public.is_platform_admin(auth.uid()));

drop policy if exists platform_admins_admin_all on public.platform_admins;
drop policy if exists platform_admins_select_own on public.platform_admins;

create policy platform_admins_admin_all
on public.platform_admins
for all
to authenticated
using (public.is_platform_admin(auth.uid()))
with check (public.is_platform_admin(auth.uid()));

create policy platform_admins_select_own
on public.platform_admins
for select
to authenticated
using (auth_user_id = auth.uid());

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.platform_admins enable row level security;
alter table public.platform_admins force row level security;
