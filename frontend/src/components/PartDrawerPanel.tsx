/**
 * Gaveta Lateral Direita (`PartDrawerPanel`) - Shift3D.
 *
 * Arquitetura Visual:
 * - Quando o usuário clica em uma peça do carro 3D, esta gaveta lateral desliza suavemente
 *   da direita (`translate-x-0` vs `translate-x-full`).
 * - Design super limpo estilo Ficha Técnica de Engenharia Automotiva:
 *   1. Nome da peça, categoria mecânica e código OEM genuíno.
 *   2. Preço médio de mercado / concessionária em destaque limpo.
 *   3. Seção de Peças Similares / Afiliados (Cross-Reference):
 *      - Se o usuário estiver no plano `PRO` ou `ADMIN` (`is_locked: false`), exibe todos os
 *        dados completos (Marca Fiat/Mopar/Bosch, Part Number exato, notas de aplicação e link de afiliado).
 *      - Se o usuário estiver no plano `FREE` (`is_locked: true`), exibe o aviso de acesso restrito
 *        por não ser assinante Premium, juntamente com o convite elegante para ativar o plano PRO.
 */

"use client";

import React from "react";
import { PartData } from "@/lib/api";
import { useRole } from "@/context/RoleContext";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Lock,
  Sparkles,
  TrendingDown,
  X,
} from "lucide-react";

interface PartDrawerPanelProps {
  part: PartData | null;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
}

export function PartDrawerPanel({
  part,
  isOpen,
  loading,
  onClose,
}: PartDrawerPanelProps) {
  const { upgradeToPro } = useRole();

  const formatBRL = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div
      className={`fixed top-0 right-0 z-40 h-screen w-full max-w-md transform border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Cabeçalho da Ficha Técnica de Engenharia */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Especificação de Engenharia
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Ficha Técnica do Componente
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar gaveta"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo da Gaveta Lateral */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-900">
                Carregando ficha técnica da peça...
              </p>
            </div>
          ) : !part ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-500">
                Clique em qualquer componente no modelo 3D para inspecionar.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Identificação Principal da Peça */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {part.category}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    ID Malha: {part.mesh_name}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">
                  {part.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {part.description}
                </p>
              </div>

              {/* Bloco 1: Preço Médio de Mercado / Peça Original (OEM) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Referência Genuína (OEM)
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {part.original_brand}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                    {part.oem_code}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Preço Médio Concessionária
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {formatBRL(part.original_price)}
                  </span>
                </div>

                <a
                  href={part.purchase_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <span>Ver Catálogo Oficial OEM</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              </div>

              {/* Bloco 2: Seção de Peças Similares / Afiliados (Cross-Reference) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                    <TrendingDown className="h-4 w-4 text-blue-600" />
                    Peças Similares & Afiliados
                  </h4>
                  <span className="text-[11px] font-medium text-slate-400">
                    {part.cross_references.length} encontrada(s)
                  </span>
                </div>

                {part.cross_references.map((cr) => {
                  const locked = cr.is_locked;

                  return (
                    <div
                      key={cr.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      {/* Faixa de Preço Médio Equivalente e Economia */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          Economia de {cr.savings_percentage}%
                        </span>
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-400">
                            Preço Médio Similar
                          </span>
                          <span className="text-base font-extrabold text-emerald-600">
                            {formatBRL(cr.estimated_price)}
                          </span>
                        </div>
                      </div>

                      {/* Exibição Estratégica: Dados Completos (PRO/ADMIN) vs Acesso Negado Elegante (FREE) */}
                      {!locked ? (
                        <div className="mt-3 space-y-3">
                          <div>
                            <span className="block text-[10px] font-semibold uppercase text-slate-400">
                              Fabricante / Montadora Similar
                            </span>
                            <p className="text-xs font-bold text-slate-900">
                              {cr.compatible_brand}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                            <div>
                              <span className="block text-[10px] text-slate-400">
                                Veículo Compatível
                              </span>
                              <span className="text-xs font-semibold text-slate-800">
                                {cr.compatible_model}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400">
                                Código Equivalente
                              </span>
                              <span className="font-mono text-xs font-bold text-blue-600">
                                {cr.compatible_part_number}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs leading-relaxed text-slate-500">
                            {cr.compatibility_notes}
                          </p>

                          <a
                            href={cr.purchase_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                          >
                            <span>Acessar Oferta de Afiliado Homologado</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ) : (
                        /* Convite Elegante para o Plano PRO quando o usuário é FREE */
                        <div className="mt-3">
                          <div className="select-none space-y-2 blur-[4px] opacity-50">
                            <p className="text-xs font-bold text-slate-800">
                              Fiat / Mopar Equivalente Homologada
                            </p>
                            <div className="grid grid-cols-2 gap-2 rounded bg-slate-100 p-2">
                              <span className="text-xs">Fiat Toro / Pulse</span>
                              <span className="font-mono text-xs">FIAT-55282627</span>
                            </div>
                          </div>

                          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                              <Lock className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-xs font-bold text-slate-900">
                              Acesso Restrito à Assinatura PRO
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                              Sua conta atual está no plano gratuito. Ative o plano{" "}
                              <strong className="text-slate-800">PRO</strong> para liberar o
                              código de intercambiabilidade, fornecedor e link de afiliado
                              com economia de{" "}
                              <strong className="text-emerald-600">
                                {formatBRL(part.original_price - cr.estimated_price)}
                              </strong>
                              .
                            </p>
                            <button
                              type="button"
                              onClick={upgradeToPro}
                              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Desbloquear com Assinatura PRO
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Discreto da Ficha Técnica */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Dados auditados via API Python
          </span>
          <span>Licença: {part?.viewer_role || "FREE"}</span>
        </div>
      </div>
    </div>
  );
}
