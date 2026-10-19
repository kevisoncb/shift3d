"""
Casos de Uso (Use Cases) da Camada de Aplicação - Shift3D.

Esta camada orquestra o fluxo de dados entre as Entidades de Domínio e os Repositórios,
aplicando as regras de negócio específicas da aplicação SaaS, como:
1. A Trava Freemium (Freemium Paywall Logic) na consulta de peças por `mesh_name`.
2. O cadastro e atualização global de peças 3D pelo Administrador (Backoffice).
"""

import uuid
from typing import List, Optional

from domain.entities import Car, CrossReference, Part, User, UserRole
from domain.repositories import AbstractCarRepository
from .dtos import (
    CarSummaryDTO,
    CreatePartInputDTO,
    CrossReferenceDTO,
    PartResponseDTO,
)


class GetPartByMeshUseCase:
    """
    Caso de Uso: Consultar detalhes de uma peça clicada no Cockpit 3D (`mesh_name`)
    aplicando rigorosamente a regra de negócio da Trava Freemium.
    
    Comportamento da Trava Freemium:
    - Usuários FREE: Recebem todos os dados da peça original (OEM, preço na concessionária,
      descrição e link original), mas a lista de peças equivalentes (`cross_references`)
      retorna com `is_locked = True`, ocultando o código da peça equivalente e o link de compra,
      exibindo apenas a prévia da economia para estimular a conversão em assinatura PRO.
    - Usuários PRO e ADMIN: Recebem todos os dados originais e a lista completa de
      peças equivalentes (`cross_references`) totalmente desbloqueada (`is_locked = False`),
      incluindo a equivalência mais barata da Fiat/Bosch.
    """

    def __init__(self, car_repository: AbstractCarRepository) -> None:
        self._car_repository = car_repository

    def execute(self, car_id: str, mesh_name: str, current_user: User) -> Optional[PartResponseDTO]:
        """
        Executa a busca da peça pelo `mesh_name` e aplica a política de visibilidade
        de acordo com a Role do usuário (`FREE`, `PRO` ou `ADMIN`).
        """
        part = self._car_repository.get_part_by_mesh_name(car_id=car_id, mesh_name=mesh_name)
        if not part:
            return None

        # Verifica na entidade de domínio User se ele possui permissão para ver Cross-References
        has_full_access = current_user.can_view_cross_references()

        processed_cross_refs: List[CrossReferenceDTO] = []
        for ref in part.cross_references:
            # Calcula automaticamente a porcentagem de economia em relação à peça original OEM
            savings_pct = 0.0
            if part.original_price > 0 and ref.estimated_price < part.original_price:
                savings_pct = round(
                    ((part.original_price - ref.estimated_price) / part.original_price) * 100, 1
                )

            if has_full_access:
                # Usuário PRO ou ADMIN: Dados 100% liberados
                processed_cross_refs.append(
                    CrossReferenceDTO(
                        id=ref.id,
                        compatible_brand=ref.compatible_brand,
                        compatible_model=ref.compatible_model,
                        compatible_part_number=ref.compatible_part_number,
                        estimated_price=ref.estimated_price,
                        compatibility_notes=ref.compatibility_notes,
                        purchase_url=ref.purchase_url,
                        savings_percentage=savings_pct,
                        is_locked=False,
                    )
                )
            else:
                # Usuário FREE: Aplica a trava Freemium (is_locked = True) e mascara dados sensíveis
                processed_cross_refs.append(
                    CrossReferenceDTO(
                        id=ref.id,
                        compatible_brand=f"{ref.compatible_brand.split('/')[0].strip()} (Bloqueado no Plano FREE)",
                        compatible_model="Assine o Shift3D PRO para visualizar o veículo doador exato",
                        compatible_part_number="🔒 ••••••••-PRO",
                        estimated_price=ref.estimated_price,
                        compatibility_notes="Especificação técnica validada pela engenharia Shift3D. Faça upgrade para liberar o código de bancada e fornecedor.",
                        purchase_url="#upgrade-pro",
                        savings_percentage=savings_pct,
                        is_locked=True,
                    )
                )

        return PartResponseDTO(
            id=part.id,
            car_id=part.car_id,
            name=part.name,
            mesh_name=part.mesh_name,
            oem_code=part.oem_code,
            original_brand=part.original_brand,
            original_price=part.original_price,
            category=part.category,
            description=part.description,
            purchase_url=part.purchase_url,
            explosion_vector=part.explosion_vector,
            cross_references=processed_cross_refs,
            viewer_role=current_user.role.value,
        )


