/**
 * Cliente HTTP de Integração com a API Python FastAPI (/backend) - Shift3D.
 *
 * Centraliza todas as chamadas REST para `/api/v1/public`, `/api/v1/app` e `/api/v1/admin`,
 * injetando automaticamente o cabeçalho `X-User-Role` com o perfil ativo (`FREE`, `PRO` ou `ADMIN`).
 * Inclui também um Fallback inteligente local (Offline-First Resiliency) caso o servidor Python
 * na porta 8000 esteja sendo reiniciado, garantindo que a experiência 3D nunca quebre.
 */

import { UserRoleType } from "@/context/RoleContext";

export interface CrossReferenceItem {
  id: string;
  compatible_brand: string;
  compatible_model: string;
  compatible_part_number: string;
  estimated_price: number;
  compatibility_notes: string;
  purchase_url: string;
  savings_percentage: number;
  is_locked: boolean;
}

export interface PartData {
  id: string;
  car_id: string;
  name: string;
  mesh_name: string;
  oem_code: string;
  original_brand: string;
  original_price: number;
  category: string;
  description: string;
  purchase_url: string;
  explosion_vector: [number, number, number];
  cross_references: CrossReferenceItem[];
  viewer_role: UserRoleType;
}

export interface CreatePartPayload {
  car_id: string;
  name: string;
  mesh_name: string;
  oem_code: string;
  original_brand: string;
  original_price: number;
  category: string;
  description: string;
  purchase_url: string;
  explosion_vector: [number, number, number];
  cross_references: {
    compatible_brand: string;
    compatible_model: string;
    compatible_part_number: string;
    estimated_price: number;
    compatibility_notes: string;
    purchase_url: string;
  }[];
}

