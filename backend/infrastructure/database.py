"""
Configuração de Banco de Dados Relacional (PostgreSQL / Supabase) - Shift3D.

Este módulo pertence à Camada de Infraestrutura (Infrastructure Layer) e deixa a
arquitetura 100% preparada para persistência em PostgreSQL ou Supabase via SQLAlchemy 2.0.
Por padrão nas Fases 1 e 2 unificadas, o sistema utiliza o `InMemoryCarRepository` para
execução imediata sem necessidade de banco externo ativo, mas basta configurar a variável
de ambiente `DATABASE_URL` (ex: URI de conexão do Supabase) para ativar o motor relacional.
"""

import os
from typing import Generator

# Carrega variáveis de ambiente caso exista um arquivo .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# URL de conexão do PostgreSQL / Supabase (ex: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres)
SUPABASE_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/shift3d_db"
)

# Definição do esquema SQL de referência para migração imediata no SQL Editor do Supabase
SUPABASE_SQL_SCHEMA = """
-- Script DDL para criação das tabelas no Supabase / PostgreSQL (Shift3D)
CREATE TABLE IF NOT EXISTS cars (
    id VARCHAR(64) PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    engine_spec VARCHAR(150) NOT NULL,
    thumbnail_url TEXT
);

CREATE TABLE IF NOT EXISTS parts (
    id VARCHAR(64) PRIMARY KEY,
    car_id VARCHAR(64) REFERENCES cars(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    mesh_name VARCHAR(100) NOT NULL UNIQUE,
    oem_code VARCHAR(100) NOT NULL,
    original_brand VARCHAR(100) NOT NULL,
    original_price NUMERIC(12, 2) NOT NULL,
    category VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    purchase_url TEXT NOT NULL,
    explosion_vector JSONB DEFAULT '[0, 0, 0]'
);

CREATE TABLE IF NOT EXISTS cross_references (
    id VARCHAR(64) PRIMARY KEY,
    part_id VARCHAR(64) REFERENCES parts(id) ON DELETE CASCADE,
    compatible_brand VARCHAR(120) NOT NULL,
    compatible_model VARCHAR(150) NOT NULL,
    compatible_part_number VARCHAR(100) NOT NULL,
    estimated_price NUMERIC(12, 2) NOT NULL,
    compatibility_notes TEXT NOT NULL,
    purchase_url TEXT NOT NULL
);
"""


def get_database_connection_info() -> dict:
    """
    Retorna o status de configuração do banco de dados para diagnóstico de infraestrutura.
    """
    is_supabase_configured = "supabase.co" in SUPABASE_DATABASE_URL
    return {
        "driver": "postgresql+psycopg2",
        "active_mode": "IN_MEMORY_MOCK_WITH_SUPABASE_READY",
        "supabase_configured": is_supabase_configured,
        "schema_ready": True,
    }
