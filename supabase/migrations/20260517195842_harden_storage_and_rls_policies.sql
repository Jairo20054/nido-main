begin;

-- Endurece politicas de Storage con auth.uid() como ancla unica de identidad.
-- El bucket de fotos/videos de propiedades sigue siendo publico por decision de producto,
-- pero solo el dueno de la carpeta puede insertar, reemplazar o borrar objetos.
drop policy if exists "Property media insert own folder" on storage.objects;
create policy "Property media insert own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-media-public'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Property media select own folder" on storage.objects;
create policy "Property media select own folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'property-media-public'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Property media update own folder" on storage.objects;
create policy "Property media update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-media-public'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'property-media-public'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Property media delete own folder" on storage.objects;
create policy "Property media delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-media-public'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- No permite que usuarios no administradores reasignen una solicitud a otro
-- arrendatario, arrendador o inmueble mediante llamadas directas a PostgREST.
create or replace function public.prevent_application_party_reassignment()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_platform_admin(auth.uid())
    and (
      new.tenant_id is distinct from old.tenant_id
      or new.landlord_id is distinct from old.landlord_id
      or new.property_id is distinct from old.property_id
    )
  then
    raise exception 'No puedes reasignar una solicitud existente';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_application_party_reassignment on public.applications;
create trigger prevent_application_party_reassignment
before update on public.applications
for each row
execute function public.prevent_application_party_reassignment();

-- Pueden leer solicitudes recibidas y cambiar estado desde backend, pero no reasignar partes.
drop policy if exists applications_landlord_update on public.applications;
create policy applications_landlord_update
  on public.applications
  for update
  to authenticated
  using (landlord_id = public.current_landlord_id())
  with check (landlord_id = public.current_landlord_id());

-- Reafirma los patrones minimos esperados por NIDO para tablas sensibles.
alter table if exists public.profiles enable row level security;
alter table if exists public.properties enable row level security;
alter table if exists public.applications enable row level security;
alter table if exists public.document_uploads enable row level security;
alter table if exists public.favorites enable row level security;

commit;