// URL base do Back-end FastAPI
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Cache espelhado em memória local para sincronia imediata caso a API esteja indisponível
const LOCAL_FALLBACK_PARTS: Record<string, Omit<PartData, "viewer_role">> = {
  mesh_hood_01: {
    id: "part-bmw-hood-01",
    car_id: "bmw-x1-2024",
    name: "Capô Dianteiro em Alumínio Aerodinâmico",
    mesh_name: "mesh_hood_01",
    oem_code: "41-61-7-483-901",
    original_brand: "BMW Genuine Parts",
    original_price: 8490.0,
    category: "Carroceria Externa",
    description:
      "Capô estrutural estampado em liga de alumínio de alta absorção de impacto. No Modo Raio-X (Visão Explodida), esta peça é deslocada verticalmente no eixo Y para liberar o acesso visual e clique direto no motor e nas velas de ignição.",
    purchase_url: "https://www.bmw.com.br",
    explosion_vector: [0.0, 1.85, 0.35],
    cross_references: [
      {
        id: "cr-hood-01",
        compatible_brand: "Fiat / Mopar Estamparia Homologada (Aftermarket)",
        compatible_model: "Linha SUV Compacto / Estamparia Equivalente Tong Yang",
        compatible_part_number: "TY-BMX1-41617",
        estimated_price: 2390.0,
        compatibility_notes:
          "Chapa em alumínio tratada com primer anticorrosivo cataforético. Mesma furação de dobradiças e trava frontal sem necessidade de adaptação.",
        purchase_url: "https://lista.mercadolivre.com.br/capo-bmw-x1",
        savings_percentage: 71.8,
        is_locked: false,
      },
    ],
  },
  mesh_engine_01: {
    id: "part-bmw-engine-01",
    car_id: "bmw-x1-2024",
    name: "Conjunto Motor 2.0L TwinPower Turbo (B48) & Bomba d'Água Auxiliar",
    mesh_name: "mesh_engine_01",
    oem_code: "11-00-2-455-312",
    original_brand: "BMW Genuine Parts",
    original_price: 4850.0,
    category: "Motor & Arrefecimento",
    description:
      "Conjunto central do propulsor 4 cilindros 16V Turbo com atuador eletrônico e módulo de arrefecimento integrado. Posicionado no cofre central abaixo do capô.",
    purchase_url: "https://www.bmw.com.br",
    explosion_vector: [0.0, 0.45, 0.0],
    cross_references: [
      {
        id: "cr-engine-01",
        compatible_brand: "Fiat / Pierburg OEM (Fornecedor Compartilhado Stellantis/BMW)",
        compatible_model: "Fiat Toro / Jeep Compass 2.0 & 1.3 Turbo (Atuador/Bomba Pierburg)",
        compatible_part_number: "PIERBURG-7.07223.05.0",
        estimated_price: 1190.0,
        compatibility_notes:
          "A Pierburg fornece exatamente a mesma válvula/bomba auxiliar de circulação para a linha Fiat/Jeep Turbo e BMW B48. Conector elétrico de 3 vias 100% Plug & Play.",
        purchase_url: "https://lista.mercadolivre.com.br/bomba-auxiliar-pierburg-bmw",
        savings_percentage: 75.5,
        is_locked: false,
      },
    ],
  },
  mesh_spark_plug: {
    id: "part-bmw-spark-01",
    car_id: "bmw-x1-2024",
    name: "Jogo de Velas de Ignição Laser Iridium de Alta Performance",
    mesh_name: "mesh_spark_plug",
    oem_code: "12-12-0-040-551",
    original_brand: "BMW Genuine Parts",
    original_price: 1680.0,
    category: "Ignição & Injeção",
    description:
      "Velas de ignição com eletrodo central em Irídio e terra em Platina para motores de injeção direta turboalimentados. Localizada no cabeçote interno do motor (ative o Modo Raio-X para visualizar e clicar facilmente!).",
    purchase_url: "https://www.bmw.com.br",
    explosion_vector: [0.0, 1.15, -0.15],
    cross_references: [
      {
        id: "cr-spark-fiat-01",
        compatible_brand: "Fiat Genuína (Mopar / NGK Laser Iridium)",
        compatible_model: "Fiat Fastback / Toro / Pulse Abarth 1.3 Turbo T270",
        compatible_part_number: "FIAT-55282627 / SILZKGR8B8S",
        estimated_price: 420.0,
        compatibility_notes:
          "Achado de Ouro Shift3D: A vela NGK Laser Iridium vendida na caixa da Fiat/Mopar (código 55282627) possui exatamente a mesma rosca M12x1.25, alcance de 26.5mm, grau térmico 8 e gap de 0.8mm da vela genuína BMW B48, custando 75% menos!",
        purchase_url: "https://lista.mercadolivre.com.br/vela-iridium-fiat-toro-1-3-turbo",
        savings_percentage: 75.0,
        is_locked: false,
      },
    ],
  },
  mesh_wheels: {
    id: "part-bmw-wheels-01",
    car_id: "bmw-x1-2024",
    name: 'Conjunto de Rodas M Sport Aro 19" & Sensor ABS / TPMS de Cubo',
    mesh_name: "mesh_wheels",
    oem_code: "36-11-8-093-922",
    original_brand: "BMW M Performance OEM",
    original_price: 3290.0,
    category: "Rodas, Freios & Suspensão",
    description:
      "Conjunto de rodagem em liga leve diamantada com sensor eletrônico de velocidade de roda (ABS/DSC) e válvula de telemetria de pressão (TPMS) 433MHz.",
    purchase_url: "https://www.bmw.com.br",
    explosion_vector: [1.4, 0.0, 0.0],
    cross_references: [
      {
        id: "cr-wheels-fiat-01",
        compatible_brand: "Fiat / Continental VDO (Sensor TPMS / ABS 433MHz)",
        compatible_model: "Fiat Toro Ranch / Titano (Mesmo transmissor Continental 433MHz)",
        compatible_part_number: "FIAT-53394085-VDO",
        estimated_price: 580.0,
        compatibility_notes:
          "O módulo sensor de roda Continental 433MHz utilizado na linha utilitária Fiat opera no mesmo protocolo de rádio frequência e encaixe de válvula metálica da plataforma UKL2 da BMW X1.",
        purchase_url: "https://lista.mercadolivre.com.br/sensor-tpms-fiat-toro",
        savings_percentage: 82.4,
        is_locked: false,
      },
    ],
  },
};

/**
 * Aplica a regra da trava Freemium no fallback local caso a API Python esteja offline.
 */
function applyClientSideFreemiumFilter(
  rawPart: Omit<PartData, "viewer_role">,
  role: UserRoleType
): PartData {
  const isUnlocked = role === "PRO" || role === "ADMIN";
  return {
    ...rawPart,
    viewer_role: role,
    cross_references: rawPart.cross_references.map((cr) => {
      if (isUnlocked) {
        return { ...cr, is_locked: false };
      }
      return {
        ...cr,
        compatible_brand: `${cr.compatible_brand.split("/")[0].trim()} (Bloqueado no Plano FREE)`,
        compatible_model: "Assine o Shift3D PRO para visualizar o veículo doador exato",
        compatible_part_number: "🔒 ••••••••-PRO",
        compatibility_notes:
          "Especificação técnica validada pela engenharia Shift3D. Faça upgrade para liberar o código de bancada e fornecedor.",
        purchase_url: "#upgrade-pro",
        is_locked: true,
      };
    }),
  };
}

