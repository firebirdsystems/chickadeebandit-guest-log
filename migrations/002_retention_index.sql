CREATE INDEX IF NOT EXISTS app_guest_log__visits_retention_idx
  ON app_guest_log__visits (check_in_at, id);
