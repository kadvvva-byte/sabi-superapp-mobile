export type UserId = string;
export type UserRole = string;
export type UserPermission = string;
export type VerificationMethod = "sms" | "email";

export type VerificationStatus = "unverified" | "pending" | "verified";

export type CurrentUserVerification = {
  phoneStatus?: VerificationStatus | null;
  emailStatus?: VerificationStatus | null;
};

export type CurrentUserStatus =
  | "active"
  | "blocked"
  | "suspended"
  | "deleted"
  | "pending"
  | (string & {});

export type CurrentUser = {
  id: UserId;
  roles: UserRole[];
  permissions: UserPermission[];
  status: CurrentUserStatus;
  phone?: string | null;
  email?: string | null;
  verification: CurrentUserVerification;
  isAuthenticated?: boolean | null;
};

function normalizeRoles(user: CurrentUser | null | undefined): UserRole[] {
  return Array.isArray(user?.roles) ? user.roles : [];
}

function normalizePermissions(
  user: CurrentUser | null | undefined,
): UserPermission[] {
  return Array.isArray(user?.permissions) ? user.permissions : [];
}

export function hasAnyRole(
  user: CurrentUser | null | undefined,
  roles: UserRole[],
): boolean {
  if (!user) return false;
  if (!roles.length) return true;

  const currentRoles = normalizeRoles(user);
  return roles.some((role) => currentRoles.includes(role));
}

export function hasEveryPermission(
  user: CurrentUser | null | undefined,
  permissions: UserPermission[],
): boolean {
  if (!user) return false;
  if (!permissions.length) return true;

  const currentPermissions = normalizePermissions(user);
  return permissions.every((permission) =>
    currentPermissions.includes(permission),
  );
}

export function canAuthenticateCurrentUser(
  user: CurrentUser | null | undefined,
): boolean {
  if (!user) return false;
  if (user.isAuthenticated === false) return false;

  return (
    user.status !== "blocked" &&
    user.status !== "suspended" &&
    user.status !== "deleted"
  );
}