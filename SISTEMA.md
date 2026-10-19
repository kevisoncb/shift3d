# 🧠 SISTEMA.md — Documento Mestre de Arquitetura, Estado e Continuidade (Shift3D)

> **⚠️ REGRA DE OURO PARA O AGENTE DE IA (EM QUALQUER PC):**
> Este projeto é desenvolvido em **2 computadores diferentes**. Como o histórico do chat local pode não estar presente ao trocar de máquina, **VOCÊ (AGENTE) DEVE SEMPRE LER ESTE ARQUIVO ANTES DE QUALQUER AÇÃO** e **SEMPRE ATUALIZÁ-LO** ao finalizar qualquer nova tarefa, funcionalidade ou correção. Isso garante que nunca fugiremos do tema, das regras de negócio ou do padrão arquitetural.

---

## 🎯 1. Visão Geral e Tema Central do Produto (Shift3D)
O **Shift3D** é uma plataforma **SaaS Freemium Automotiva** onde usuários interagem com modelos 3D de carros (visão explodida / Modo Raio-X com peças clicáveis estilo *Tony Stark HUD*) para:
1. Consultar o **Código Original da Montadora (OEM)** e o preço tabelado na concessionária.
2. Descobrir **Peças Equivalentes Mais Baratas de outras marcas (Cross-Reference)** — por exemplo, uma peça genuína da **Fiat / Mopar, Bosch ou Pierburg** que possui exatamente a mesma especificação técnica de uma peça da **BMW X1**, custando até **75% menos**.

---

## 📏 2. Regras Inegociáveis de Qualidade (Guardrails)
1. **Idioma Híbrido Padronizado:**
   - **Código-fonte** (variáveis, classes, funções, nomes de arquivos, rotas e propriedades): **100% em Inglês**.
   - **Documentação interna** (comentários, docstrings, mensagens de erro e explicações na UI): **100% em Português do Brasil (pt-BR)**.
2. **Padrão Arquitetural Back-end:**
   - **Clean Architecture + Domain-Driven Design (DDD)** rigoroso em Python (`FastAPI`).
   - Divisão obrigatória em 4 camadas dentro de `/backend`:
     - `domain/` (Entidades puras e interfaces abstratas de repositório; zero dependência de frameworks).
     - `application/` (Casos de uso / Use Cases e DTOs; onde reside a lógica da **Trava Freemium**).
     - `infrastructure/` (Implementação de repositórios em memória e configuração SQLAlchemy/Supabase).
     - `presentation/` (Rotas FastAPI divididas em `/api/v1/public`, `/api/v1/app`, `/api/v1/admin` e controle RBAC com `require_role`).
3. **Vínculo Obrigatório 3D (`mesh_name`):**
   - Nenhuma entidade `Part` pode existir sem o campo obrigatório `mesh_name`. Ele é a ponte exata entre a malha clicada na cena 3D (`@react-three/fiber`) e o registro no Back-end Python.
4. **Regra da Trava Freemium (Paywall Logic):**
   - **Perfil `FREE`:** Visualiza e gira o carro 3D, usa o Modo Raio-X e vê os dados da peça original (OEM), mas a lista `cross_references` vem bloqueada do Back-end com `is_locked: True` (ocultando código equivalente e link de compra, exibindo efeito *blur* e cadeado no Front-end).
   - **Perfis `PRO` e `ADMIN`:** Recebem `is_locked: False`, desbloqueando integralmente a marca, veículo doador, Part Number equivalente (ex: peça da Fiat) e link de compra.

---

## ✅ 3. O Que Já Foi Feito (Log de Alterações — Fases 1 e 2 Unificadas)

### 📅 Entrega 01 — Base Funcional Completa (Fases 1 e 2 Unificadas)
**Status:** ✅ Concluído, Compilado e Validado.

#### 🔹 Back-end (`/backend` — Python + FastAPI + DDD)
- [x] `backend/domain/entities.py`: Criadas as entidades `User`, `UserRole` (`FREE`, `PRO`, `ADMIN`), `Car`, `Part` (com validação de `mesh_name` obrigatório) e `CrossReference`.
- [x] `backend/domain/repositories.py`: Criada a interface abstrata `AbstractCarRepository`.
- [x] `backend/application/dtos.py`: Criados os DTOs de entrada e saída com Pydantic v2 (`PartResponseDTO`, `CrossReferenceDTO`, `CreatePartInputDTO`, `CarSummaryDTO`).
- [x] `backend/application/use_cases.py`:
  - Implementado `GetPartByMeshUseCase` aplicando a trava Freemium (`is_locked: True` para `FREE` e `is_locked: False` para `PRO`/`ADMIN`) e cálculo automático de percentual de economia (`savings_percentage`).
  - Implementado `ListCarsCatalogUseCase` para listagem do catálogo 3D.
  - Implementado `RegisterGlobalPartAdminUseCase` para cadastro/atualização global de peças vinculadas a um `mesh_name` pelo Admin.
