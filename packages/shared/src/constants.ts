export const SYNC_PROTOCOL_VERSION = "1.0";

export const ROLES = ["admin", "member", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  workspace: ["read", "write", "delete", "manage_members"],
  project: ["read", "write", "delete"],
} as const;
