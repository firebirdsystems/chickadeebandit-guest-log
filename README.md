# Guest Log

A digital sign-in / sign-out sheet for visitors, deliveries, and overnight guests —
for shared houses, fraternities/sororities, and orgs with a front-desk or guest policy.

## How it works

- **Sign in a guest** — any member logs a guest with a type (visitor / delivery /
  overnight), purpose, and (for overnight) an expected departure. The entry is scoped
  to the member who logged it.
- **Check out** — the host (or leadership) marks the guest as departed.
- **Overnight approval** — members of the configured **Leadership** group can approve
  or deny overnight stays. Decisions are recorded in an immutable append-only log, so a
  host can never approve their own overnight guest.
- **Who sees what** — a member sees only the guests they signed in; leadership sees the
  full house log. This is enforced server-side, not just in the UI.

## Data & security model

| Table | Policy | Who can read / write |
|-------|--------|----------------------|
| `visits` | `owner_only` (`host_id`, `adults_bypass:false`) + `privileged_groups` leadership | A member reads/writes only their own entries; leadership reads/manages all |
| `approvals` | `inherit_visibility` + `insert_privileged_only` + `endpoint_writes_only` | Read follows the visit; written only by the leadership group via the append endpoint |
| `settings` | `app_config` | Read-all; written only by the admin `/api/admin-config` endpoint |

Overnight approval is a privileged state transition, so it lives in a separate
append-only child table (the `append_only_records` mechanism) rather than as a column on
the owner-writable visit row — otherwise a host could self-approve via raw SQL. Effective
approval status is derived from the latest decision row.

## Development

```bash
npm install
npm run dev     # serve locally with demo data
npm test        # unit tests + manifest validation
node build.mjs  # produce dist/bundle.json
```
