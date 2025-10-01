# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Define o caminho para o nosso arquivo de banco de dados SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./ybyoca.db"

# Cria o "motor" do SQLAlchemy, o ponto de entrada para o banco de dados
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Cria uma classe SessionLocal, que será usada para criar sessões de banco de dados individuais
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Cria uma classe Base que nossos modelos de tabela (ex: Tabela de Projetos) irão herdar
Base = declarative_base()

# Função para obter uma sessão do banco de dados em cada requisição
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
