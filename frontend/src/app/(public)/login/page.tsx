/**
 * Tela de Autenticação Corporativa & Acesso Administrativo (`src/app/(public)/login/page.tsx`) - Shift3D.
 *
 * Responsabilidades:
 * 1. Garante que a página web do ADMIN (`/admin`) seja acessada através de login real de administrador,
 *    e nunca através de uma box/botão de simulador solto na tela principal.
 * 2. Permite que usuários comuns também alternem entre uma conta Standard (`FREE`) e uma conta
 *    Corporativa (`PRO`) através de credenciais reais de acesso.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { ArrowLeft, Box, Lock, Mail } from "lucide-react";

export default function CorporateLoginPage() {
  const { loginWithCredentials } = useRole();
  const router = useRouter();

  const [email, setEmail] = useState("admin@shift3d.com.br");
  const [password, setPassword] = useState("admin123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = loginWithCredentials(email, password);
    if (!result.success) {
      setErrorMessage(result.message || "Credenciais inválidas.");
      return;
    }

    router.push(result.redirectUrl);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao Painel Principal
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Box className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Shift<span className="text-blue-600">3D</span> Enterprise
            </h1>
            <p className="text-xs text-slate-500">
              Portal de Autenticação Corporativa & Backoffice
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {errorMessage && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@empresa.com.br"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs text-slate-900 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs text-slate-900 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Autenticar no Sistema
            </button>
          </form>

          {/* Credenciais de Homologação Discretas para Teste */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <span className="block text-[11px] font-semibold text-slate-400">
              Credenciais de Homologação (Clique para preencher):
            </span>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@shift3d.com.br");
                  setPassword("admin123");
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Conta Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("pro@shift3d.com.br");
                  setPassword("pro123");
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Conta PRO
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("ricardo@autocenter.com.br");
                  setPassword("free123");
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Conta Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
