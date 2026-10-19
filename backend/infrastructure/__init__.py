"""
Pacote da Camada de Infraestrutura (Infrastructure Layer) do Shift3D.
Exporta o repositório Singleton em memória e utilitários de banco de dados (PostgreSQL/Supabase).
"""

from .database import SUPABASE_DATABASE_URL, SUPABASE_SQL_SCHEMA, get_database_connection_info
from .repositories import InMemoryCarRepository, car_repository_singleton

__all__ = [
    "InMemoryCarRepository",
    "car_repository_singleton",
    "SUPABASE_DATABASE_URL",
    "SUPABASE_SQL_SCHEMA",
    "get_database_connection_info",
]
