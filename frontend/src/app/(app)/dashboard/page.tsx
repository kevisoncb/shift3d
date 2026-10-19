/**
 * Ambiente `(app)` — Rota explícita `/dashboard` do Sistema Principal do Usuário.
 *
 * Isolado estritamente dentro de `src/app/(app)/dashboard/page.tsx` para futura separação
 * por subdomínio (`app.shift3d.com`). Destino automático pós-login de contas comuns (`FREE` e `PRO`).
 */

import React from "react";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";

export default function AppMainDashboardRoute() {
  return <DashboardWorkspace />;
}
