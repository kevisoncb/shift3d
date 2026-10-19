"""
Pacote da Camada de Domínio (Domain Layer) do Shift3D.
Exporta as entidades centrais e contratos de repositório.
"""

from .entities import Car, CrossReference, Part, User, UserRole
from .repositories import AbstractCarRepository

__all__ = [
    "UserRole",
    "User",
    "CrossReference",
    "Part",
    "Car",
    "AbstractCarRepository",
]
