DO $$
DECLARE j record;
BEGIN
  FOR j IN SELECT jobid FROM cron.job WHERE jobname = 'groearnx-testnet-worker' OR jobid = 1 LOOP
    PERFORM cron.unschedule(j.jobid);
  END LOOP;
END $$;

SELECT cron.schedule(
  'groearnx-testnet-worker',
  '* * * * *',
  $job$
    select net.http_get(
      url := 'https://dxpprprcmgjvjpvyorbm.supabase.co/functions/v1/groearnx-trading?action=worker',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='groearnx_worker_cron_secret' limit 1),
        'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4cHBycHJjbWdqdmpwdnlvcmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMTkwODEsImV4cCI6MjEwODU5NTA4MX0.AsKLWZSHEKeM2-iA_cYl_w7lRHjKI9KP4VNYwXXtSMg'
      ),
      timeout_milliseconds := 15000
    );
  $job$
);
