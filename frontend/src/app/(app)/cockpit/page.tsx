/**
 * Rota `/cockpit` - Shift3D.
 *
 * Mantém compatibilidade total de rota renderizando o mesmo `DashboardWorkspace` corporativo.
 */

import React from "react";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";

export default function CockpitRoutePage() {
  return <DashboardWorkspace />;
}
