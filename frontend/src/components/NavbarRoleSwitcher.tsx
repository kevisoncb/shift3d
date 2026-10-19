/**
 * Menu Lateral Fixo Esquerdo (`Sidebar`) - Shift3D.
 *
 * Padrão Corporativo Minimalista:
 * - Fundo `bg-slate-50` com borda fina à direita (`border-r border-slate-200`).
 * - Logotipo minimalista do Shift3D no topo.
 * - Links limpos para:
 *   1. 'Painel & Palco 3D'
 *   2. 'Frota de Veículos'
 *   3. 'Configurações'
 * - Card de perfil do usuário na base com botão direto de Login / Logout (`/login`).
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  Box,
  CarFront,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

interface SidebarProps {
  activeSection?: string;
  onSelectSection?: (section: string) => void;
}

export function Sidebar({ activeSection = "painel", onSelectSection }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, isAuthenticated, upgradeToPro, logout } = useRole();

  const navItems = [
    {
      id: "painel",
      label: "Painel & Palco 3D",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "frota",
      label: "Frota de Veículos",
      href: "/dashboard?view=frota",
      icon: CarFront,
    },
    {
      id: "configuracoes",
      label: "Configurações",
      href: "/dashboard?view=configuracoes",
      icon: Settings,
    },
  ];

  const handleAuthButtonClick = () => {
    if (isAuthenticated) {
      logout();
    }
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-slate-50 select-none">
      {/* Topo: Logotipo Minimalista Shift3D + Links de Navegação */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Box className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                Shift<span className="text-blue-600">3D</span>
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Enterprise SaaS
              </span>
            </div>
          </Link>
        </div>

        {/* Links de Navegação Limpos */}
        <div className="px-3 py-5">
          <span className="mb-2 block px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Ambiente Principal
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isInAppArea =
                pathname === "/" ||
                pathname?.startsWith("/dashboard") ||
                pathname?.startsWith("/cockpit");
              const isActive = isInAppArea && activeSection === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    if (isInAppArea && onSelectSection) {
                      e.preventDefault();
                      onSelectSection(item.id);
                    }
                  }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/80"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Link do Backoffice Admin exibido apenas quando autenticado como ADMIN */}
            {role === "ADMIN" && (
              <Link
                href="/admin"
                className={`mt-2 flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                  pathname?.startsWith("/admin")
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/80"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Painel Backoffice
                </span>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-700">
                  Admin
                </span>
              </Link>
            )}
          </nav>

          {/* Link Institucional Discreto para a Landing Page Pública */}
          <div className="mt-6 border-t border-slate-200/70 pt-4 px-3">
            <Link
              href="/institucional"
              className="block text-[11px] font-medium text-slate-400 transition hover:text-slate-700"
            >
              Sobre a Plataforma & Planos →
            </Link>
          </div>
        </div>
      </div>

      {/* Base da Sidebar: Convite PRO (se FREE) + Card de Perfil do Usuário com Botão Login/Logout */}
      <div className="border-t border-slate-200 p-4 space-y-3">
        {role === "FREE" && (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-900">
                Plano Standard (Free)
              </span>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Peças similares e códigos de afiliados exigem assinatura PRO.
            </p>
            <button
              type="button"
              onClick={upgradeToPro}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Sparkles className="h-3 w-3" />
              Ativar Plano PRO
            </button>
          </div>
        )}

        {/* Card de Perfil do Usuário na Base */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">
                {user.name}
              </p>
              <p className="truncate text-[10px] font-medium text-slate-500">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAuthButtonClick}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            {isAuthenticated ? (
              <>
                <LogOut className="h-3.5 w-3.5 text-slate-500" />
                <span>Alternar Conta / Logout</span>
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5 text-blue-600" />
                <span>Entrar na Conta</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
