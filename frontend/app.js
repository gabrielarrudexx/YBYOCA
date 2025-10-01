// frontend/app.js - Versão Responsiva e Aprimorada

// Sistema de Notificações Toast
class ToastManager {
    static show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '[OK]' : type === 'error' ? '[X]' : '[!]';
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2 font-bold">${icon}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Sistema de Menu Mobile
class MobileMenu {
    static init() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const headerMenuToggle = document.getElementById('header-menu-toggle');
        const sidebar = document.getElementById('mobile-sidebar');
        const overlay = document.getElementById('mobile-overlay');
        const closeBtn = document.getElementById('mobile-sidebar-close');

        const openMenu = () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeMenu = () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        menuToggle?.addEventListener('click', openMenu);
        headerMenuToggle?.addEventListener('click', openMenu);
        closeBtn?.addEventListener('click', closeMenu);
        overlay?.addEventListener('click', closeMenu);
    }
}

// Dashboard Analytics Manager
class DashboardManager {
    static updateAnalytics(projects, clients) {
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === "Em Andamento").length;
        const totalInvested = projects.reduce((sum, p) => sum + p.spent, 0);
        const activeClients = clients.length;

        document.getElementById('dashboard-total-projects').textContent = totalProjects;
        document.getElementById('dashboard-active-projects').textContent = activeProjects;
        document.getElementById('dashboard-total-invested').textContent = `R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('dashboard-active-clients').textContent = activeClients;
    }

    static updateProgressBar(project) {
        const progressBar = document.getElementById('progress-bar');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressStatus = document.getElementById('progress-status');

        if (!project || !progressBar) return;

        const percentage = Math.min((project.spent / project.budget) * 100, 100);
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage.toFixed(1)}%`;

        if (percentage > 100) {
            progressStatus.textContent = 'Atencao: Orcamento Estourado';
            progressStatus.className = 'text-red-600 font-semibold';
            progressBar.className = 'bg-gradient-to-r from-red-500 to-orange-500 h-4 rounded-full transition-all duration-500';
        } else if (percentage > 80) {
            progressStatus.textContent = 'Atencao: Quase do limite';
            progressStatus.className = 'text-yellow-600 font-semibold';
        } else if (percentage === 100) {
            progressStatus.textContent = 'Orcamento Esgotado';
            progressStatus.className = 'text-green-600 font-semibold';
        } else {
            progressStatus.textContent = 'Em Andamento';
            progressStatus.className = 'text-green-600 font-semibold';
        }
    }
}

// Responsividade e Utilidades
class ResponsiveHelper {
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static setupCategoryButtons() {
        const categoryRadios = document.querySelectorAll('input[name="expenseCategory"]');
        const categoryBtns = document.querySelectorAll('.category-btn');

        const updateCategoryButtons = () => {
            const selectedCategory = document.querySelector('input[name="expenseCategory"]:checked')?.value;

            categoryBtns.forEach(btn => {
                const category = btn.dataset.category;
                if (category === selectedCategory) {
                    btn.classList.add('border-blue-500', 'bg-blue-50');
                    btn.classList.remove('border-gray-300', 'bg-white');
                } else {
                    btn.classList.remove('border-blue-500', 'bg-blue-50');
                    btn.classList.add('border-gray-300', 'bg-white');
                }
            });
        };

        categoryRadios.forEach(radio => {
            radio.addEventListener('change', updateCategoryButtons);
        });

        // Initialize
        updateCategoryButtons();
    }

    static optimizeForMobile() {
        if (!this.isMobile()) return;

        // Ajustar elementos específicos para mobile
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.classList.add('card-mobile');
        });

        // Otimizar scroll
        const scrollableElements = document.querySelectorAll('.max-h-64, .max-h-96');
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
        });
    }
}

