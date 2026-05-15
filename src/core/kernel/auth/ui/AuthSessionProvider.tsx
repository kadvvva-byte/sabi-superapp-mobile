import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyAuthenticatedSession,
  resetAuthenticatedSession,
} from "../session.actions";
import { resolveAuthActor, type AuthActorSnapshot } from "../domain/auth-actor";
import {
  canAuthenticateCurrentUser,
  hasAnyRole,
  hasEveryPermission,
  type CurrentUser,
  type UserPermission,
  type UserRole,
} from "../current-user";
import { useAuthSession as useKernelAuthSession } from "../use-auth-session";
import { resolveSabiApiBaseUrl } from "../../../../shared/api/apiBaseUrl";

type AuthSessionStatus = "guest" | "authenticated";

type AuthSessionContextValue = {
  user: CurrentUser | null;
  authActor: AuthActorSnapshot | null;
  status: AuthSessionStatus;
  isAuthenticated: boolean;
  setUser: (user: CurrentUser | null) => void;
  signOut: () => Promise<void>;
  signInDemoUser: () => Promise<void>;
  signInDemoAdmin: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: UserPermission) => boolean;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

type Props = {
  children: ReactNode;
};

function buildSessionUser(params: {
  currentUserId: string | null;
  phoneNumber: string | null;
  authenticated: boolean;
}): CurrentUser | null {
  if (!params.authenticated || !params.currentUserId) {
    return null;
  }

  return {
    id: params.currentUserId,
    roles: [],
    permissions: [],
    status: "active",
    phone: params.phoneNumber,
    email: null,
    verification: {
      phoneStatus: "verified",
      emailStatus: "verified",
    },
    isAuthenticated: true,
  };
}

export function AuthSessionProvider({ children }: Props) {
  const session = useKernelAuthSession();
  const [userOverride, setUserOverride] = useState<CurrentUser | null>(null);

  const sessionUser = useMemo(
    () =>
      buildSessionUser({
        currentUserId: session.currentUserId,
        phoneNumber: session.phoneNumber,
        authenticated: session.authenticated,
      }),
    [session.authenticated, session.currentUserId, session.phoneNumber],
  );

  const user = useMemo<CurrentUser | null>(() => {
    if (userOverride && session.currentUserId) {
      if (userOverride.id === session.currentUserId) {
        return userOverride;
      }
    }

    return userOverride ?? sessionUser;
  }, [session.currentUserId, sessionUser, userOverride]);

  const authActor = useMemo<AuthActorSnapshot | null>(() => {
    return user ? resolveAuthActor(user) : null;
  }, [user]);

  const value = useMemo<AuthSessionContextValue>(() => {
    const isAuthenticated = Boolean(
      user && canAuthenticateCurrentUser(user) && session.authenticated,
    );

    const setUser = (nextUser: CurrentUser | null) => {
      setUserOverride(nextUser);
    };

    const signOut = async () => {
      setUserOverride(null);
      await resetAuthenticatedSession({
        markHydrated: true,
        error: null,
      });
    };

    const signInDemoUser = async () => {
      const demoUser: CurrentUser = {
        id: "demo-user",
        roles: ["user"],
        permissions: [],
        status: "active",
        phone: "+998900000001",
        email: null,
        verification: {
          phoneStatus: "verified",
          emailStatus: "verified",
        },
        isAuthenticated: true,
      };

      setUserOverride(demoUser);

      await applyAuthenticatedSession({
        apiBaseUrl: resolveSabiApiBaseUrl(undefined, { port: "4001" }),
        accessToken: "demo-user-token",
        refreshToken: "demo-user-refresh-token",
        currentUserId: demoUser.id,
        phoneNumber: demoUser.phone ?? null,
      });
    };

    const signInDemoAdmin = async () => {
      const demoAdmin: CurrentUser = {
        id: "demo-admin",
        roles: ["platform_admin"],
        permissions: ["admin:access"],
        status: "active",
        phone: null,
        email: "admin@sabi.local",
        verification: {
          phoneStatus: "verified",
          emailStatus: "verified",
        },
        isAuthenticated: true,
      };

      setUserOverride(demoAdmin);

      await applyAuthenticatedSession({
        apiBaseUrl: resolveSabiApiBaseUrl(undefined, { port: "4001" }),
        accessToken: "demo-admin-token",
        refreshToken: "demo-admin-refresh-token",
        currentUserId: demoAdmin.id,
        phoneNumber: null,
      });
    };

    return {
      user,
      authActor,
      status: isAuthenticated ? "authenticated" : "guest",
      isAuthenticated,
      setUser,
      signOut,
      signInDemoUser,
      signInDemoAdmin,
      hasRole: (role) => hasAnyRole(user, [role]),
      hasPermission: (permission) => hasEveryPermission(user, [permission]),
    };
  }, [authActor, session.authenticated, user]);

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }

  return context;
}

export default AuthSessionProvider;