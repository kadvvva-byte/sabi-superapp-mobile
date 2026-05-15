export type UserId = string;

export type UserRole =
  | "user"
  | "support_admin"
  | "moderator"
  | "finance_admin"
  | "risk_admin"
  | "platform_admin"
  | "super_admin";

export type UserPermission =
  | "auth.login"
  | "auth.verify"
  | "profile.read"
  | "profile.update"
  | "wallet.read"
  | "wallet.transfer"
  | "wallet.withdraw"
  | "wallet.admin.read"
  | "messenger.read"
  | "messenger.moderate"
  | "admin.panel.read"
  | "admin.support"
  | "admin.moderation"
  | "admin.finance"
  | "admin.risk"
  | "admin.platform"
  | "admin.super";

export type VerificationMethod = "sms" | "email";

export type UserStatus =
  | "active"
  | "pending"
  | "blocked"
  | "suspended"
  | "deleted";

export type VerificationStatus = "unverified" | "pending" | "verified";

export type UserVerification = {
  phoneStatus: VerificationStatus;
  emailStatus: VerificationStatus;
  lastVerifiedAt: string | null;
};

export type UserEntityProps = {
  id: UserId;
  roles?: UserRole[];
  permissions?: UserPermission[];
  status?: UserStatus;
  phone?: string | null;
  email?: string | null;
  verification?: Partial<UserVerification>;
};

const ROLE_PERMISSION_MAP: Record<UserRole, UserPermission[]> = {
  user: [
    "auth.login",
    "auth.verify",
    "profile.read",
    "profile.update",
    "wallet.read",
    "wallet.transfer",
    "wallet.withdraw",
    "messenger.read",
  ],
  support_admin: [
    "auth.login",
    "auth.verify",
    "profile.read",
    "wallet.read",
    "messenger.read",
    "admin.panel.read",
    "admin.support",
  ],
  moderator: [
    "auth.login",
    "auth.verify",
    "profile.read",
    "messenger.read",
    "messenger.moderate",
    "admin.panel.read",
    "admin.moderation",
  ],
  finance_admin: [
    "auth.login",
    "auth.verify",
    "profile.read",
    "wallet.read",
    "wallet.admin.read",
    "admin.panel.read",
    "admin.finance",
  ],
  risk_admin: [
    "auth.login",
    "auth.verify",
    "profile.read",
    "wallet.read",
    "wallet.admin.read",
    "messenger.read",
    "admin.panel.read",
    "admin.risk",
  ],
  platform_admin: [
    "auth.login",
    "auth.verify",
    "profile.read",
    "wallet.read",
    "wallet.admin.read",
    "messenger.read",
    "messenger.moderate",
    "admin.panel.read",
    "admin.support",
    "admin.moderation",
    "admin.finance",
    "admin.risk",
    "admin.platform",
  ],
  super_admin: [
    "auth.login",
    "auth.verify",
    "profile.read",
    "profile.update",
    "wallet.read",
    "wallet.transfer",
    "wallet.withdraw",
    "wallet.admin.read",
    "messenger.read",
    "messenger.moderate",
    "admin.panel.read",
    "admin.support",
    "admin.moderation",
    "admin.finance",
    "admin.risk",
    "admin.platform",
    "admin.super",
  ],
};

function dedupe<T extends string>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function buildRolePermissions(roles: UserRole[]): UserPermission[] {
  return dedupe(roles.flatMap((role) => ROLE_PERMISSION_MAP[role] ?? []));
}

export default class UserEntity {
  public id: UserId;
  public roles: UserRole[];
  public permissions: UserPermission[];
  public status: UserStatus;
  public phone: string | null;
  public email: string | null;
  public verification: UserVerification;

  constructor(props: UserEntityProps) {
    this.id = props.id;
    this.roles = dedupe(props.roles ?? ["user"]);
    this.permissions = dedupe([
      ...buildRolePermissions(this.roles),
      ...(props.permissions ?? []),
    ]);
    this.status = props.status ?? "pending";
    this.phone = props.phone ?? null;
    this.email = props.email ?? null;

    const defaultPhoneStatus: VerificationStatus = this.phone
      ? "unverified"
      : "verified";

    const defaultEmailStatus: VerificationStatus = this.email
      ? "unverified"
      : "verified";

    this.verification = {
      phoneStatus: props.verification?.phoneStatus ?? defaultPhoneStatus,
      emailStatus: props.verification?.emailStatus ?? defaultEmailStatus,
      lastVerifiedAt: props.verification?.lastVerifiedAt ?? null,
    };
  }

  static create(props: UserEntityProps): UserEntity {
    return new UserEntity(props);
  }

  canAuthenticate(): boolean {
    if (
      this.status === "blocked" ||
      this.status === "suspended" ||
      this.status === "deleted"
    ) {
      return false;
    }

    const hasVerifiedPhone =
      !this.phone || this.verification.phoneStatus === "verified";
    const hasVerifiedEmail =
      !this.email || this.verification.emailStatus === "verified";

    return hasVerifiedPhone && hasVerifiedEmail;
  }

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this.roles.includes(role));
  }

  hasPermission(permission: UserPermission): boolean {
    return this.permissions.includes(permission);
  }

  hasEveryPermission(permissions: UserPermission[]): boolean {
    return permissions.every((permission) =>
      this.permissions.includes(permission)
    );
  }

  toJSON() {
    return {
      id: this.id,
      roles: [...this.roles],
      permissions: [...this.permissions],
      status: this.status,
      phone: this.phone,
      email: this.email,
      verification: { ...this.verification },
    };
  }
}