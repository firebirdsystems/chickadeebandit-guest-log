import { isAdult } from "./shared.js";
export { isAdult };

export const VISIT_TYPES = [
  { value: "visitor",   label: "Visitor",   icon: "👋" },
  { value: "delivery",  label: "Delivery",  icon: "📦" },
  { value: "overnight", label: "Overnight", icon: "🛏️" },
];

export function visitTypeMeta(type) {
  return VISIT_TYPES.find((t) => t.value === type) ?? { value: type, label: type, icon: "•" };
}

// ── Leadership gate ────────────────────────────────────────────────────────────
// Mirrors the hub's `memberInAppGroupSetting`: privileged IFF a leadership group
// is configured, still exists, and the caller is in it. NO "all adults" fallback —
// `approvals` is insert_privileged_only, which the hub rejects entirely when no
// group is set. (See __tests__/helpers/privileged-gate.mjs.)
export function isLeadership(member, groups, leadershipGroupId) {
  if (!member || !leadershipGroupId) return false;
  const g = (groups ?? []).find((x) => x.id === leadershipGroupId);
  return !!g && g.memberIds.includes(member.id);
}

// ── Overnight approval state ───────────────────────────────────────────────────
// Approvals are an append-only decision log. The effective decision for a visit is
// the latest row by decided_at.
export function latestApproval(approvals, visitId) {
  return approvals
    .filter((a) => a.visit_id === visitId)
    .sort((a, b) => String(b.decided_at).localeCompare(String(a.decided_at)))[0] ?? null;
}

// Returns "pending" | "approved" | "denied" for an overnight visit; non-overnight
// visits are not gated so return "n/a".
export function approvalState(visit, approvals) {
  if (visit.visit_type !== "overnight") return "n/a";
  const latest = latestApproval(approvals, visit.id);
  if (!latest) return "pending";
  return latest.decision === "approved" ? "approved" : "denied";
}

export function isOnSite(visit) {
  return visit.status === "checked_in";
}

// A member may edit/check-out a visit if they logged it, or they are leadership.
export function canManageVisit(visit, member, groups, leadershipGroupId) {
  if (!member) return false;
  if (visit.host_id === member.id) return true;
  return isLeadership(member, groups, leadershipGroupId);
}
