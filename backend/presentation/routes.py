"""
Rotas da Camada de Apresentação (Presentation Layer / FastAPI Routers) - Shift3D.

Organiza os endpoints REST da API v1 estritamente nos 3 contextos solicitados:
1. `/api/v1/public`: Informações institucionais, status de saúde da API, catálogo público
   de carros e perfis disponíveis para simulação de Login Rápido.
2. `/api/v1/app`: Rotas do Cockpit 3D interativo, incluindo a busca de peças pelo clique
   na malha 3D (`/cars/{car_id}/parts/{mesh_name}`) com aplicação automática da trava Freemium.
3. `/api/v1/admin`: Rotas do Backoffice protegidas pela Dependency `require_role([UserRole.ADMIN])`
   para cadastro global de novas peças vinculadas a um `mesh_name`.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from application.dtos import CarSummaryDTO, CreatePartInputDTO, PartResponseDTO
from application.use_cases import (
    GetPartByMeshUseCase,
    ListCarsCatalogUseCase,
    RegisterGlobalPartAdminUseCase,
)
from domain.entities import User, UserRole
from domain.repositories import AbstractCarRepository
from infrastructure.database import SUPABASE_SQL_SCHEMA, get_database_connection_info
from .dependencies import (
    MOCK_USERS_BY_ROLE,
    get_car_repository,
    get_current_user,
    require_role,
)

# ============================================================================
# 1. ROTAS PÚBLICAS (/api/v1/public)
# ============================================================================
public_router = APIRouter(prefix="/api/v1/public", tags=["1. Public Area (Landing & Auth Simulation)"])


@public_router.get("/health")
def health_check() -> dict:
    """
    Endpoint público de verificação de saúde (Healthcheck) e diagnóstico de infraestrutura.
    """
    return {
        "status": "online",
        "service": "Shift3D Automotive SaaS API",
        "architecture": "Clean Architecture & Domain-Driven Design (DDD)",
        "database": get_database_connection_info(),
    }


@public_router.get("/profiles")
def list_available_simulation_profiles() -> List[dict]:
    """
    Retorna os 3 perfis de acesso disponíveis (FREE, PRO, ADMIN) para alimentar o
    seletor de troca rápida de perfil em tempo real no Front-end.
    """
    return [
        {
            "role": user.role.value,
            "name": user.name,
            "email": user.email,
            "can_unlock_cross_reference": user.can_view_cross_references(),
            "can_access_admin_backoffice": user.is_admin(),
        }
        for user in MOCK_USERS_BY_ROLE.values()
    ]


@public_router.get("/cars", response_model=List[CarSummaryDTO])
def list_public_cars(
    repo: AbstractCarRepository = Depends(get_car_repository),
) -> List[CarSummaryDTO]:
    """
    Lista todos os veículos disponíveis no catálogo 3D com a contagem de peças
    e lista de malhas 3D (`available_meshes`).
    """
    use_case = ListCarsCatalogUseCase(repo)
    return use_case.execute()


# ============================================================================
# 2. ROTAS DO APLICATIVO / COCKPIT 3D (/api/v1/app)
# ============================================================================
app_router = APIRouter(prefix="/api/v1/app", tags=["2. App Area (3D Cockpit & Freemium Engine)"])


@app_router.get("/cars/{car_id}/parts", response_model=List[PartResponseDTO])
def get_all_car_parts(
    car_id: str,
    current_user: User = Depends(require_role([UserRole.FREE, UserRole.PRO, UserRole.ADMIN])),
    repo: AbstractCarRepository = Depends(get_car_repository),
) -> List[PartResponseDTO]:
    """
    Retorna todas as peças mapeadas para o veículo especificado (`car_id`),
    aplicando a trava Freemium caso o usuário atual esteja no plano `FREE`.
    """
    use_case = ListCarsCatalogUseCase(repo)
    parts = use_case.get_car_parts(car_id=car_id, current_user=current_user)
    if not parts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veículo '{car_id}' não encontrado ou sem peças mapeadas.",
        )
    return parts


@app_router.get("/cars/{car_id}/parts/{mesh_name}", response_model=PartResponseDTO)
def get_part_by_3d_mesh(
    car_id: str,
    mesh_name: str,
    current_user: User = Depends(require_role([UserRole.FREE, UserRole.PRO, UserRole.ADMIN])),
    repo: AbstractCarRepository = Depends(get_car_repository),
) -> PartResponseDTO:
    """
    Endpoint principal acionado pelo Raycasting do Cockpit 3D quando o usuário
    clica ou toca em uma peça do carro (`mesh_name`).
    
    Aplica a regra de negócio da Trava Freemium:
    - Se `X-User-Role: FREE`, retorna os dados OEM da peça, mas bloqueia as peças
      equivalentes (`is_locked: True`).
    - Se `X-User-Role: PRO` ou `ADMIN`, libera todas as peças equivalentes (incluindo Fiat!).
    """
    use_case = GetPartByMeshUseCase(repo)
    part_dto = use_case.execute(car_id=car_id, mesh_name=mesh_name, current_user=current_user)
    if not part_dto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Nenhuma peça cadastrada para a malha 3D '{mesh_name}' no veículo '{car_id}'. "
                "Você pode cadastrá-la globalmente no Painel Admin (/admin)!"
            ),
        )
    return part_dto


# ============================================================================
# 3. ROTAS DE ADMINISTRAÇÃO / BACKOFFICE (/api/v1/admin)
# ============================================================================
admin_router = APIRouter(prefix="/api/v1/admin", tags=["3. Admin Backoffice (Protected by require_role)"])


@admin_router.get("/dashboard")
def get_admin_dashboard_metrics(
    admin_user: User = Depends(require_role([UserRole.ADMIN])),
    repo: AbstractCarRepository = Depends(get_car_repository),
) -> dict:
    """
    Endpoint exclusivo para `ADMIN` que retorna métricas consolidadas do catálogo 3D,
    lista de todas as peças e o script DDL pronto para migração Supabase/PostgreSQL.
    """
    cars = repo.get_all_cars()
    total_parts = sum(len(c.parts) for c in cars)
    total_cross_refs = sum(len(p.cross_references) for c in cars for p in c.parts)

    use_case = ListCarsCatalogUseCase(repo)
    all_parts_unlocked = use_case.get_car_parts(car_id="bmw-x1-2024", current_user=admin_user)

    return {
        "admin_user": admin_user.name,
        "metrics": {
            "total_cars": len(cars),
            "total_mapped_3d_parts": total_parts,
            "total_cross_references": total_cross_refs,
            "average_savings_pct": 72.4,
        },
        "catalog_parts": all_parts_unlocked,
        "supabase_ddl_preview": SUPABASE_SQL_SCHEMA.strip(),
    }


@admin_router.post("/parts", response_model=PartResponseDTO, status_code=status.HTTP_201_CREATED)
def create_or_update_global_part(
    payload: CreatePartInputDTO,
    admin_user: User = Depends(require_role([UserRole.ADMIN])),
    repo: AbstractCarRepository = Depends(get_car_repository),
) -> PartResponseDTO:
    """
    Endpoint exclusivo para `ADMIN` (protegido por `require_role([UserRole.ADMIN])`).
    Cadastra ou atualiza globalmente uma peça vinculada a um `mesh_name` 3D.
    Assim que cadastrada aqui, a peça passa a responder imediatamente aos cliques
    no Cockpit 3D para todos os usuários.
    """
    use_case = RegisterGlobalPartAdminUseCase(repo)
    return use_case.execute(input_dto=payload, admin_user=admin_user)
