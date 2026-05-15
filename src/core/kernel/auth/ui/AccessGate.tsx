import React, { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  canAccessByPermission,
  canAccessByRole,
} from "../domain/access-control";
import { useAuthSession } from "./AuthSessionProvider";
import { useSabiTheme } from "../../../../theme/ThemeProvider";
import type {
  CurrentUser,
  UserPermission,
  UserRole,
} from "../current-user";

type Props = {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: UserPermission[];
  fallback?: ReactNode;
  title?: string;
  message?: string;
};

export default function AccessGate({
  children,
  requiredRoles,
  requiredPermissions,
  fallback,
  title = "Access restricted",
  message = "You do not have permission to open this section.",
}: Props) {
  const theme = useSabiTheme();
  const session = useAuthSession() as {
    user?: CurrentUser | null;
    isAuthenticated?: boolean;
  };

  const user = session.user ?? null;
  const isAuthenticated = Boolean(session.isAuthenticated);

  let allowed = true;

  if (requiredRoles?.length) {
    allowed = canAccessByRole(user, requiredRoles).allowed;
  }

  if (allowed && requiredPermissions?.length) {
    allowed = canAccessByPermission(user, requiredPermissions).allowed;
  }

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {isAuthenticated
          ? message
          : "Authentication is required before this section can be opened."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});