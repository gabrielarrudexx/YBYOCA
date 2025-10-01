#!/usr/bin/env python3
"""
Arquivo de inicialização principal para o Replit
Este arquivo garante que o servidor inicie corretamente no ambiente Replit
"""

import os
import sys
import subprocess

def main():
    """Função principal para iniciar o servidor Ybyoca"""

    # Garante que estamos no diretório correto
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Adiciona o diretório atual ao PATH para importações
    sys.path.insert(0, os.getcwd())
    sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

    # Porta do Replit ou porta padrão
    port = os.environ.get('PORT', '8000')

    print("🏗️  Iniciando Ybyoca - Sistema de Gestão de Obras")
    print(f"🌐 Porta: {port}")
    print(f"📁 Diretório: {os.getcwd()}")

    # Comando para iniciar o servidor
    cmd = [
        sys.executable, "-m", "uvicorn",
        "backend.main:app",
        "--host", "0.0.0.0",
        "--port", str(port),
        "--reload"
    ]

    print("🚀 Comando:", " ".join(cmd))

    try:
        # Inicia o servidor
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado pelo usuário")
        sys.exit(0)

if __name__ == "__main__":
    main()