class ListCarsCatalogUseCase:
    """
    Caso de Uso: Listar os veículos disponíveis no catálogo 3D com a relação
    de todas as peças e malhas 3D (`mesh_name`) mapeadas.
    """

    def __init__(self, car_repository: AbstractCarRepository) -> None:
        self._car_repository = car_repository

    def execute(self) -> List[CarSummaryDTO]:
        cars = self._car_repository.get_all_cars()
        return [
            CarSummaryDTO(
                id=car.id,
                brand=car.brand,
                model=car.model,
                year=car.year,
                engine_spec=car.engine_spec,
                thumbnail_url=car.thumbnail_url,
                total_parts=len(car.parts),
                available_meshes=[p.mesh_name for p in car.parts],
            )
            for car in cars
        ]

    def get_car_parts(self, car_id: str, current_user: User) -> List[PartResponseDTO]:
        """
        Retorna todas as peças de um veículo aplicando a regra Freemium para cada peça.
        Útil para pré-carregar metadados do carro no Cockpit 3D e no Dashboard Admin.
        """
        car = self._car_repository.get_car_by_id(car_id)
        if not car:
            return []
        part_use_case = GetPartByMeshUseCase(self._car_repository)
        results: List[PartResponseDTO] = []
        for part in car.parts:
            dto = part_use_case.execute(car_id=car_id, mesh_name=part.mesh_name, current_user=current_user)
            if dto:
                results.append(dto)
        return results


class RegisterGlobalPartAdminUseCase:
    """
    Caso de Uso Exclusivo de Administração (Backoffice):
    Permite que um usuário com perfil `ADMIN` cadastre uma nova peça ou atualize
    uma peça existente vinculada a um `mesh_name` 3D, refletindo globalmente e em
    tempo real para todos os usuários da plataforma.
    """

    def __init__(self, car_repository: AbstractCarRepository) -> None:
        self._car_repository = car_repository

    def execute(self, input_dto: CreatePartInputDTO, admin_user: User) -> PartResponseDTO:
        """
        Valida a permissão administrativa, constrói a Entidade de Domínio `Part`
        com suas respectivas `CrossReference` e persiste no repositório global.
        """
        if not admin_user.is_admin():
            raise PermissionError("Apenas administradores (ADMIN) podem cadastrar peças globalmente.")

        cross_refs: List[CrossReference] = []
        if input_dto.cross_references:
            for cr_input in input_dto.cross_references:
                savings_pct = 0.0
                if input_dto.original_price > 0 and cr_input.estimated_price < input_dto.original_price:
                    savings_pct = round(
                        ((input_dto.original_price - cr_input.estimated_price) / input_dto.original_price) * 100, 1
                    )
                cross_refs.append(
                    CrossReference(
                        id=f"cr-{uuid.uuid4().hex[:8]}",
                        compatible_brand=cr_input.compatible_brand,
                        compatible_model=cr_input.compatible_model,
                        compatible_part_number=cr_input.compatible_part_number,
                        estimated_price=cr_input.estimated_price,
                        compatibility_notes=cr_input.compatibility_notes,
                        purchase_url=cr_input.purchase_url,
                        savings_percentage=savings_pct,
                        is_locked=False,
                    )
                )

        new_part = Part(
            id=f"part-{uuid.uuid4().hex[:8]}",
            car_id=input_dto.car_id,
            name=input_dto.name,
            mesh_name=input_dto.mesh_name.strip(),
            oem_code=input_dto.oem_code.strip(),
            original_brand=input_dto.original_brand,
            original_price=input_dto.original_price,
            category=input_dto.category,
            description=input_dto.description,
            purchase_url=input_dto.purchase_url,
            explosion_vector=input_dto.explosion_vector,
            cross_references=cross_refs,
        )

        saved_part = self._car_repository.add_or_update_part(car_id=input_dto.car_id, part=new_part)

        # Retorna a peça recém-cadastrada usando o caso de uso de leitura com visão ADMIN
        get_use_case = GetPartByMeshUseCase(self._car_repository)
        result = get_use_case.execute(
            car_id=input_dto.car_id,
            mesh_name=saved_part.mesh_name,
            current_user=admin_user,
        )
        assert result is not None
        return result
