begin;

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.platform_admins (
  auth_user_id uuid primary key references auth.users (id) on delete cascade,
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  granted_by uuid references public.profiles (id) on delete set null,
  granted_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_admins_identity_check check (auth_user_id = profile_id)
);

create table if not exists public.property_features (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.properties (id) on delete cascade,
  feature_code text not null,
  feature_value text,
  source text not null default 'manual',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_features_source_check check (source in ('manual', 'imported', 'generated', 'ai')),
  constraint property_features_code_check check (char_length(trim(feature_code)) > 0)
);

create unique index if not exists property_features_property_code_key
  on public.property_features (property_id, feature_code);

create table if not exists public.document_requirement_templates (
  id uuid primary key default uuid_generate_v4(),
  profile_type text not null,
  document_type text not null,
  title text not null,
  description text,
  is_required boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_requirement_templates_profile_type_check
    check (profile_type in ('all', 'employed', 'independent', 'backup')),
  constraint document_requirement_templates_document_type_check
    check (char_length(trim(document_type)) > 0),
  constraint document_requirement_templates_title_check
    check (char_length(trim(title)) > 0)
);

create unique index if not exists document_requirement_templates_scope_key
  on public.document_requirement_templates (profile_type, document_type);

create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  contract_id uuid references public.contracts (id) on delete cascade,
  application_id uuid references public.applications (id) on delete cascade,
  subject text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  category text not null default 'general',
  assigned_to uuid references public.profiles (id) on delete set null,
  last_message_at timestamptz,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_tickets_status_check check (status in ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  constraint support_tickets_priority_check check (priority in ('low', 'normal', 'high', 'urgent')),
  constraint support_tickets_subject_check check (char_length(trim(subject)) > 0)
);

create index if not exists idx_support_tickets_profile_id on public.support_tickets (profile_id);
create index if not exists idx_support_tickets_status on public.support_tickets (status);
create index if not exists idx_support_tickets_assigned_to on public.support_tickets (assigned_to);

create table if not exists public.support_thread_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  attachment_url text,
  attachment_name text,
  attachment_mime_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_thread_messages_ticket_id on public.support_thread_messages (ticket_id);

alter table public.profiles
  add column if not exists country_code char(2),
  add column if not exists locale text,
  add column if not exists timezone text;

alter table public.profiles
  add constraint profiles_identity_check check (id = auth_id);

alter table public.landlords
  add constraint landlords_identity_check check (id = profile_id),
  add constraint landlords_bio_length_check check (bio is null or char_length(bio) <= 2000),
  add constraint landlords_property_count_check check (coalesce(property_count, 0) >= 0),
  add constraint landlords_total_revenue_check check (coalesce(total_revenue, 0) >= 0),
  add constraint landlords_rating_check check (rating is null or (rating >= 0 and rating <= 5));

alter table public.tenants
  add constraint tenants_identity_check check (id = profile_id),
  add constraint tenants_income_check check (monthly_income is null or monthly_income >= 0),
  add constraint tenants_history_check check (coalesce(rental_history_count, 0) >= 0),
  add constraint tenants_credit_score_check check (credit_score is null or (credit_score >= 0 and credit_score <= 1000)),
  add constraint tenants_rating_check check (rating is null or (rating >= 0 and rating <= 5));

alter table public.properties
  add column if not exists country_code char(2),
  add column if not exists currency_code char(3) not null default 'USD',
  add column if not exists state_region text,
  add column if not exists address_line_2 text,
  add column if not exists workflow_stage text not null default 'draft',
  add constraint properties_rent_check check (monthly_rent > 0),
  add constraint properties_bedrooms_check check (bedrooms >= 0),
  add constraint properties_bathrooms_check check (bathrooms >= 0),
  add constraint properties_area_check check (area_m2 is null or area_m2 > 0),
  add constraint properties_parking_check check (parking_spots >= 0),
  add constraint properties_max_occupants_check check (max_occupants is null or max_occupants > 0),
  add constraint properties_currency_check check (char_length(currency_code) = 3),
  add constraint properties_status_check check (status in ('draft', 'pending', 'approved', 'rejected', 'published', 'rented', 'archived'));

alter table public.applications
  add column if not exists workflow_stage text not null default 'prequalification',
  add column if not exists prequalification_result_id uuid,
  add column if not exists submitted_at timestamptz,
  add column if not exists prequalified_at timestamptz,
  add column if not exists documents_completed_at timestamptz,
  add column if not exists verification_completed_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists contract_signed_at timestamptz,
  add column if not exists delivery_completed_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists scoring_context jsonb not null default '{}'::jsonb,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add constraint applications_workflow_stage_check check (
    workflow_stage in (
      'prequalification',
      'document_collection',
      'verification',
      'approval',
      'contracting',
      'signature',
      'payment',
      'delivery',
      'active',
      'closed'
    )
  ),
  add constraint applications_status_check check (
    status in ('draft', 'pending', 'prequalified', 'documents_pending', 'under_review', 'approved', 'rejected', 'withdrawn', 'contracting', 'active', 'completed', 'cancelled')
  ),
  add constraint applications_lease_months_check check (lease_months is null or lease_months > 0),
  add constraint applications_occupants_check check (occupants is null or occupants > 0);

