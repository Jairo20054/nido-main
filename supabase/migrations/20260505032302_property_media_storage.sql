begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'property-media-public',
  'property-media-public',
  true,
  20971520,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

drop policy if exists "Property media insert own folder" on storage.objects;
create policy "Property media insert own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-media-public'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "Property media select own folder" on storage.objects;
create policy "Property media select own folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'property-media-public'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "Property media update own folder" on storage.objects;
create policy "Property media update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-media-public'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
)
with check (
  bucket_id = 'property-media-public'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "Property media delete own folder" on storage.objects;
create policy "Property media delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-media-public'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

commit;
