/**
 * Ambiente Principal do Usuário (`DashboardWorkspace`) - Shift3D (`src/app/(app)`).
 *
 * Estrutura Corporativa Minimalista:
 * 1. Sidebar Fixa Esquerda (`bg-slate-50` com `border-r border-slate-200`).
 * 2. Barra Superior de Filtros (`h-16 bg-white border-b`): Conectada aos dados da API Python
 *    (`/api/v1/public/cars` e `/api/v1/app/cars/{id}/parts`), contendo seletores limpos de Marca,
 *    Modelo e Busca Global de Peças por nome ou código OEM. Exibida somente durante a apresentação do carro 3D.
 * 3. Palco 3D Central (`w-full h-[82vh]`): Componente `CarViewer3D` imersivo sem cards na frente,
 *    contendo apenas o botão flutuante elegante "Modo Raio-X (Explodir Peças)" no canto superior direito.
 * 4. Gaveta Lateral Direita (`PartDrawerPanel`): Oculta por padrão (`isOpen: false`), desliza
 *    suavemente da direita apenas quando o usuário clica em uma peça do 3D ou seleciona na busca.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/NavbarRoleSwitcher";
import { CarViewer3D, CustomMeshDefinition } from "@/components/CarViewer3D";
import { PartDrawerPanel } from "@/components/PartDrawerPanel";
import { useRole } from "@/context/RoleContext";
import {
  CarSummaryItem,
  fetchAllCarParts,
  fetchPartByMeshName,
  fetchPublicCarsCatalog,
  PartData,
} from "@/lib/api";
import {
  Boxes,
  Lock,
  RotateCcw,
  Search,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

const DEFAULT_CAR_ID = "bmw-x1-2024";

const CORE_MESHES = [
  "mesh_hood_01",
  "mesh_engine_01",
  "mesh_spark_plug",
  "mesh_wheels",
];

// Catálogo base enriquecido com os dados reais vindos da API Python (/api/v1/public/cars)
const BRANDS_CATALOG: Record<
  string,
  { label: string; models: { id: string; name: string; premiumOnly?: boolean }[] }
> = {
  BMW: {
    label: "BMW",
    models: [
      { id: "bmw-x1-2024", name: "X1 sDrive20i 2.0 Turbo (2024)" },
      { id: "bmw-320i-g20", name: "320i M Sport G20 (Licença PRO)", premiumOnly: true },
    ],
  },
  CHEVROLET: {
    label: "Chevrolet",
    models: [
      { id: "chevrolet-tracker", name: "Tracker Premier 1.2 Turbo (Licença PRO)", premiumOnly: true },
      { id: "chevrolet-cruze", name: "Cruze RS 1.4 Ecotec (Licença PRO)", premiumOnly: true },
    ],
  },
};

export function DashboardWorkspace() {
  const { role, upgradeToPro } = useRole();

  // Seção ativa na Sidebar ('painel' | 'frota' | 'configuracoes')
  const [activeSection, setActiveSection] = useState<string>("painel");

  // Filtros Superiores conectados à API Python
  const [apiCars, setApiCars] = useState<CarSummaryItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("BMW");
  const [selectedModel, setSelectedModel] = useState<string>("bmw-x1-2024");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [premiumAlert, setPremiumAlert] = useState<string | null>(null);

  // Estados do Palco 3D e da Gaveta Lateral Direita (oculta por padrão)
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [currentPart, setCurrentPart] = useState<PartData | null>(null);
  const [loadingPart, setLoadingPart] = useState<boolean>(false);
  const [allCatalogParts, setAllCatalogParts] = useState<PartData[]>([]);

  // Carrega dados de veículos e peças diretamente da API Python FastAPI
  const loadCatalogData = useCallback(async () => {
    const [carsFromApi, partsFromApi] = await Promise.all([
      fetchPublicCarsCatalog(),
      fetchAllCarParts(DEFAULT_CAR_ID, role),
    ]);
    setApiCars(carsFromApi);
    setAllCatalogParts(partsFromApi);
  }, [role]);

  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);

  // Acionado ao clicar em uma peça no Palco 3D ou na Busca Global: busca na API Python e desliza a Gaveta Lateral Direita
  const handleSelectMesh = useCallback(
    async (meshName: string) => {
      setSelectedMesh(meshName);
      setIsDrawerOpen(true);
      setLoadingPart(true);
      try {
        const result = await fetchPartByMeshName(DEFAULT_CAR_ID, meshName, role);
        setCurrentPart(result.data);
      } finally {
        setLoadingPart(false);
      }
    },
    [role]
  );

  // Atualiza instantaneamente os dados da gaveta caso o usuário ative o plano PRO com ela aberta
  useEffect(() => {
    if (selectedMesh && isDrawerOpen) {
      handleSelectMesh(selectedMesh);
    }
  }, [role, selectedMesh, isDrawerOpen, handleSelectMesh]);

  // Busca Global de Peças por nome, código OEM ou identificador de malha
  const filteredPartsBySearch = searchQuery.trim()
    ? allCatalogParts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.oem_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mesh_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleBrandChange = (newBrand: string) => {
    setSelectedBrand(newBrand);
    const firstModel = BRANDS_CATALOG[newBrand]?.models[0];
    if (firstModel) {
      if (firstModel.premiumOnly && role === "FREE") {
        setPremiumAlert(
          `A frota completa da marca ${BRANDS_CATALOG[newBrand].label} requer assinatura PRO ativa.`
        );
      } else {
        setPremiumAlert(null);
        setSelectedModel(firstModel.id);
      }
    }
  };

  const handleModelChange = (newModelId: string) => {
    const modelObj = BRANDS_CATALOG[selectedBrand]?.models.find(
      (m) => m.id === newModelId
    );
    if (modelObj?.premiumOnly && role === "FREE") {
      setPremiumAlert(
        `O modelo "${modelObj.name}" requer assinatura PRO para carregamento da malha 3D.`
      );
      return;
    }
    setPremiumAlert(null);
    setSelectedModel(newModelId);
  };

  // Malhas dinâmicas adicionais cadastradas via POST /api/v1/admin/parts no Backoffice
  const customMeshes: CustomMeshDefinition[] = allCatalogParts
    .filter((p) => !CORE_MESHES.includes(p.mesh_name))
    .map((p) => ({
      mesh_name: p.mesh_name,
      name: p.name,
      explosion_vector: p.explosion_vector,
    }));

  const primaryApiCar = apiCars[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900">
      {/* 1. SIDEBAR FIXA ESQUERDA (bg-slate-50 com border-r border-slate-200) */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          if (sec !== "painel") {
            setIsDrawerOpen(false);
            setPremiumAlert(null);
          }
        }}
      />

      {/* 2. ÁREA PRINCIPAL DO SISTEMA */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
        {/* BARRA SUPERIOR DE FILTROS (h-16 bg-white border-b) — Somente na apresentação do carro 3D */}
        {activeSection === "painel" && (
          <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
            {/* Seletores Limpos de Marca e Modelo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Marca:</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-900 transition focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  <option value="BMW">BMW</option>
                  <option value="CHEVROLET">Chevrolet</option>
                </select>
              </div>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Modelo:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-900 transition focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  {BRANDS_CATALOG[selectedBrand]?.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id === "bmw-x1-2024" && primaryApiCar
                        ? `${primaryApiCar.model} (${primaryApiCar.year})`
                        : m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Busca Global de Peças por Nome ou Código OEM */}
            <div className="relative w-full max-w-md">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar peça por nome ou código OEM (ex: 12-12-0-040-551)..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Resultados da Busca Global */}
              {searchQuery.trim() !== "" && (
                <div className="absolute left-0 right-0 top-10 z-30 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  {filteredPartsBySearch.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-500">
                      Nenhuma peça encontrada para &ldquo;{searchQuery}&rdquo;.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {filteredPartsBySearch.map((item) => (
                        <button
                          key={item.mesh_name}
                          type="button"
                          onClick={() => {
                            if (item.mesh_name === "mesh_spark_plug" && !isExploded) {
                              setIsExploded(true);
                            }
                            handleSelectMesh(item.mesh_name);
                            setSearchQuery("");
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition hover:bg-slate-50"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <span className="font-mono text-[10px] text-slate-400">
                              OEM: {item.oem_code}
                            </span>
                          </div>
                          <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-600">
                            Abrir no 3D
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>
        )}

        {/* Alerta sutil caso usuário FREE selecione veículo exclusivo PRO */}
        {premiumAlert && activeSection === "painel" && (
          <div className="z-20 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              <span>{premiumAlert}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  upgradeToPro();
                  setPremiumAlert(null);
                }}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Ativar Plano PRO →
              </button>
              <button
                type="button"
                onClick={() => setPremiumAlert(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* 3. PALCO 3D CENTRAL IMERSIVO (w-full h-[82vh]) */}
        <main className="relative flex-1 overflow-y-auto p-6 bg-slate-50/40">
          {activeSection === "painel" && (
            <div className="relative h-[82vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Único Botão Flutuante Elegante no Canto Superior Direito */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  onClick={() => setIsExploded((prev) => !prev)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all shadow-sm ${
                    isExploded
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white/95 text-slate-700 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {isExploded ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Modo Normal (Recolher Peças)
                    </>
                  ) : (
                    <>
                      <Boxes className="h-3.5 w-3.5 text-blue-600" />
                      Modo Raio-X (Explodir Peças)
                    </>
                  )}
                </button>
              </div>

              {/* Componente CarViewer3D ocupando 100% do Palco Central sem cards na frente */}
              <CarViewer3D
                selectedMesh={selectedMesh}
                isExploded={isExploded}
                onSelectMesh={handleSelectMesh}
                customMeshes={customMeshes}
              />
            </div>
          )}

          {activeSection === "frota" && (
            <div className="mx-auto max-w-5xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Frota de Veículos Homologados
                </h2>
                <p className="text-xs text-slate-500">
                  Selecione um veículo para inspecionar no Palco 3D.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      Disponível
                    </span>
                    <h3 className="mt-2 text-base font-bold text-slate-900">
                      BMW X1 sDrive20i (2024)
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Motor 2.0L TwinPower Turbo B48 • {allCatalogParts.length} peças mapeadas na API
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection("painel")}
                    className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    Abrir no Palco 3D
                  </button>
                </div>

                {[
                  {
                    brand: "Chevrolet",
                    model: "Tracker Premier 1.2 Turbo (2024)",
                    spec: "Motor CSS Prime 1.2L • 18 equivalências mapeadas",
                  },
                  {
                    brand: "BMW",
                    model: "320i M Sport G20 (2024)",
                    spec: "Motor B48 Flex • 24 equivalências mapeadas",
                  },
                ].map((veh, idx) => {
                  const locked = role === "FREE";
                  return (
                    <div
                      key={idx}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            locked
                              ? "bg-slate-100 text-slate-600"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {locked && <Lock className="h-2.5 w-2.5" />}
                          {locked ? "Requer Plano PRO" : "Liberado PRO"}
                        </span>
                        <h3 className="mt-2 text-base font-bold text-slate-900">
                          {veh.brand} {veh.model}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">{veh.spec}</p>
                      </div>

                      {locked ? (
                        <button
                          type="button"
                          onClick={upgradeToPro}
                          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Lock className="h-3.5 w-3.5 text-blue-600" />
                          Ativar Plano PRO
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveSection("painel")}
                          className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Carregar Modelo 3D
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === "configuracoes" && (
            <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Configurações da Conta & Assinatura
                  </h2>
                  <p className="text-xs text-slate-500">
                    Gerencie seu plano de acesso na plataforma Shift3D
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <span className="block text-[11px] font-semibold uppercase text-slate-400">
                    Plano Atual da Conta
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Licença {role}
                  </span>
                </div>

                {role === "FREE" ? (
                  <button
                    type="button"
                    onClick={upgradeToPro}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Fazer Upgrade para PRO
                  </button>
                ) : (
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Assinatura Ativa
                  </span>
                )}
              </div>
            </div>
          )}
        </main>

        {/* 4. GAVETA LATERAL DIREITA (DRAWER DE DETALHES DA PEÇA) */}
        <PartDrawerPanel
          part={currentPart}
          isOpen={isDrawerOpen}
          loading={loadingPart}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>
    </div>
  );
}
