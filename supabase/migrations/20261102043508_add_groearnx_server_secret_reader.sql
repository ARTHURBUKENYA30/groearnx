create or replace function public.groearnx_get_secret(p_name text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_secret text;
begin
  if auth.role() <> 'service_role' then raise exception 'forbidden'; end if;
  if p_name not in ('groearnx_worker_cron_secret','groearnx_encryption_key') then raise exception 'secret name not allowed'; end if;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = p_name limit 1;
  return v_secret;
end;
$$;
revoke all on function public.groearnx_get_secret(text) from public, anon, authenticated;
grant execute on function public.groearnx_get_secret(text) to service_role;
