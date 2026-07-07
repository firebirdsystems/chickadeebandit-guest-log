import { describe, it, expect } from "vitest";
import {
  visitTypeMeta, isLeadership, latestApproval, approvalState,
  isOnSite, canManageVisit,
} from "../src/logic.js";
import { testPrivilegedGateContract } from "./helpers/privileged-gate.mjs";

const GROUPS = [{ id: "g-lead", name: "Leadership", memberIds: ["m-lead"] }];

describe("visit type metadata", () => {
  it("resolves known types with an icon", () => {
    expect(visitTypeMeta("overnight").label).toBe("Overnight");
    expect(visitTypeMeta("delivery").icon).toBeTruthy();
  });
  it("falls back for unknown types", () => {
    expect(visitTypeMeta("mystery").label).toBe("mystery");
  });
});

describe("approval state", () => {
  const visitOvernight = { id: "v1", visit_type: "overnight" };
  const visitVisitor = { id: "v2", visit_type: "visitor" };
  it("non-overnight visits are not gated", () => {
    expect(approvalState(visitVisitor, [])).toBe("n/a");
  });
  it("overnight with no decision is pending", () => {
    expect(approvalState(visitOvernight, [])).toBe("pending");
  });
  it("uses the latest decision by decided_at", () => {
    const approvals = [
      { visit_id: "v1", decision: "denied",   decided_at: "2026-01-01T00:00:00Z" },
      { visit_id: "v1", decision: "approved", decided_at: "2026-01-02T00:00:00Z" },
    ];
    expect(latestApproval(approvals, "v1").decision).toBe("approved");
    expect(approvalState(visitOvernight, approvals)).toBe("approved");
  });
});

describe("on-site + manage", () => {
  const visit = { id: "v1", host_id: "m-host", status: "checked_in" };
  it("isOnSite reflects status", () => {
    expect(isOnSite(visit)).toBe(true);
    expect(isOnSite({ ...visit, status: "checked_out" })).toBe(false);
  });
  it("host can manage own visit", () => {
    expect(canManageVisit(visit, { id: "m-host" }, GROUPS, "g-lead")).toBe(true);
  });
  it("a non-host non-leader cannot manage", () => {
    expect(canManageVisit(visit, { id: "m-other" }, GROUPS, "g-lead")).toBe(false);
  });
  it("leadership can manage any visit", () => {
    expect(canManageVisit(visit, { id: "m-lead" }, GROUPS, "g-lead")).toBe(true);
  });
});

// Leadership gate fronts insert_privileged_only approvals — must mirror the hub.
testPrivilegedGateContract("isLeadership", isLeadership, {
  member:   { id: "m-lead",  role: "adult" },
  outsider: { id: "m-other", role: "adult" },
  groups:   GROUPS,
  groupId:  "g-lead",
});
