# backend/main.py
import shutil
from fastapi import Depends, FastAPI, HTTPException, status, File, UploadFile, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import time
from datetime import datetime

try:
    from . import auth, crud, models, schemas, pdf_generator
    from .database import SessionLocal, engine
except ImportError:
    # Para execução direta ou no Replit
    import auth, crud, models, schemas, pdf_generator
    from database import SessionLocal, engine
from fastapi import Response

# --- Criação do Banco de Dados e Diretórios ---

# Cria o diretório para uploads se não existir
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app = FastAPI(
    title="Ybyoca API",
    description="API para o sistema de gestão de obras Ybyoca.",
    version="1.0.0"
)

# --- Configuração CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas as origens (para desenvolvimento)
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos os métodos
    allow_headers=["*"],  # Permitir todos os headers
)

# --- Criação de Usuário Inicial ---
def create_initial_user():
    print("[DEBUG] Tentando criar usuário inicial...")
    db = SessionLocal()
    try:
        # Verifica se o usuário admin já existe
        admin_user = crud.get_user_by_email(db, email="admin@ybyoca.com")
        if not admin_user:
            print("[DEBUG] Usuário admin não encontrado, criando um novo.")
            # Se não existir, cria um novo usuário arquiteto
            user_in = schemas.UserCreate(
                email="admin@ybyoca.com",
                password="admin", # Senha provisória
                role="architect"
            )
            crud.create_user(db=db, user=user_in)
            print("[SUCCESS] Usuário administrador padrão 'admin@ybyoca.com' criado com sucesso.")
        else:
            print("[DEBUG] Usuário admin 'admin@ybyoca.com' já existe no banco de dados.")
    except Exception as e:
        print(f"[ERROR] Ocorreu um erro durante a criação do usuário inicial: {e}")
    finally:
        print("[DEBUG] Fechando sessão do banco de dados de inicialização.")
        db.close()

@app.on_event("startup")
def startup_event():
    print("[STARTUP] Criando tabelas do banco de dados...")
    models.Base.metadata.create_all(bind=engine)
    print("[STARTUP] Tabelas criadas.")
    create_initial_user()


# Monta o diretório 'uploads' para ser acessível via /uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# Monta o diretório 'frontend' para servir o CSS e JS
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

# --- Dependências ---

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    import os
    try:
        # Tenta ler com UTF-8 (codificação moderna)
        with open("frontend/index.html", encoding="utf-8") as f:
            return HTMLResponse(content=f.read(), status_code=200)
    except UnicodeDecodeError:
        # Se falhar, tenta com a codificação padrão do sistema
        with open("frontend/index.html", encoding="cp1252") as f:
            return HTMLResponse(content=f.read(), status_code=200)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# --- Endpoints de Autenticação ---

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Endpoints de Usuários ---

async def get_current_active_user(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except auth.JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user

@app.post("/users/", response_model=schemas.User)
def create_client_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != 'architect':
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem criar usuários.")
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já registrado.")
    user.role = 'client' # Garante que o arquiteto só crie clientes
    return crud.create_user(db=db, user=user)

@app.get("/users/clients", response_model=List[schemas.User])
def get_all_clients(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != 'architect':
        raise HTTPException(status_code=403, detail="Acesso não permitido.")
    users = crud.get_users(db)
    return [user for user in users if user.role == 'client']

# --- Endpoints de Projetos ---

@app.post("/projects/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    if current_user.role != 'architect':
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem criar projetos.")
    
    # Valida se o cliente existe antes de criar o projeto
    client = crud.get_user(db, user_id=project.client_id)
    if not client or client.role != 'client':
        raise HTTPException(status_code=404, detail=f"Cliente com ID {project.client_id} não encontrado.")

    return crud.create_project(db=db, project=project, architect_id=current_user.id)

@app.get("/projects/", response_model=List[schemas.Project])
def read_projects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user), status: Optional[str] = None):
    if current_user.role == 'architect':
        return crud.get_projects_by_architect(db, architect_id=current_user.id, status=status)
    else: # Cliente
        return crud.get_projects_by_client(db, client_id=current_user.id)

@app.put("/projects/{project_id}/finalize", response_model=schemas.Project)
def finalize_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    if current_user.role != 'architect':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas arquitetos podem finalizar projetos.")
    
    project = crud.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado.")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para finalizar este projeto.")
    if project.status == "Concluída":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Projeto já está concluído.")

    updated_project = crud.update_project_status(db, project_id, "Concluída", datetime.utcnow())
    return updated_project

