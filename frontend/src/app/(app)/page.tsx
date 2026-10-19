/**
 * Ambiente `(app)` — Sistema Principal do Usuário (`/dashboard` e raiz `/`).
 *
 * Contém o layout corporativo com menu lateral fixo (`Sidebar`), barra superior de filtros
 * de marca/modelo e busca global, o Palco 3D Gigante (`w-full h-[82vh]`) e a Gaveta Lateral Direita (`Drawer`).
 */

import React from "react";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";

export default function AppRootDashboardPage() {
  return <DashboardWorkspace />;
}
