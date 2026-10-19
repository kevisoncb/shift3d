"""
Ponto de Entrada Principal (Entrypoint) do Back-end Shift3D - FastAPI + DDD.

Este arquivo inicializa a aplicação FastAPI, configura o middleware de CORS (liberado
para comunicação direta com o Front-end Next.js em `http://localhost:3000`) e registra
as rotas divididas nas camadas `/api/v1/public`, `/api/v1/app` e `/api/v1/admin`.
"""

import os
import sys

# Garante que o diretório raiz do back-end esteja sempre no sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from presentation.routes import admin_router, app_router, public_router


def create_application() -> FastAPI:
    """
    Factory Function que instancia e configura o servidor FastAPI seguindo
    os padrões de Clean Architecture e Domain-Driven Design (DDD).
    """
    application = FastAPI(
        title="Shift3D Automotive SaaS API",
        description=(
            "API RESTful construída com Clean Architecture e DDD para a plataforma "
            "Shift3D: inspeção automotiva interativa em 3D (Modo Raio-X) e "
            "inteligência de equivalência de peças (Cross-Reference) com trava Freemium."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configuração de CORS totalmente liberada para o Front-end Next.js
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Registro dos 3 grupos de rotas da Camada de Apresentação
    application.include_router(public_router)
    application.include_router(app_router)
    application.include_router(admin_router)

    @application.get("/", tags=["Root"])
    def root_welcome() -> dict:
        """Rota raiz com resumo rápido dos endpoints disponíveis."""
        return {
            "project": "Shift3D - Automotive 3D Cross-Reference SaaS",
            "docs": "/docs",
            "endpoints": {
                "public": "/api/v1/public/cars",
                "cockpit_3d": "/api/v1/app/cars/bmw-x1-2024/parts/{mesh_name}",
                "admin_backoffice": "/api/v1/admin/parts",
            },
        }

    return application


app = create_application()


if __name__ == "__main__":
    import uvicorn

    # Inicia o servidor ASGI na porta 8000 com hot-reload ativado
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
