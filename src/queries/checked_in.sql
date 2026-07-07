SELECT
  id,
  guest_name,
  visit_type,
  host_id,
  host_name,
  check_in_at,
  expected_out_at
FROM app_guest_log__visits
WHERE status = 'checked_in'
ORDER BY check_in_at ASC
LIMIT 200
