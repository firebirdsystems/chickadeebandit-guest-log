-- Automation support for the `log_visit` action.
--
-- `source_event_id` records which app event produced the row. The dispatcher's
-- dedupe guard matches on it (SELECT 1 FROM ... WHERE source_event_id = ?
-- LIMIT 1), so a redelivered event reuses the visit already open instead of
-- signing the same guest in twice.
--
-- Nullable on purpose: visits signed in by a person at the desk have no source
-- event, and the guard only ever looks for a specific non-null id.
ALTER TABLE app_guest_log__visits ADD COLUMN source_event_id TEXT;

CREATE INDEX IF NOT EXISTS app_guest_log__visits_source_event_idx
  ON app_guest_log__visits (source_event_id);