function getCategoryClass(category) {
    switch (category) {
        case 'Matéria Prima': return 'bg-blue-100 text-blue-800';
        case 'Mão de Obra': return 'bg-green-100 text-green-800';
        case 'Custos Variados': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Configuração automática da URL da API para diferentes ambientes
    function getApiUrl() {
        const currentHost = window.location.origin;

        // Se estiver no Replit, usa a URL atual como base da API
        if (currentHost.includes('replit.dev')) {
            return currentHost;
        }

        // Se estiver em localhost, usa o backend local
        if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
            return 'http://127.0.0.1:8000';
        }

        // Para outros ambientes, usa a URL atual
        return currentHost;
    }

    const API_URL = getApiUrl();
    console.log('API URL configurada para:', API_URL);

    // --- Estado Global da Aplicação ---
    let architectState = { allProjects: [], activeProjects: [], completedProjects: [], clients: [] };
    let selectedProjectId = null;

    // --- Elementos da UI ---
    const loginView = document.getElementById('login-view');
    const architectView = document.getElementById('architect-view');
    const clientView = document.getElementById('client-view');
    const completedClientView = document.getElementById('completed-client-view'); // Novo
    const clientProjectSelectionView = document.getElementById('client-project-selection-view');
    const views = [loginView, architectView, clientView, completedClientView, clientProjectSelectionView];
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // --- Funções de API ---
    const api = {
        async login(email, password) {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);
            const response = await fetch(`${API_URL}/token`, { method: 'POST', body: formData });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Erro de comunicação com o servidor' }));
                throw new Error(errorData.detail || 'Falha no login');
            }
            return response.json();
        },
        async get(endpoint) {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`${API_URL}${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar dados');
            return response.json();
        },
        async post(endpoint, data) {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha ao criar recurso');
            }
            return response.json();
        },
        async postForm(endpoint, formData) {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha ao enviar formulário');
            }
            return response.json();
        },
        async delete(endpoint) {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha ao excluir recurso');
            }
            return response.json();
        },
        async put(endpoint, data) {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha ao atualizar recurso');
            }
            return response.json();
        }
    };

    // --- Gerenciamento de Views ---
    function showView(viewId) {
        views.forEach(view => view.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
    }

    // --- Lógica de Autenticação ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');
        try {
            const data = await api.login(loginForm.email.value, loginForm.password.value);
            localStorage.setItem('userToken', data.access_token);
            initializeApp();
        } catch (error) {
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
        }
    });

    function logout() {
        localStorage.removeItem('userToken');
        selectedProjectId = null;
        architectState = { allProjects: [], activeProjects: [], completedProjects: [], clients: [] };
        showView('login-view');
    }

    // --- Funções de Finalização de Obra ---
    async function handleFinalizeProject() {
        if (!selectedProjectId) {
            alert("Nenhum projeto selecionado para finalizar.");
            return;
        }
        if (!confirm("Tem certeza que deseja finalizar esta obra? Esta ação não pode ser desfeita.")) {
            return;
        }
        try {
            await api.put(`/projects/${selectedProjectId}/finalize`, {}); // PUT request
            alert("Obra finalizada com sucesso!");
            await loadArchitectDashboard(); // Recarrega o dashboard do arquiteto
        } catch (error) {
            alert(error.message);
        }
    }

    // --- Renderização do Painel do Arquiteto ---
    async function loadArchitectDashboard() {
        try {
            // Busca todos os projetos e clientes
            [architectState.allProjects, architectState.clients] = await Promise.all([
                api.get('/projects/'),
                api.get('/users/clients')
            ]);

            // Filtra projetos ativos e concluídos
            architectState.activeProjects = architectState.allProjects.filter(p => p.status === "Em Andamento");
            architectState.completedProjects = architectState.allProjects.filter(p => p.status === "Concluída");

            // Atualizar dashboard analytics
            DashboardManager.updateAnalytics(architectState.allProjects, architectState.clients);

            renderArchitectProjects();
            renderCompletedProjects(); // Nova função para renderizar concluídos
            renderClientList();
            populateClientSelect();
            showView('architect-view');

            // Mostrar estado vazio ou detalhes
            if (selectedProjectId) {
                loadProjectDetails(selectedProjectId);
            } else {
                document.getElementById('architect-project-details').classList.add('hidden');
                document.getElementById('empty-state').classList.remove('hidden');
            }

            // Otimizar para mobile
            ResponsiveHelper.optimizeForMobile();
            ResponsiveHelper.setupCategoryButtons();
        } catch (error) {
            console.error('Erro ao carregar painel do arquiteto:', error);
            ToastManager.show('Erro ao carregar painel. Tente novamente.', 'error');
            logout();
        }
    }

    function renderArchitectProjects() {
        const projectList = document.getElementById('project-list-architect');
        projectList.innerHTML = architectState.activeProjects.length ? '' : '<p class="text-sm text-gray-500">Nenhum projeto em andamento.</p>';
        architectState.activeProjects.forEach(p => {
            const div = document.createElement('div');
            div.className = 'p-2 border rounded-md cursor-pointer hover:bg-gray-50';
            div.textContent = p.name;
            div.addEventListener('click', () => loadProjectDetails(p.id));
            projectList.appendChild(div);
        });
    }

    function renderCompletedProjects() {
        const completedProjectList = document.getElementById('completed-projects-list-architect');
        completedProjectList.innerHTML = architectState.completedProjects.length ? '' : '<p class="text-sm text-gray-500">Nenhuma obra finalizada.</p>';
        architectState.completedProjects.forEach(p => {
            const div = document.createElement('div');
            div.className = 'p-2 border rounded-md cursor-pointer hover:bg-gray-50';
            div.textContent = `${p.name} (Concluída em ${new Date(p.completed_at).toLocaleDateString()})`;
            div.addEventListener('click', () => loadProjectDetails(p.id)); // Pode clicar para ver detalhes
            completedProjectList.appendChild(div);
        });
    }

    function renderClientList() {
        const clientList = document.getElementById('client-list');
        clientList.innerHTML = architectState.clients.length ? '' : '<p class="text-sm text-gray-500">Nenhum cliente cadastrado.</p>';
        architectState.clients.forEach(c => {
            const div = document.createElement('div');
            div.className = 'p-2 border rounded-md';
            div.textContent = c.email;
            clientList.appendChild(div);
        });
    }

    function populateClientSelect() {
        const select = document.getElementById('project-client-select');
        select.innerHTML = '<option value="">Selecione...</option>';
        architectState.clients.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.email;
            select.appendChild(option);
        });
    }

    function loadProjectDetails(projectId) {
        selectedProjectId = projectId; // Define o estado do projeto selecionado
        const project = architectState.allProjects.find(p => p.id === projectId); // Busca em todos os projetos
        if (!project) { return; }

        // Esconder estado vazio e mostrar detalhes
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('architect-project-details').classList.remove('hidden');

        // Atualizar informações básicas
        document.getElementById('details-project-name').textContent = project.name;
        document.getElementById('details-project-budget').textContent = `R$ ${project.budget.toFixed(2)}`;
        document.getElementById('details-project-spent').textContent = `R$ ${project.spent.toFixed(2)}`;

        const remaining = project.budget - project.spent;
        const remainingEl = document.getElementById('details-project-remaining');
        remainingEl.textContent = `R$ ${remaining.toFixed(2)}`;
        remainingEl.className = 'font-bold ';
        if (remaining < 0) { remainingEl.classList.add('text-red-600'); }
        else if (remaining < project.budget * 0.25) { remainingEl.classList.add('text-yellow-500'); }
        else { remainingEl.classList.add('text-green-600'); }

        // Atualizar barra de progresso
        DashboardManager.updateProgressBar(project);

        // Esconde a área de lançamento de despesas e o botão finalizar se a obra estiver concluída
        const expenseLaunchArea = document.getElementById('expense-launch-area');
        const finalizeButton = document.getElementById('finalize-project-button');
        if (project.status === "Concluída") {
            expenseLaunchArea.classList.add('hidden');
            finalizeButton.classList.add('hidden');
        } else {
            expenseLaunchArea.classList.remove('hidden');
            finalizeButton.classList.remove('hidden');
        }

        // Atualizar contador de despesas
        const expensesCount = document.getElementById('expenses-count');
        expensesCount.textContent = `${project.expenses.length} itens`;

        // Renderiza a lista de despesas existentes (versão responsiva)
        const expenseList = document.getElementById('expense-list-architect');

        if (project.expenses.length === 0) {
            expenseList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p>Nenhuma despesa lançada ainda</p>
                </div>
            `;
        } else {
            expenseList.innerHTML = '';
            project.expenses.forEach(e => {
                const div = document.createElement('div');
                div.className = 'bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow';

                // Versão mobile-friendly do card de despesa
                const categoryIcon = e.category === 'Matéria Prima' ? '[MP]' :
                                   e.category === 'Mão de Obra' ? '[MO]' : '[CV]';

                div.innerHTML = `
                    <div class="flex-responsive between items-start">
                        <div class="flex items-center space-x-3 flex-grow min-w-0">
                            ${e.photo_url ?
                                `<img src="${API_URL}${e.photo_url}" alt="${e.name}" class="img-card flex-shrink-0">` :
                                `<div class="img-card bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span class="text-2xl">${categoryIcon}</span>
                                </div>`
                            }
                            <div class="min-w-0 flex-1">
                                <h4 class="font-semibold text-gray-800 truncate">${e.name}</h4>
                                <p class="text-lg font-bold text-gray-900">R$ ${e.value.toFixed(2)}</p>
                                <span class="text-xs font-medium px-2 py-1 rounded-full ${getCategoryClass(e.category)} inline-block mt-1">
                                    ${e.category}
                                </span>
                            </div>
                        </div>
                        <button class="btn-secondary btn-small delete-expense-btn flex-shrink-0" data-expense-id="${e.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Excluir
                        </button>
                    </div>
                `;
                expenseList.appendChild(div);
            });
        }
    }

    async function handleDeleteExpense(event) {
        const expenseId = event.target.closest('.delete-expense-btn').dataset.expenseId;
        if (!confirm('Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.')) {
            return;
        }
        try {
            await api.delete(`/expenses/${expenseId}`);
            ToastManager.show('Despesa excluída com sucesso!', 'success');

            // Recarregar dashboard dependendo do tipo de usuário
            if (architectState.allProjects.length > 0) {
                await loadArchitectDashboard();
                if (selectedProjectId) {
                    loadProjectDetails(selectedProjectId);
                }
            } else {
                await loadClientDashboard();
            }
        } catch (error) {
            ToastManager.show('Erro ao excluir despesa: ' + error.message, 'error');
        }
    }

    // --- Renderização do Painel do Cliente ---
    function showClientProjectDetails(project) {
        if (project.status === "Concluída") {
            loadCompletedClientProject(project);
        } else {
            renderClientProject(project);
            showView('client-view');
        }
    }

    async function loadClientDashboard() {
        try {
            const projects = await api.get('/projects/'); // Busca todos os projetos do cliente
            
            if (projects.length === 0) {
                const container = document.getElementById('client-project-details');
                container.innerHTML = '<p>Nenhuma obra vinculada a você.</p>';
                showView('client-view');
                return;
            }

            if (projects.length === 1) {
                // Se houver apenas um projeto, mostre-o diretamente
                showClientProjectDetails(projects[0]);
            } else {
                // Se houver múltiplos projetos, mostre a tela de seleção
                const projectListContainer = document.getElementById('client-projects-list');
                projectListContainer.innerHTML = ''; // Limpa a lista anterior
                
                projects.forEach(project => {
                    const div = document.createElement('div');
                    div.className = 'p-4 border rounded-lg cursor-pointer hover:bg-gray-100';
                    div.innerHTML = `
                        <p class="font-bold text-lg">${project.name}</p>
                        <p class="text-sm ${project.status === 'Concluída' ? 'text-gray-500' : 'text-green-600'}">${project.status}</p>
                    `;
                    div.addEventListener('click', () => showClientProjectDetails(project));
                    projectListContainer.appendChild(div);
                });

                showView('client-project-selection-view');
            }
        } catch (error) {
            console.error('Erro ao carregar painel do cliente:', error);
            logout();
        }
    }

    async function renderClientProject(project) {
        // Atualizar mensagem de boas-vindAS
        document.getElementById('client-welcome').textContent = `Acompanhando: ${project.name}`;

        // Calcular métricas
        const remaining = project.budget - project.spent;
        const spentPercentage = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
        const daysActive = project.created_at ? Math.ceil((new Date() - new Date(project.created_at)) / (1000 * 60 * 60 * 24)) : 0;

        // Atualizar KPIs principais
        document.getElementById('client-budget').textContent = `R$ ${project.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('client-spent').textContent = `R$ ${project.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('client-remaining').textContent = `R$ ${remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('spent-percentage').textContent = `${spentPercentage.toFixed(1)}% do orçamento`;

        // Atualizar status do saldo
        const remainingStatus = document.getElementById('remaining-status');
        const remainingEl = document.getElementById('client-remaining');
        if (remaining < 0) {
            remainingStatus.textContent = 'Orçamento estourado';
            remainingEl.parentElement.parentElement.classList.add('bg-red-600');
            remainingEl.parentElement.parentElement.classList.remove('from-purple-500', 'to-purple-600');
        } else if (remaining < project.budget * 0.25) {
            remainingStatus.textContent = 'Atenção: Saldo baixo';
            remainingEl.parentElement.parentElement.classList.add('bg-orange-600');
            remainingEl.parentElement.parentElement.classList.remove('from-purple-500', 'to-purple-600');
        } else {
            remainingStatus.textContent = 'Dentro do orçamento';
        }

        // Atualizar barras de progresso
        const budgetProgress = document.getElementById('budget-progress');
        const progressBarClient = document.getElementById('progress-bar-client');
        const progressCircle = document.getElementById('progress-circle');
        const progressCircleText = document.getElementById('progress-circle-text');

        const progressPercentage = Math.min(spentPercentage, 100);
        budgetProgress.style.width = `${progressPercentage}%`;
        progressBarClient.style.width = `${progressPercentage}%`;
        document.getElementById('client-progress').textContent = `${progressPercentage.toFixed(0)}%`;
        document.getElementById('progress-circle-text').textContent = `${progressPercentage.toFixed(0)}%`;

        // Atualizar círculo de progresso
        const circumference = 2 * Math.PI * 30; // r = 30
        const offset = circumference - (progressPercentage / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;

        // Calcular estatísticas
        const totalExpenses = project.expenses.length;
        const avgExpense = totalExpenses > 0 ? project.spent / totalExpenses : 0;
        const maxExpense = project.expenses.length > 0 ? Math.max(...project.expenses.map(e => e.value)) : 0;
        const categoryCounts = {};
        let mainCategory = '-';

        project.expenses.forEach(e => {
            categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
        });

        if (Object.keys(categoryCounts).length > 0) {
            mainCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);
        }

        // Atualizar estatísticas
        document.getElementById('total-expenses').textContent = totalExpenses;
        document.getElementById('avg-expense').textContent = `R$ ${avgExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('max-expense').textContent = `R$ ${maxExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('main-category').textContent = mainCategory;
        document.getElementById('days-active').textContent = daysActive;

        // Renderizar timeline
        renderClientTimeline(project);

        // Renderizar grid de despesas
        renderClientExpensesGrid(project);

        // Adicionar notificações importantes
        addClientNotifications(project);

        // Adicionar event listeners para filtros
        setupExpenseFilters(project);
    }

    function renderClientTimeline(project) {
        const timeline = document.getElementById('client-timeline');

        if (!project.expenses || project.expenses.length === 0) {
            timeline.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p>Nenhuma despesa registrada ainda</p>
                </div>
            `;
            return;
        }

        // Ordenar despesas por data (mais recentes primeiro)
        const sortedExpenses = [...project.expenses].sort((a, b) => {
            // Se não tiver data, colocar no final
            return new Date(b.created_at || '1970-01-01') - new Date(a.created_at || '1970-01-01');
        });

        let timelineHTML = '';
        sortedExpenses.slice(0, 10).forEach((expense, index) => {
            const date = expense.created_at ? new Date(expense.created_at).toLocaleDateString('pt-BR') : 'Data não informada';
            const time = expense.created_at ? new Date(expense.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
            const isRecent = index < 3;

            const categoryColors = {
                'Matéria Prima': 'bg-blue-100 text-blue-700 border-blue-200',
                'Mão de Obra': 'bg-green-100 text-green-700 border-green-200',
                'Custos Variados': 'bg-yellow-100 text-yellow-700 border-yellow-200'
            };

            const categoryClass = categoryColors[expense.category] || 'bg-gray-100 text-gray-700 border-gray-200';

            timelineHTML += `
                <div class="flex items-start space-x-4 ${isRecent ? 'bg-blue-50 p-4 rounded-lg border border-blue-200' : ''}">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 rounded-full ${isRecent ? 'bg-blue-600' : 'bg-gray-300'} flex items-center justify-center text-white font-semibold text-sm">
                            ${index + 1}
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-semibold text-gray-900 truncate">${expense.name}</h4>
                            <span class="text-lg font-bold text-gray-900">R$ ${expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="text-xs px-2 py-1 rounded-full ${categoryClass}">${expense.category}</span>
                            <span class="text-xs text-gray-500">${date} ${time}</span>
                        </div>
                        ${expense.photo_url ?
                            `<img src="${API_URL}${expense.photo_url}" alt="${expense.name}" class="w-full h-32 object-cover rounded-lg mt-2">` :
                            ''
                        }
                    </div>
                </div>
            `;
        });

        timeline.innerHTML = timelineHTML;
    }

    function renderClientExpensesGrid(project) {
        const grid = document.getElementById('client-expenses-grid');

        if (!project.expenses || project.expenses.length === 0) {
            grid.innerHTML = `
                <div class="text-center py-12 col-span-full">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="text-gray-500">Nenhuma despesa registrada</p>
                </div>
            `;
            return;
        }

        let gridHTML = '';
        project.expenses.forEach(expense => {
            const categoryColors = {
                'Matéria Prima': 'from-blue-500 to-blue-600',
                'Mão de Obra': 'from-green-500 to-green-600',
                'Custos Variados': 'from-yellow-500 to-yellow-600'
            };

            const categoryGradient = categoryColors[expense.category] || 'from-gray-500 to-gray-600';

            gridHTML += `
                <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div class="h-2 bg-gradient-to-r ${categoryGradient}"></div>
                    <div class="p-4">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs px-2 py-1 rounded-full ${categoryColors[expense.category] ? categoryColors[expense.category].replace('from-', 'bg-').replace(' to-', ' text-') : 'bg-gray-100 text-gray-700'}">
                                ${expense.category}
                            </span>
                            <span class="text-lg font-bold text-gray-900">R$ ${expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <h4 class="font-semibold text-gray-800 mb-2 truncate">${expense.name}</h4>
                        ${expense.photo_url ?
                            `<img src="${API_URL}${expense.photo_url}" alt="${expense.name}" class="w-full h-32 object-cover rounded-lg mb-2">` :
                            `<div class="w-full h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>`
                        }
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">${expense.created_at ? new Date(expense.created_at).toLocaleDateString('pt-BR') : 'Data não informada'}</span>
                            <button class="text-red-600 hover:text-red-800 transition" onclick="deleteExpenseFromClient(${expense.id})">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = gridHTML;
    }

    function addClientNotifications(project) {
        const notifications = document.getElementById('client-notifications');

        const notificationsData = [
            {
                type: 'success',
                title: 'Bem-vindo!',
                message: 'Sua obra está sendo acompanhada em tempo real.',
                time: 'Agora'
            }
        ];

        // Adicionar notificações baseadas no status do projeto
        const remaining = project.budget - project.spent;
        const spentPercentage = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;

        if (spentPercentage > 80) {
            notificationsData.push({
                type: 'warning',
                title: 'Atenção ao Orçamento',
                message: `Você já utilizou ${spentPercentage.toFixed(1)}% do orçamento.`,
                time: 'Importante'
            });
        }

        if (project.expenses.length > 0) {
            const lastExpense = project.expenses[project.expenses.length - 1];
            notificationsData.push({
                type: 'info',
                title: 'Nova Despesa Registrada',
                message: `${lastExpense.name} - R$ ${lastExpense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                time: 'Recente'
            });
        }

        let notificationsHTML = '';
        notificationsData.forEach(notif => {
            const typeColors = {
                success: 'bg-green-50 border-green-200',
                warning: 'bg-yellow-50 border-yellow-200',
                info: 'bg-blue-50 border-blue-200',
                error: 'bg-red-50 border-red-200'
            };

            const dotColors = {
                success: 'bg-green-500',
                warning: 'bg-yellow-500',
                info: 'bg-blue-500',
                error: 'bg-red-500'
            };

            notificationsHTML += `
                <div class="flex items-start space-x-3 p-3 ${typeColors[notif.type]} rounded-lg border">
                    <div class="w-2 h-2 ${dotColors[notif.type]} rounded-full mt-2"></div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800">${notif.title}</p>
                        <p class="text-xs text-gray-600">${notif.message}</p>
                        <p class="text-xs text-gray-500 mt-1">${notif.time}</p>
                    </div>
                </div>
            `;
        });

        notifications.innerHTML = notificationsHTML;
    }

    function setupExpenseFilters(project) {
        const filterButtons = {
            'filter-all': null,
            'filter-material': 'Matéria Prima',
            'filter-labor': 'Mão de Obra',
            'filter-misc': 'Custos Variados'
        };

        Object.entries(filterButtons).forEach(([buttonId, category]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    // Atualizar estilos dos botões
                    Object.keys(filterButtons).forEach(id => {
                        const btn = document.getElementById(id);
                        if (btn) {
                            btn.classList.remove('bg-blue-100', 'text-blue-700');
                            btn.classList.add('bg-gray-100', 'text-gray-700');
                        }
                    });
                    button.classList.remove('bg-gray-100', 'text-gray-700');
                    button.classList.add('bg-blue-100', 'text-blue-700');

                    // Filtrar despesas
                    const filteredExpenses = category ?
                        project.expenses.filter(e => e.category === category) :
                        project.expenses;

                    // Criar um projeto temporário com as despesas filtradas
                    const filteredProject = { ...project, expenses: filteredExpenses };
                    renderClientExpensesGrid(filteredProject);
                });
            }
        });
    }

    function deleteExpenseFromClient(expenseId) {
        if (!confirm('Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.')) {
            return;
        }

        handleDeleteExpense({ target: { closest: () => ({ dataset: { expenseId } }) } });
    }

    // Função de feedback do cliente
    window.sendFeedback = function(type) {
        const feedbackMessages = {
            'excelent': 'Que otimo! Ficamos felizes que voce esteja satisfeito com o andamento.',
            'good': 'Obrigado pelo feedback! Vamos continuar trabalhando para melhorar.',
            'concerned': 'Entendemos sua preocupacao. Nossa equipe ira analisar e entrar em contato.',
            'contact': 'Perfeito! Entre em contato direto: +55 34 9943-6350'
        };

        if (type === 'contact') {
            // Abrir WhatsApp
            window.open('https://wa.me/553499436350?text=Olá! Gostaria de tirar uma dúvida sobre minha obra.', '_blank');
            ToastManager.show('Abrindo WhatsApp para contato direto...', 'success');
        } else {
            ToastManager.show(feedbackMessages[type], 'success');
        }

        // Aqui voce poderia enviar o feedback para o backend
        console.log('Feedback do cliente:', type);
    }

    async function loadCompletedClientProject(project) {
        // Atualizar mensagem de boas-vindas
        document.getElementById('completed-welcome').textContent = `Parabéns! O projeto "${project.name}" foi concluído com sucesso!`;

        // Calcular métricas
        const remaining = project.budget - project.spent;
        const percentageDifference = project.budget > 0 ? (remaining / project.budget) * 100 : 0;

        // Atualizar cards principais
        document.getElementById('completed-project-budget').textContent = `R$ ${project.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('completed-project-spent').textContent = `R$ ${project.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('completed-project-remaining').textContent = `${remaining >= 0 ? 'Economia: ' : 'Estouro: '} R$ ${Math.abs(remaining).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('difference-percentage').textContent = `${Math.abs(percentageDifference).toFixed(1)}% ${remaining >= 0 ? 'economia' : 'estouro'}`;

        // Calcular duração
        let duration = "N/A";
        if (project.created_at && project.completed_at) {
            const startDate = new Date(project.created_at);
            const endDate = new Date(project.completed_at);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            duration = `${diffDays} dias`;
        }
        document.getElementById('completed-project-duration').textContent = duration;

        // Renderizar timeline premium
        renderCompletedTimeline(project);

        showView('completed-client-view');

        document.getElementById('logout-button-completed-client').addEventListener('click', logout);

        document.getElementById('print-report-button').addEventListener('click', async () => {
            try {
                const token = localStorage.getItem('userToken');
                const response = await fetch(`${API_URL}/projects/${project.id}/report`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Falha ao gerar o relatório. Status: ' + response.status);
                }

                const pdfBlob = await response.blob();
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');

            } catch (error) {
                console.error('Erro ao imprimir relatório:', error);
                ToastManager.show('Não foi possível gerar o relatório. Tente novamente.', 'error');
            }
        });
    }

    function renderCompletedTimeline(project) {
        const timeline = document.getElementById('completed-expenses-list');

        if (!project.expenses || project.expenses.length === 0) {
            timeline.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p>Nenhuma despesa registrada neste projeto</p>
                </div>
            `;
            return;
        }

        // Ordenar despesas por data
        const sortedExpenses = [...project.expenses].sort((a, b) => {
            return new Date(b.created_at || '1970-01-01') - new Date(a.created_at || '1970-01-01');
        });

        let timelineHTML = '';
        sortedExpenses.forEach((expense, index) => {
            const date = expense.created_at ? new Date(expense.created_at).toLocaleDateString('pt-BR') : 'Data não informada';
            const time = expense.created_at ? new Date(expense.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

            const categoryColors = {
                'Matéria Prima': 'bg-blue-100 text-blue-700 border-blue-200',
                'Mão de Obra': 'bg-green-100 text-green-700 border-green-200',
                'Custos Variados': 'bg-yellow-100 text-yellow-700 border-yellow-200'
            };

            const categoryClass = categoryColors[expense.category] || 'bg-gray-100 text-gray-700 border-gray-200';

            timelineHTML += `
                <div class="flex items-start space-x-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">
                            ${index + 1}
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-gray-900 truncate">${expense.name}</h4>
                            <span class="text-xl font-bold text-green-600">R$ ${expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="text-xs px-3 py-1 rounded-full ${categoryClass} font-medium">${expense.category}</span>
                            <span class="text-sm text-gray-600">${date} ${time}</span>
                            <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✅ Concluído</span>
                        </div>
                        ${expense.photo_url ?
                            `<img src="${API_URL}${expense.photo_url}" alt="${expense.name}" class="w-full h-32 object-cover rounded-lg mt-2 shadow-md">` :
                            `<div class="w-full h-32 bg-gray-100 rounded-lg mt-2 flex items-center justify-center shadow-inner">
                                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>`
                        }
                    </div>
                </div>
            `;
        });

        timeline.innerHTML = timelineHTML;
    }

    // Funções extras para obras concluídas
    window.downloadFullReport = function() {
        window.print();
        ToastManager.show('Preparando relatório completo para impressão...', 'success');
    };

    window.shareResults = function() {
        if (navigator.share) {
            navigator.share({
                title: 'Obra Concluída com Sucesso!',
                text: 'Confira os resultados do meu projeto',
                url: window.location.href
            });
        } else {
            // Copiar link para área de transferência
            navigator.clipboard.writeText(window.location.href);
            ToastManager.show('Link copiado para a área de transferência!', 'success');
        }
    };

    window.contactForNewProject = function() {
        window.open('https://wa.me/553499436350?text=Olá! Gostaria de iniciar um novo projeto.', '_blank');
        ToastManager.show('Abrindo WhatsApp para novo projeto...', 'success');
    };

    // --- Modals e Forms ---
    const createClientModal = document.getElementById('create-client-modal');
    const createProjectModal = document.getElementById('create-project-modal');

    document.getElementById('show-create-client-modal').addEventListener('click', () => createClientModal.classList.remove('hidden'));
    document.getElementById('cancel-create-client').addEventListener('click', () => createClientModal.classList.add('hidden'));
    document.getElementById('create-client-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/', { email: e.target.elements['client-email'].value, password: e.target.elements['client-password'].value, role: 'client' });
            createClientModal.classList.add('hidden'); e.target.reset();
            loadArchitectDashboard();
        } catch (error) { alert(error.message); }
    });

    document.getElementById('show-create-project-modal').addEventListener('click', () => createProjectModal.classList.remove('hidden'));
    document.getElementById('cancel-create-project').addEventListener('click', () => createProjectModal.classList.add('hidden'));
    document.getElementById('create-project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const newProject = await api.post('/projects/', { name: e.target.elements['project-name'].value, budget: parseFloat(e.target.elements['project-budget'].value), client_id: parseInt(e.target.elements['project-client-select'].value) });
            createProjectModal.classList.add('hidden'); e.target.reset();
            await loadArchitectDashboard();
            setTimeout(() => { loadProjectDetails(newProject.id); }, 50); // Delay para garantir renderização do DOM
        } catch (error) { alert(error.message); }
    });

    // --- Lógica para alternar formulários de despesa ---
    const categoryRadios = document.querySelectorAll('input[name="expenseCategory"]');
    const formMateriaPrima = document.getElementById('form-materia-prima');
    const formMaoDeObra = document.getElementById('form-mao-de-obra');
    const formCustosVariados = document.getElementById('form-custos-variados');
    const expenseForms = [formMateriaPrima, formMaoDeObra, formCustosVariados];

    let currentVisibleForm = formMateriaPrima; // Define o formulário inicial

    categoryRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const selectedValue = event.target.value;
            let newVisibleForm;

            if (selectedValue === 'material') {
                newVisibleForm = formMateriaPrima;
            } else if (selectedValue === 'labor') {
                newVisibleForm = formMaoDeObra;
            } else if (selectedValue === 'misc') {
                newVisibleForm = formCustosVariados;
            }

            if (currentVisibleForm !== newVisibleForm) {
                currentVisibleForm.classList.add('hidden');
                newVisibleForm.classList.remove('hidden');
                currentVisibleForm = newVisibleForm;
            }
        });
    });

    // --- Lógica unificada para submissão de formulário de despesa ---
    async function handleExpenseSubmit(event) {
        event.preventDefault();
        if (!selectedProjectId) {
            ToastManager.show('Por favor, selecione um projeto antes de adicionar uma despesa.', 'warning');
            return;
        }
        const form = event.target;
        const formData = new FormData(form);

        try {
            await api.postForm(`/projects/${selectedProjectId}/expenses/`, formData);
            ToastManager.show('Despesa adicionada com sucesso!', 'success');
            form.reset();

            // Recarrega os detalhes do projeto para mostrar a nova despesa
            const currentProjectId = selectedProjectId;
            await loadArchitectDashboard();
            if (currentProjectId) {
                loadProjectDetails(currentProjectId);
            }
        } catch (error) {
            ToastManager.show('Erro ao adicionar despesa: ' + error.message, 'error');
        }
    }

    expenseForms.forEach(form => form.addEventListener('submit', handleExpenseSubmit));

    // --- Inicialização ---
    async function initializeApp() {
        const token = localStorage.getItem('userToken');
        if (!token) { showView('login-view'); return; }
        try {
            const user = await api.get('/users/me');
            if (user.role === 'architect') { loadArchitectDashboard(); }
            else { loadClientDashboard(); }
        } catch (error) { console.error('Sessão inválida:', error); logout(); }
    }

    document.getElementById('logout-button').addEventListener('click', logout);
    document.getElementById('logout-button-client').addEventListener('click', logout);
    document.getElementById('logout-button-completed-client').addEventListener('click', logout);
    document.getElementById('logout-button-selection').addEventListener('click', logout);
    document.getElementById('finalize-project-button').addEventListener('click', handleFinalizeProject);

    // Event listeners dos botões de voltar
    document.getElementById('back-to-selection')?.addEventListener('click', () => {
        loadClientDashboard();
    });

    document.getElementById('back-to-selection-from-completed')?.addEventListener('click', () => {
        loadClientDashboard();
    });

    // Event listeners do menu mobile
    document.getElementById('mobile-logout')?.addEventListener('click', logout);
    document.getElementById('mobile-create-client')?.addEventListener('click', () => {
        document.getElementById('create-client-modal').classList.remove('hidden');
        MobileMenu.closeMenu();
    });
    document.getElementById('mobile-create-project')?.addEventListener('click', () => {
        document.getElementById('create-project-modal').classList.remove('hidden');
        MobileMenu.closeMenu();
    });
    document.getElementById('empty-create-project')?.addEventListener('click', () => {
        document.getElementById('create-project-modal').classList.remove('hidden');
    });

    // Adicionar event listeners para botões de delete (delegation)
    document.addEventListener('click', (event) => {
        if (event.target.closest('.delete-expense-btn')) {
            handleDeleteExpense(event);
        }
    });

    // Monitorar resize da tela para ajustes responsivos
    window.addEventListener('resize', () => {
        ResponsiveHelper.optimizeForMobile();
    });

    // Inicializar componentes
    MobileMenu.init();
    initializeApp();
});