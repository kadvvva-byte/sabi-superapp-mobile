import {
  canAuthenticateCurrentUser,
  hasAnyRole,
  hasEveryPermission,
  type CurrentUser,
  type UserPermission,
  type UserRole,
} from "./current-user";

export type AccessCheckResult = {
  allowed: boolean;
  reason?: "unauthenticated" | "forbidden";
};

export function canAccessByRole(
  user: CurrentUser | null | undefined,
  roles: UserRole[],
): AccessCheckResult {
  if (!user || !canAuthenticateCurrentUser(user)) {
    return { allowed: false, reason: "unauthenticated" };
  }

  if (!hasAnyRole(user, roles)) {
    return { allowed: false, reason: "forbidden" };
  }

  return { allowed: true };
}

export function canAccessByPermission(
  user: CurrentUser | null | undefined,
  permissions: UserPermission[],
): AccessCheckResult {
  if (!user || !canAuthenticateCurrentUser(user)) {
    return { allowed: false, reason: "unauthenticated" };
  }

  if (!hasEveryPermission(user, permissions)) {
    return { allowed: false, reason: "forbidden" };
  }

  return { allowed: true };
}
