import type UserEntity from "../../user/domain/user.entity";
import {
  canAccessByPermission,
  canAccessByRole,
} from "../../auth/domain/access-control";
import type { AdminRole } from "../../auth/domain/auth-actor";
import type {
  UserPermission,
  UserRole,
} from "../../user/domain/user.entity";

export type AdminSectionKey =
  | "support"
  | "moderation"
  | "finance"
  | "risk"
  | "platform"
  | "super";

export type AdminSectionConfig = {
  key: AdminSectionKey;
  title: string;
  roles: UserRole[];
  permissions: UserPermission[];
};

export const ADMIN_SECTION_CONFIG: Record<AdminSectionKey, AdminSectionConfig> = {
  support: {
    key: "support",
    title: "Support",
    roles: ["support_admin", "platform_admin", "super_admin"],
    permissions: ["admin.panel.read", "admin.support"],
  },
  moderation: {
    key: "moderation",
    title: "Moderation",
    roles: ["moderator", "platform_admin", "super_admin"],
    permissions: ["admin.panel.read", "admin.moderation"],
  },
  finance: {
    key: "finance",
    title: "Finance",
    roles: ["finance_admin", "platform_admin", "super_admin"],
    permissions: ["admin.panel.read", "admin.finance"],
  },
  risk: {
    key: "risk",
    title: "Risk",
    roles: ["risk_admin", "platform_admin", "super_admin"],
    permissions: ["admin.panel.read", "admin.risk"],
  },
  platform: {
    key: "platform",
    title: "Platform",
    roles: ["platform_admin", "super_admin"],
    permissions: ["admin.panel.read", "admin.platform"],
  },
  super: {
    key: "super",
    title: "Super Admin",
    roles: ["super_admin"],
    permissions: ["admin.panel.read", "admin.super"],
  },
};

export const ADMIN_ROLE_ORDER: AdminRole[] = [
  "support_admin",
  "moderator",
  "finance_admin",
  "risk_admin",
  "platform_admin",
  "super_admin",
];

export function getAvailableAdminSections(user: UserEntity): AdminSectionConfig[] {
  return Object.values(ADMIN_SECTION_CONFIG).filter((section) => {
    const byRole = canAccessByRole(user, section.roles).allowed;
    const byPermission = canAccessByPermission(user, section.permissions).allowed;
    return byRole && byPermission;
  });
}

export function canAccessAdminSection(
  user: UserEntity,
  section: AdminSectionKey
): boolean {
  const config = ADMIN_SECTION_CONFIG[section];
  return (
    canAccessByRole(user, config.roles).allowed &&
    canAccessByPermission(user, config.permissions).allowed
  );
}

export function getDefaultAdminSection(
  user: UserEntity
): AdminSectionKey | null {
  const available = getAvailableAdminSections(user);
  return available.length > 0 ? available[0].key : null;
}