- [x] `backend/infrastructure/repositories.py`: Implementado `InMemoryCarRepository` com Mock completo da **BMW X1 (`bmw-x1-2024`)** e 4 malhas iniciais:
  1. `mesh_hood_01` — Capô Dianteiro em Alumínio (R$ 8.490 OEM vs R$ 2.390 Equivalente).
  2. `mesh_engine_01` — Conjunto Motor 2.0L TwinPower Turbo B48 & Bomba Auxiliar (R$ 4.850 OEM vs R$ 1.190 Pierburg/Fiat Toro).
  3. `mesh_spark_plug` — Jogo de Velas Laser Iridium (R$ 1.680 OEM BMW vs **R$ 420 Genuína Fiat Toro/Pulse 1.3 Turbo — 75% de economia**).
  4. `mesh_wheels` — Conjunto de Rodas Aro 19" & Sensor ABS/TPMS (R$ 3.290 OEM vs R$ 580 Continental/Fiat).
- [x] `backend/infrastructure/database.py`: Criada preparação para **PostgreSQL / Supabase** com variável `DATABASE_URL` e script DDL SQL (`cars`, `parts`, `cross_references`).
- [x] `backend/presentation/dependencies.py`: Implementado injetor de usuário simulado via header `X-User-Role` e a Dependency `require_role`.
- [x] `backend/presentation/routes.py` & `backend/main.py`: Criadas as rotas `/api/v1/public/*`, `/api/v1/app/*` e `/api/v1/admin/*` com CORS liberado.

#### 🔹 Front-end (`/frontend` — Next.js 14 App Router + React Three Fiber + TailwindCSS)
- [x] `frontend/src/context/RoleContext.tsx`: Contexto global para alternar instantaneamente em tempo real entre `FREE`, `PRO` e `ADMIN`.
- [x] `frontend/src/components/NavbarRoleSwitcher.tsx`: Barra superior estilo *Stark HUD* com navegação entre as 3 áreas e botões de troca rápida de perfil.
- [x] `frontend/src/app/(public)/page.tsx`: Landing page comercial moderna (tema escuro automotivo) + Simulador interativo de Login RBAC.
- [x] `frontend/src/components/CarViewer3D.tsx`: Componente 3D com `@react-three/fiber` e `@react-three/drei`:
  - Modelo 3D procedural da BMW X1 dividido nas malhas clicáveis `mesh_hood_01`, `mesh_engine_01`, `mesh_spark_plug` e `mesh_wheels` (além de renderizar dinamicamente novas malhas criadas no `/admin`).
  - Raycasting e Highlight luminoso ao passar o mouse ou tocar/clicar na peça.
  - Modo **"Explodir Peças (Modo Raio-X)"** que interpola suavemente (`THREE.MathUtils.lerp`) as coordenadas XYZ das peças externas para permitir clicar nas peças internas do motor.
  - Suporte completo a Desktop Mouse e Mobile Touch (`Pinch-to-Zoom`).
- [x] `frontend/src/components/PartDrawerPanel.tsx`: Drawer lateral responsivo exibindo dados OEM e a seção **"Peças Equivalentes Mais Baratas"** (aplicando `blur` + cadeado se `is_locked: true` ou exibindo a peça da Fiat liberada se `PRO`/`ADMIN`).
- [x] `frontend/src/app/(app)/cockpit/page.tsx`: Página integrada do Cockpit 3D conectada à API Python.
- [x] `frontend/src/app/(admin)/admin/page.tsx`: Painel Backoffice com Dashboard de métricas e formulário funcional conectado a `POST /api/v1/admin/parts`.

