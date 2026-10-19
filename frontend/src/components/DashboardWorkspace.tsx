/**
 * Componente Unificado de Plataforma SaaS Corporativa (`DashboardWorkspace`) - Shift3D.
 *
 * Arquitetura Visual:
 * 1. Estrutura de Tela (Dashboard Layout):
 *    - Menu Lateral Fixo (`Sidebar`) à esquerda em `bg-slate-50` com borda fina à direita.
 *    - Área Principal (`main`) ocupando todo o restante da tela.
 * 2. Barra Superior de Filtros e Busca:
 *    - Seletores limpos de Marca (ex: BMW, Chevrolet, Fiat/Stellantis), Modelo e Barra de Busca
 *      Global rápida para localizar carros ou peças pelo nome ou código OEM.
 * 3. O Palco 3D Gigante (Foco Absoluto):
 *    - Visualizador 3D ocupando o centro da tela (`w-full h-[80vh]`), limpo, sem botões flutuantes
 *      exagerados — apenas um único botão minimalista e elegante no canto para "Modo Raio-X (Explodir Peças)".
 * 4. Gaveta Lateral Direita (`PartDrawerPanel`):
 *    - Desliza suavemente da direita quando o usuário clica em uma peça do carro 3D ou seleciona
 *      um item na busca superior.
 * 5. Mesma interface para FREE e PRO:
 *    - Usuários FREE e PRO utilizam exatamente o mesmo sistema; locais exclusivos (como códigos
 *      Cross-Reference na gaveta ou relatórios avançados de frota) exibem bloqueio elegante para contas FREE.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/NavbarRoleSwitcher";
import { CarViewer3D, CustomMeshDefinition } from "@/components/CarViewer3D";
import { PartDrawerPanel } from "@/components/PartDrawerPanel";
import { useRole } from "@/context/RoleContext";
import { fetchAllCarParts, fetchPartByMeshName, PartData } from "@/lib/api";
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

// Catálogo de Marcas e Modelos na Barra Superior
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

  // Navegação lateral da Sidebar (painel, frota, configuracoes)
  const [activeSection, setActiveSection] = useState<string>("painel");

  // Filtros superiores: Marca, Modelo e Busca Global
  const [selectedBrand, setSelectedBrand] = useState<string>("BMW");
  const [selectedModel, setSelectedModel] = useState<string>("bmw-x1-2024");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [premiumAlert, setPremiumAlert] = useState<string | null>(null);

  // Estados do Palco 3D e da Gaveta Lateral Direita
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [currentPart, setCurrentPart] = useState<PartData | null>(null);
  const [loadingPart, setLoadingPart] = useState<boolean>(false);
  const [allCatalogParts, setAllCatalogParts] = useState<PartData[]>([]);

  // Carrega todas as peças do veículo para alimentar a busca global superior e malhas extras
  const loadCatalogParts = useCallback(async () => {
    const list = await fetchAllCarParts(DEFAULT_CAR_ID, role);
    setAllCatalogParts(list);
  }, [role]);

  useEffect(() => {
    loadCatalogParts();
  }, [loadCatalogParts]);

  // Busca dados na API Python quando uma peça 3D é clicada e abre a Gaveta Lateral Direita
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

  // Recarrega a peça aberta caso o usuário faça upgrade para PRO com a gaveta aberta
  useEffect(() => {
    if (selectedMesh && isDrawerOpen) {
      handleSelectMesh(selectedMesh);
    }
  }, [role, selectedMesh, isDrawerOpen, handleSelectMesh]);

  // Filtra peças pela barra de busca superior
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
          `A frota completa da marca ${BRANDS_CATALOG[newBrand].label} é exclusiva para assinantes do plano PRO.`
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
        `O modelo "${modelObj.name}" requer licença PRO ativa para carregamento da malha 3D.`
      );
      return;
    }
    setPremiumAlert(null);
    setSelectedModel(newModelId);
  };

  const customMeshes: CustomMeshDefinition[] = allCatalogParts
    .filter((p) => !CORE_MESHES.includes(p.mesh_name))
    .map((p) => ({
      mesh_name: p.mesh_name,
      name: p.name,
      explosion_vector: p.explosion_vector,
    }));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900">
      {/* 1. MENU LATERAL FIXO (SIDEBAR) */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          // Fecha a gaveta de detalhes da peça e alertas caso saia da visualização do carro 3D
          if (sec !== "painel") {
            setIsDrawerOpen(false);
            setPremiumAlert(null);
          }
        }}
      />

      {/* 2. ÁREA PRINCIPAL (MAIN CONTENT) */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
        {/* BARRA SUPERIOR DE FILTROS E BUSCA GLOBAL (Exibida SOMENTE na apresentação do carro 3D) */}
        {activeSection === "painel" && (
          <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
            {/* Seletores de Marca e Modelo */}
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
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Barra de Busca Global Rápida (Carros ou Peças por Nome / Código OEM) */}
            <div className="relative w-full max-w-md">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar peça por nome, código OEM (ex: 12-12) ou malha..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Dropdown Limpo de Resultados da Busca Rápida */}
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
                            Inspecionar 3D
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

        {/* Aviso Elegante de Acesso Negado caso usuário FREE tente acessar um veículo/recurso exclusivo PRO */}
        {premiumAlert && (
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
                Desbloquear com Licença PRO →
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

        {/* CONTEÚDO CENTRAL: O PALCO 3D GIGANTE (Ou abas secundárias da Sidebar) */}
        <main className="relative flex-1 overflow-y-auto p-6 bg-slate-50/40">
          {activeSection === "painel" && (
            <div className="relative h-[82vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Único Botão Flutuante Minimalista no Canto: Modo Raio-X (Explodir Peças) */}
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

              {/* O Palco 3D Gigante */}
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
                  Catálogo de Frota & Modelos 3D
                </h2>
                <p className="text-xs text-slate-500">
                  Selecione um veículo homologado para abrir no Palco 3D ou gerencie sua licença.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card Ativo: BMW X1 */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      Liberado
                    </span>
                    <h3 className="mt-2 text-base font-bold text-slate-900">
                      BMW X1 sDrive20i (2024)
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Motor 2.0L TwinPower Turbo B48 • {allCatalogParts.length} componentes mapeados
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

                {/* Cards Restritos ao Plano PRO (Acesso Negado para FREE) */}
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
                          {locked ? "Exclusivo PRO" : "Liberado PRO"}
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
                          Acesso Restrito (Ativar PRO)
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
                    Gerencie seu nível de acesso na plataforma Shift3D
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <span className="block text-[11px] font-semibold uppercase text-slate-400">
                    Plano Atual da Organização
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
                  <button
                    type="button"
                    onClick={() => window.localStorage.setItem("shift3d_active_role", "FREE")}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    Licença PRO Ativa
                  </button>
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
