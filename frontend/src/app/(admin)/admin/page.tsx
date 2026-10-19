/**
 * Área 3: `(admin)` - Painel Backoffice Administrativo (`src/app/(admin)/admin/page.tsx`) - Shift3D.
 *
 * Regra de Negócio e Segurança:
 * - A página web do ADMIN só é acessível mediante login de Administrador (`/login`).
 * - Caso um usuário `FREE` ou `PRO` tente acessar `/admin` diretamente pela URL sem estar
 *   autenticado como `ADMIN`, o sistema exibe a tela corporativa de Acesso Restrito com
 *   redirecionamento para a página de Login Administrativo (`/login`), sem jamais exibir
 *   uma "box clicável" que muda o site sem login.
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/NavbarRoleSwitcher";
import { useRole } from "@/context/RoleContext";
import {
  CreatePartPayload,
  fetchAllCarParts,
  PartData,
  registerPartAsAdmin,
} from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Lock,
  LogIn,
  PackagePlus,
  TrendingDown,
} from "lucide-react";

export default function AdminBackofficePage() {
  const { role } = useRole();
  const [catalogParts, setCatalogParts] = useState<PartData[]>([]);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Campos do formulário de cadastro global de peça vinculada a um mesh_name
  const [partName, setPartName] = useState("Válvula Termostática Eletrônica B48");
  const [meshName, setMeshName] = useState("mesh_thermostat_01");
  const [oemCode, setOemCode] = useState("11-53-8-648-791");
  const [originalBrand, setOriginalBrand] = useState("BMW Genuine Parts");
  const [originalPrice, setOriginalPrice] = useState("2450");
  const [category, setCategory] = useState("Motor & Arrefecimento");
  const [description, setDescription] = useState(
    "Módulo termostático gerenciado eletronicamente pela DME. Componente homologado no catálogo global."
  );

  // Campos de Cross-Reference
  const [compBrand, setCompBrand] = useState("Fiat / Mahle Behr Original");
  const [compModel, setCompModel] = useState("Fiat Toro / Fastback 1.3 Turbo");
  const [compPartNumber, setCompPartNumber] = useState("MAHLE-TI-234-88");
  const [compPrice, setCompPrice] = useState("540");
  const [compNotes, setCompNotes] = useState(
    "Carcaça e atuador térmico Mahle idênticos ao fornecido para a linha BMW/Mini."
  );

  const loadParts = useCallback(async () => {
    const data = await fetchAllCarParts("bmw-x1-2024", "ADMIN");
    setCatalogParts(data);
  }, []);

  useEffect(() => {
    if (role === "ADMIN") {
      loadParts();
    }
  }, [role, loadParts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setSubmitting(true);

    try {
      const payload: CreatePartPayload = {
        car_id: "bmw-x1-2024",
        name: partName,
        mesh_name: meshName,
        oem_code: oemCode,
        original_brand: originalBrand,
        original_price: Number(originalPrice) || 1500,
        category,
        description,
        purchase_url: "https://www.bmw.com.br",
        explosion_vector: [0.0, 1.35, -0.6],
        cross_references: [
          {
            compatible_brand: compBrand,
            compatible_model: compModel,
            compatible_part_number: compPartNumber,
            estimated_price: Number(compPrice) || 350,
            compatibility_notes: compNotes,
            purchase_url: "https://lista.mercadolivre.com.br",
          },
        ],
      };

      const res = await registerPartAsAdmin(payload, role);
      await loadParts();

      setStatusMessage({
        type: "success",
        text: `Peça "${res.part.name}" (${res.part.mesh_name}) registrada com sucesso no catálogo global.`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao cadastrar peça.";
      setStatusMessage({
        type: "error",
        text: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatBRL = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  // BLOQUEIO ESTRITO: Caso não esteja logado como ADMIN, exige autenticação em /login
  if (role !== "ADMIN") {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              Acesso Restrito à Engenharia (Backoffice)
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Esta área é exclusiva para administradores autenticados. Realize o login
              corporativo com uma credencial administrativa para gerenciar o catálogo global.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <LogIn className="h-4 w-4" />
                Ir para Login Administrativo
              </Link>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar ao Palco 3D
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900">
      {/* Menu Lateral Fixo (Sidebar) */}
      <Sidebar />

      {/* Conteúdo Principal do Backoffice ERP */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 px-8 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Cabeçalho ERP */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                Shift3D Backoffice ERP
              </span>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
                Engenharia de Malhas 3D & Cross-Reference
              </h1>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao Palco 3D
            </Link>
          </div>

          {/* Grid de Métricas Limpo */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-medium text-slate-500">
                Malhas 3D Vinculadas (BMW X1)
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {catalogParts.length} Peças
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-medium text-slate-500">
                Economia Média Cross-Reference
              </span>
              <p className="mt-1 text-2xl font-bold text-emerald-600">74,8%</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-medium text-slate-500">
                Persistência API Python
              </span>
              <p className="mt-1 flex items-center gap-1.5 text-base font-bold text-slate-900">
                <Database className="h-4 w-4 text-blue-600" />
                Repositório Global Ativo
              </p>
            </div>
          </div>

          {/* Formulário + Tabela de Catálogo */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <PackagePlus className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Cadastrar / Atualizar Peça por Malha 3D
                </h2>
              </div>

              {statusMessage && (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-3 text-xs font-medium ${
                    statusMessage.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    ID da Malha 3D (mesh_name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={meshName}
                    onChange={(e) => setMeshName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Nome da Peça *
                  </label>
                  <input
                    type="text"
                    required
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Código OEM *
                  </label>
                  <input
                    type="text"
                    required
                    value={oemCode}
                    onChange={(e) => setOemCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Preço OEM (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Descrição Técnica
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-700">
                  <TrendingDown className="h-3.5 w-3.5 text-blue-600" />
                  Peça Similar / Equivalente (Cross-Reference)
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Marca Similar *
                    </label>
                    <input
                      type="text"
                      required
                      value={compBrand}
                      onChange={(e) => setCompBrand(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Veículo Compatível *
                    </label>
                    <input
                      type="text"
                      required
                      value={compModel}
                      onChange={(e) => setCompModel(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Código Equivalente *
                    </label>
                    <input
                      type="text"
                      required
                      value={compPartNumber}
                      onChange={(e) => setCompPartNumber(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-blue-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Preço Médio Similar (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={compPrice}
                      onChange={(e) => setCompPrice(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Salvando..." : "Publicar Peça no Catálogo Global"}
              </button>
            </form>

            {/* Tabela de Peças Mapeadas */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-6 overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-900">
                  Catálogo de Malhas 3D Ativas ({catalogParts.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Peça / Malha</th>
                      <th className="py-3 px-4">OEM</th>
                      <th className="py-3 px-4">Similar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {catalogParts.map((item) => {
                      const bestRef = item.cross_references[0];
                      return (
                        <tr key={item.mesh_name} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <span className="font-mono text-[10px] text-slate-400">
                              {item.mesh_name}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                            {formatBRL(item.original_price)}
                          </td>
                          <td className="py-3 px-4">
                            {bestRef ? (
                              <div>
                                <span className="font-bold text-emerald-600 whitespace-nowrap">
                                  {formatBRL(bestRef.estimated_price)}
                                </span>
                                <span className="block text-[10px] text-slate-400 truncate max-w-[140px]">
                                  {bestRef.compatible_brand}
                                </span>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
