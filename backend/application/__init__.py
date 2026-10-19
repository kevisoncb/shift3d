"""
Pacote da Camada de Aplicação (Application Layer) do Shift3D.
Exporta os casos de uso e DTOs.
"""

from .dtos import (
    CarSummaryDTO,
    CreateCrossReferenceInputDTO,
    CreatePartInputDTO,
    CrossReferenceDTO,
    PartResponseDTO,
)
from .use_cases import (
    GetPartByMeshUseCase,
    ListCarsCatalogUseCase,
    RegisterGlobalPartAdminUseCase,
)

__all__ = [
    "CrossReferenceDTO",
    "PartResponseDTO",
    "CarSummaryDTO",
    "CreateCrossReferenceInputDTO",
    "CreatePartInputDTO",
    "GetPartByMeshUseCase",
    "ListCarsCatalogUseCase",
    "RegisterGlobalPartAdminUseCase",
]
