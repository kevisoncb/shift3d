"""
Data Transfer Objects (DTOs) da Camada de Aplicação - Shift3D.

Os DTOs estruturam os dados de entrada e saída dos Casos de Uso (Use Cases),
isolando as Entidades de Domínio da camada de Apresentação (FastAPI / JSON)
e permitindo aplicar transformações de segurança como a trava Freemium.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class CrossReferenceDTO(BaseModel):
    """
    DTO que representa uma peça equivalente (Cross-Reference) serializada para o Front-end.
    
    Quando `is_locked` é True (usuários do plano FREE), os dados estratégicos como
    `compatible_part_number`, `compatible_brand` detalhada e `purchase_url` são
    mascarados pela camada de Aplicação para incentivar o upgrade para o plano PRO.
    """
    id: str
    compatible_brand: str
    compatible_model: str
    compatible_part_number: str
    estimated_price: float
    compatibility_notes: str
    purchase_url: str
    savings_percentage: float
    is_locked: bool = Field(
        default=False,
        description="Indica se os dados desta peça equivalente estão bloqueados pela trava Freemium"
    )


class PartResponseDTO(BaseModel):
    """
    DTO de resposta contendo os dados completos da peça original (OEM) vinculada ao `mesh_name`
    e a lista de peças equivalentes de outras marcas (Cross-References).
    """
    id: str
    car_id: str
    name: str
    mesh_name: str
    oem_code: str
    original_brand: str
    original_price: float
    category: str
    description: str
    purchase_url: str
    explosion_vector: List[float]
    cross_references: List[CrossReferenceDTO]
    viewer_role: str = Field(
        description="Perfil do usuário que realizou a consulta (FREE, PRO ou ADMIN)"
    )


class CarSummaryDTO(BaseModel):
    """
    DTO resumido de um veículo disponível para inspeção 3D no catálogo.
    """
    id: str
    brand: str
    model: str
    year: int
    engine_spec: str
    thumbnail_url: str
    total_parts: int
    available_meshes: List[str]


class CreateCrossReferenceInputDTO(BaseModel):
    """
    DTO de entrada para cadastro de uma peça equivalente (Cross-Reference) pelo Admin.
    """
    compatible_brand: str = Field(..., min_length=2, description="Marca da peça equivalente (ex: Fiat)")
    compatible_model: str = Field(..., min_length=2, description="Modelo compatível (ex: Fiat Pulse / Toro)")
    compatible_part_number: str = Field(..., min_length=3, description="Código da peça equivalente")
    estimated_price: float = Field(..., gt=0, description="Preço estimado em Reais (R$)")
    compatibility_notes: str = Field(..., description="Notas técnicas de intercambiabilidade")
    purchase_url: str = Field(default="https://mercadolivre.com.br", description="URL para compra")


class CreatePartInputDTO(BaseModel):
    """
    DTO de entrada utilizado pelo painel Backoffice (Admin) para cadastrar ou atualizar
    globalmente uma peça vinculada a um `mesh_name` do modelo 3D.
    """
    car_id: str = Field(default="bmw-x1-2024", description="ID do veículo no catálogo")
    name: str = Field(..., min_length=2, description="Nome da peça em Português")
    mesh_name: str = Field(..., min_length=2, description="Identificador exato da malha 3D (ex: mesh_hood_01)")
    oem_code: str = Field(..., min_length=3, description="Código OEM genuíno da montadora")
    original_brand: str = Field(default="BMW Genuine Parts", description="Marca original OEM")
    original_price: float = Field(..., gt=0, description="Preço original na concessionária (R$)")
    category: str = Field(default="Motor", description="Categoria da peça")
    description: str = Field(..., description="Descrição técnica da peça")
    purchase_url: str = Field(default="https://www.bmw.com.br", description="Link oficial de compra OEM")
    explosion_vector: List[float] = Field(
        default_factory=lambda: [0.0, 1.2, 0.0],
        description="Vetor [X, Y, Z] de deslocamento para o Modo Raio-X (Explosão 3D)"
    )
    cross_references: Optional[List[CreateCrossReferenceInputDTO]] = Field(
        default_factory=list,
        description="Lista opcional de peças equivalentes mais baratas"
    )