alter table public.prequalification_results
  add column if not exists application_id uuid,
  add column if not exists property_id uuid,
  add column if not exists employment_category text,
  add column if not exists monthly_rent numeric,
  add column if not exists income_to_rent_ratio numeric,
  add column if not exists requires_backup boolean not null default false,
  add column if not exists requires_insurance boolean not null default false,
  add column if not exists classification approval_classification_enum,
  add column if not exists scoring_inputs jsonb not null default '{}'::jsonb,
  add column if not exists decision_context jsonb not null default '{}'::jsonb,
  add column if not exists document_plan jsonb not null default '[]'::jsonb,
  add constraint prequalification_results_score_check check (score is null or (score >= 0 and score <= 100)),
  add constraint prequalification_results_income_check check (monthly_income is null or monthly_income >= 0),
  add constraint prequalification_results_monthly_rent_check check (monthly_rent is null or monthly_rent >= 0),
  add constraint prequalification_results_ratio_check check (income_to_rent_ratio is null or income_to_rent_ratio >= 0);

alter table public.document_requirements
  add column if not exists template_id uuid,
  add column if not exists document_label text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.document_uploads
  add column if not exists uploaded_by uuid references public.profiles (id) on delete set null,
  add column if not exists storage_path text,
  add column if not exists mime_type text,
  add column if not exists file_size_bytes bigint,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.verifications
  add column if not exists verification_scope text,
  add column if not exists verification_method text,
  add column if not exists score integer,
  add column if not exists score_breakdown jsonb not null default '{}'::jsonb,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.approval_decisions
  add column if not exists score integer,
  add column if not exists score_breakdown jsonb not null default '{}'::jsonb,
  add column if not exists reason_codes jsonb not null default '[]'::jsonb,
  add column if not exists decision_engine_version text,
  add column if not exists decision_metadata jsonb not null default '{}'::jsonb;

alter table public.contracts
  add column if not exists currency_code char(3) not null default 'USD',
  add column if not exists jurisdiction_country_code char(2),
  add column if not exists template_key text,
  add column if not exists signed_at timestamptz,
  add column if not exists activated_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add constraint contracts_currency_check check (char_length(currency_code) = 3),
  add constraint contracts_date_check check (lease_end_date > lease_start_date),
  add constraint contracts_rent_check check (rent_amount > 0),
  add constraint contracts_security_deposit_check check (security_deposit is null or security_deposit >= 0),
  add constraint contracts_maintenance_fee_check check (maintenance_fee is null or maintenance_fee >= 0),
  add constraint contracts_duration_check check (duration_months is null or duration_months > 0);

alter table public.contract_parties
  add column if not exists party_email text,
  add column if not exists is_primary boolean not null default false,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add constraint contract_parties_party_type_check check (party_type in ('tenant', 'landlord', 'guarantor'));

alter table public.signatures
  add column if not exists signature_method text,
  add column if not exists signature_metadata jsonb not null default '{}'::jsonb;

alter table public.payments
  add column if not exists currency_code char(3) not null default 'USD',
  add column if not exists provider text,
  add column if not exists provider_reference text,
  add column if not exists payment_purpose text,
  add column if not exists captured_at timestamptz,
  add column if not exists released_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add constraint payments_currency_check check (char_length(currency_code) = 3),
  add constraint payments_amount_check check (amount > 0),
  add constraint payments_purpose_check check (
    payment_type in ('first_payment', 'deposit', 'monthly_rent', 'late_fee', 'refund', 'other')
  );

alter table public.payout_releases
  add column if not exists currency_code char(3) not null default 'USD',
  add column if not exists provider text,
  add column if not exists provider_reference text,
  add column if not exists release_method text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add constraint payout_releases_currency_check check (char_length(currency_code) = 3),
  add constraint payout_releases_total_amount_check check (total_amount >= 0);

alter table public.delivery_checklists
  add column if not exists phase text,
  add column if not exists summary text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add constraint delivery_checklists_phase_check check (phase is null or phase in ('move_in', 'move_out', 'handoff')),
  add constraint delivery_checklists_type_check check (char_length(trim(checklist_type)) > 0);

alter table public.inventory_items
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add constraint inventory_items_quantity_check check (quantity is null or quantity > 0);

alter table public.notifications
  add column if not exists category text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add constraint notifications_title_check check (char_length(trim(title)) > 0),
  add constraint notifications_message_check check (char_length(trim(message)) > 0);

alter table public.audit_logs
  add column if not exists actor_role text;

create unique index if not exists idx_prequalification_results_application_id
  on public.prequalification_results (application_id);

create index if not exists idx_prequalification_results_property_id
  on public.prequalification_results (property_id);

create index if not exists idx_prequalification_results_classification
  on public.prequalification_results (classification);

create unique index if not exists idx_document_requirements_application_document
  on public.document_requirements (application_id, document_type);

create index if not exists idx_document_requirements_template_id
  on public.document_requirements (template_id);

create index if not exists idx_document_uploads_uploaded_by
  on public.document_uploads (uploaded_by);

create index if not exists idx_verifications_score
  on public.verifications (score);