/**
 * Busca os dados de uma peça clicada no Cockpit 3D (`mesh_name`) na API Python FastAPI:
 * GET `/api/v1/app/cars/{carId}/parts/{meshName}`
 */
export async function fetchPartByMeshName(
  carId: string,
  meshName: string,
  role: UserRoleType
): Promise<{ data: PartData; source: "FASTAPI_BACKEND" | "LOCAL_FALLBACK" }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/app/cars/${encodeURIComponent(carId)}/parts/${encodeURIComponent(meshName)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": role,
        },
        cache: "no-store",
      }
    );

    if (response.ok) {
      const json: PartData = await response.json();
      return { data: json, source: "FASTAPI_BACKEND" };
    }
  } catch {
    // Continua silenciosamente para o fallback caso o backend local na porta 8000 não esteja rodando
  }

  // Verifica se há peças customizadas salvas via Admin no localStorage
  if (typeof window !== "undefined") {
    const customStored = window.localStorage.getItem("shift3d_custom_parts");
    if (customStored) {
      try {
        const parsedCustom: Record<string, Omit<PartData, "viewer_role">> = JSON.parse(customStored);
        if (parsedCustom[meshName]) {
          return {
            data: applyClientSideFreemiumFilter(parsedCustom[meshName], role),
            source: "LOCAL_FALLBACK",
          };
        }
      } catch {
        // Ignora erro de parse
      }
    }
  }

  const fallback = LOCAL_FALLBACK_PARTS[meshName] || LOCAL_FALLBACK_PARTS["mesh_spark_plug"];
  return {
    data: applyClientSideFreemiumFilter(fallback, role),
    source: "LOCAL_FALLBACK",
  };
}

/**
 * Lista todas as peças cadastradas no veículo (para o Cockpit 3D e para o Dashboard Admin).
 */
export async function fetchAllCarParts(
  carId: string,
  role: UserRoleType
): Promise<PartData[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/app/cars/${encodeURIComponent(carId)}/parts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": role,
        },
        cache: "no-store",
      }
    );
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback
  }

  const merged: Record<string, Omit<PartData, "viewer_role">> = { ...LOCAL_FALLBACK_PARTS };
  if (typeof window !== "undefined") {
    const customStored = window.localStorage.getItem("shift3d_custom_parts");
    if (customStored) {
      try {
        Object.assign(merged, JSON.parse(customStored));
      } catch {
        // Ignora
      }
    }
  }

  return Object.values(merged).map((p) => applyClientSideFreemiumFilter(p, role));
}

/**
 * Cadastra ou atualiza globalmente uma peça vinculada a um `mesh_name` via Painel Admin:
 * POST `/api/v1/admin/parts` (protegido por `require_role([UserRole.ADMIN])`).
 */
export async function registerPartAsAdmin(
  payload: CreatePartPayload,
  role: UserRoleType
): Promise<{ part: PartData; syncedWithBackend: boolean }> {
  if (role !== "ADMIN") {
    throw new Error(
      `Acesso Negado (403): Seu perfil atual é '${role}'. Altere para 'ADMIN' na barra superior para cadastrar peças globalmente.`
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/parts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": role,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const created: PartData = await response.json();
      return { part: created, syncedWithBackend: true };
    }
  } catch {
    // Persiste também no localStorage caso o servidor FastAPI esteja offline
  }

  const savingsPct =
    payload.original_price > 0 && payload.cross_references[0]
      ? Number(
          (
            ((payload.original_price - payload.cross_references[0].estimated_price) /
              payload.original_price) *
            100
          ).toFixed(1)
        )
      : 65.0;

  const newPart: Omit<PartData, "viewer_role"> = {
    id: `part-custom-${Date.now()}`,
    car_id: payload.car_id,
    name: payload.name,
    mesh_name: payload.mesh_name.trim(),
    oem_code: payload.oem_code.trim(),
    original_brand: payload.original_brand,
    original_price: payload.original_price,
    category: payload.category,
    description: payload.description,
    purchase_url: payload.purchase_url,
    explosion_vector: payload.explosion_vector,
    cross_references: payload.cross_references.map((cr, idx) => ({
      id: `cr-custom-${Date.now()}-${idx}`,
      ...cr,
      savings_percentage: savingsPct,
      is_locked: false,
    })),
  };

  if (typeof window !== "undefined") {
    const existingRaw = window.localStorage.getItem("shift3d_custom_parts");
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    existing[newPart.mesh_name] = newPart;
    window.localStorage.setItem("shift3d_custom_parts", JSON.stringify(existing));
  }

  return {
    part: applyClientSideFreemiumFilter(newPart, role),
    syncedWithBackend: false,
  };
}
