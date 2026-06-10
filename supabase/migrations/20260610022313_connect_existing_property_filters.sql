alter table public.properties
  add column if not exists summary text,
  add column if not exists rental_type text default 'FULL_HOME',
  add column if not exists neighborhood text,
  add column if not exists hide_exact_address boolean default false,
  add column if not exists zone_reference text,
  add column if not exists administration_included boolean default false,
  add column if not exists deposit_required boolean default false,
  add column if not exists services_included text[] default '{}'::text[],
  add column if not exists available_immediately boolean default false,
  add column if not exists floor integer,
  add column if not exists strata integer,
  add column if not exists utilities_included boolean default false,
  add column if not exists balcony boolean default false,
  add column if not exists equipped_kitchen boolean default false,
  add column if not exists laundry_area boolean default false,
  add column if not exists elevator boolean default false,
  add column if not exists doorman boolean default false,
  add column if not exists security boolean default false,
  add column if not exists gym boolean default false,
  add column if not exists gated_community boolean default false,
  add column if not exists common_areas boolean default false,
  add column if not exists rules text,
  add column if not exists requirements text,
  add column if not exists ideal_tenant_profile text,
  add column if not exists special_conditions text,
  add column if not exists contact_method text,
  add column if not exists verification_details text,
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists contact_whatsapp text,
  add column if not exists contact_email text,
  add column if not exists contact_preference text,
  add column if not exists publishing_authorization boolean default false,
  add column if not exists accepts_students boolean default false,
  add column if not exists accepts_families boolean default false,
  add column if not exists accepts_cosigner boolean default false,
  add column if not exists requires_rental_study boolean default false,
  add column if not exists visits_allowed boolean default false,
  add column if not exists visit_hours text,
  add column if not exists visit_notes text,
  add column if not exists rejection_reason text,
  add column if not exists approved_at timestamptz,
  add column if not exists published_at timestamptz;

create index if not exists properties_neighborhood_status_idx
  on public.properties (neighborhood, status);

create index if not exists properties_state_region_status_idx
  on public.properties (state_region, status);

create index if not exists properties_property_type_status_idx
  on public.properties (property_type, status);

alter table public.properties
  alter column monthly_rent type numeric(14, 2),
  alter column security_deposit type numeric(14, 2),
  alter column maintenance_fee type numeric(14, 2);