### 📅 Entrega 02 — Redesign Visual Completo (Overhaul: Estilo Concessionária Moderna & Minimalista)
**Status:** ✅ Concluído e Validado.
- [x] **Nova Identidade Visual (Light Mode Corporativo):** Substituição completa do tema escuro antigo por uma interface corporativa limpa inspirada em plataformas oficiais de montadoras, Apple e Stripe (`bg-slate-50`, containers `bg-white`, bordas sutis `border-slate-200/80` e sombras elegantes `shadow-sm`).

### 📅 Entrega 03 — Arquitetura Dashboard SaaS Corporativo (Sidebar Fixa + Palco 3D Gigante + Gaveta Deslizante + Login Admin Real)
**Status:** ✅ Concluído e Validado.
- [x] **Estrutura de Tela (Dashboard Layout):**
  - `Sidebar` (`NavbarRoleSwitcher.tsx`): Menu lateral fixo à esquerda com fundo `bg-slate-50`, borda fina à direita, logotipo minimalista do Shift3D, navegação limpa (`Painel & Palco 3D`, `Frota / Carros`, `Configurações`) e perfil do usuário na base.
  - `DashboardWorkspace.tsx`: Área principal unificada para usuários `FREE` e `PRO` (mesmo sistema, onde recursos exclusivos apresentam acesso restrito por não ser assinante PRO).
- [x] **Filtros e Busca Superior (Exclusivos do Palco 3D):** Barra de ferramentas limpa no topo da área principal exibida **somente** durante a apresentação do carro 3D (`activeSection === "painel"`), ocultando-se automaticamente nas abas `Frota / Carros` e `Configurações`.
- [x] **O Palco 3D Gigante (Foco Absoluto):** Visualizador 3D ocupando o centro da tela (`w-full h-[82vh]`), sem cards flutuantes desnecessários, contendo apenas um único botão minimalista no canto superior direito para **"Modo Raio-X (Explodir Peças)"**.
- [x] **Gaveta Lateral Direita Deslizante (`PartDrawerPanel.tsx`):** Desliza suavemente da direita ao clicar em uma peça do carro 3D, com design de ficha técnica de engenharia (nome da peça, preço médio de mercado e seção de Peças Similares / Afiliados exibindo dados completos para `PRO` ou convite elegante para `FREE`).
- [x] **Acesso Administrativo via Login (`/login` -> `/admin`):** Criada a página de Login Corporativo (`src/app/(public)/login/page.tsx`). A página `/admin` exige login com credenciais administrativas e não utiliza boxes clicáveis de simulador soltas pelo site.

### 📅 Entrega 04 — Isolamento Estrito de Ambientes App Router (`(public)`, `(app)`, `(admin)`) & Validação Full-Stack E2E
**Status:** ✅ Concluído, Testado e Sincronizado na branch `dev`.
- [x] **Isolamento de Rotas para Futura Separação por Subdomínios:**
  - `src/app/(public)/`: Contém a Landing Page Institucional e materiais de vendas (`/institucional`) e a página de Login Unificada (`/login`).
  - `src/app/(app)/`: Contém o Sistema Principal do Usuário nas rotas `/` (`src/app/(app)/page.tsx`), `/dashboard` (`src/app/(app)/dashboard/page.tsx`) e `/cockpit` (`src/app/(app)/cockpit/page.tsx`), encapsulando `Sidebar`, Barra Superior de Filtros (conectada a `/api/v1/public/cars`), Palco 3D Gigante (`w-full h-[82vh]`) e Gaveta Lateral Direita (`PartDrawerPanel`).
  - `src/app/(admin)/`: Contém o Backoffice restrito (`/admin` em `src/app/(admin)/admin/page.tsx`), acessível apenas após login administrativo.
- [x] **Redirecionamentos Inteligentes de Login (`RoleContext.tsx`):**
  - Contas comuns (`FREE` e `PRO`) são redirecionadas automaticamente para `/dashboard` (`src/app/(app)`).
  - Contas administrativas (`admin@shift3d.com.br`) são redirecionadas automaticamente para `/admin` (`src/app/(admin)`).
- [x] **Integração Full-Stack Validada (Next.js ↔ FastAPI):** Testadas e validadas todas as rotas `GET /api/v1/public/cars`, `GET /api/v1/app/cars/{id}/parts/{mesh_name}` (trava Freemium `is_locked: True` vs `False`) e `POST /api/v1/admin/parts` (cadastro global de `mesh_name` refletindo em tempo real no Palco 3D).