create index if not exists idx_approval_decisions_score
  on public.approval_decisions (score);

create index if not exists idx_contracts_currency_code
  on public.contracts (currency_code);

create index if not exists idx_payments_currency_code
  on public.payments (currency_code);

create index if not exists idx_payout_releases_currency_code
  on public.payout_releases (currency_code);

create index if not exists idx_support_thread_messages_sender_id
  on public.support_thread_messages (sender_id);

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path to public
as $function$
  select id
  from public.profiles
  where auth_id = auth.uid()
  limit 1;
$function$;

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path to public
as $function$
  select t.id
  from public.tenants t
  join public.profiles p on p.id = t.profile_id
  where p.auth_id = auth.uid()
  limit 1;
$function$;

create or replace function public.current_landlord_id()
returns uuid
language sql
stable
security definer
set search_path to public
as $function$
  select l.id
  from public.landlords l
  join public.profiles p on p.id = l.profile_id
  where p.auth_id = auth.uid()
  limit 1;
$function$;

create or replace function public.is_platform_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path to public
as $function$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.auth_user_id = coalesce(user_id, auth.uid())
  );
$function$;

create or replace function public.get_user_role(user_id uuid)
returns user_role_enum
language sql
stable
security definer
set search_path to public
as $function$
  select case
    when exists (
      select 1
      from public.platform_admins pa
      where pa.auth_user_id = user_id
    ) then 'admin'::user_role_enum
    else coalesce(
      (
        select p.role
        from public.profiles p
        where p.auth_id = user_id
        limit 1
      ),
      'tenant'::user_role_enum
    )
  end;
$function$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to public
as $function$
declare
  v_role user_role_enum;
