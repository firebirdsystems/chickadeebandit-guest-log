-- One row per logged guest visit. Owner-scoped to the host member who logged it
-- (owner_only, host_id) so a member sees only their own entries; the configured
-- leadership group sees and manages the full log (privileged_groups). guest_name
-- and purpose are encrypted at rest; visit_type is plaintext so it can be filtered.
CREATE TABLE IF NOT EXISTS app_guest_log__visits (
  id                TEXT NOT NULL,
  guest_name        TEXT NOT NULL DEFAULT '',
  visit_type        TEXT NOT NULL DEFAULT 'visitor',   -- visitor | delivery | overnight
  purpose           TEXT NOT NULL DEFAULT '',
  host_id           TEXT NOT NULL,
  host_name         TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'checked_in', -- checked_in | checked_out
  check_in_at       TEXT NOT NULL,
  check_out_at      TEXT,
  expected_out_at   TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS app_guest_log__visits_host_idx
  ON app_guest_log__visits (host_id, check_in_at);
CREATE INDEX IF NOT EXISTS app_guest_log__visits_status_idx
  ON app_guest_log__visits (status);

-- Overnight-stay approvals. Immutable decision log written ONLY by the hub
-- append-record endpoint, and only by the configured leadership group
-- (inherit_visibility from visits + insert_privileged_only + endpoint_writes_only).
-- A host cannot approve their own overnight guest. Effective approval = latest row.
CREATE TABLE IF NOT EXISTS app_guest_log__approvals (
  id          TEXT NOT NULL,
  visit_id    TEXT NOT NULL,
  decision    TEXT NOT NULL,   -- approved | denied
  note        TEXT NOT NULL DEFAULT '',
  decided_by  TEXT NOT NULL,
  decided_at  TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS app_guest_log__approvals_visit_idx
  ON app_guest_log__approvals (visit_id, decided_at);

-- key/value settings: leadership_group_id. Written only by the admin-gated
-- /api/admin-config endpoint (app_config policy).
CREATE TABLE IF NOT EXISTS app_guest_log__settings (
  key    TEXT NOT NULL,
  value  TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (key)
);
