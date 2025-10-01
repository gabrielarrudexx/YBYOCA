#!/bin/bash

# Instalar dependências
pip install -r requirements.txt

# Iniciar o servidor FastAPI
uvicorn backend.main:app --host 0.0.0.0 --port $PORT