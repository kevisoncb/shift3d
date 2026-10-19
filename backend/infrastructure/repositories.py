"""
Implementação Concreta dos Repositórios (Infrastructure Layer) - Shift3D.

Este módulo implementa a interface `AbstractCarRepository` definida no Domínio.
Fornece o banco de dados em memória inicializado com a Taxonomia Base Universal de Peças Fixas
da **BMW X1** (`bmw-x1-2024`), prontas para interação estilo Configurador Automotivo:
1. `mesh_hood_01` (Capô dianteiro aerodinâmico)
2. `mesh_front_bumper` (Para-choque dianteiro M Sport & Grade Ativa)
3. `mesh_headlights` (Conjunto de Faróis Full LED Adaptativos)
4. `mesh_doors` (Conjunto de Portas Laterais & Máquina de Vidro)
5. `mesh_wheels` (Conjunto de Rodas Aro 19" & Sensores ABS/TPMS)
6. `mesh_engine_01` (Bloco do Motor 2.0 TwinPower Turbo B48)
7. `mesh_spark_plug` (Jogo de Velas de Ignição Laser Iridium com equivalência Fiat!)

Além da taxonomia base universal, qualquer nova malha personalizada (`mesh_name` exclusivo)
cadastrada pelo Backoffice Admin (`/admin`) é persistida dinamicamente nesta instância Singleton.
"""

from typing import Dict, List, Optional
from domain.entities import Car, CrossReference, Part
from domain.repositories import AbstractCarRepository


# Taxonomia Base Universal de Malhas 3D Fixas para todos os veículos da plataforma
BASE_UNIVERSAL_MESH_TAXONOMY: List[str] = [
    "mesh_hood_01",
    "mesh_front_bumper",
    "mesh_headlights",
    "mesh_doors",
    "mesh_wheels",
    "mesh_engine_01",
    "mesh_spark_plug",
]


