create extension if not exists "pgcrypto";

create schema if not exists private;

do $$
begin
  create type public.account_role as enum ('admin', 'landlord', 'tenant', 'guarantor', 'reviewer', 'system');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.account_status as enum ('active', 'blocked', 'deleted');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.occupation_type as enum ('employee', 'independent', 'student', 'pensioner', 'foreigner');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.backup_option as enum ('none', 'guarantor', 'insurance');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.property_status as enum ('draft', 'published', 'rented', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.application_status as enum (
    'draft',
    'prequalified',
    'needs_backup',
    'documents_pending',
    'under_review',
    'conditionally_approved',
    'approved',
    'rejected',
    'contract_draft',
    'awaiting_signatures',
    'signed',
    'active',
    'closed',
    'cancelled',
    'expired'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.document_requirement_scope as enum ('identity', 'income', 'backup', 'property', 'contract');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.document_state as enum ('pending', 'uploaded', 'reviewing', 'approved', 'rejected', 'needs_fix');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_check_type as enum ('identity', 'income', 'manual_review');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_status as enum ('approved', 'conditional', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.approval_band as enum ('high', 'medium', 'low');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.approval_result as enum ('approved', 'needs_backup', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.contract_status as enum ('draft', 'pending_signatures', 'signed', 'active', 'terminated', 'expired', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.contract_party_role as enum ('tenant', 'landlord', 'guarantor');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.signature_status as enum ('pending', 'sent', 'viewed', 'signed', 'failed', 'expired');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_type as enum ('first_payment', 'deposit', 'monthly_rent', 'penalty', 'adjustment');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('pending', 'held', 'released', 'failed', 'refunded', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payout_status as enum ('pending', 'ready', 'released', 'failed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.delivery_status as enum ('pending', 'in_progress', 'completed', 'disputed', 'resolved');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.inventory_status as enum ('pending', 'ok', 'observed', 'disputed', 'replaced');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_channel as enum ('in_app', 'email', 'sms', 'whatsapp');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_status as enum ('queued', 'sent', 'delivered', 'read', 'failed');
exception
  when duplicate_object then null;
end $$;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.current_profile_role()
returns public.account_role
language sql
stable
security definer
set search_path = public, private
as $$
  select (
    select p.primary_role
    from public.profiles p
    where p.id = auth.uid()
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select auth.uid() is not null and (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.primary_role = 'admin'::public.account_role
    )
    or exists (
      select 1
      from public.roles r
      where r.profile_id = auth.uid()
        and r.role_key = 'admin'::public.account_role
        and r.status = 'active'
    )
  );
$$;

create or replace function private.has_role(required_role public.account_role)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select auth.uid() is not null and (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.primary_role = required_role
    )
    or exists (
      select 1
      from public.roles r
      where r.profile_id = auth.uid()
        and r.role_key = required_role
        and r.status = 'active'
    )
  );
$$;

create or replace function private.is_profile_owner(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select auth.uid() is not null and auth.uid() = target_profile_id;
$$;

create or replace function private.owns_property(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.properties p
    where p.id = target_property_id
      and p.landlord_id = auth.uid()
  );
$$;

create or replace function private.can_view_property(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.is_admin()
    or private.owns_property(target_property_id)
    or exists (
      select 1
      from public.properties p
      where p.id = target_property_id
        and p.status = 'published'::public.property_status
    );
$$;

create or replace function private.can_view_application(target_application_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.is_admin()
    or exists (
      select 1
      from public.applications a
      where a.id = target_application_id
        and (
          a.tenant_id = auth.uid()
          or a.landlord_id = auth.uid()
        )
    );
$$;

create or replace function private.can_view_contract(target_contract_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.is_admin()
    or exists (
      select 1
      from public.contract_parties cp
      where cp.contract_id = target_contract_id
        and cp.profile_id = auth.uid()
    )
    or private.owns_property((
      select c.property_id
      from public.contracts c
      where c.id = target_contract_id
    ));
$$;

create or replace function private.can_manage_contract(target_contract_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.is_admin()
    or exists (
      select 1
      from public.contracts c
      where c.id = target_contract_id
        and c.landlord_id = auth.uid()
    );
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  bio text,
  avatar_url text,
  locale text not null default 'es-CO',
  country_code text not null default 'CO',
  timezone text not null default 'America/Bogota',
  primary_role public.account_role not null default 'tenant',
  status public.account_status not null default 'active',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_key public.account_role not null,
  scope_type text not null default 'global',
  scope_id uuid,
  status text not null default 'active',
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, role_key, scope_type, scope_id)
);

create table public.landlords (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  legal_name text,
  company_name text,
  document_number text,
  country_code text not null default 'CO',
  verification_status public.verification_status not null default 'conditional',
  payout_preference jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  occupation_type public.occupation_type not null default 'employee',
  monthly_income numeric(14, 2),
  has_guarantor boolean not null default false,
  backup_option public.backup_option not null default 'none',
  prequalification_result public.approval_result,
  approval_band public.approval_band,
  risk_score integer not null default 0,
  country_code text not null default 'CO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete restrict,
  slug text not null unique,
  title text not null,
  summary text not null default '',
  description text not null default '',
  country_code text not null default 'CO',
  currency_code char(3) not null default 'COP',
  city text not null,
  neighborhood text,
  address_line text not null,
  property_type text not null default 'apartment',
  status public.property_status not null default 'draft',
  monthly_rent numeric(14, 2) not null,
  maintenance_fee numeric(14, 2) not null default 0,
  deposit_amount numeric(14, 2) not null default 0,
  bedrooms integer not null default 1,
  bathrooms numeric(4, 1) not null default 1,
  area_m2 numeric(10, 2) not null default 0,
  parking_spots integer not null default 0,
  max_occupants integer not null default 1,
  furnished boolean not null default false,
  pets_allowed boolean not null default false,
  available_from date not null default current_date,
  min_lease_months integer not null default 6,
  amenities jsonb not null default '[]'::jsonb,
  responsibilities jsonb not null default '[]'::jsonb,
  penalties jsonb not null default '[]'::jsonb,
  cover_image_url text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  landlord_id uuid not null references public.profiles(id) on delete restrict,
  occupation_type public.occupation_type not null,
  monthly_income numeric(14, 2) not null,
  has_guarantor boolean not null default false,
  backup_option public.backup_option not null default 'none',
  occupants integer not null default 1,
  desired_move_in date not null,
  lease_months integer not null default 12,
  status public.application_status not null default 'draft',
  prequalification_result public.approval_result,
  approval_band public.approval_band,
  risk_score integer not null default 0,
  monthly_total numeric(14, 2) not null default 0,
  income_ratio numeric(8, 2) not null default 0,
  notes text,
  submitted_at timestamptz,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prequalification_results (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  result public.approval_result not null,
  approval_band public.approval_band not null,
  risk_score integer not null,
  model_version text not null default 'nido-pro-1',
  monthly_total numeric(14, 2) not null,
  income_ratio numeric(8, 2) not null,
  threshold_eligible numeric(8, 2) not null,
  threshold_backup numeric(8, 2) not null,
  reasons jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  evaluated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_requirements (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  requirement_scope public.document_requirement_scope not null,
  document_key text not null,
  label text not null,
  why text not null,
  required boolean not null default true,
  status public.document_state not null default 'pending',
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id, document_key)
);

create table public.document_uploads (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references public.document_requirements(id) on delete cascade,
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  checksum text,
  status public.document_state not null default 'uploaded',
  reviewer_notes text,
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requirement_id, storage_path)
);

create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  check_type public.verification_check_type not null,
  status public.verification_status not null default 'conditional',
  details text,
  metadata jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id, check_type)
);

create table public.approval_decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  approval_band public.approval_band not null,
  decision public.approval_result not null,
  score integer not null,
  rule_version text not null default 'nido-pro-1',
  reason_code text not null,
  reasons jsonb not null default '[]'::jsonb,
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete restrict,
  tenant_id uuid not null references public.profiles(id) on delete restrict,
  landlord_id uuid not null references public.profiles(id) on delete restrict,
  rent_amount numeric(14, 2) not null,
  duration_months integer not null,
  penalties jsonb not null default '[]'::jsonb,
  responsibilities jsonb not null default '[]'::jsonb,
  start_date date not null,
  end_date date not null,
  status public.contract_status not null default 'draft',
  active_from timestamptz,
  signed_at timestamptz,
  terminated_at timestamptz,
  signature_deadline_at timestamptz,
  contract_version integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contract_parties (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  party_role public.contract_party_role not null,
  display_name text not null,
  required_to_sign boolean not null default true,
  signing_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contract_id, profile_id, party_role)
);

create table public.signatures (
  id uuid primary key default gen_random_uuid(),
  contract_party_id uuid not null unique references public.contract_parties(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  signer_id uuid not null references public.profiles(id) on delete cascade,
  signer_role public.contract_party_role not null,
  status public.signature_status not null default 'pending',
  signed_at timestamptz,
  signature_method text not null default 'otp',
  signature_hash text,
  evidence jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  payer_id uuid not null references public.profiles(id) on delete restrict,
  payee_id uuid references public.profiles(id) on delete set null,
  payment_type public.payment_type not null,
  amount numeric(14, 2) not null,
  currency_code char(3) not null default 'COP',
  status public.payment_status not null default 'pending',
  held_at timestamptz,
  released_at timestamptz,
  provider_ref text,
  escrow_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payout_releases (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null unique references public.payments(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  beneficiary_id uuid not null references public.profiles(id) on delete restrict,
  status public.payout_status not null default 'pending',
  release_condition text not null,
  amount numeric(14, 2) not null,
  released_at timestamptz,
  provider_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.delivery_checklists (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null unique references public.contracts(id) on delete cascade,
  status public.delivery_status not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  tenant_confirmed_at timestamptz,
  landlord_confirmed_at timestamptz,
  overall_condition text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.delivery_checklists(id) on delete cascade,
  room_name text not null,
  item_name text not null,
  expected_condition text not null,
  observed_condition text,
  photos jsonb not null default '[]'::jsonb,
  notes text,
  status public.inventory_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete cascade,
  channel public.notification_channel not null default 'in_app',
  template_key text not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  status public.notification_status not null default 'queued',
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role text not null default 'system',
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb not null default '{}'::jsonb,
  after_data jsonb not null default '{}'::jsonb,
  reason_code text,
  request_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tenant_id, property_id)
);

create table public.country_rules (
  id uuid primary key default gen_random_uuid(),
  country_code text not null unique,
  currency_code char(3) not null,
  eligible_ratio numeric(8, 2) not null default 3.00,
  backup_ratio numeric(8, 2) not null default 2.30,
  hard_floor_ratio numeric(8, 2) not null default 1.60,
  signature_mode text not null default 'otp',
  escrow_mode text not null default 'partner_escrow',
  document_rules jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_primary_role_idx on public.profiles (primary_role);
create index if not exists roles_profile_role_idx on public.roles (profile_id, role_key, status);
create index if not exists landlords_profile_idx on public.landlords (profile_id);
create index if not exists tenants_profile_idx on public.tenants (profile_id);
create index if not exists properties_landlord_status_idx on public.properties (landlord_id, status, created_at desc);
create index if not exists properties_city_status_idx on public.properties (city, status, monthly_rent);
create index if not exists property_images_property_idx on public.property_images (property_id, sort_order);
create index if not exists applications_tenant_status_idx on public.applications (tenant_id, status, created_at desc);
create index if not exists applications_landlord_status_idx on public.applications (landlord_id, status, created_at desc);
create index if not exists applications_property_idx on public.applications (property_id, created_at desc);
create index if not exists prequalification_results_application_idx on public.prequalification_results (application_id);
create index if not exists document_requirements_application_idx on public.document_requirements (application_id, status);
create index if not exists document_uploads_requirement_idx on public.document_uploads (requirement_id, status);
create index if not exists verifications_application_idx on public.verifications (application_id, check_type);
create index if not exists approval_decisions_application_idx on public.approval_decisions (application_id, approval_band);
create index if not exists contracts_property_status_idx on public.contracts (property_id, status);
create index if not exists contracts_tenant_status_idx on public.contracts (tenant_id, status);
create index if not exists contract_parties_contract_idx on public.contract_parties (contract_id, party_role);
create index if not exists signatures_contract_idx on public.signatures (contract_id, status);
create index if not exists payments_contract_status_idx on public.payments (contract_id, status, created_at desc);
create index if not exists payouts_contract_status_idx on public.payout_releases (contract_id, status);
create index if not exists delivery_checklists_contract_idx on public.delivery_checklists (contract_id, status);
create index if not exists inventory_items_checklist_idx on public.inventory_items (checklist_id, status);
create index if not exists notifications_recipient_status_idx on public.notifications (recipient_id, status, created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index if not exists favorites_tenant_idx on public.favorites (tenant_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.landlords enable row level security;
alter table public.tenants enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.applications enable row level security;
alter table public.prequalification_results enable row level security;
alter table public.document_requirements enable row level security;
alter table public.document_uploads enable row level security;
alter table public.verifications enable row level security;
alter table public.approval_decisions enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_parties enable row level security;
alter table public.signatures enable row level security;
alter table public.payments enable row level security;
alter table public.payout_releases enable row level security;
alter table public.delivery_checklists enable row level security;
alter table public.inventory_items enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.favorites enable row level security;
alter table public.country_rules enable row level security;

create policy "profiles_read_own_or_admin"
on public.profiles
for select
to authenticated
using (private.is_admin() or private.is_profile_owner(id));

create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (private.is_admin() or private.is_profile_owner(id))
with check (private.is_admin() or private.is_profile_owner(id));

create policy "profiles_insert_admin"
on public.profiles
for insert
to authenticated
with check (private.is_admin() or private.is_profile_owner(id));

create policy "roles_read_own_or_admin"
on public.roles
for select
to authenticated
using (private.is_admin() or private.is_profile_owner(profile_id));

create policy "roles_write_admin"
on public.roles
for insert
to authenticated
with check (private.is_admin());

create policy "roles_update_admin"
on public.roles
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "roles_delete_admin"
on public.roles
for delete
to authenticated
using (private.is_admin());

create policy "landlords_read_own_or_admin"
on public.landlords
for select
to authenticated
using (private.is_admin() or private.is_profile_owner(profile_id));

create policy "landlords_write_admin_or_owner"
on public.landlords
for insert
to authenticated
with check (private.is_admin() or private.is_profile_owner(profile_id));

create policy "landlords_update_own_or_admin"
on public.landlords
for update
to authenticated
using (private.is_admin() or private.is_profile_owner(profile_id))
with check (private.is_admin() or private.is_profile_owner(profile_id));

create policy "landlords_delete_admin"
on public.landlords
for delete
to authenticated
using (private.is_admin());

create policy "tenants_read_own_or_admin"
on public.tenants
for select
to authenticated
using (private.is_admin() or private.is_profile_owner(profile_id));

create policy "tenants_write_admin_or_owner"
on public.tenants
for insert
to authenticated
with check (private.is_admin() or private.is_profile_owner(profile_id));

create policy "tenants_update_own_or_admin"
on public.tenants
for update
to authenticated
using (private.is_admin() or private.is_profile_owner(profile_id))
with check (private.is_admin() or private.is_profile_owner(profile_id));

create policy "tenants_delete_admin"
on public.tenants
for delete
to authenticated
using (private.is_admin());

create policy "properties_public_read"
on public.properties
for select
to anon, authenticated
using (private.can_view_property(id));

create policy "properties_insert_landlord_or_admin"
on public.properties
for insert
to authenticated
with check (private.is_admin() or private.is_profile_owner(landlord_id));

create policy "properties_update_landlord_or_admin"
on public.properties
for update
to authenticated
using (private.is_admin() or private.owns_property(id))
with check (private.is_admin() or private.owns_property(id));

create policy "properties_delete_landlord_or_admin"
on public.properties
for delete
to authenticated
using (private.is_admin() or private.owns_property(id));

create policy "property_images_public_read"
on public.property_images
for select
to anon, authenticated
using (private.can_view_property(property_id));

create policy "property_images_manage_owner_or_admin"
on public.property_images
for all
to authenticated
using (private.is_admin() or private.owns_property(property_id))
with check (private.is_admin() or private.owns_property(property_id));

create policy "applications_read_related_or_admin"
on public.applications
for select
to authenticated
using (private.is_admin() or tenant_id = auth.uid() or landlord_id = auth.uid());

create policy "applications_insert_tenant_or_admin"
on public.applications
for insert
to authenticated
with check (private.is_admin() or tenant_id = auth.uid());

create policy "applications_update_related_or_admin"
on public.applications
for update
to authenticated
using (
  private.is_admin()
  or tenant_id = auth.uid()
  or landlord_id = auth.uid()
)
with check (
  private.is_admin()
  or tenant_id = auth.uid()
  or landlord_id = auth.uid()
);

create policy "applications_delete_admin_or_tenant_draft"
on public.applications
for delete
to authenticated
using (
  private.is_admin()
  or (tenant_id = auth.uid() and status in ('draft'::public.application_status, 'prequalified'::public.application_status))
);

create policy "prequalification_results_read_related_or_admin"
on public.prequalification_results
for select
to authenticated
using (private.is_admin() or private.can_view_application(application_id));

create policy "prequalification_results_write_admin"
on public.prequalification_results
for insert
to authenticated
with check (private.is_admin() or private.can_view_application(application_id));

create policy "prequalification_results_update_admin"
on public.prequalification_results
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "document_requirements_read_related_or_admin"
on public.document_requirements
for select
to authenticated
using (private.is_admin() or private.can_view_application(application_id));

create policy "document_requirements_write_admin_or_landlord"
on public.document_requirements
for all
to authenticated
using (private.is_admin() or private.can_view_application(application_id))
with check (private.is_admin() or private.can_view_application(application_id));

create policy "document_uploads_read_related_or_admin"
on public.document_uploads
for select
to authenticated
using (
  private.is_admin()
  or exists (
    select 1
    from public.document_requirements dr
    where dr.id = requirement_id
      and private.can_view_application(dr.application_id)
  )
  or uploader_id = auth.uid()
);

create policy "document_uploads_insert_uploader_or_admin"
on public.document_uploads
for insert
to authenticated
with check (private.is_admin() or uploader_id = auth.uid());

create policy "document_uploads_update_uploader_or_admin"
on public.document_uploads
for update
to authenticated
using (private.is_admin() or uploader_id = auth.uid())
with check (private.is_admin() or uploader_id = auth.uid());

create policy "document_uploads_delete_uploader_or_admin"
on public.document_uploads
for delete
to authenticated
using (private.is_admin() or uploader_id = auth.uid());

create policy "verifications_read_related_or_admin"
on public.verifications
for select
to authenticated
using (private.is_admin() or private.can_view_application(application_id));

create policy "verifications_write_admin"
on public.verifications
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "approval_decisions_read_related_or_admin"
on public.approval_decisions
for select
to authenticated
using (private.is_admin() or private.can_view_application(application_id));

create policy "approval_decisions_write_admin"
on public.approval_decisions
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "contracts_read_related_or_admin"
on public.contracts
for select
to authenticated
using (private.can_view_contract(id));

create policy "contracts_insert_admin_or_landlord"
on public.contracts
for insert
to authenticated
with check (private.is_admin() or landlord_id = auth.uid());

create policy "contracts_update_related_or_admin"
on public.contracts
for update
to authenticated
using (private.can_manage_contract(id) or private.is_profile_owner(tenant_id))
with check (private.can_manage_contract(id) or private.is_profile_owner(tenant_id));

create policy "contracts_delete_admin"
on public.contracts
for delete
to authenticated
using (private.is_admin());

create policy "contract_parties_read_related_or_admin"
on public.contract_parties
for select
to authenticated
using (
  private.is_admin()
  or exists (
    select 1
    from public.contracts c
    where c.id = contract_id
      and (
        c.tenant_id = auth.uid()
        or c.landlord_id = auth.uid()
      )
  )
  or profile_id = auth.uid()
);

create policy "contract_parties_write_admin_or_landlord"
on public.contract_parties
for all
to authenticated
using (private.is_admin() or private.can_manage_contract(contract_id))
with check (private.is_admin() or private.can_manage_contract(contract_id));

create policy "signatures_read_related_or_admin"
on public.signatures
for select
to authenticated
using (
  private.is_admin()
  or signer_id = auth.uid()
  or private.can_view_contract(contract_id)
);

create policy "signatures_write_signer_or_admin"
on public.signatures
for insert
to authenticated
with check (private.is_admin() or signer_id = auth.uid() or private.can_manage_contract(contract_id));

create policy "signatures_update_signer_or_admin"
on public.signatures
for update
to authenticated
using (private.is_admin() or signer_id = auth.uid() or private.can_manage_contract(contract_id))
with check (private.is_admin() or signer_id = auth.uid() or private.can_manage_contract(contract_id));

create policy "payments_read_related_or_admin"
on public.payments
for select
to authenticated
using (
  private.is_admin()
  or payer_id = auth.uid()
  or payee_id = auth.uid()
  or private.can_view_contract(contract_id)
);

create policy "payments_write_admin_or_landlord"
on public.payments
for all
to authenticated
using (private.is_admin() or private.can_manage_contract(contract_id))
with check (private.is_admin() or private.can_manage_contract(contract_id));

create policy "payouts_read_related_or_admin"
on public.payout_releases
for select
to authenticated
using (
  private.is_admin()
  or beneficiary_id = auth.uid()
  or private.can_view_contract(contract_id)
);

create policy "payouts_write_admin_or_landlord"
on public.payout_releases
for all
to authenticated
using (private.is_admin() or private.can_manage_contract(contract_id))
with check (private.is_admin() or private.can_manage_contract(contract_id));

create policy "delivery_read_related_or_admin"
on public.delivery_checklists
for select
to authenticated
using (private.is_admin() or private.can_view_contract(contract_id));

create policy "delivery_write_related_or_admin"
on public.delivery_checklists
for all
to authenticated
using (private.is_admin() or private.can_manage_contract(contract_id) or private.can_view_contract(contract_id))
with check (private.is_admin() or private.can_manage_contract(contract_id) or private.can_view_contract(contract_id));

create policy "inventory_read_related_or_admin"
on public.inventory_items
for select
to authenticated
using (
  private.is_admin()
  or exists (
    select 1
    from public.delivery_checklists dc
    where dc.id = checklist_id
      and private.can_view_contract(dc.contract_id)
  )
);

create policy "inventory_write_related_or_admin"
on public.inventory_items
for all
to authenticated
using (
  private.is_admin()
  or exists (
    select 1
    from public.delivery_checklists dc
    where dc.id = checklist_id
      and private.can_manage_contract(dc.contract_id)
  )
)
with check (
  private.is_admin()
  or exists (
    select 1
    from public.delivery_checklists dc
    where dc.id = checklist_id
      and private.can_manage_contract(dc.contract_id)
  )
);

create policy "notifications_read_own_or_admin"
on public.notifications
for select
to authenticated
using (private.is_admin() or recipient_id = auth.uid());

create policy "notifications_write_admin"
on public.notifications
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "audit_logs_read_admin"
on public.audit_logs
for select
to authenticated
using (private.is_admin());

create policy "audit_logs_write_admin"
on public.audit_logs
for insert
to authenticated
with check (private.is_admin());

create policy "favorites_read_own_or_admin"
on public.favorites
for select
to authenticated
using (private.is_admin() or tenant_id = auth.uid());

create policy "favorites_write_own_or_admin"
on public.favorites
for all
to authenticated
using (private.is_admin() or tenant_id = auth.uid())
with check (private.is_admin() or tenant_id = auth.uid());

create policy "country_rules_read_public"
on public.country_rules
for select
to anon, authenticated
using (active = true);

create or replace function private.log_row_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  actor uuid := auth.uid();
  actor_role_value text := coalesce(private.current_profile_role()::text, 'system');
  request_id_value text := nullif(current_setting('request.header.x-request-id', true), '');
begin
  if (tg_op = 'DELETE') then
    insert into public.audit_logs (
      actor_id,
      actor_role,
      entity_type,
      entity_id,
      action,
      before_data,
      after_data,
      request_id,
      ip_address,
      user_agent
    )
    values (
      actor,
      actor_role_value,
      tg_table_name,
      old.id,
      lower(tg_op),
      to_jsonb(old),
      '{}'::jsonb,
      request_id_value,
      nullif(current_setting('request.header.x-forwarded-for', true), '')::inet,
      nullif(current_setting('request.header.user-agent', true), '')
    );
    return old;
  end if;

  insert into public.audit_logs (
    actor_id,
    actor_role,
    entity_type,
    entity_id,
    action,
    before_data,
    after_data,
    request_id,
    ip_address,
    user_agent
  )
  values (
    actor,
    actor_role_value,
    tg_table_name,
    new.id,
    lower(tg_op),
    coalesce(to_jsonb(old), '{}'::jsonb),
    to_jsonb(new),
    request_id_value,
    nullif(current_setting('request.header.x-forwarded-for', true), '')::inet,
    nullif(current_setting('request.header.user-agent', true), '')
  );

  return new;
end;
$$;

create or replace function private.refresh_contract_state(target_contract_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  required_signatures integer;
  signed_signatures integer;
  delivery_completed boolean;
begin
  select count(*)
    into required_signatures
  from public.contract_parties cp
  where cp.contract_id = target_contract_id
    and cp.required_to_sign = true;

  select count(*)
    into signed_signatures
  from public.signatures s
  where s.contract_id = target_contract_id
    and s.status = 'signed'::public.signature_status;

  select exists (
    select 1
    from public.delivery_checklists dc
    where dc.contract_id = target_contract_id
      and dc.status = 'completed'::public.delivery_status
      and dc.tenant_confirmed_at is not null
      and dc.landlord_confirmed_at is not null
  )
  into delivery_completed;

  update public.contracts c
  set
    status = case
      when delivery_completed and signed_signatures >= required_signatures and required_signatures > 0 then 'active'::public.contract_status
      when signed_signatures >= required_signatures and required_signatures > 0 then 'signed'::public.contract_status
      else c.status
    end,
    signed_at = case
      when signed_signatures >= required_signatures and required_signatures > 0 and c.signed_at is null then now()
      else c.signed_at
    end,
    active_from = case
      when delivery_completed and signed_signatures >= required_signatures and required_signatures > 0 and c.active_from is null then now()
      else c.active_from
    end,
    updated_at = now()
  where c.id = target_contract_id;

  update public.payments p
  set
    status = case
      when p.status = 'held'::public.payment_status
        and delivery_completed
        and exists (
          select 1
          from public.contracts c
          where c.id = target_contract_id
            and c.status = 'active'::public.contract_status
        )
        then 'released'::public.payment_status
      else p.status
    end,
    released_at = case
      when p.status = 'held'::public.payment_status
        and delivery_completed
        and exists (
          select 1
          from public.contracts c
          where c.id = target_contract_id
            and c.status = 'active'::public.contract_status
        )
        and p.released_at is null
        then now()
      else p.released_at
    end,
    updated_at = now()
  where p.contract_id = target_contract_id;

  update public.payout_releases pr
  set
    status = case
      when exists (
        select 1
        from public.payments p
        where p.id = pr.payment_id
          and p.status = 'released'::public.payment_status
      ) then 'released'::public.payout_status
      when exists (
        select 1
        from public.payments p
        where p.id = pr.payment_id
          and p.status = 'held'::public.payment_status
      ) then 'ready'::public.payout_status
      else pr.status
    end,
    released_at = case
      when exists (
        select 1
        from public.payments p
        where p.id = pr.payment_id
          and p.status = 'released'::public.payment_status
      ) and pr.released_at is null then now()
      else pr.released_at
    end,
    updated_at = now()
  where pr.contract_id = target_contract_id;
end;
$$;

create or replace function private.refresh_contract_state_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  target_contract_id uuid;
begin
  target_contract_id := coalesce(new.contract_id, old.contract_id);
  if target_contract_id is not null then
    perform private.refresh_contract_state(target_contract_id);
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function private.generate_document_requirements(target_application_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  app_row public.applications;
  rule_row public.country_rules;
begin
  select * into app_row
  from public.applications
  where id = target_application_id;

  if not found then
    return;
  end if;

  select *
  into rule_row
  from public.country_rules
  where country_code = (
    select p.country_code
    from public.properties p
    where p.id = app_row.property_id
  )
  and active = true
  order by created_at desc
  limit 1;

  delete from public.document_requirements
  where application_id = target_application_id;

  insert into public.document_requirements (
    application_id,
    requirement_scope,
    document_key,
    label,
    why,
    required,
    status,
    sort_order,
    metadata
  )
  values
    (target_application_id, 'identity', 'identity-document', 'Documento de identidad', 'Confirmamos que la identidad del solicitante coincide con el expediente.', true, 'pending', 1, jsonb_build_object('formats', jsonb_build_array('jpg', 'png', 'pdf'))),
    (target_application_id, 'identity', 'selfie-liveness', 'Selfie o prueba de vida', 'Reduce suplantación y valida que la solicitud sea legítima.', true, 'pending', 2, jsonb_build_object('formats', jsonb_build_array('jpg', 'png'))),
    (
      target_application_id,
      'income',
      case
        when app_row.occupation_type = 'employee'::public.occupation_type then 'employment-letter'
        when app_row.occupation_type = 'independent'::public.occupation_type then 'bank-statements'
        when app_row.occupation_type = 'student'::public.occupation_type then 'student-proof'
        when app_row.occupation_type = 'pensioner'::public.occupation_type then 'pension-proof'
        else 'income-proof'
      end,
      case
        when app_row.occupation_type = 'employee'::public.occupation_type then 'Carta laboral'
        when app_row.occupation_type = 'independent'::public.occupation_type then 'Extractos bancarios'
        when app_row.occupation_type = 'student'::public.occupation_type then 'Certificado de estudio'
        when app_row.occupation_type = 'pensioner'::public.occupation_type then 'Soporte de pensión'
        else 'Soporte de ingresos'
      end,
      case
        when app_row.occupation_type = 'employee'::public.occupation_type then 'Validamos estabilidad laboral y salario declarado.'
        when app_row.occupation_type = 'independent'::public.occupation_type then 'Revisamos consistencia entre ingresos y movimientos.'
        when app_row.occupation_type = 'student'::public.occupation_type then 'Validamos tu vínculo académico actual.'
        when app_row.occupation_type = 'pensioner'::public.occupation_type then 'Validamos recurrencia y monto de la pensión.'
        else 'Validamos continuidad y origen de los ingresos.'
      end,
      true,
      'pending',
      3,
      jsonb_build_object('source', app_row.occupation_type::text, 'country_rule', coalesce(rule_row.country_code, app_row.occupation_type::text))
    );

  if app_row.has_guarantor or app_row.backup_option <> 'none'::public.backup_option then
    insert into public.document_requirements (
      application_id,
      requirement_scope,
      document_key,
      label,
      why,
      required,
      status,
      sort_order,
      metadata
    )
    values (
      target_application_id,
      'backup',
      case
        when app_row.backup_option = 'insurance'::public.backup_option then 'insurance-policy'
        else 'guarantor-documents'
      end,
      case
        when app_row.backup_option = 'insurance'::public.backup_option then 'Póliza o garantía'
        else 'Documentos del respaldo'
      end,
      case
        when app_row.backup_option = 'insurance'::public.backup_option then 'Necesitamos validar la garantía alternativa.'
        else 'Necesitamos validar el respaldo que acompaña la solicitud.'
      end,
      true,
      'pending',
      4,
      jsonb_build_object('backup_option', app_row.backup_option::text)
    );
  end if;
end;
$$;

create or replace function private.calculate_prequalification(
  target_application_id uuid
)
returns table (
  result public.approval_result,
  approval_band public.approval_band,
  risk_score integer,
  monthly_total numeric,
  income_ratio numeric,
  threshold_eligible numeric,
  threshold_backup numeric,
  reasons jsonb,
  recommendations jsonb
)
language plpgsql
stable
security definer
set search_path = public, private
as $$
declare
  app_row public.applications;
  property_row public.properties;
  rule_row public.country_rules;
  effective_eligible numeric(8, 2) := 3.00;
  effective_backup numeric(8, 2) := 2.30;
  hard_floor numeric(8, 2) := 1.60;
  occupation_adjustment numeric(8, 2) := 0;
  computed_monthly_total numeric(14, 2);
  computed_ratio numeric(8, 2);
  computed_score integer := 0;
  computed_result public.approval_result := 'rejected';
  computed_band public.approval_band := 'low';
  notes jsonb := '[]'::jsonb;
  next_steps jsonb := '[]'::jsonb;
begin
  select * into app_row
  from public.applications
  where id = target_application_id;

  if not found then
    raise exception 'application % not found', target_application_id;
  end if;

  select * into property_row
  from public.properties
  where id = app_row.property_id;

  select * into rule_row
  from public.country_rules
  where country_code = property_row.country_code
    and active = true
  order by created_at desc
  limit 1;

  if rule_row.id is null then
    effective_eligible := 3.00;
    effective_backup := 2.30;
    hard_floor := 1.60;
  else
    effective_eligible := rule_row.eligible_ratio;
    effective_backup := rule_row.backup_ratio;
    hard_floor := rule_row.hard_floor_ratio;
  end if;

  occupation_adjustment :=
    case app_row.occupation_type
      when 'employee'::public.occupation_type then 0.00
      when 'independent'::public.occupation_type then 0.15
      when 'student'::public.occupation_type then 0.10
      when 'pensioner'::public.occupation_type then 0.00
      when 'foreigner'::public.occupation_type then 0.10
      else 0.00
    end;

  computed_monthly_total := coalesce(property_row.monthly_rent, 0) + coalesce(property_row.maintenance_fee, 0);
  computed_ratio := case when computed_monthly_total > 0 then round(app_row.monthly_income / computed_monthly_total, 2) else 0 end;
  effective_eligible := effective_eligible + occupation_adjustment;
  effective_backup := effective_backup + occupation_adjustment;

  notes := jsonb_build_array(
    jsonb_build_object(
      'code', 'occupancy',
      'message', case
        when app_row.occupants > property_row.max_occupants then format('El inmueble admite hasta %s ocupantes.', property_row.max_occupants)
        else 'La ocupación declarada está dentro del límite del inmueble.'
      end
    ),
    jsonb_build_object(
      'code', 'income_ratio',
      'message', case
        when computed_ratio >= effective_eligible then 'Tus ingresos declarados cubren el canon con holgura.'
        when computed_ratio >= effective_backup then 'Puedes continuar, pero requerimos respaldo.'
        else 'Tus ingresos quedan por debajo del umbral mínimo.'
      end
    ),
    jsonb_build_object(
      'code', 'backup',
      'message', case
        when app_row.has_guarantor or app_row.backup_option <> 'none'::public.backup_option then 'La solicitud cuenta con una opción de respaldo.'
        else 'No hay respaldo declarado todavía.'
      end
    )
  );

  if app_row.occupants > property_row.max_occupants or computed_ratio < hard_floor then
    computed_result := 'rejected';
    computed_band := 'low';
    next_steps := jsonb_build_array(
      'Explorar inmuebles con un canon menor.',
      'Agregar un respaldo o garantía alternativa si el país lo permite.'
    );
  elsif computed_ratio >= effective_eligible and (app_row.has_guarantor = false and app_row.backup_option = 'none'::public.backup_option) then
    computed_result := 'approved';
    computed_band := 'high';
    next_steps := jsonb_build_array(
      'Continuar con la carga documental.',
      'Preparar el contrato y la firma digital.'
    );
  elsif computed_ratio >= effective_backup or app_row.has_guarantor or app_row.backup_option <> 'none'::public.backup_option then
    computed_result := 'needs_backup';
    computed_band := 'medium';
    next_steps := jsonb_build_array(
      'Subir documentos del respaldo.',
      'Continuar con la revisión una vez se confirme el respaldo.'
    );
  else
    computed_result := 'rejected';
    computed_band := 'low';
    next_steps := jsonb_build_array(
      'Explorar opciones más acordes al presupuesto.',
      'Consultar soporte si necesitas un respaldo adicional.'
    );
  end if;

  computed_score :=
    greatest(
      0,
      least(
        100,
        round(
          case
            when effective_eligible > 0 then (computed_ratio / effective_eligible) * 45
            else 0
          end
          + case when app_row.occupants <= property_row.max_occupants then 20 else 0 end
          + case when app_row.has_guarantor or app_row.backup_option <> 'none'::public.backup_option then 15 else 6 end
          + case app_row.occupation_type
              when 'employee'::public.occupation_type then 12
              when 'independent'::public.occupation_type then 8
              when 'student'::public.occupation_type then 4
              when 'pensioner'::public.occupation_type then 10
              when 'foreigner'::public.occupation_type then 6
              else 0
            end
        )
      )
    );

  if computed_score >= 80 and computed_result <> 'rejected' then
    computed_band := 'high';
    computed_result := 'approved';
  elsif computed_score >= 60 and computed_result <> 'rejected' then
    computed_band := 'medium';
    if computed_result = 'approved' then
      computed_result := 'needs_backup';
    end if;
  else
    computed_band := 'low';
    if app_row.has_guarantor or app_row.backup_option = 'insurance'::public.backup_option then
      computed_result := 'needs_backup';
    else
      computed_result := 'rejected';
    end if;
  end if;

  return query
  select
    computed_result,
    computed_band,
    computed_score,
    computed_monthly_total,
    computed_ratio,
    effective_eligible,
    effective_backup,
    notes,
    next_steps;
end;
$$;

create or replace function public.sync_application_workflow()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  evaluation record;
begin
  if tg_op = 'DELETE' then
    return old;
  end if;

  select * into evaluation
  from private.calculate_prequalification(new.id);

  insert into public.prequalification_results (
    application_id,
    result,
    approval_band,
    risk_score,
    model_version,
    monthly_total,
    income_ratio,
    threshold_eligible,
    threshold_backup,
    reasons,
    recommendations,
    evaluated_at
  )
  values (
    new.id,
    evaluation.result,
    evaluation.approval_band,
    evaluation.risk_score,
    'nido-pro-1',
    evaluation.monthly_total,
    evaluation.income_ratio,
    evaluation.threshold_eligible,
    evaluation.threshold_backup,
    evaluation.reasons,
    evaluation.recommendations,
    now()
  )
  on conflict (application_id) do update set
    result = excluded.result,
    approval_band = excluded.approval_band,
    risk_score = excluded.risk_score,
    monthly_total = excluded.monthly_total,
    income_ratio = excluded.income_ratio,
    threshold_eligible = excluded.threshold_eligible,
    threshold_backup = excluded.threshold_backup,
    reasons = excluded.reasons,
    recommendations = excluded.recommendations,
    evaluated_at = excluded.evaluated_at,
    updated_at = now();

  insert into public.approval_decisions (
    application_id,
    approval_band,
    decision,
    score,
    rule_version,
    reason_code,
    reasons,
    decided_by,
    decided_at
  )
  values (
    new.id,
    evaluation.approval_band,
    evaluation.result,
    evaluation.risk_score,
    'nido-pro-1',
    case evaluation.result
      when 'approved'::public.approval_result then 'auto_approve'
      when 'needs_backup'::public.approval_result then 'backup_required'
      else 'risk_reject'
    end,
    evaluation.reasons,
    null,
    now()
  )
  on conflict (application_id) do update set
    approval_band = excluded.approval_band,
    decision = excluded.decision,
    score = excluded.score,
    reason_code = excluded.reason_code,
    reasons = excluded.reasons,
    decided_at = excluded.decided_at,
    updated_at = now();

  update public.applications
  set
    prequalification_result = evaluation.result,
    approval_band = evaluation.approval_band,
    risk_score = evaluation.risk_score,
    monthly_total = evaluation.monthly_total,
    income_ratio = evaluation.income_ratio,
    status = case evaluation.result
      when 'approved'::public.approval_result then 'prequalified'::public.application_status
      when 'needs_backup'::public.approval_result then 'needs_backup'::public.application_status
      else 'rejected'::public.application_status
    end,
    submitted_at = coalesce(submitted_at, now()),
    last_activity_at = now(),
    updated_at = now()
  where id = new.id;

  perform private.generate_document_requirements(new.id);
  return new;
end;
$$;

create or replace function public.bootstrap_contract_from_application(target_application_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  app_row public.applications;
  prop_row public.properties;
  contract_id_value uuid;
begin
  select * into app_row
  from public.applications
  where id = target_application_id;

  if not found then
    raise exception 'application % not found', target_application_id;
  end if;

  if app_row.prequalification_result is distinct from 'approved'::public.approval_result
     and app_row.prequalification_result is distinct from 'needs_backup'::public.approval_result then
    raise exception 'application % is not ready for contract creation', target_application_id;
  end if;

  select * into prop_row
  from public.properties
  where id = app_row.property_id;

  insert into public.contracts (
    application_id,
    property_id,
    tenant_id,
    landlord_id,
    rent_amount,
    duration_months,
    penalties,
    responsibilities,
    start_date,
    end_date,
    status,
    signature_deadline_at
  )
  values (
    app_row.id,
    app_row.property_id,
    app_row.tenant_id,
    app_row.landlord_id,
    prop_row.monthly_rent,
    app_row.lease_months,
    prop_row.penalties,
    prop_row.responsibilities,
    app_row.desired_move_in,
    (app_row.desired_move_in + (app_row.lease_months || ' months')::interval)::date,
    'pending_signatures'::public.contract_status,
    now() + interval '7 days'
  )
  returning id into contract_id_value;

  insert into public.contract_parties (
    contract_id,
    profile_id,
    party_role,
    display_name,
    required_to_sign,
    signing_order
  )
  select
    contract_id_value,
    app_row.tenant_id,
    'tenant'::public.contract_party_role,
    trim(coalesce((select first_name from public.profiles where id = app_row.tenant_id), '') || ' ' || coalesce((select last_name from public.profiles where id = app_row.tenant_id), '')),
    true,
    1
  union all
  select
    contract_id_value,
    app_row.landlord_id,
    'landlord'::public.contract_party_role,
    trim(coalesce((select first_name from public.profiles where id = app_row.landlord_id), '') || ' ' || coalesce((select last_name from public.profiles where id = app_row.landlord_id), '')),
    true,
    2;

  if app_row.has_guarantor or app_row.backup_option <> 'none'::public.backup_option then
    insert into public.contract_parties (
      contract_id,
      profile_id,
      party_role,
      display_name,
      required_to_sign,
      signing_order
    )
    values (
      contract_id_value,
      app_row.tenant_id,
      'guarantor'::public.contract_party_role,
      'Guarantor',
      false,
      3
    );
  end if;

  update public.applications
  set status = 'contract_draft'::public.application_status,
      last_activity_at = now(),
      updated_at = now()
  where id = app_row.id;

  return contract_id_value;
end;
$$;

create or replace function public.on_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  requested_role public.account_role := case lower(coalesce(new.raw_user_meta_data->>'role', 'tenant'))
    when 'admin' then 'admin'::public.account_role
    when 'landlord' then 'landlord'::public.account_role
    when 'tenant' then 'tenant'::public.account_role
    else 'tenant'::public.account_role
  end;
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    bio,
    avatar_url,
    locale,
    country_code,
    timezone,
    primary_role,
    status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'firstName', ''),
    coalesce(new.raw_user_meta_data->>'lastName', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'bio', ''),
    nullif(new.raw_user_meta_data->>'avatarUrl', ''),
    coalesce(new.raw_user_meta_data->>'locale', 'es-CO'),
    coalesce(new.raw_user_meta_data->>'countryCode', 'CO'),
    coalesce(new.raw_user_meta_data->>'timezone', 'America/Bogota'),
    requested_role,
    'active'::public.account_status
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    bio = excluded.bio,
    avatar_url = excluded.avatar_url,
    locale = excluded.locale,
    country_code = excluded.country_code,
    timezone = excluded.timezone,
    primary_role = excluded.primary_role,
    updated_at = now();

  insert into public.roles (
    profile_id,
    role_key,
    scope_type,
    scope_id,
    status,
    granted_by
  )
  values (
    new.id,
    requested_role,
    'global',
    null,
    'active',
    null
  )
  on conflict do nothing;

  if requested_role = 'landlord'::public.account_role then
    insert into public.landlords (profile_id, country_code)
    values (new.id, coalesce(new.raw_user_meta_data->>'countryCode', 'CO'))
    on conflict (profile_id) do nothing;
  else
    insert into public.tenants (profile_id, country_code)
    values (new.id, coalesce(new.raw_user_meta_data->>'countryCode', 'CO'))
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_trigger on auth.users;
create trigger on_auth_user_created_trigger
after insert on auth.users
for each row
execute function public.on_auth_user_created();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row
execute function private.touch_updated_at();

drop trigger if exists roles_touch_updated_at on public.roles;
create trigger roles_touch_updated_at
before update on public.roles
for each row
execute function private.touch_updated_at();

drop trigger if exists landlords_touch_updated_at on public.landlords;
create trigger landlords_touch_updated_at
before update on public.landlords
for each row
execute function private.touch_updated_at();

drop trigger if exists tenants_touch_updated_at on public.tenants;
create trigger tenants_touch_updated_at
before update on public.tenants
for each row
execute function private.touch_updated_at();

drop trigger if exists properties_touch_updated_at on public.properties;
create trigger properties_touch_updated_at
before update on public.properties
for each row
execute function private.touch_updated_at();

drop trigger if exists property_images_touch_updated_at on public.property_images;
create trigger property_images_touch_updated_at
before update on public.property_images
for each row
execute function private.touch_updated_at();

drop trigger if exists applications_touch_updated_at on public.applications;
create trigger applications_touch_updated_at
before update on public.applications
for each row
execute function private.touch_updated_at();

drop trigger if exists applications_sync_workflow on public.applications;
create trigger applications_sync_workflow
after insert or update of occupation_type, monthly_income, has_guarantor, backup_option, occupants, desired_move_in, lease_months, property_id on public.applications
for each row
execute function public.sync_application_workflow();

drop trigger if exists prequalification_results_touch_updated_at on public.prequalification_results;
create trigger prequalification_results_touch_updated_at
before update on public.prequalification_results
for each row
execute function private.touch_updated_at();

drop trigger if exists document_requirements_touch_updated_at on public.document_requirements;
create trigger document_requirements_touch_updated_at
before update on public.document_requirements
for each row
execute function private.touch_updated_at();

drop trigger if exists document_uploads_touch_updated_at on public.document_uploads;
create trigger document_uploads_touch_updated_at
before update on public.document_uploads
for each row
execute function private.touch_updated_at();

drop trigger if exists verifications_touch_updated_at on public.verifications;
create trigger verifications_touch_updated_at
before update on public.verifications
for each row
execute function private.touch_updated_at();

drop trigger if exists approval_decisions_touch_updated_at on public.approval_decisions;
create trigger approval_decisions_touch_updated_at
before update on public.approval_decisions
for each row
execute function private.touch_updated_at();

drop trigger if exists contracts_touch_updated_at on public.contracts;
create trigger contracts_touch_updated_at
before update on public.contracts
for each row
execute function private.touch_updated_at();

drop trigger if exists contract_parties_touch_updated_at on public.contract_parties;
create trigger contract_parties_touch_updated_at
before update on public.contract_parties
for each row
execute function private.touch_updated_at();

drop trigger if exists signatures_touch_updated_at on public.signatures;
create trigger signatures_touch_updated_at
before update on public.signatures
for each row
execute function private.touch_updated_at();

drop trigger if exists payments_touch_updated_at on public.payments;
create trigger payments_touch_updated_at
before update on public.payments
for each row
execute function private.touch_updated_at();

drop trigger if exists payouts_touch_updated_at on public.payout_releases;
create trigger payouts_touch_updated_at
before update on public.payout_releases
for each row
execute function private.touch_updated_at();

drop trigger if exists delivery_touch_updated_at on public.delivery_checklists;
create trigger delivery_touch_updated_at
before update on public.delivery_checklists
for each row
execute function private.touch_updated_at();

drop trigger if exists inventory_touch_updated_at on public.inventory_items;
create trigger inventory_touch_updated_at
before update on public.inventory_items
for each row
execute function private.touch_updated_at();

drop trigger if exists notifications_touch_updated_at on public.notifications;
create trigger notifications_touch_updated_at
before update on public.notifications
for each row
execute function private.touch_updated_at();

drop trigger if exists country_rules_touch_updated_at on public.country_rules;
create trigger country_rules_touch_updated_at
before update on public.country_rules
for each row
execute function private.touch_updated_at();

drop trigger if exists profiles_audit_log on public.profiles;
create trigger profiles_audit_log
after insert or update or delete on public.profiles
for each row
execute function private.log_row_change();

drop trigger if exists properties_audit_log on public.properties;
create trigger properties_audit_log
after insert or update or delete on public.properties
for each row
execute function private.log_row_change();

drop trigger if exists applications_audit_log on public.applications;
create trigger applications_audit_log
after insert or update or delete on public.applications
for each row
execute function private.log_row_change();

drop trigger if exists contracts_audit_log on public.contracts;
create trigger contracts_audit_log
after insert or update or delete on public.contracts
for each row
execute function private.log_row_change();

drop trigger if exists signatures_audit_log on public.signatures;
create trigger signatures_audit_log
after insert or update or delete on public.signatures
for each row
execute function private.log_row_change();

drop trigger if exists payments_audit_log on public.payments;
create trigger payments_audit_log
after insert or update or delete on public.payments
for each row
execute function private.log_row_change();

drop trigger if exists delivery_audit_log on public.delivery_checklists;
create trigger delivery_audit_log
after insert or update or delete on public.delivery_checklists
for each row
execute function private.log_row_change();

drop trigger if exists applications_refresh_contract_state on public.signatures;
create trigger applications_refresh_contract_state
after insert or update or delete on public.signatures
for each row
execute function private.refresh_contract_state_trigger();

drop trigger if exists delivery_refresh_contract_state on public.delivery_checklists;
create trigger delivery_refresh_contract_state
after insert or update or delete on public.delivery_checklists
for each row
execute function private.refresh_contract_state_trigger();

insert into public.country_rules (
  country_code,
  currency_code,
  eligible_ratio,
  backup_ratio,
  hard_floor_ratio,
  signature_mode,
  escrow_mode,
  document_rules,
  active
)
values
  (
    'CO',
    'COP',
    3.00,
    2.30,
    1.60,
    'otp',
    'partner_escrow',
    jsonb_build_object(
      'employee', jsonb_build_array('identity-document', 'employment-letter', 'payslips'),
      'independent', jsonb_build_array('identity-document', 'bank-statements', 'income-proof'),
      'fallback', jsonb_build_array('guarantor-documents', 'insurance-policy')
    ),
    true
  )
on conflict (country_code) do update set
  currency_code = excluded.currency_code,
  eligible_ratio = excluded.eligible_ratio,
  backup_ratio = excluded.backup_ratio,
  hard_floor_ratio = excluded.hard_floor_ratio,
  signature_mode = excluded.signature_mode,
  escrow_mode = excluded.escrow_mode,
  document_rules = excluded.document_rules,
  active = excluded.active,
  updated_at = now();
