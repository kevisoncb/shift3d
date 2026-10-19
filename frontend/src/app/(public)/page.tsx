/**
 * Rota Principal (`/`) - Shift3D.
 *
 * Renderiza diretamente a interface corporativa unificada (`DashboardWorkspace`) com
 * Menu Lateral Fixo à esquerda, Barra de Filtros/Busca no topo, Palco 3D Gigante no centro
 * e Gaveta Lateral Direita deslizante.
 * Usuários FREE e PRO navegam exatamente nesta mesma interface, com bloqueio elegante
 * nos itens restritos ao plano PRO.
 */

import React from "react";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";

export default function MainSaaSDashboardPage() {
  return <DashboardWorkspace />;
}
