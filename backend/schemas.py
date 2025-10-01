# backend/schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Schemas para Despesas (Expense) ---

class ExpenseBase(BaseModel):
    name: str
    value: float
    category: str
    photo_url: Optional[str] = None
    is_deleted: bool = False

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# --- Schemas para Projetos (Project) ---

class ProjectBase(BaseModel):
    name: str
    budget: float
    status: str = "Em Andamento"

class ProjectCreate(ProjectBase):
    client_id: int

class Project(ProjectBase):
    id: int
    spent: float
    owner_id: int
    client_id: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    expenses: List[Expense] = []

    class Config:
        from_attributes = True

# --- Schemas para Usuários (User) ---

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    role: str = 'client'

class User(UserBase):
    id: int
    role: str
    # owned_projects: List[Project] = [] # Comentado para evitar recursão infinita na serialização
    # client_project: Optional[Project] = None # Comentado para evitar recursão infinita na serialização

    class Config:
        from_attributes = True

# --- Schemas para Fases do Projeto ---

class ProjectPhaseBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str = "Pendente"
    progress_percentage: float = 0.0
    estimated_cost: float = 0.0
    actual_cost: float = 0.0
    notes: Optional[str] = None

class ProjectPhaseCreate(ProjectPhaseBase):
    pass

class ProjectPhase(ProjectPhaseBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# --- Schemas para Checklist ---

class ChecklistBase(BaseModel):
    item_name: str
    is_completed: bool = False
    priority: str = "Média"
    due_date: Optional[datetime] = None
    notes: Optional[str] = None

class ChecklistCreate(ChecklistBase):
    pass

class Checklist(ChecklistBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# --- Schemas para Autenticação (Token) ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None