begin
  v_role :=
    case lower(coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'tenant'))
      when 'landlord' then 'landlord'::user_role_enum
      else 'tenant'::user_role_enum
    end;

  insert into public.profiles (
    id,
    auth_id,
    email,
    first_name,
    last_name,
    phone,
    role
  ) values (
    new.id,
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1))), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), ''),
    v_role
  )
  on conflict (auth_id) do update
    set email = excluded.email,
        first_name = coalesce(excluded.first_name, public.profiles.first_name),
        last_name = coalesce(excluded.last_name, public.profiles.last_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        updated_at = now();

  return new;
end;
$function$;

create or replace function public.create_landlord_on_profile_creation()
returns trigger
language plpgsql
security definer
set search_path to public
as $function$
begin
  if new.role = 'landlord' then
    insert into public.landlords (id, profile_id)
    values (new.id, new.id)
    on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$function$;

create or replace function public.create_tenant_on_profile_creation()
returns trigger
language plpgsql
security definer
set search_path to public
as $function$
begin
  if new.role = 'tenant' then
    insert into public.tenants (id, profile_id)
    values (new.id, new.id)
    on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$function$;

create or replace function public.infer_applicant_category(p_occupation text)
returns text
language sql
stable
set search_path to public
as $function$
  select case
    when p_occupation is null or btrim(p_occupation) = '' then 'employed'
    when lower(p_occupation) like any (array['%independent%', '%freelance%', '%self-employed%', '%autonom%']) then 'independent'
    when lower(p_occupation) like any (array['%student%', '%retired%', '%unemploy%']) then 'backup'
    else 'employed'
  end;
$function$;

create or replace function public.calculate_prequalification(
  p_tenant_id uuid,
  p_occupation text,
  p_monthly_income numeric,
  p_has_guarantor boolean
)
returns table(result approval_status_enum, classification approval_classification_enum, score integer)
language plpgsql
stable
set search_path to public
as $function$
declare
  v_score integer := 0;
  v_classification public.approval_classification_enum;
  v_result public.approval_status_enum;
begin
  if p_monthly_income is null or p_monthly_income <= 0 then
    return query select 'rejected'::approval_status_enum, 'low'::approval_classification_enum, 0;
    return;
  end if;

  if p_monthly_income >= 6000 then
    v_score := v_score + 40;
  elsif p_monthly_income >= 4000 then
    v_score := v_score + 30;
  elsif p_monthly_income >= 2500 then
    v_score := v_score + 20;
  else
    v_score := v_score + 10;
  end if;

  if lower(coalesce(p_occupation, '')) like any (array['%employee%', '%salary%', '%manager%', '%engineer%', '%doctor%', '%lawyer%', '%teacher%']) then
    v_score := v_score + 25;
  elsif lower(coalesce(p_occupation, '')) like any (array['%independent%', '%freelance%', '%self-employed%', '%autonom%']) then
    v_score := v_score + 18;
  else
    v_score := v_score + 10;
  end if;

  if p_has_guarantor then
    v_score := v_score + 20;
  end if;

  if v_score >= 70 then
    v_classification := 'high';
    v_result := 'approved';
  elsif v_score >= 50 then
    v_classification := 'medium';
    v_result := 'needs_backup';
  else
    v_classification := 'low';
    v_result := 'rejected';
  end if;

  return query select v_result, v_classification, v_score;
end;
$function$;

create or replace function public.evaluate_prequalification(
  p_monthly_income numeric,
  p_monthly_rent numeric,
  p_occupation text,
  p_has_guarantor boolean,
  p_has_insurance boolean default false
)
returns table(
  score integer,
  classification approval_classification_enum,
  result approval_status_enum,
  requires_backup boolean,
  requires_insurance boolean,
  reasoning text
)
language plpgsql
stable
set search_path to public
as $function$
declare
  v_ratio numeric;
  v_score integer := 0;
  v_classification approval_classification_enum;
  v_result approval_status_enum;
  v_requires_backup boolean := false;
  v_requires_insurance boolean := false;
  v_reason text := '';
  v_category text := infer_applicant_category(p_occupation);
begin
  if p_monthly_income is null or p_monthly_income <= 0 then
    return query select 0, 'low'::approval_classification_enum, 'rejected'::approval_status_enum, false, false, 'Income is missing or invalid';
    return;
  end if;

  if p_monthly_rent is not null and p_monthly_rent > 0 then
    v_ratio := p_monthly_income / p_monthly_rent;
    v_score := case
      when v_ratio >= 4 then 60
      when v_ratio >= 3 then 50
      when v_ratio >= 2 then 35
      when v_ratio >= 1.5 then 20
      else 10
    end;
  else
    v_ratio := null;
    v_score := 25;
  end if;

  v_score := v_score + case
    when v_category = 'employed' then 20
    when v_category = 'independent' then 15
    else 10
  end;

  if p_has_guarantor then
    v_score := v_score + 10;
  end if;

  if p_has_insurance then
    v_score := v_score + 8;
  end if;

  if v_ratio is not null and v_ratio >= 3 then
    v_classification := 'high';
    v_result := 'approved';
    v_reason := 'Strong income-to-rent ratio and stable applicant profile';
  elsif v_ratio is not null and v_ratio >= 2 then
    v_classification := 'medium';
    v_result := 'needs_backup';
    v_requires_backup := true;
    v_reason := 'Applicant is viable with backup support';
  elsif v_ratio is not null and v_ratio >= 1.5 then
    v_classification := 'low';
    v_result := case when p_has_insurance then 'needs_backup'::approval_status_enum else 'rejected'::approval_status_enum end;
    v_requires_backup := true;
    v_requires_insurance := not p_has_insurance;
    v_reason := 'Applicant is borderline and needs insurance or stronger backup';
  else
    v_classification := 'low';
    v_result := 'rejected';
    v_requires_insurance := true;
    v_reason := 'Applicant income is below the required threshold';
  end if;

  if p_has_guarantor and v_result = 'approved' then
    v_reason := v_reason || '; guarantor present but not required';
  elsif p_has_guarantor and v_result = 'needs_backup' then
    v_reason := v_reason || '; guarantor can serve as backup';
  end if;

  return query select v_score, v_classification, v_result, v_requires_backup, v_requires_insurance, v_reason;
end;
$function$;

create or replace function public.generate_document_requirements(
  p_application_id uuid,
  p_requires_backup boolean default false
)
returns void
language plpgsql
security definer
set search_path to public
as $function$
declare
  v_tenant_id uuid;
  v_occupation text;
  v_category text;
begin
  select a.tenant_id, t.occupation
    into v_tenant_id, v_occupation
  from public.applications a
  join public.tenants t on t.id = a.tenant_id
  where a.id = p_application_id;

  if v_tenant_id is null then
    raise exception 'Application % not found', p_application_id;
  end if;

  v_category := infer_applicant_category(v_occupation);

  insert into public.document_requirements (
    application_id,
    template_id,
    document_type,
    document_label,
    status,
    is_required,
    metadata
  )
  select
    p_application_id,
    d.id,
    d.document_type,
    d.title,
    'pending'::document_status_enum,
    d.is_required,
    jsonb_build_object('profile_type', d.profile_type, 'category', v_category)
  from public.document_requirement_templates d
  where d.profile_type in ('all', v_category)
     or (p_requires_backup and d.profile_type = 'backup')
  on conflict (application_id, document_type) do nothing;
end;
$function$;

create or replace function public.store_prequalification_result(
  p_tenant_id uuid,
  p_property_id uuid,
  p_application_id uuid,
  p_occupation text,
  p_monthly_income numeric,
  p_has_guarantor boolean,
  p_monthly_rent numeric default null,
  p_has_insurance boolean default false
)
returns public.prequalification_results
language plpgsql
security definer
set search_path to public
as $function$
declare
  v_eval record;
  v_row public.prequalification_results;
begin
  select * into v_eval
  from public.evaluate_prequalification(
    p_monthly_income,
    p_monthly_rent,
    p_occupation,
    p_has_guarantor,
    p_has_insurance
  );

  insert into public.prequalification_results (
    tenant_id,
    application_id,
    property_id,
    occupation,
    employment_category,
    monthly_income,
    monthly_rent,
    has_guarantor,
    result,
    classification,
    score,
    reasoning,
    generated_at,
    valid_until,
    requires_backup,
    requires_insurance,
    income_to_rent_ratio,
    scoring_inputs,
    decision_context,
    document_plan
  ) values (
    p_tenant_id,
    p_application_id,
    p_property_id,
    p_occupation,
    infer_applicant_category(p_occupation),
    p_monthly_income,
    p_monthly_rent,
    p_has_guarantor,
    v_eval.result,
    v_eval.classification,
    v_eval.score,
    v_eval.reasoning,
    now(),
    now() + interval '30 days',
    v_eval.requires_backup,
    v_eval.requires_insurance,
    case when p_monthly_rent is not null and p_monthly_rent > 0 then p_monthly_income / p_monthly_rent else null end,
    jsonb_build_object(
      'occupation', p_occupation,
      'monthly_income', p_monthly_income,
      'monthly_rent', p_monthly_rent,
      'has_guarantor', p_has_guarantor,
      'has_insurance', p_has_insurance
    ),
    jsonb_build_object(
      'classification', v_eval.classification,
      'result', v_eval.result,
      'reasoning', v_eval.reasoning
    ),
    jsonb_build_array(
      jsonb_build_object('rule', 'income_to_rent', 'ratio', case when p_monthly_rent is not null and p_monthly_rent > 0 then p_monthly_income / p_monthly_rent else null end)
    )
  )
  returning * into v_row;

  perform public.generate_document_requirements(p_application_id, v_eval.requires_backup);

  return v_row;
end;
$function$;

create or replace function public.log_audit_event(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_values jsonb,
  p_new_values jsonb,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path to public
as $function$
declare
  v_audit_id uuid;
begin
  insert into public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    status,
    actor_role
  ) values (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_ip_address,
    p_user_agent,
    'success',
    case when p_user_id is null then null else public.get_user_role(p_user_id)::text end
  )
  returning id into v_audit_id;

  return v_audit_id;
end;
$function$;

create or replace function public.send_notification(
  p_recipient_id uuid,
  p_title text,
  p_message text,
  p_notification_type notification_type_enum default 'info'::notification_type_enum,
  p_related_entity_type text default null,
  p_related_entity_id uuid default null,
  p_action_url text default null,
  p_sender_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path to public
as $function$
declare
  v_notification_id uuid;
begin
  insert into public.notifications (
    recipient_id,
    sender_id,
    title,
    message,
    notification_type,
    related_entity_type,
    related_entity_id,
    action_url
  ) values (
    p_recipient_id,
    p_sender_id,
    p_title,
    p_message,
    p_notification_type,
    p_related_entity_type,
    p_related_entity_id,
    p_action_url
  )
  returning id into v_notification_id;

  return v_notification_id;
end;
$function$;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path to public
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path to public
as $function$
declare
  v_entity_id uuid;
  v_old jsonb;
  v_new jsonb;
begin
  if tg_op = 'DELETE' then
    v_entity_id := old.id;
    v_old := to_jsonb(old);
  elsif tg_op = 'UPDATE' then
    v_entity_id := new.id;
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
  else
    v_entity_id := new.id;
    v_new := to_jsonb(new);
  end if;

  perform public.log_audit_event(
    auth.uid(),
    tg_op,
    tg_table_name,
    v_entity_id,
    v_old,
    v_new,
    inet_client_addr(),
    current_setting('request.headers', true)
  );

  return coalesce(new, old);
end;
$function$;

drop policy if exists system_insert_audit_logs on public.audit_logs;
drop policy if exists system_insert_doc_requirements on public.document_requirements;
drop policy if exists system_insert_notifications on public.notifications;
drop policy if exists system_insert_prequalification on public.prequalification_results;

create policy platform_admins_admin_all
  on public.platform_admins
  for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy platform_admins_select_own
  on public.platform_admins
  for select
  using (auth_user_id = auth.uid());

create policy property_features_public_read
  on public.property_features
  for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.status = 'published'
    )
    or public.is_platform_admin(auth.uid())
    or property_id in (
      select p.id
      from public.properties p
      where p.landlord_id = public.current_landlord_id()
    )
  );