class InMemoryCarRepository(AbstractCarRepository):
    """
    Repositório em memória com estado global compartilhado (Singleton Pattern)
    para permitir sincronia em tempo real entre o Backoffice Admin e o Palco 3D.
    """

    def __init__(self) -> None:
        self._cars: Dict[str, Car] = {}
        self._seed_initial_bmw_x1()

    def _seed_initial_bmw_x1(self) -> None:
        """
        Popula o repositório com a Taxonomia Base Universal de peças da BMW X1 sDrive20i,
        incluindo os vetores de deslocamento para o Modo Raio-X e equivalências mais baratas.
        """
        car_id = "bmw-x1-2024"

        initial_parts: List[Part] = [
            # 1. Capô Dianteiro (mesh_hood_01)
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
                    "Ao ser selecionado ou no Modo Raio-X, eleva-se suavemente no eixo Y revelando o cofre do motor."
                ),
                purchase_url="https://www.bmw.com.br",
                explosion_vector=[0.0, 1.55, 0.35],
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
            # 2. Para-choque Dianteiro (mesh_front_bumper)
            Part(
                id="part-bmw-bumper-01",
                car_id=car_id,
                name="Para-choque Dianteiro M Sport & Sensores PDC",
                mesh_name="mesh_front_bumper",
                oem_code="51-11-8-078-410",
                original_brand="BMW M Performance OEM",
                original_price=6890.00,
                category="Carroceria & Aerodinâmica",
                description=(
                    "Conjunto frontal em polímero de engenharia de alta absorção com difusor integrado "
                    "e 4 sensores ultrassônicos de estacionamento (PDC)."
                ),
                purchase_url="https://www.bmw.com.br",
                explosion_vector=[0.0, 0.1, 1.25],
                cross_references=[
                    CrossReference(
                        id="cr-bumper-01",
                        compatible_brand="Bosch / Stellantis Mopar (Kit Sensores PDC + Grade)",
                        compatible_model="Fiat Fastback / Jeep Compass (Sensores Ultrassônicos Bosch 0263013)",
                        compatible_part_number="BOSCH-0263013509",
                        estimated_price=1490.00,
                        compatibility_notes=(
                            "Os transdutores ultrassônicos embutidos no para-choque BMW são fabricados pela Bosch "
                            "com o mesmo conector de 3 pinos utilizado na linha Jeep/Fiat."
                        ),
                        purchase_url="https://lista.mercadolivre.com.br/sensor-estacionamento-bosch-bmw",
                    )
                ],
            ),
            # 3. Conjunto de Faróis Full LED (mesh_headlights)
            Part(
                id="part-bmw-headlights-01",
                car_id=car_id,
                name="Conjunto Óptico Faróis Full LED Adaptativos & Módulo DRL",
                mesh_name="mesh_headlights",
                oem_code="63-11-7-489-521",
                original_brand="BMW Adaptive LED OEM",
                original_price=11400.00,
                category="Iluminação & Elétrica",
                description=(
                    "Faróis duplos em tecnologia Full LED com assinatura luminosa diurna (DRL) "
                    "e módulo reator eletrônico de controle térmico integrado."
                ),
                purchase_url="https://www.bmw.com.br",
                explosion_vector=[0.0, 0.35, 1.05],
                cross_references=[
                    CrossReference(
                        id="cr-headlights-01",
                        compatible_brand="Valeo / Marelli Automotive Lighting (Módulo DRL LED)",
                        compatible_model="Fiat Pulse Impetus / Jeep Commander Full LED",
                        compatible_part_number="VALEO-63117428789",
                        estimated_price=1890.00,
                        compatibility_notes=(
                            "Módulo driver controlador de LED fabricado pela Valeo/Marelli com mesma "
                            "pinagem e dissipador em alumínio aletado."
                        ),
                        purchase_url="https://lista.mercadolivre.com.br/modulo-drl-led-bmw-x1",
                    )
                ],
            ),
            # 4. Conjunto de Portas Laterais (mesh_doors)
            Part(
                id="part-bmw-doors-01",
                car_id=car_id,
                name="Conjunto de Portas Laterais & Máquina Elevadora de Vidro",
                mesh_name="mesh_doors",
                oem_code="51-33-7-388-102",
                original_brand="BMW Genuine Parts",
                original_price=4150.00,
                category="Carroceria & Conforto",
                description=(
                    "Painéis estruturais das portas laterais com barra de proteção intrusiva, "
                    "fechadura elétrica Soft-Close e motor antiesmagamento."
                ),
                purchase_url="https://www.bmw.com.br",
                explosion_vector=[1.15, 0.15, 0.0],
                cross_references=[
                    CrossReference(
                        id="cr-doors-01",
                        compatible_brand="Brose / Fiat Mopar Original (Motor Elevador de Vidro)",
                        compatible_model="Fiat Toro / Jeep Renegade (Motor Brose 6 Pinos)",
                        compatible_part_number="BROSE-C00148-105",
                        estimated_price=690.00,
                        compatibility_notes=(
                            "A sistemista alemã Brose fornece o mesmo motor elétrico de engrenagem "
                            "helicoidal com função um-toque para BMW e Stellantis."
                        ),
                        purchase_url="https://lista.mercadolivre.com.br/motor-vidro-eletrico-bmw-x1",
                    )
                ],
            ),
            # 5. Conjunto de Rodas & Sensores (mesh_wheels)
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
                    "de roda (ABS/DSC) e válvula de telemetria de pressão (TPMS) 433MHz."
                ),
                purchase_url="https://www.bmw.com.br",
                explosion_vector=[0.85, -0.1, 0.0],
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
            # 6. Bloco do Motor TwinPower Turbo (mesh_engine_01)
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
                purchase_url="https://www.bmw.com.br",
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
            # 7. Vela de Ignição Laser Iridium (mesh_spark_plug)
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
                    "de injeção direta turboalimentados. Localizada no cabeçote interno do motor."
                ),
                purchase_url="https://www.bmw.com.br",
                explosion_vector=[0.0, 1.05, -0.15],
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
        Adiciona uma nova peça (malha dinâmica personalizada) ou atualiza uma peça
        da taxonomia base vinculada ao mesmo `mesh_name`.
        """
        car = self._cars.get(car_id)
        if not car:
            car = next(iter(self._cars.values()))

        normalized_mesh = part.mesh_name.strip().lower()
        for idx, existing_part in enumerate(car.parts):
            if existing_part.mesh_name.strip().lower() == normalized_mesh:
                car.parts[idx] = part
                return part

        car.parts.append(part)
        return part


car_repository_singleton = InMemoryCarRepository()
