/**
 * Menu Lateral Fixo (`SidebarNavigation`) - Shift3D.
 *
 * Arquitetura Visual:
 * - Posicionado à esquerda com fundo branco/gelo sutil (`bg-slate-50`), borda fina na direita (`border-r border-slate-200`).
 * - Contém o logotipo minimalista do Shift3D no topo.
 * - Navegação limpa: Painel (Palco 3D), Frota / Carros, Relatórios de Equivalência (com indicação
 *   de recurso restrito se o usuário for FREE) e Configurações.
 * - Base da Sidebar exibe o cartão de perfil do usuário autenticado, plano atual e link discreto
 *   para Login Corporativo / Acesso Administrativo (`/login`), sem botões de simulador poluindo a tela.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  Box,
  CarFront,
  LayoutDashboard,
  Lock,
  LogIn,
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
  const { role, user, upgradeToPro } = useRole();

  const navItems = [
    {
      id: "painel",
      label: "Painel & Palco 3D",
      href: "/",
      icon: LayoutDashboard,
      lockedForFree: false,
    },
    {
      id: "frota",
      label: "Frota / Carros",
      href: "/?view=frota",
      icon: CarFront,
      lockedForFree: false,
    },
    {
      id: "configuracoes",
      label: "Configurações",
      href: "/?view=configuracoes",
      icon: Settings,
      lockedForFree: false,
    },
  ];

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-slate-50 select-none">
      {/* Topo: Logotipo Minimalista Shift3D + Navegação Principal */}
      <div>
        <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Box className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
              Shift<span className="text-blue-600">3D</span>
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Enterprise Catalog
            </span>
          </div>
        </div>

        {/* Menu de Navegação Principal */}
        <div className="px-3 py-5">
          <span className="mb-2 block px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Navegação Principal
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === "/" && activeSection === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    if (pathname === "/" && onSelectSection) {
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

            {/* Item visível apenas quando autenticado como ADMIN via /login */}
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
                  Gestão Backoffice
                </span>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-700">
                  Admin
                </span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Base da Sidebar: Status de Assinatura + Perfil do Usuário */}
      <div className="border-t border-slate-200 p-4 space-y-3">
        {/* Caso seja usuário FREE, exibe um card sutil de assinatura Premium */}
        {role === "FREE" && (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-900">
                Licença Standard (Free)
              </span>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Códigos equivalentes (Cross-Reference) requerem licença PRO.
            </p>
            <button
              type="button"
              onClick={upgradeToPro}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Sparkles className="h-3 w-3" />
              Ativar Licença PRO
            </button>
          </div>
        )}

        {/* Perfil do Usuário na Base */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900">
                {user.name}
              </p>
              <p className="truncate text-[10px] font-medium text-slate-500">
                {user.company}
              </p>
            </div>
          </div>

          <Link
            href="/login"
            title="Alternar Conta / Login Administrativo"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LogIn className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
