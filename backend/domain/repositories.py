"""
Contratos de Repositório (Interfaces / Ports) da Camada de Domínio - Shift3D.

Seguindo o Princípio da Inversão de Dependência (DIP - SOLID) e a Clean Architecture,
a camada de Domínio define as interfaces abstratas (contratos) que a camada de
Infraestrutura deve implementar (seja em memória ou em PostgreSQL/Supabase).
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from .entities import Car, Part


class AbstractCarRepository(ABC):
    """
    Interface abstrata para o repositório de veículos e peças 3D.
    Garante que os Casos de Uso na camada de Aplicação não conheçam detalhes
    de banco de dados (SQLAlchemy, Supabase ou Mock em memória).
    """

    @abstractmethod
    def get_all_cars(self) -> List[Car]:
        """Retorna a lista de todos os veículos cadastrados na plataforma."""
        raise NotImplementedError

    @abstractmethod
    def get_car_by_id(self, car_id: str) -> Optional[Car]:
        """Busca um veículo específico pelo seu identificador único."""
        raise NotImplementedError

    @abstractmethod
    def get_part_by_mesh_name(self, car_id: str, mesh_name: str) -> Optional[Part]:
        """
        Busca uma peça específica dentro de um veículo através do nome da malha 3D (`mesh_name`).
        Este método é acionado diretamente quando o usuário clica em uma peça no Cockpit 3D.
        """
        raise NotImplementedError

    @abstractmethod
    def add_or_update_part(self, car_id: str, part: Part) -> Part:
        """
        Cadastra uma nova peça ou atualiza uma peça existente vinculada a um `mesh_name`
        no catálogo global do veículo (Operação exclusiva de Admin no Backoffice).
        """
        raise NotImplementedError
