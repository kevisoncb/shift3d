"""
Injeção de Dependências e Segurança RBAC (Role-Based Access Control) - Shift3D.

Este módulo pertence à Camada de Apresentação (Presentation Layer) e fornece:
1. Resolução do usuário autenticado/simulado a partir do cabeçalho HTTP `X-User-Role`
   ou parâmetro de query, facilitando a troca rápida de perfil em tempo real no Front-end
   (FREE, PRO e ADMIN).
2. A Dependency Factory `require_role` exigida pela arquitetura para proteger rotas
   sensíveis (como `/api/v1/admin`).
"""

from typing import Callable, List, Optional
from fastapi import Depends, Header, HTTPException, Query, status

from domain.entities import User, UserRole
from domain.repositories import AbstractCarRepository
from infrastructure.repositories import car_repository_singleton


# Perfis simulados padrão para testes rápidos em tempo real
MOCK_USERS_BY_ROLE = {
    UserRole.FREE: User(
        id="usr-free-01",
        name="Carlos Entusiasta (Plano FREE)",
        email="carlos.free@shift3d.io",
        role=UserRole.FREE,
    ),
    UserRole.PRO: User(
        id="usr-pro-01",
        name="Oficina Stark Performance (Assinante PRO)",
        email="contato@starkperformance.com.br",
        role=UserRole.PRO,
    ),
    UserRole.ADMIN: User(
        id="usr-admin-01",
        name="Engenheiro Chefe Shift3D (ADMIN)",
        email="admin@shift3d.io",
        role=UserRole.ADMIN,
    ),
}


def get_car_repository() -> AbstractCarRepository:
    """
    Dependency do FastAPI que injeta a instância do repositório de veículos e peças.
    """
    return car_repository_singleton


def get_current_user(
    x_user_role: Optional[str] = Header(
        default="FREE",
        alias="X-User-Role",
        description="Cabeçalho HTTP que define o perfil ativo na simulação (FREE, PRO ou ADMIN)",
    ),
    role_query: Optional[str] = Query(
        default=None,
        alias="role",
        description="Parâmetro opcional de query para sobrescrever a role em testes diretos no navegador",
    ),
) -> User:
    """
    Resolve e retorna a entidade `User` correspondente ao perfil enviado pelo Front-end.
    Prioriza o query param `?role=` se informado, ou utiliza o header `X-User-Role`.
    """
    raw_role = (role_query or x_user_role or "FREE").strip().upper()
    try:
        resolved_role = UserRole(raw_role)
    except ValueError:
        resolved_role = UserRole.FREE

    return MOCK_USERS_BY_ROLE[resolved_role]


def require_role(allowed_roles: List[UserRole]) -> Callable[[User], User]:
    """
    Fábrica de Dependências (Dependency Factory) para controle de acesso baseado em papéis (RBAC).
    
    Verifica se a Role do usuário atual está contida na lista `allowed_roles`.
    Caso contrário, interrompe a requisição com HTTP 403 Forbidden detalhado em Português.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            allowed_names = ", ".join([r.value for r in allowed_roles])
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Acesso negado: Seu perfil atual é '{current_user.role.value}', "
                    f"mas este recurso exige um dos seguintes perfis: [{allowed_names}]."
                ),
            )
        return current_user

    return role_checker
