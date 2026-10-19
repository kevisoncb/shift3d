# 🏎️ Shift3D — Plataforma SaaS 3D de Equivalência Automotiva (Cross-Reference)

Arquitetura completa das **Fases 1 e 2 unificadas** construída segundo os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**.

---

## 🏗️ Estrutura do Projeto

### Parte 1: Back-end Python (`/backend` — FastAPI + DDD)
- `domain/entities.py`: Entidades puras de domínio (`User`, `UserRole` com `FREE`, `PRO`, `ADMIN`, `Car`, `Part` com campo obrigatório `mesh_name` e `CrossReference`).
- `domain/repositories.py`: Contrato abstrato `AbstractCarRepository`.
- `application/dtos.py`: Data Transfer Objects tipados com Pydantic v2.
- `application/use_cases.py`:
  - `GetPartByMeshUseCase`: Aplica a **Trava Freemium** (`is_locked: True` para `FREE`, ocultando o código da peça equivalente, e `is_locked: False` liberando tudo para `PRO` e `ADMIN`).
  - `RegisterGlobalPartAdminUseCase`: Cadastro e atualização global de peças vinculadas a um `mesh_name` pelo Administrador.
- `infrastructure/repositories.py`: Repositório em memória inicializado com o **Mock completo da BMW X1 (`bmw-x1-2024`)**, incluindo:
  - `mesh_hood_01` (Capô dianteiro em alumínio)
  - `mesh_engine_01` (Bloco do Motor 2.0 TwinPower Turbo)
  - `mesh_spark_plug` (Jogo de Velas Laser Iridium com **equivalência mais barata da Fiat Toro/Pulse 1.3 Turbo — 75% de economia**)
  - `mesh_wheels` (Conjunto de Rodas Aro 19" & Sensor ABS/TPMS com **equivalência Continental/Fiat**)
- `infrastructure/database.py`: Preparação completa para **PostgreSQL / Supabase** (`SQLAlchemy 2.0` + DDL SQL pronto).
- `presentation/dependencies.py`: Controle de acesso RBAC com a Dependency `require_role`.
- `presentation/routes.py`: Rotas separadas em `/api/v1/public`, `/api/v1/app` e `/api/v1/admin`.

### Parte 2: Front-end Next.js + 3D (`/frontend` — App Router + React Three Fiber)
- `src/app/(public)/page.tsx`: Landing Page comercial (tema escuro automotivo estilo Tony Stark HUD) + Simulador de Login e troca rápida entre `FREE`, `PRO` e `ADMIN`.
- `src/app/(app)/cockpit/page.tsx`: O **Cockpit 3D Responsivo** com o botão **"Explodir Peças (Modo Raio-X)"** e Drawer lateral dinâmico.
- `src/components/CarViewer3D.tsx`: Cena 3D interativa em `@react-three/fiber` e `@react-three/drei` com **Raycasting/Highlight**, etiquetas holográficas e animação suave de coordenadas XYZ no Modo Raio-X.
- `src/components/PartDrawerPanel.tsx`: Painel lateral exibindo preço OEM, link de compra e a seção **"Peças Equivalentes Mais Baratas"** (com efeito *blur*/cadeado se `is_locked: true` ou a peça da Fiat liberada se `PRO`/`ADMIN`).
- `src/app/(admin)/admin/page.tsx`: **Painel Backoffice** com Dashboard e formulário funcional conectado a `POST /api/v1/admin/parts` para cadastrar novas peças vinculadas a um `mesh_name`.
