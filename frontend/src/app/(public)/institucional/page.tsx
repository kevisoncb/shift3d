/**
 * Ambiente `(public)` — Landing Page Institucional e Materiais de Vendas (`src/app/(public)/institucional/page.tsx`).
 *
 * Isolada estritamente dentro de `src/app/(public)/` juntamente com a página de login
 * unificada (`/login`), pronta para futura separação em subdomínio comercial (`www.shift3d.com`).
 */

"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Layers,
  LogIn,
  Sparkles,
  TrendingDown,
  Wrench,
} from "lucide-react";

export default function PublicInstitutionalLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Cabeçalho Institucional Limpo */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/institucional" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Box className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Shift<span className="text-blue-600">3D</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <LogIn className="h-3.5 w-3.5 text-slate-500" />
              Entrar (/login)
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Acessar Sistema (/dashboard)
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Institucional */}
      <section className="border-b border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Plataforma SaaS Automotiva de Catálogo 3D & Cross-Reference
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Engenharia Reversa 3D para Redução de Custos em Autopeças.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            Inspecione modelos 3D em Modo Raio-X, localize o Part Number OEM genuíno de
            concessionária e descubra peças equivalentes homologadas de outras montadoras
            com até 75% de economia.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Layers className="h-4 w-4" />
              Abrir Palco 3D Agora
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Portal de Login Unificado
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Códigos OEM Auditados
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Equivalência Fiat / Bosch / Mahle / Pierburg
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Modo Raio-X Interativo 60 FPS
            </span>
          </div>
        </div>
      </section>

      {/* Pilares Comerciais */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Layers className="mb-3 h-6 w-6 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Palco 3D Imersivo</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Visualização explodida por coordenadas XYZ para seleção direta de componentes internos do motor.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <TrendingDown className="mb-3 h-6 w-6 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Inteligência Cross-Reference</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Identificação imediata de fornecedores sistemistas compartilhados entre montadoras premium e nacionais.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Wrench className="mb-3 h-6 w-6 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Backoffice ERP Restrito</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Cadastro global de novas peças vinculadas às malhas 3D com atualização instantânea via API FastAPI.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
