"""
Módulo da Camada de Domínio (Domain Layer) - Shift3D.

Esta é a camada mais interna da Clean Architecture e do Domain-Driven Design (DDD).
Aqui residem as regras de negócio puras, entidades e objetos de valor, totalmente
independentes de frameworks externos, bancos de dados ou interfaces de usuário.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional


class UserRole(str, Enum):
    """
    Enumeração que define os níveis de acesso (Roles) dos usuários na plataforma SaaS Freemium.
    
    - FREE: Usuário gratuito. Pode visualizar o modelo 3D, explodir peças e consultar dados
      originais (OEM), mas NÃO tem acesso aos códigos e marcas das peças equivalentes mais
      baratas (Cross-Reference bloqueado).
    - PRO: Assinante pago. Possui acesso irrestrito a todas as peças equivalentes (Cross-Reference)
      e links diretos de compra com economia.
    - ADMIN: Administrador do sistema (Backoffice). Possui acesso total de visualização e
      permissão para cadastrar novas peças vinculadas às malhas 3D (mesh_name) globalmente.
    """
    FREE = "FREE"
    PRO = "PRO"
    ADMIN = "ADMIN"


@dataclass
class User:
    """
    Entidade de Domínio que representa um Usuário da plataforma Shift3D.
    
    Contém a identificação, credenciais básicas e o perfil de acesso (UserRole)
    que governa a trava Freemium nos Casos de Uso da camada de Aplicação.
    """
    id: str
    name: str
    email: str
    role: UserRole = UserRole.FREE

    def can_view_cross_references(self) -> bool:
        """
        Regra de Negócio de Domínio: Verifica se o usuário tem permissão para
        desbloquear as informações completas de peças equivalentes (Cross-Reference).
        """
        return self.role in (UserRole.PRO, UserRole.ADMIN)

    def is_admin(self) -> bool:
        """
        Regra de Negócio de Domínio: Verifica se o usuário possui privilégios administrativos
        para alterar o catálogo global de peças e malhas 3D.
        """
        return self.role == UserRole.ADMIN


@dataclass
class CrossReference:
    """
    Entidade / Objeto de Valor que representa uma Peça Equivalente (Cross-Reference)
    de outra montadora ou fabricante aftermarket mais acessível.
    
    Exemplo clássico no domínio automotivo: Uma peça ou componente usado em uma BMW X1
    que compartilha exatamente a mesma especificação técnica de uma peça da Fiat ou Bosch,
    custando uma fração do preço original na concessionária.
    """
    id: str
    compatible_brand: str          # Marca compatível (ex: "Fiat / Magneti Marelli")
    compatible_model: str          # Modelo do veículo de origem (ex: "Fiat Toro / Pulse 1.3 Turbo")
    compatible_part_number: str    # Código da peça equivalente (ocultado para usuários FREE)
    estimated_price: float         # Preço médio de mercado da peça equivalente em Reais (BRL)
    compatibility_notes: str       # Notas técnicas de encaixe, durabilidade ou aplicação
    purchase_url: str              # Link para compra da peça equivalente
    savings_percentage: float = 0.0 # Percentual de economia calculado em relação à peça OEM
    is_locked: bool = False        # Flag controlada pela camada de Aplicação para trava Freemium


@dataclass
class Part:
    """
    Entidade de Domínio que representa uma Peça Automotiva vinculada a uma malha 3D.
    
    O atributo obrigatório `mesh_name` é o elo fundamental entre a engenharia de software
    e a computação gráfica: ele mapeia exatamente o nome do objeto/mesh dentro da cena
    Three.js / React Three Fiber (ex: 'mesh_hood_01', 'mesh_engine_01', 'mesh_spark_plug').
    """
    id: str
    car_id: str
    name: str                      # Nome comercial e técnico da peça em Português
    mesh_name: str                 # Identificador obrigatório da malha 3D no modelo interativo
    oem_code: str                  # Código Original da Montadora (Part Number OEM)
    original_brand: str            # Marca genuína da montadora (ex: "BMW Genuine Parts")
    original_price: float          # Preço original na concessionária em Reais (BRL)
    category: str                  # Categoria mecânica (ex: "Motor", "Carroceria", "Ignição", "Rodas")
    description: str               # Explicação técnica da função da peça no veículo
    purchase_url: str              # Link de referência para compra da peça genuína
    explosion_vector: List[float] = field(default_factory=lambda: [0.0, 0.0, 0.0])  # Vetor [X, Y, Z] de deslocamento no Modo Raio-X / Visão Explodida
    cross_references: List[CrossReference] = field(default_factory=list)            # Lista de peças compatíveis mais baratas

    def __post_init__(self) -> None:
        """
        Validação de invariantes de domínio logo após a instanciação da entidade.
        Garante que nenhuma peça exista no domínio sem o vínculo obrigatório `mesh_name`.
        """
        if not self.mesh_name or not self.mesh_name.strip():
            raise ValueError("O campo 'mesh_name' é obrigatório para vincular a peça à malha 3D.")


@dataclass
class Car:
    """
    Agregado Raiz (Aggregate Root) que representa um Veículo dentro da plataforma Shift3D.
    
    Agrupa metadados técnicos do veículo e a coleção de peças (`Part`) que compõem
    sua estrutura 3D interativa.
    """
    id: str
    brand: str                     # Montadora (ex: "BMW")
    model: str                     # Modelo comercial (ex: "X1 sDrive20i")
    year: int                      # Ano de fabricação/modelo
    engine_spec: str               # Especificação do motor (ex: "2.0 TwinPower Turbo (B48)")
    thumbnail_url: str             # Imagem de capa do veículo
    parts: List[Part] = field(default_factory=list)
