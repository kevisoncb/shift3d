"""
Implementação Concreta dos Repositórios (Infrastructure Layer) - Shift3D.

Este módulo implementa a interface `AbstractCarRepository` definida no Domínio.
Fornece o banco de dados em memória inicializado com o Mock completo de uma **BMW X1**
(`bmw-x1-2024`), incluindo as malhas 3D clicáveis obrigatórias:
- `mesh_hood_01` (Capô dianteiro)
- `mesh_engine_01` (Bloco do Motor 2.0 TwinPower Turbo)
- `mesh_spark_plug` (Jogo de Velas de Ignição Iridium com equivalência mais barata da Fiat!)
- `mesh_wheels` (Conjunto de Rodas / Cubo e Sensor ABS com equivalência mais barata da Fiat!)

Qualquer nova peça cadastrada pelo painel Admin (`/admin`) é persistida nesta instância
Singleton em memória e refletida globalmente em tempo real para o Cockpit 3D.
"""

from typing import Dict, List, Optional
from domain.entities import Car, CrossReference, Part
from domain.repositories import AbstractCarRepository


class InMemoryCarRepository(AbstractCarRepository):
    """
    Repositório em memória com estado global compartilhado (Singleton Pattern)
    para permitir testes em tempo real entre o Painel Admin e o Cockpit 3D.
    """

    def __init__(self) -> None:
        self._cars: Dict[str, Car] = {}
        self._seed_initial_bmw_x1()

    def _seed_initial_bmw_x1(self) -> None:
        """
        Popula o repositório com os dados técnicos reais e simulados da BMW X1 sDrive20i,
        conectando cada peça ao respectivo `mesh_name` do modelo 3D procedural.
        """
        car_id = "bmw-x1-2024"

        initial_parts: List[Part] = [
            # 1. Capô Dianteiro (Peça externa que se afasta no Modo Raio-X para revelar o motor)
            Part(
                id="part-bmw-hood-01",
                car_id=car_id,
                name="Capô Dianteiro em Alumínio Aerodinâmico",
                mesh_name="mesh_hood_01",
                oem_code="41-61-7-483-901",
                original_brand="BMW Genuine Parts",
                original_price=8490.00,
                category="Carroceria Externa",
                description=(
                    "Capô estrutural estampado em liga de alumínio de alta absorção de impacto. "
                    "No Modo Raio-X (Visão Explodida), esta peça é deslocada verticalmente no eixo Y "
                    "para liberar o acesso visual e clique direto no motor e nas velas de ignição."
                ),
                purchase_url="https://www.bmw.com.br/pt/topics/offers-and-services/original-bmw-parts.html",
                explosion_vector=[0.0, 1.85, 0.35],
                cross_references=[
                    CrossReference(
                        id="cr-hood-01",
                        compatible_brand="Fiat / Mopar Estamparia Homologada (Aftermarket)",
                        compatible_model="Linha SUV Compacto / Estamparia Equivalente Tong Yang",
                        compatible_part_number="TY-BMX1-41617",
                        estimated_price=2390.00,
                        compatibility_notes=(
                            "Chapa em alumínio tratada com primer anticorrosivo cataforético. "
                            "Mesma furação de dobradiças e trava frontal sem necessidade de adaptação."
                        ),
                        purchase_url="https://lista.mercadolivre.com.br/capo-bmw-x1",
                    )
                ],
            ),
            # 2. Bloco do Motor TwinPower Turbo
            Part(
                id="part-bmw-engine-01",
                car_id=car_id,
                name="Conjunto Motor 2.0L TwinPower Turbo (B48) & Bomba d'Água Auxiliar",
                mesh_name="mesh_engine_01",
                oem_code="11-00-2-455-312",
                original_brand="BMW Genuine Parts",
                original_price=4850.00,
                category="Motor & Arrefecimento",
                description=(
                    "Conjunto central do propulsor 4 cilindros 16V Turbo com atuador eletrônico "
                    "e módulo de arrefecimento integrado. Posicionado no cofre central abaixo do capô."
                ),
                purchase_url="https://www.bmw.com.br/pt/topics/offers-and-services/original-bmw-parts.html",
                explosion_vector=[0.0, 0.45, 0.0],
                cross_references=[
                    CrossReference(
                        id="cr-engine-01",
                        compatible_brand="Fiat / Pierburg OEM (Fornecedor Compartilhado Stellantis/BMW)",
                        compatible_model="Fiat Toro / Jeep Compass 2.0 & 1.3 Turbo (Atuador/Bomba Pierburg)",
                        compatible_part_number="PIERBURG-7.07223.05.0",
                        estimated_price=1190.00,
                        compatibility_notes=(
                            "A Pierburg fornece exatamente a mesma válvula/bomba auxiliar de circulação "
                            "para a linha Fiat/Jeep Turbo e BMW B48. Conector elétrico de 3 vias 100% Plug & Play."
                        ),
                        purchase_url="https://lista.mercadolivre.com.br/bomba-auxiliar-pierburg-bmw",
                    )
                ],
            ),
            # 3. Vela de Ignição (Peça interna do motor com equivalência clássica mais barata da Fiat!)
            Part(
                id="part-bmw-spark-01",
                car_id=car_id,
                name="Jogo de Velas de Ignição Laser Iridium de Alta Performance",
                mesh_name="mesh_spark_plug",
                oem_code="12-12-0-040-551",
                original_brand="BMW Genuine Parts",
                original_price=1680.00,
                category="Ignição & Injeção",
                description=(
                    "Velas de ignição com eletrodo central em Irídio e terra em Platina para motores "
                    " de injeção direta turboalimentados. Localizada no cabeçote interno do motor "
                    "(ative o Modo Raio-X para visualizar e clicar facilmente!)."
                ),
                purchase_url="https://www.bmw.com.br/pt/topics/offers-and-services/original-bmw-parts.html",
                explosion_vector=[0.0, 1.15, -0.15],
                cross_references=[
                    CrossReference(
                        id="cr-spark-fiat-01",
                        compatible_brand="Fiat Genuína (Mopar / NGK Laser Iridium)",
                        compatible_model="Fiat Fastback / Toro / Pulse Abarth 1.3 Turbo T270",
                        compatible_part_number="FIAT-55282627 / SILZKGR8B8S",
                        estimated_price=420.00,
                        compatibility_notes=(
                            "Achado de Ouro Shift3D: A vela NGK Laser Iridium vendida na caixa da Fiat/Mopar "
                            "(código 55282627) possui exatamente a mesma rosca M12x1.25, alcance de 26.5mm, "
                            "grau térmico 8 e gap de 0.8mm da vela genuína BMW B48, custando 75% menos!"
                        ),
                        purchase_url="https://lista.mercadolivre.com.br/vela-iridium-fiat-toro-1-3-turbo",
                    ),
                    CrossReference(
                        id="cr-spark-bosch-02",
                        compatible_brand="Bosch Double Iridium",
                        compatible_model="Linha Euro Turbo Injeção Direta",
                        compatible_part_number="BOSCH-0242145541",
                        estimated_price=495.00,
                        compatibility_notes="Equivalência direta Bosch com eletrodo duplo de irídio homologado.",
                        purchase_url="https://lista.mercadolivre.com.br/vela-bosch-double-iridium-bmw",
                    ),
                ],
            ),
            # 4. Conjunto de Rodas / Sensores de Roda
            Part(
                id="part-bmw-wheels-01",
                car_id=car_id,
                name="Conjunto de Rodas M Sport Aro 19\" & Sensor ABS / TPMS de Cubo",
                mesh_name="mesh_wheels",
                oem_code="36-11-8-093-922",
                original_brand="BMW M Performance OEM",
                original_price=3290.00,
                category="Rodas, Freios & Suspensão",
                description=(
                    "Conjunto de rodagem em liga leve diamantada com sensor eletrônico de velocidade "
                    "de roda (ABS/DSC) e válvula de telemetria de pressão (TPMS)433MHz."
                ),
                purchase_url="https://www.bmw.com.br/pt/topics/offers-and-services/original-bmw-parts.html",
                explosion_vector=[1.4, 0.0, 0.0],
                cross_references=[
                    CrossReference(
                        id="cr-wheels-fiat-01",
                        compatible_brand="Fiat / Continental VDO (Sensor TPMS / ABS 433MHz)",
                        compatible_model="Fiat Toro Ranch / Titano (Mesmo transmissor Continental 433MHz)",
                        compatible_part_number="FIAT-53394085-VDO",
                        estimated_price=580.00,
                        compatibility_notes=(
                            "O módulo sensor de roda Continental 433MHz utilizado na linha utilitária Fiat "
                            "opera no mesmo protocolo de rádio frequência e encaixe de válvula metálica da plataforma UKL2 da BMW X1."
                        ),
                        purchase_url="https://lista.mercadolivre.com.br/sensor-tpms-fiat-toro",
                    )
                ],
            ),
        ]

        bmw_x1 = Car(
            id=car_id,
            brand="BMW",
            model="X1 sDrive20i M Sport",
            year=2024,
            engine_spec="2.0L TwinPower Turbo (192 cv / 28,5 kgfm)",
            thumbnail_url="/images/bmw-x1-wireframe.png",
            parts=initial_parts,
        )

        self._cars[car_id] = bmw_x1

    def get_all_cars(self) -> List[Car]:
        """Retorna todos os veículos cadastrados na memória."""
        return list(self._cars.values())

    def get_car_by_id(self, car_id: str) -> Optional[Car]:
        """Retorna um veículo pelo seu ID."""
        return self._cars.get(car_id)

    def get_part_by_mesh_name(self, car_id: str, mesh_name: str) -> Optional[Part]:
        """
        Localiza uma peça dentro do veículo a partir do identificador `mesh_name`
        clicado pelo usuário na cena 3D.
        """
        car = self._cars.get(car_id)
        if not car:
            return None

        normalized_mesh = mesh_name.strip().lower()
        for part in car.parts:
            if part.mesh_name.strip().lower() == normalized_mesh:
                return part
        return None

    def add_or_update_part(self, car_id: str, part: Part) -> Part:
        """
        Adiciona uma nova peça ou atualiza uma peça já vinculada ao mesmo `mesh_name`.
        Garante que qualquer alteração feita no painel `/admin` reflita imediatamente
        em todo o ecossistema Shift3D.
        """
        car = self._cars.get(car_id)
        if not car:
            # Caso o car_id informado ainda não exista, vincula ao veículo principal BMW X1
            car = next(iter(self._cars.values()))

        normalized_mesh = part.mesh_name.strip().lower()
        for idx, existing_part in enumerate(car.parts):
            if existing_part.mesh_name.strip().lower() == normalized_mesh:
                car.parts[idx] = part
                return part

        car.parts.append(part)
        return part


# Instância Singleton global do repositório em memória para compartilhamento entre rotas
car_repository_singleton = InMemoryCarRepository()
