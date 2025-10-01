# backend/crud.py
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from . import models, schemas, auth

# --- CRUD para Usuários ---

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- CRUD para Projetos ---

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_projects_by_architect(db: Session, architect_id: int, status: Optional[str] = None):
    query = db.query(models.Project).filter(models.Project.owner_id == architect_id)
    if status:
        query = query.filter(models.Project.status == status)
    return query.all()

def get_projects_by_client(db: Session, client_id: int):
    return db.query(models.Project).filter(models.Project.client_id == client_id).all()

def create_project(db: Session, project: schemas.ProjectCreate, architect_id: int):
    db_project = models.Project(**project.dict(), owner_id=architect_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project_status(db: Session, project_id: int, status: str, completed_at: datetime = None):
    db_project = get_project(db, project_id)
    if db_project:
        db_project.status = status
        db_project.completed_at = completed_at
        db.commit()
        db.refresh(db_project)
    return db_project

# --- CRUD para Despesas ---

def get_expense(db: Session, expense_id: int):
    return db.query(models.Expense).filter(models.Expense.id == expense_id).first()

def create_expense(db: Session, project_id: int, expense: schemas.ExpenseCreate, photo_url: Optional[str] = None):
    db_expense = models.Expense(
        name=expense.name,
        value=expense.value,
        category=expense.category,
        project_id=project_id, 
        photo_url=photo_url
    )
    db.add(db_expense)
    
    project = get_project(db, project_id)
    project.spent += expense.value

    db.commit()
    db.refresh(db_expense)
    return db_expense

def delete_expense(db: Session, expense_id: int):
    db_expense = get_expense(db, expense_id)
    if db_expense:
        # Atualiza o valor gasto no projeto antes de marcar a despesa como excluída
        project = get_project(db, db_expense.project_id)
        if project:
            project.spent -= db_expense.value
            db.add(project) # Garante que o SQLAlchemy registre a modificação do projeto
            # db.flush() # Não é necessário se o commit for no final
        
        db_expense.is_deleted = True # Marca a despesa como excluída (soft delete)
        db.add(db_expense) # Garante que o SQLAlchemy registre a modificação da despesa
        db.commit()
    return db_expense

def get_all_expenses_for_project(db: Session, project_id: int):
    return db.query(models.Expense).filter(models.Expense.project_id == project_id).all()

# --- CRUD para Fases do Projeto ---

def get_project_phases(db: Session, project_id: int):
    return db.query(models.ProjectPhase).filter(models.ProjectPhase.project_id == project_id).all()

def get_project_phase(db: Session, phase_id: int):
    return db.query(models.ProjectPhase).filter(models.ProjectPhase.id == phase_id).first()

def create_project_phase(db: Session, phase: schemas.ProjectPhaseCreate, project_id: int):
    db_phase = models.ProjectPhase(**phase.dict(), project_id=project_id)
    db.add(db_phase)
    db.commit()
    db.refresh(db_phase)
    return db_phase

def update_project_phase(db: Session, phase_id: int, phase_data: dict):
    db_phase = get_project_phase(db, phase_id)
    if db_phase:
        for key, value in phase_data.items():
            setattr(db_phase, key, value)
        db.commit()
        db.refresh(db_phase)
    return db_phase

def delete_project_phase(db: Session, phase_id: int):
    db_phase = get_project_phase(db, phase_id)
    if db_phase:
        db.delete(db_phase)
        db.commit()
    return db_phase

# --- CRUD para Checklist ---

def get_project_checklist(db: Session, project_id: int):
    return db.query(models.Checklist).filter(models.Checklist.project_id == project_id).all()

def get_checklist_item(db: Session, item_id: int):
    return db.query(models.Checklist).filter(models.Checklist.id == item_id).first()

def create_checklist_item(db: Session, item: schemas.ChecklistCreate, project_id: int):
    db_item = models.Checklist(**item.dict(), project_id=project_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_checklist_item(db: Session, item_id: int, item_data: dict):
    db_item = get_checklist_item(db, item_id)
    if db_item:
        for key, value in item_data.items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def toggle_checklist_item(db: Session, item_id: int):
    db_item = get_checklist_item(db, item_id)
    if db_item:
        db_item.is_completed = not db_item.is_completed
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_checklist_item(db: Session, item_id: int):
    db_item = get_checklist_item(db, item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item
