"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type AdminStaffProfile = {
  firstName: string;
  lastName: string;
  displayRole: string;
  roles?: string[];
  permissions?: string[];
};

type AdminAuthContextValue = {
  staff: AdminStaffProfile;
  permissions: string[];
  roles: string[];
  can: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({
  staff,
  children,
}: {
  staff: AdminStaffProfile;
  children: ReactNode;
}) {
  const value = useMemo<AdminAuthContextValue>(() => {
    const permissions = staff.permissions ?? [];
    const roles = staff.roles ?? [];
    return {
      staff,
      permissions,
      roles,
      can: (permission) => permissions.includes(permission),
      hasRole: (role) => roles.includes(role),
    };
  }, [staff]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  }
  return value;
}

export function useCan(permission: string) {
  return useAdminAuth().can(permission);
}
