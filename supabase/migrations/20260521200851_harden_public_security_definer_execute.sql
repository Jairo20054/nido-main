-- Harden RPC exposure for functions in the exposed public schema.
-- Supabase exposes executable public-schema functions through /rest/v1/rpc.
-- NIDO does not call these functions directly from the browser; they are used
-- internally by triggers/RLS or reserved for server-side flows.

revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;

grant execute on all functions in schema public to service_role;

alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon;
alter default privileges in schema public revoke execute on functions from authenticated;
alter default privileges in schema public grant execute on functions to service_role;