@app.get("/projects/{project_id}/report")
def get_project_report(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    project = crud.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado.")

    # Valida se o usuário tem permissão para ver o relatório
    if current_user.role == 'client':
        client_projects = crud.get_projects_by_client(db, client_id=current_user.id)
        client_project_ids = {p.id for p in client_projects}
        if project.id not in client_project_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para acessar este relatório.")
    elif current_user.role == 'architect':
        if project.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para acessar este relatório.")
    
    pdf_bytes = pdf_generator.create_project_report(project)
    
    return Response(content=pdf_bytes, media_type='application/pdf')

# --- Endpoints de Despesas ---

@app.post("/projects/{project_id}/expenses/", response_model=schemas.Expense)
def create_expense_for_project(
    project_id: int,
    name: str = Form(...),
    value: float = Form(...),
    category: str = Form(...),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    if current_user.role != 'architect':
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem adicionar despesas.")

    project = crud.get_project(db, project_id=project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para adicionar despesas a este projeto.")

    photo_url = None
    if photo:
        _, extension = os.path.splitext(photo.filename)
        safe_filename = f"{int(time.time())}_{project_id}{extension}"
        file_location = f"uploads/{safe_filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(photo.file, file_object)
        photo_url = f"/{file_location}"
    
    expense_data = schemas.ExpenseCreate(name=name, value=value, category=category)
    
    return crud.create_expense(db=db, project_id=project_id, expense=expense_data, photo_url=photo_url)

@app.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    if current_user.role != 'client':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas clientes podem excluir despesas.")

    expense = crud.get_expense(db, expense_id=expense_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Despesa não encontrada.")

    client_projects = crud.get_projects_by_client(db, client_id=current_user.id)
    client_project_ids = {p.id for p in client_projects}
    if expense.project_id not in client_project_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para excluir esta despesa.")

    crud.delete_expense(db, expense_id=expense_id)
    return {"message": "Despesa excluída com sucesso."}

# --- Endpoints de Fases do Projeto (Cronograma) ---

@app.get("/projects/{project_id}/phases", response_model=List[schemas.ProjectPhase])
def get_project_phases(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    project = crud.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")

    # Verificar permissão
    if current_user.role == 'architect' and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para acessar este projeto.")
    elif current_user.role == 'client':
        client_projects = crud.get_projects_by_client(db, client_id=current_user.id)
        client_project_ids = {p.id for p in client_projects}
        if project_id not in client_project_ids:
            raise HTTPException(status_code=403, detail="Sem permissão para acessar este projeto.")

    return crud.get_project_phases(db, project_id=project_id)

@app.post("/projects/{project_id}/phases", response_model=schemas.ProjectPhase)
def create_project_phase(
    project_id: int,
    phase: schemas.ProjectPhaseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    project = crud.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")

    if current_user.role != 'architect' or project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem criar fases.")

    return crud.create_project_phase(db=db, phase=phase, project_id=project_id)

@app.put("/phases/{phase_id}", response_model=schemas.ProjectPhase)
def update_project_phase(
    phase_id: int,
    phase_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    phase = crud.get_project_phase(db, phase_id=phase_id)
    if not phase:
        raise HTTPException(status_code=404, detail="Fase não encontrada.")

    project = crud.get_project(db, project_id=phase.project_id)
    if current_user.role != 'architect' or project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem atualizar fases.")

    return crud.update_project_phase(db, phase_id=phase_id, phase_data=phase_data)

@app.delete("/phases/{phase_id}")
def delete_project_phase(
    phase_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    phase = crud.get_project_phase(db, phase_id=phase_id)
    if not phase:
        raise HTTPException(status_code=404, detail="Fase não encontrada.")

    project = crud.get_project(db, project_id=phase.project_id)
    if current_user.role != 'architect' or project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem excluir fases.")

    crud.delete_project_phase(db, phase_id=phase_id)
    return {"message": "Fase excluída com sucesso."}

# --- Endpoints de Checklist (Controle de Qualidade) ---

@app.get("/projects/{project_id}/checklist", response_model=List[schemas.Checklist])
def get_project_checklist(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    project = crud.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")

    # Verificar permissão
    if current_user.role == 'architect' and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para acessar este projeto.")
    elif current_user.role == 'client':
        client_projects = crud.get_projects_by_client(db, client_id=current_user.id)
        client_project_ids = {p.id for p in client_projects}
        if project_id not in client_project_ids:
            raise HTTPException(status_code=403, detail="Sem permissão para acessar este projeto.")

    return crud.get_project_checklist(db, project_id=project_id)

@app.post("/projects/{project_id}/checklist", response_model=schemas.Checklist)
def create_checklist_item(
    project_id: int,
    item: schemas.ChecklistCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    project = crud.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")

    if current_user.role != 'architect' or project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem criar itens de checklist.")

    return crud.create_checklist_item(db=db, item=item, project_id=project_id)

@app.put("/checklist/{item_id}/toggle", response_model=schemas.Checklist)
def toggle_checklist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    item = crud.get_checklist_item(db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item de checklist não encontrado.")

    project = crud.get_project(db, project_id=item.project_id)
    if current_user.role != 'architect' or project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem atualizar checklist.")

    return crud.toggle_checklist_item(db, item_id=item_id)

@app.put("/checklist/{item_id}", response_model=schemas.Checklist)
def update_checklist_item(
    item_id: int,
    item_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    item = crud.get_checklist_item(db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item de checklist não encontrado.")

    project = crud.get_project(db, project_id=item.project_id)
    if current_user.role != 'architect' or project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem atualizar checklist.")

    return crud.update_checklist_item(db, item_id=item_id, item_data=item_data)

@app.delete("/checklist/{item_id}")
def delete_checklist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    item = crud.get_checklist_item(db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item de checklist não encontrado.")

    project = crud.get_project(db, project_id=item.project_id)
    if current_user.role != 'architect' or project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem excluir checklist.")

    crud.delete_checklist_item(db, item_id=item_id)
    return {"message": "Item de checklist excluído com sucesso."}