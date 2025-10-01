# backend/models.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default='client') # Roles: 'architect' or 'client'

    # Relacionamento: Um arquiteto pode ter vários projetos
    owned_projects = relationship("Project", foreign_keys='[Project.owner_id]', back_populates="owner")
    # Relacionamento: Um cliente pode ter vários projetos
    client_projects = relationship("Project", foreign_keys='[Project.client_id]', back_populates="client")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    budget = Column(Float, default=0.0)
    spent = Column(Float, default=0.0)
    status = Column(String, default="Em Andamento") # Novo campo: "Em Andamento" ou "Concluída"
    created_at = Column(DateTime, default=datetime.utcnow) # Novo campo: data de criação
    completed_at = Column(DateTime, nullable=True) # Novo campo: data de conclusão
    
    owner_id = Column(Integer, ForeignKey("users.id")) # ID do Arquiteto
    client_id = Column(Integer, ForeignKey("users.id")) # ID do Cliente

    # Relacionamento com o usuário (dono/arquiteto)
    owner = relationship("User", back_populates="owned_projects", foreign_keys=[owner_id])
    # Relacionamento com o usuário (cliente)
    client = relationship("User", back_populates="client_projects", foreign_keys=[client_id])
    # Relacionamento com as despesas (apenas as não excluídas)
    expenses = relationship("Expense", primaryjoin="and_(Project.id == Expense.project_id, Expense.is_deleted == False)", back_populates="project")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    value = Column(Float, default=0.0)
    category = Column(String, index=True) # Novo campo para categoria
    photo_url = Column(String, nullable=True) # Caminho para a foto da despesa
    is_deleted = Column(Boolean, default=False) # Novo campo para soft delete

    project_id = Column(Integer, ForeignKey("projects.id"))

    # Relacionamento com o projeto
    project = relationship("Project", back_populates="expenses")

class ProjectPhase(Base):
    __tablename__ = "project_phases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, default="Pendente") # Pendente, Em Andamento, Concluído, Atrasado
    progress_percentage = Column(Float, default=0.0) # 0-100
    estimated_cost = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)
    notes = Column(String, nullable=True)

    project_id = Column(Integer, ForeignKey("projects.id"))

    # Relacionamento com o projeto
    project = relationship("Project")

class Checklist(Base):
    __tablename__ = "checklists"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    is_completed = Column(Boolean, default=False)
    priority = Column(String, default="Média") # Baixa, Média, Alta
    due_date = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)

    project_id = Column(Integer, ForeignKey("projects.id"))

    # Relacionamento com o projeto
    project = relationship("Project")

class CashFlow(Base):
    __tablename__ = "cash_flows"

    id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float, default=0.0)
    transaction_type = Column(String, default="expense") # income, expense, forecast
    category = Column(String, index=True)
    description = Column(String, nullable=True)
    is_confirmed = Column(Boolean, default=True) # Para projeções não confirmadas

    project_id = Column(Integer, ForeignKey("projects.id"))

    # Relacionamento com o projeto
    project = relationship("Project")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String, index=True) # budget_overrun, deadline_approaching, etc.
    title = Column(String, index=True)
    message = Column(String)
    severity = Column(String, default="medium") # low, medium, high, critical
    is_read = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relacionamentos
    project = relationship("Project")
    user = relationship("User")