create policy property_features_owner_manage
  on public.property_features
  for all
  using (
    public.is_platform_admin(auth.uid())
    or property_id in (
      select p.id
      from public.properties p
      where p.landlord_id = public.current_landlord_id()
    )
  )
  with check (
    public.is_platform_admin(auth.uid())
    or property_id in (
      select p.id
      from public.properties p
      where p.landlord_id = public.current_landlord_id()
    )
  );

create policy document_requirement_templates_admin_all
  on public.document_requirement_templates
  for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy support_tickets_owner_select
  on public.support_tickets
  for select
  using (
    profile_id = public.current_profile_id()
    or assigned_to = public.current_profile_id()
    or public.is_platform_admin(auth.uid())
  );

create policy support_tickets_owner_insert
  on public.support_tickets
  for insert
  with check (
    profile_id = public.current_profile_id()
    or public.is_platform_admin(auth.uid())
  );

create policy support_tickets_owner_update
  on public.support_tickets
  for update
  using (
    profile_id = public.current_profile_id()
    or assigned_to = public.current_profile_id()
    or public.is_platform_admin(auth.uid())
  )
  with check (
    profile_id = public.current_profile_id()
    or assigned_to = public.current_profile_id()
    or public.is_platform_admin(auth.uid())
  );

create policy support_messages_access
  on public.support_thread_messages
  for select
  using (
    public.is_platform_admin(auth.uid())
    or ticket_id in (
      select t.id
      from public.support_tickets t
      where t.profile_id = public.current_profile_id()
         or t.assigned_to = public.current_profile_id()
    )
  );

