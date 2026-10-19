/**
 * Layout Raiz (`RootLayout`) do Next.js App Router - Shift3D.
 *
 * Fornece o `RoleProvider` global. A estrutura de Sidebar fixa e Área Principal
 * é gerenciada diretamente dentro do `DashboardWorkspace` e do Backoffice `/admin`.
 */

import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";

export const metadata: Metadata = {
  title: "Shift3D | Painel de Controle Automotivo 3D & Cross-Reference",
  description:
    "Sistema SaaS corporativo de inspeção automotiva em 3D para consulta de códigos OEM e peças equivalentes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