### 📅 Entrega 05 — Configurador 3D Avançado (Taxonomia Base Universal + Hover + Elevação Lerp + Foco Translúcido)
**Status:** ✅ Concluído, Compilado e Sincronizado na branch `dev`.
- [x] **Taxonomia Base Universal de Peças Fixas (`repositories.py` & `CarViewer3D.tsx`):**
  - Mapeadas as 7 malhas universais no Back-end e no Front-end 3D: `mesh_hood_01` (Capô), `mesh_front_bumper` (Para-choque dianteiro), `mesh_headlights` (Faróis Full LED), `mesh_doors` (Portas laterais), `mesh_wheels` (Rodas Aro 19" & Sensores), `mesh_engine_01` (Motor 2.0 Turbo) e `mesh_spark_plug` (Velas de Ignição com equivalência Fiat), mantendo extensibilidade dinâmica para malhas extras criadas no `/admin`.
- [x] **Interação Visual de Configurador Automotivo (`CarViewer3D.tsx`):**
  - **Hover (`onPointerOver`):** Brilho azul claro (`#38BDF8`) e leve elevação instantânea ao passar o mouse sobre qualquer peça clicável.
  - **Clique & Elevação (`selectionOffset` com `lerp`):** A peça clicada eleva-se/desloca-se suavemente para fora do eixo do carro enquanto o Drawer lateral desliza com seus dados técnicos.
  - **Foco Translúcido:** As demais peças não selecionadas ficam translúcidas (`opacity: 0.28`) para focar 100% da atenção na peça selecionada; ao clicar em outra peça, a anterior retorna suavemente à posição original e a nova peça sobe.

---

## 🚀 4. Próximos Passos Planejados (Roadmap Fase 3 e Evolução)
Sempre que formos avançar no projeto em qualquer um dos 2 PCs, seguiremos esta fila prioritária:

1. **Fase 3.1 — Carregamento de Modelos `.GLTF` / `.GLB` Reais:**
   - Evoluir o `CarViewer3D.tsx` com `useGLTF` do `@react-three/drei` para carregar arquivos `.glb` reais de veículos exportados do Blender, mantendo o modelo procedural atual como fallback automático caso o arquivo `.glb` ainda não esteja na pasta `public/models/`.
2. **Fase 3.2 — Persistência Real no Supabase / PostgreSQL:**
   - Conectar o `database.py` a um projeto real do Supabase via variável `.env` (`DATABASE_URL`), criando a classe `PostgresCarRepository(AbstractCarRepository)` e mantendo a mesma interface de domínio sem tocar nos Use Cases.
3. **Fase 3.3 — Autenticação Real (JWT / Supabase Auth) & Checkout Stripe/MercadoPago:**
   - Substituir gradualmente o simulador de header `X-User-Role` por tokens JWT reais, mantendo um "Modo Demo / Dev Switcher" para testes rápidos.
4. **Fase 3.4 — Busca Inteligente & Filtro por Sintoma / Categoria Mecânica:**
   - Adicionar barra de pesquisa no Cockpit 3D para localizar peças pelo nome ou código OEM e destacar automaticamente a malha correspondente piscando em neon no modelo 3D.

---

## 💻 5. Controle de Versão GitHub & Guia Rápido ao Trocar de Computador (PC 1 ↔ PC 2)
- **Repositório Oficial no GitHub:** `https://github.com/kevisoncb/shift3d`
- **Estratégia de Branches:**
  - `dev` (**Branch Ativa de Desenvolvimento**): Tudo o que construirmos e testarmos no dia a dia deve ser feito e comitado primeiro na branch `dev`.
  - `producao` / `main` (**Branches de Produção Estável**): Recebem merge a partir da `dev` somente quando uma entrega estiver validada e pronta para produção.

### Passo a Passo ao Trocar de Computador (PC 1 ↔ PC 2):
1. No computador novo, clone o repositório na branch `dev` (ou faça `git pull origin dev` se já estiver clonado):
   ```bash
   git clone -b dev https://github.com/kevisoncb/shift3d.git
   ```
2. Abra a pasta `shift3d` no **Antigravity**. O Agente lerá automaticamente `.agents/rules/sistema-sync.md` e este arquivo `SISTEMA.md`.
3. Para instalar dependências e rodar no PC novo:
   - **Back-end (`/backend`):** `pip install -r requirements.txt` e `python main.py` (Porta `8000`).
   - **Front-end (`/frontend`):** `npm install --legacy-peer-deps` e `npm run dev` (Porta `3000`).
