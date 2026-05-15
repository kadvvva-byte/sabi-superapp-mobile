import {
  canAuthenticateCurrentUser,
  hasAnyRole,
  type CurrentUser,
  type UserId,
  type UserPermission,
  type UserRole,
  type VerificationMethod,
} from "./current-user";

export type AuthActorSnapshot = {
  userId: UserId;
  roles: UserRole[];
  permissions: UserPermission[];
  status: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

export type AuthEligibility = {
  canLogin: boolean;
  reason?: "blocked" | "suspended" | "deleted" | "unverified";
};

export type VerificationRequest = {
  userId: UserId;
  channel: VerificationMethod;
  destination: string;
};

export type AdminRole =
  | "support_admin"
  | "moderator"
  | "finance_admin"
  | "risk_admin"
  | "platform_admin"
  | "super_admin";

export const ADMIN_ROLES: AdminRole[] = [
  "support_admin",
  "moderator",
  "finance_admin",
  "risk_admin",
  "platform_admin",
  "super_admin",
];

export function resolveAuthActor(user: CurrentUser): AuthActorSnapshot {
  return {
    userId: user.id,
    roles: Array.isArray(user.roles) ? user.roles : [],
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    status: String(user.status ?? ""),
    isAuthenticated: canAuthenticateCurrentUser(user),
    isAdmin: hasAnyRole(user, ADMIN_ROLES),
  };
}

export function evaluateAuthEligibility(user: CurrentUser): AuthEligibility {
  if (user.status === "blocked") {
    return { canLogin: false, reason: "blocked" };
  }

  if (user.status === "suspended") {
    return { canLogin: false, reason: "suspended" };
  }

  if (user.status === "deleted") {
    return { canLogin: false, reason: "deleted" };
  }

  const hasVerifiedPhone =
    !user.phone || user.verification.phoneStatus === "verified";
  const hasVerifiedEmail =
    !user.email || user.verification.emailStatus === "verified";

  if (!hasVerifiedPhone || !hasVerifiedEmail) {
    return { canLogin: false, reason: "unverified" };
  }

  return { canLogin: true };
}

export function assertCanAuthenticate(user: CurrentUser): void {
  const result = evaluateAuthEligibility(user);

  if (!result.canLogin) {
    throw new Error(`User cannot authenticate: ${result.reason}`);
  }
}

export function buildVerificationRequest(
  user: CurrentUser,
): VerificationRequest {
  if (user.phone && user.verification.phoneStatus !== "verified") {
    return {
      userId: user.id,
      channel: "sms",
      destination: user.phone,
    };
  }

  if (user.email && user.verification.emailStatus !== "verified") {
    return {
      userId: user.id,
      channel: "email",
      destination: user.email,
    };
  }

  throw new Error("User does not require verification");
}