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
    v_old := to_jsonb(old);
    v_entity_id := coalesce(
      (v_old ->> 'id')::uuid,
      (v_old ->> 'auth_user_id')::uuid,
      (v_old ->> 'profile_id')::uuid
    );
  elsif tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_entity_id := coalesce(
      (v_new ->> 'id')::uuid,
      (v_new ->> 'auth_user_id')::uuid,
      (v_new ->> 'profile_id')::uuid
    );
  else
    v_new := to_jsonb(new);
    v_entity_id := coalesce(
      (v_new ->> 'id')::uuid,
      (v_new ->> 'auth_user_id')::uuid,
      (v_new ->> 'profile_id')::uuid
    );
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
