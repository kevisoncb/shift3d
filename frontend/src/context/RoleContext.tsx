/**
 * Contexto Global de Autenticação e Sessão Corporativa (`RoleContext`) - Shift3D.
 *
 * Responsabilidades:
 * 1. Gerencia a sessão do usuário logado na plataforma SaaS (`FREE`, `PRO` ou `ADMIN`).
 * 2. Isola claramente o redirecionamento pós-login:
 *    - Ao logar com conta comum (`FREE` ou `PRO`), redireciona para o sistema principal (`/dashboard`).
 *    - Ao logar com credencial administrativa (`admin@shift3d.com.br`), redireciona para o Backoffice (`/admin`).
 * 3. Mantém usuários `FREE` e `PRO` no mesmo ambiente (`src/app/(app)`), aplicando restrição
 *    elegante nos recursos exclusivos do plano PRO.
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRoleType = "FREE" | "PRO" | "ADMIN";

export interface AuthenticatedUser {
  name: string;
  email: string;
  company: string;
  role: UserRoleType;
}

interface RoleContextValue {
  role: UserRoleType;
  user: AuthenticatedUser;
  isAuthenticated: boolean;
  setRole: (newRole: UserRoleType) => void;
  loginWithCredentials: (email: string, password?: string) => {
    success: boolean;
    role: UserRoleType;
    redirectUrl: string;
    message?: string;
  };
  upgradeToPro: () => void;
  logout: () => void;
}

const ACCOUNTS_DIRECTORY: Record<UserRoleType, AuthenticatedUser> = {
  FREE: {
    name: "Ricardo Almeida",
    email: "ricardo@autocenter.com.br",
    company: "Plano Básico (Standard)",
    role: "FREE",
  },
  PRO: {
    name: "Ricardo Almeida",
    email: "pro@shift3d.com.br",
    company: "Assinatura Corporativa PRO",
    role: "PRO",
  },
  ADMIN: {
    name: "Diretoria de Engenharia",
    email: "admin@shift3d.com.br",
    company: "Shift3D Global Backoffice",
    role: "ADMIN",
  },
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRoleType>("FREE");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("shift3d_active_role") as UserRoleType | null;
    if (saved && (saved === "FREE" || saved === "PRO" || saved === "ADMIN")) {
      setRoleState(saved);
    }
  }, []);

  const setRole = (newRole: UserRoleType) => {
    setRoleState(newRole);
    setIsAuthenticated(true);
    window.localStorage.setItem("shift3d_active_role", newRole);
  };

  /**
   * Realiza autenticação corporativa unificada em `/login`:
   * - Conta Admin (`admin@shift3d.com.br`) -> Redireciona para `/admin` (`src/app/(admin)`).
   * - Conta Comum (`FREE` ou `PRO`) -> Redireciona para `/dashboard` (`src/app/(app)`).
   */
  const loginWithCredentials = (email: string, password = "") => {
    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.includes("admin") ||
      normalizedEmail === "engenharia@shift3d.com.br"
    ) {
      if (password && password !== "admin" && password !== "admin123" && password !== "123456") {
        return {
          success: false,
          role: role,
          redirectUrl: "/login",
          message: "Credenciais administrativas inválidas.",
        };
      }
      setRole("ADMIN");
      return {
        success: true,
        role: "ADMIN" as UserRoleType,
        redirectUrl: "/admin",
      };
    }

    if (normalizedEmail.includes("pro") || normalizedEmail.includes("premium")) {
      setRole("PRO");
      return {
        success: true,
        role: "PRO" as UserRoleType,
        redirectUrl: "/dashboard",
      };
    }

    setRole("FREE");
    return {
      success: true,
      role: "FREE" as UserRoleType,
      redirectUrl: "/dashboard",
    };
  };

  const upgradeToPro = () => {
    setRole("PRO");
  };

  const logout = () => {
    setRoleState("FREE");
    setIsAuthenticated(false);
    window.localStorage.setItem("shift3d_active_role", "FREE");
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        user: ACCOUNTS_DIRECTORY[role],
        isAuthenticated,
        setRole,
        loginWithCredentials,
        upgradeToPro,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole deve ser utilizado dentro de um RoleProvider.");
  }
  return context;
}
