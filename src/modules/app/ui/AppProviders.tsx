import React, { type ReactNode, useEffect } from "react";
import {
  restoreAuthenticatedSessionFromStorage,
} from "../../../core/kernel/auth/session.actions";
import { AuthSessionProvider } from "../../../core/kernel/auth/ui/AuthSessionProvider";

type Props = {
  children: ReactNode;
};

function AuthSessionBootstrap() {
  useEffect(() => {
    void restoreAuthenticatedSessionFromStorage();
  }, []);

  return null;
}

export default function AppProviders({ children }: Props) {
  return (
    <AuthSessionProvider>
      <AuthSessionBootstrap />
      {children}
    </AuthSessionProvider>
  );
}