create policy support_messages_insert
  on public.support_thread_messages
  for insert
  with check (
    sender_id = public.current_profile_id()
    and (
      public.is_platform_admin(auth.uid())
      or ticket_id in (
        select t.id
        from public.support_tickets t
        where t.profile_id = public.current_profile_id()
           or t.assigned_to = public.current_profile_id()
      )
    )
  );

create policy prequalification_results_tenant_select
  on public.prequalification_results
  for select
  using (
    tenant_id = public.current_tenant_id()
    or public.is_platform_admin(auth.uid())
  );

create policy prequalification_results_tenant_insert
  on public.prequalification_results
  for insert
  with check (
    tenant_id = public.current_tenant_id()
    or public.is_platform_admin(auth.uid())
  );

create policy audit_logs_admin_select
  on public.audit_logs
  for select
  using (public.is_platform_admin(auth.uid()));

create policy document_requirements_tenant_select
  on public.document_requirements
  for select
  using (
    application_id in (
      select a.id
      from public.applications a
      where a.tenant_id = public.current_tenant_id()
    )
    or public.is_platform_admin(auth.uid())
  );

create policy document_requirements_landlord_select
  on public.document_requirements
  for select
  using (
    application_id in (
      select a.id
      from public.applications a
      where a.landlord_id = public.current_landlord_id()
    )
    or public.is_platform_admin(auth.uid())
  );

create policy notifications_recipient_select
  on public.notifications
  for select
  using (
    recipient_id = public.current_profile_id()
    or public.is_platform_admin(auth.uid())
  );

create policy notifications_recipient_update
  on public.notifications
  for update
  using (
    recipient_id = public.current_profile_id()
    or public.is_platform_admin(auth.uid())
  )
  with check (
    recipient_id = public.current_profile_id()
    or public.is_platform_admin(auth.uid())
  );

create policy applications_admin_all
  on public.applications
  for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy applications_tenant_manage
  on public.applications
  for all
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());

create policy applications_landlord_read
  on public.applications
  for select
  using (landlord_id = public.current_landlord_id());

create policy applications_landlord_update
  on public.applications
  for update
  using (landlord_id = public.current_landlord_id())
  with check (landlord_id = public.current_landlord_id());

create policy profiles_admin_all
  on public.profiles
  for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy profiles_own_select
  on public.profiles
  for select
  using (auth_id = auth.uid());

create policy profiles_own_insert
  on public.profiles
  for insert
  with check (auth_id = auth.uid());

create policy profiles_own_update
  on public.profiles
  for update
  using (auth_id = auth.uid())
  with check (auth_id = auth.uid());

create policy landlords_admin_all
  on public.landlords
  for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy landlords_own_select
  on public.landlords
  for select
  using (profile_id = public.current_profile_id());

create policy landlords_own_update
  on public.landlords
  for update
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

create policy tenants_admin_all
  on public.tenants
  for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy tenants_own_select
  on public.tenants
  for select
  using (profile_id = public.current_profile_id());

create policy tenants_own_update
  on public.tenants
  for update
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

create policy properties_public_read
  on public.properties
  for select
  using (status = 'published' or public.is_platform_admin(auth.uid()) or landlord_id = public.current_landlord_id());

create policy properties_landlord_manage
  on public.properties
  for all
  using (landlord_id = public.current_landlord_id() or public.is_platform_admin(auth.uid()))
  with check (landlord_id = public.current_landlord_id() or public.is_platform_admin(auth.uid()));

create policy property_images_public_read
  on public.property_images
  for select
  using (
    property_id in (
      select p.id
      from public.properties p
      where p.status = 'published'
    )
    or public.is_platform_admin(auth.uid())
    or property_id in (
      select p.id
      from public.properties p
      where p.landlord_id = public.current_landlord_id()
    )
  );

create policy property_images_landlord_manage
  on public.property_images
  for all
  using (
    public.is_platform_admin(auth.uid())
    or property_id in (
      select p.id
      from public.properties p
      where p.landlord_id = public.current_landlord_id()
    )
  )
  with check (
    public.is_platform_admin(auth.uid())
    or property_id in (
      select p.id
      from public.properties p
      where p.landlord_id = public.current_landlord_id()
    )
  );

create policy favorites_tenant_all
  on public.favorites
  for all
  using (tenant_id = public.current_tenant_id() or public.is_platform_admin(auth.uid()))
  with check (tenant_id = public.current_tenant_id() or public.is_platform_admin(auth.uid()));

create policy payments_tenant_select
  on public.payments
  for select
  using (
    tenant_id = public.current_tenant_id()
    or landlord_id = public.current_landlord_id()
    or public.is_platform_admin(auth.uid())
  );

create policy payments_admin_insert_update
  on public.payments
  for insert
  with check (public.is_platform_admin(auth.uid()));

create policy payments_admin_manage
  on public.payments
  for update
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy payouts_landlord_select
  on public.payout_releases
  for select
  using (landlord_id = public.current_landlord_id() or public.is_platform_admin(auth.uid()));

