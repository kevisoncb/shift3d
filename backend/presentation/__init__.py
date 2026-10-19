"""
Pacote da Camada de Apresentação (Presentation Layer) do Shift3D.
Exporta os roteadores FastAPI e as dependências de controle de acesso.
"""

from .dependencies import get_car_repository, get_current_user, require_role
from .routes import admin_router, app_router, public_router

__all__ = [
    "public_router",
    "app_router",
    "admin_router",
    "get_car_repository",
    "get_current_user",
    "require_role",
]
