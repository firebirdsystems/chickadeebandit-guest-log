SELECT
  id,
  guest_name,
  visit_type,
  purpose,
  host_id,
  host_name,
  status,
  check_in_at,
  check_out_at,
  expected_out_at
FROM app_guest_log__visits
ORDER BY check_in_at DESC
LIMIT 200