create policy payouts_admin_manage
  on public.payout_releases
  for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy contracts_party_select
  on public.contracts
  for select
  using (
    tenant_id = public.current_tenant_id()
    or landlord_id = public.current_landlord_id()
    or public.is_platform_admin(auth.uid())
  );

create policy contracts_admin_manage
  on public.contracts
  for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy contract_parties_select
  on public.contract_parties
  for select
  using (
    profile_id = public.current_profile_id()
    or contract_id in (
      select c.id
      from public.contracts c
      where c.tenant_id = public.current_tenant_id()
         or c.landlord_id = public.current_landlord_id()
    )
    or public.is_platform_admin(auth.uid())
  );

create policy signatures_select
  on public.signatures
  for select
  using (
    signer_id = public.current_profile_id()
    or contract_id in (
      select c.id
      from public.contracts c
      where c.tenant_id = public.current_tenant_id()
         or c.landlord_id = public.current_landlord_id()
    )
    or public.is_platform_admin(auth.uid())
  );

create policy signatures_signer_manage
  on public.signatures
  for all
  using (signer_id = public.current_profile_id() or public.is_platform_admin(auth.uid()))
  with check (signer_id = public.current_profile_id() or public.is_platform_admin(auth.uid()));

create policy delivery_checklists_select
  on public.delivery_checklists
  for select
  using (
    contract_id in (
      select c.id
      from public.contracts c
      where c.tenant_id = public.current_tenant_id()
         or c.landlord_id = public.current_landlord_id()
    )
    or public.is_platform_admin(auth.uid())
  );

create policy delivery_checklists_manage
  on public.delivery_checklists
  for all
  using (
    public.is_platform_admin(auth.uid())
    or contract_id in (
      select c.id
      from public.contracts c
      where c.tenant_id = public.current_tenant_id()
         or c.landlord_id = public.current_landlord_id()
    )
  )
  with check (
    public.is_platform_admin(auth.uid())
    or contract_id in (
      select c.id
      from public.contracts c
      where c.tenant_id = public.current_tenant_id()
         or c.landlord_id = public.current_landlord_id()
    )
  );

create policy inventory_items_select
  on public.inventory_items
  for select
  using (
    checklist_id in (
      select d.id
      from public.delivery_checklists d
      where d.contract_id in (
        select c.id
        from public.contracts c
        where c.tenant_id = public.current_tenant_id()
           or c.landlord_id = public.current_landlord_id()
      )
    )
    or public.is_platform_admin(auth.uid())
  );

create policy document_uploads_tenant_select
  on public.document_uploads
  for select
  using (
    application_id in (
      select a.id
      from public.applications a
      where a.tenant_id = public.current_tenant_id()
    )
    or public.is_platform_admin(auth.uid())
  );

create policy document_uploads_tenant_insert
  on public.document_uploads
  for insert
  with check (
    application_id in (
      select a.id
      from public.applications a
      where a.tenant_id = public.current_tenant_id()
    )
    or public.is_platform_admin(auth.uid())
  );

create policy document_uploads_tenant_update
  on public.document_uploads
  for update
  using (
    application_id in (
      select a.id
      from public.applications a
      where a.tenant_id = public.current_tenant_id()
    )
    or public.is_platform_admin(auth.uid())
  )
  with check (
    application_id in (
      select a.id
      from public.applications a
      where a.tenant_id = public.current_tenant_id()
    )
    or public.is_platform_admin(auth.uid())
  );

create policy verifications_admin_manage
  on public.verifications
  for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create policy verifications_tenant_select
  on public.verifications
  for select
  using (
    tenant_id = public.current_tenant_id()
    or public.is_platform_admin(auth.uid())
  );

create policy approval_decisions_select
  on public.approval_decisions
  for select
  using (
    tenant_id = public.current_tenant_id()
    or landlord_id = public.current_landlord_id()
    or public.is_platform_admin(auth.uid())
  );

create policy approval_decisions_admin_manage
  on public.approval_decisions
  for all
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

create trigger set_platform_admins_updated_at
before update on public.platform_admins
for each row execute function public.update_updated_at();

create trigger set_property_features_updated_at
before update on public.property_features
for each row execute function public.update_updated_at();

create trigger set_document_requirement_templates_updated_at
before update on public.document_requirement_templates
for each row execute function public.update_updated_at();

create trigger set_support_tickets_updated_at
before update on public.support_tickets
for each row execute function public.update_updated_at();

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at();

create trigger set_landlords_updated_at
before update on public.landlords
for each row execute function public.update_updated_at();

create trigger set_tenants_updated_at
before update on public.tenants
for each row execute function public.update_updated_at();

create trigger set_properties_updated_at
before update on public.properties
for each row execute function public.update_updated_at();

create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.update_updated_at();

create trigger set_prequalification_results_updated_at
before update on public.prequalification_results
for each row execute function public.update_updated_at();

create trigger set_document_requirements_updated_at
before update on public.document_requirements
for each row execute function public.update_updated_at();

create trigger set_document_uploads_updated_at
before update on public.document_uploads
for each row execute function public.update_updated_at();

create trigger set_verifications_updated_at
before update on public.verifications
for each row execute function public.update_updated_at();

create trigger set_approval_decisions_updated_at
before update on public.approval_decisions
for each row execute function public.update_updated_at();

