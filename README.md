# 🏗️ Ybyoca - Sistema de Gestão de Obras Premium

[![GitHub stars](https://img.shields.io/github/stars/gabrielarrudexx/YBYOCA.svg?style=social&label=Star)](https://github.com/gabrielarrudexx/YBYOCA)
[![GitHub forks](https://img.shields.io/github/forks/gabrielarrudexx/YBYOCA.svg?style=social&label=Fork)](https://github.com/gabrielarrudexx/YBYOCA)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Sobre o Projeto

O **Ybyoca** é um sistema completo e profissional para gestão de obras, projetado para arquitetos e clientes acompanharem projetos em tempo real. Com interface moderna e totalmente responsiva, oferece todas as ferramentas necessárias para administrar projetos, despesas e gerar relatórios detalhados.

## ✨ Características Principais

### 🎨 **Interface Profissional**
- Layout moderno com colunas bem definidas (4+8 grid)
- Alta legibilidade sem textos brancos
- Design responsivo para todos os dispositivos
- Cores profissionais e agradáveis
- Glassmorphism e animações suaves

### 🔐 **Sistema de Login**
- Autenticação JWT segura
- Papéis de usuário (Arquiteto/Cliente)
- Dashboard personalizado por role
- Sessões seguras com gerenciamento automático

### 📊 **Dashboard Completo**
- Analytics em tempo real
- Cards informativos com métricas principais
- Visualização de progresso financeiro
- Gráficos e estatísticas detalhadas

### 🏗️ **Gestão de Projetos**
- Criação e edição de projetos
- Vinculação com clientes
- Acompanhamento de orçamento vs gastos
- Status de projetos (Ativo/Concluído)

### 💰 **Controle de Despesas**
- Categorias de despesas (Matéria Prima, Mão de Obra, Custos Variados)
- Upload de comprovantes com fotos
- Controle financeiro detalhado
- Saldo restante em tempo real

### 📄 **Relatórios PDF**
- Geração automática de relatórios
- Formatação profissional para impressão
- Sumário financeiro completo
- Histórico de todas as despesas

### 📱 **Totalmente Responsivo**
- Mobile-first design
- Menu hambúrguer para dispositivos móveis
- Interface touch-friendly
- Otimizado para tablets e desktops

## 🚀 **Deploy Automático no Replit**

Este projeto está **100% otimizado para funcionar no Replit** sem configurações adicionais!

### ⚡ **Como Usar no Replit**

1. **Clone ou importe o repositório**: `https://github.com/gabrielarrudexx/YBYOCA.git`
2. **Clique em "Run"** no Replit
3. **Acesse o sistema** com as credenciais padrão

### 🔑 **Acesso Padrão**
- **E-mail**: `admin@ybyoca.com`
- **Senha**: `admin`

## 🛠️ **Tecnologias Utilizadas**

### **Backend**
- **FastAPI**: Framework moderno e rápido
- **SQLAlchemy**: ORM para banco de dados
- **SQLite**: Banco de dados leve e portável
- **JWT**: Autenticação segura
- **bcrypt**: Hash de senhas
- **PyPDF2**: Geração de relatórios PDF

### **Frontend**
- **HTML5**: Estrutura semântica
- **CSS3**: Design moderno com Tailwind CSS
- **JavaScript ES6+**: Lógica interativa
- **Responsive Design**: Mobile-first
- **Glassmorphism**: Design moderno

### **Infraestrutura**
- **Replit**: Hospedagem automática
- **GitHub**: Controle de versão
- **CORS**: Configuração de segurança

## 📁 **Estrutura do Projeto**

```
📦 Ybyoca/
├── 📁 backend/                 # API FastAPI
│   ├── 📄 main.py             # Servidor principal
│   ├── 📄 models.py           # Models do banco
│   ├── 📄 crud.py             # Operações CRUD
│   ├── 📄 auth.py             # Autenticação
│   ├── 📄 schemas.py          # Schemas Pydantic
│   ├── 📄 config.py           # Configurações
│   ├── 📄 database.py         # Conexão BD
│   └── 📄 pdf_generator.py    # Geração PDF
├── 📁 frontend/                # Interface Web
│   ├── 📄 index.html          # Página principal
│   ├── 📄 style.css           # Estilos modernos
│   ├── 📄 app.js              # Lógica JavaScript
│   ├── 📄 config.js           # Configurações
│   └── 🖼️ logo.jpg            # Logo do sistema
├── 📁 uploads/                 # Arquivos enviados
├── 📁 video_editor/            # Editor de vídeos (adicional)
├── 📄 requirements.txt         # Dependências Python
├── 📄 .replit                  # Configuração Replit
├── 📄 run.py                   # Script inicialização
├── 📄 README.md               # Este arquivo
└── 📄 README_REPLIT.md         # Guia específico Replit
```

## 🎯 **Como Usar**

### **Para Arquitetos**
1. **Faça login** com credenciais de arquiteto
2. **Crie clientes** no painel lateral
3. **Cadastre projetos** vinculando aos clientes
4. **Acompanhe o progresso** em tempo real
5. **Lançe despesas** por categoria
6. **Gere relatórios** PDF para entrega

### **Para Clientes**
1. **Faça login** com credenciais fornecidas
2. **Visualize seus projetos** ativos
3. **Acompanhe o andamento** financeiro
4. **Veja detalhes** das despesas
5. **Acesse relatórios** concluídos

## 🔧 **Configuração Local**

Se preferir rodar localmente:

```bash
# Clone o repositório
git clone https://github.com/gabrielarrudexx/YBYOCA.git
cd YBYOCA

# Instale as dependências
pip install -r requirements.txt

# Execute o servidor
python run.py
```

## 🌐 **Deploy em Produção**

### **Replit (Recomendado)**
- Importe o repositório
- Clique em Run
- Pronto! 🎉

### **Outros provedores**
- Configure variáveis de ambiente
- Instale dependências
- Execute: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

## 📊 **Screenshots**

*(Adicione aqui screenshots da interface quando disponível)*

## 🤝 **Contribuindo**

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar issues
- Sugerir melhorias
- Enviar Pull Requests

## 📝 **License**

Este projeto está licenciado sob a MIT License.

## 👥 **Desenvolvedores**

- **[@gabrielarrudexx](https://github.com/gabrielarrudexx)** - Desenvolvedor Principal

## 🙏 **Agradecimentos**

- FastAPI pela API moderna e rápida
- Tailwind CSS pelo design incrível
- Replit pela plataforma de desenvolvimento
- Comunidade Python pelo suporte

---

**🚀 Sistema pronto para uso! Veja como é fácil gerenciar suas obras com o Ybyoca!**