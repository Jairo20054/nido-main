begin;

do $$
begin
  if to_regclass('public."Property"') is not null then
    execute 'create index if not exists "Property_status_published_created_idx" on public."Property" (status, "publishedAt" desc, "createdAt" desc)';
  end if;

  if to_regclass('public."Favorite"') is not null then
    execute 'create index if not exists "Favorite_user_created_idx" on public."Favorite" ("userId", "createdAt" desc)';
  end if;

  if to_regclass('public."RentalRequest"') is not null then
    execute 'create index if not exists "RentalRequest_tenant_created_idx" on public."RentalRequest" ("tenantId", "createdAt" desc)';
    execute 'create index if not exists "RentalRequest_landlord_created_idx" on public."RentalRequest" ("landlordId", "createdAt" desc)';
    execute 'create unique index if not exists "RentalRequest_active_tenant_property_key" on public."RentalRequest" ("tenantId", "propertyId") where status in (''PENDING'', ''APPROVED'')';
  end if;
end $$;

commit;