create trigger set_contracts_updated_at
before update on public.contracts
for each row execute function public.update_updated_at();

create trigger set_contract_parties_updated_at
before update on public.contract_parties
for each row execute function public.update_updated_at();

create trigger set_signatures_updated_at
before update on public.signatures
for each row execute function public.update_updated_at();

create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.update_updated_at();

create trigger set_payout_releases_updated_at
before update on public.payout_releases
for each row execute function public.update_updated_at();

create trigger set_delivery_checklists_updated_at
before update on public.delivery_checklists
for each row execute function public.update_updated_at();

create trigger set_notifications_updated_at
before update on public.notifications
for each row execute function public.update_updated_at();

create trigger set_inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.update_updated_at();

create trigger set_support_thread_messages_updated_at
before update on public.support_thread_messages
for each row execute function public.update_updated_at();

create trigger audit_properties_changes
after insert or update or delete on public.properties
for each row execute function public.audit_row_change();

create trigger audit_property_images_changes
after insert or update or delete on public.property_images
for each row execute function public.audit_row_change();

create trigger audit_platform_admins_changes
after insert or update or delete on public.platform_admins
for each row execute function public.audit_row_change();

create trigger audit_applications_changes
after insert or update or delete on public.applications
for each row execute function public.audit_row_change();

create trigger audit_prequalification_results_changes
after insert or update or delete on public.prequalification_results
for each row execute function public.audit_row_change();

create trigger audit_document_requirements_changes
after insert or update or delete on public.document_requirements
for each row execute function public.audit_row_change();

create trigger audit_document_uploads_changes
after insert or update or delete on public.document_uploads
for each row execute function public.audit_row_change();

create trigger audit_verifications_changes
after insert or update or delete on public.verifications
for each row execute function public.audit_row_change();

create trigger audit_approval_decisions_changes
after insert or update or delete on public.approval_decisions
for each row execute function public.audit_row_change();

create trigger audit_contracts_changes
after insert or update or delete on public.contracts
for each row execute function public.audit_row_change();

create trigger audit_contract_parties_changes
after insert or update or delete on public.contract_parties
for each row execute function public.audit_row_change();

create trigger audit_signatures_changes
after insert or update or delete on public.signatures
for each row execute function public.audit_row_change();

create trigger audit_payments_changes
after insert or update or delete on public.payments
for each row execute function public.audit_row_change();

create trigger audit_payout_releases_changes
after insert or update or delete on public.payout_releases
for each row execute function public.audit_row_change();

create trigger audit_delivery_checklists_changes
after insert or update or delete on public.delivery_checklists
for each row execute function public.audit_row_change();

create trigger audit_inventory_items_changes
after insert or update or delete on public.inventory_items
for each row execute function public.audit_row_change();

create trigger audit_notifications_changes
after insert or update or delete on public.notifications
for each row execute function public.audit_row_change();

create trigger audit_support_tickets_changes
after insert or update or delete on public.support_tickets
for each row execute function public.audit_row_change();

create trigger audit_support_thread_messages_changes
after insert or update or delete on public.support_thread_messages
for each row execute function public.audit_row_change();

insert into public.document_requirement_templates (profile_type, document_type, title, description, is_required, sort_order, metadata)
values
  ('employed', 'id_document', 'Government ID', 'Identity document for employed applicants', true, 10, '{"examples":["passport","national_id","residence_permit"]}'::jsonb),
  ('employed', 'employment_letter', 'Employment letter', 'Recent employment verification letter', true, 20, '{}'::jsonb),
  ('employed', 'pay_slip_1', 'Pay slip 1', 'Most recent pay slip', true, 30, '{}'::jsonb),
  ('employed', 'pay_slip_2', 'Pay slip 2', 'Second most recent pay slip', true, 40, '{}'::jsonb),
  ('employed', 'pay_slip_3', 'Pay slip 3', 'Third most recent pay slip', true, 50, '{}'::jsonb),
  ('independent', 'id_document', 'Government ID', 'Identity document for independent applicants', true, 10, '{"examples":["passport","national_id","residence_permit"]}'::jsonb),
  ('independent', 'bank_statements', 'Bank statements', 'Recent bank statements showing cash flow', true, 20, '{}'::jsonb),
  ('independent', 'income_proof', 'Income proof', 'Contracts, invoices or tax evidence', true, 30, '{}'::jsonb),
  ('backup', 'guarantor_id', 'Guarantor ID', 'Identity document for guarantor or backup party', true, 10, '{}'::jsonb),
  ('backup', 'guarantor_income_proof', 'Guarantor income proof', 'Evidence of guarantor capacity', true, 20, '{}'::jsonb),
  ('backup', 'insurance_policy', 'Insurance policy', 'Rental insurance proof if guarantor is not present', true, 30, '{}'::jsonb),
  ('all', 'consent_form', 'Consent form', 'Consent to data processing and validation', true, 5, '{}'::jsonb)
on conflict (profile_type, document_type) do update
set title = excluded.title,
    description = excluded.description,
    is_required = excluded.is_required,
    sort_order = excluded.sort_order,
    metadata = excluded.metadata,
    updated_at = now();

commit;
