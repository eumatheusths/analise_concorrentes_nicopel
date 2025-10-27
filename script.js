// ===== CONFIGURAÇÕES E CONSTANTES =====
const CONFIG = {
    STORAGE_KEY: 'nicopel_concorrentes_v6',
    THREAT_ORDER: { alta: 0, media: 1, baixa: 2 },
    INITIAL_DATA: [
        {
            id: '1',
            name: 'Soluplex Brasil',
            location: 'São Paulo - SP',
            threat: 'alta',
            category: 'potes-copos',
            website: 'https://www.soluplex.com.br/',
            instagram: 'https://www.instagram.com/soluplex.brasil/',
            phone: '',
            cnpj: '',
            tags: 'plástico,injetora,embalagens,fast-food',
            ticket: '',
            focus: 'Solução completa para fast-food',
            analysis: 'Agressivos no marketing para franquias, oferecem um mix completo de produtos que atrai grandes redes. Ponto fraco pode ser a menor flexibilidade para clientes menores.',
            builtIn: true,
            archived: false,
            ecommerce: true,
            metaAdsUrl: '',
            googleAdsUrl: ''
        },
        {
            id: '2',
            name: 'Papello Embalagens',
            location: 'Caxias do Sul - RS',
            threat: 'media',
            category: 'potes-copos',
            website: 'https://www.papello.com.br/',
            instagram: 'https://www.instagram.com/papelloembalagens/',
            phone: '',
            cnpj: '',
            tags: 'copos,potes,baldes,regional,e-commerce',
            ticket: '',
            focus: 'Copos, potes e baldes de papel',
            analysis: 'Competem diretamente na linha de produtos. Possuem forte presença no e-commerce.',
            builtIn: true,
            archived: false,
            ecommerce: true,
            metaAdsUrl: '',
            googleAdsUrl: ''
        }
        // ... (outros dados iniciais com campos ecommerce, metaAdsUrl, googleAdsUrl)
    ],
};

// ===== UTILITÁRIOS =====
class Utils {
    static $(sel, el = document) {
        return el.querySelector(sel);
    }
    
    static $$(sel, el = document) {
        return Array.from(el.querySelectorAll(sel));
    }
    
    static uid() {
        return Math.random().toString(36).slice(2, 10);
    }
    
    static nl(s) {
        return (s || '').trim();
    }

    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }

    static downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // NOVO: Verificar se elemento existe antes de adicionar event listener
    static safeAddEventListener(selector, event, handler) {
        const element = this.$(selector);
        if (element) {
            element.addEventListener(event, handler);
            return true;
        }
        return false;
    }
}

// ===== GERENCIAMENTO DE ESTADO =====
class StateManager {
    constructor() {
        this.data = [];
        this.filters = {
            category: 'todos',
            threat: 'todos',
            search: '',
            tag: '',
            sort: 'az',
            ecommerce: 'todos',
        };
        this.init();
    }

    init() {
        this.data = this.loadData();
        this.updateDates();
        console.log('Dados carregados:', this.data.length, 'concorrentes');
    }

    loadData() {
        try {
            const existing = localStorage.getItem(CONFIG.STORAGE_KEY);
            let dataToLoad = CONFIG.INITIAL_DATA;

            if (existing) {
                dataToLoad = JSON.parse(existing);
            } else {
                console.log('Criando dados iniciais...');
            }

            let needsSave = !existing;
            dataToLoad.forEach((competitor) => {
                let updated = false;
                if (competitor.ecommerce === undefined) {
                    competitor.ecommerce = false;
                    updated = true;
                }
                if (competitor.metaAdsUrl === undefined) {
                    competitor.metaAdsUrl = '';
                    updated = true;
                }
                if (competitor.googleAdsUrl === undefined) {
                    competitor.googleAdsUrl = '';
                    updated = true;
                }
                if (updated) needsSave = true;
            });

            if (needsSave) {
                console.log('Migrando dados para novo formato...');
                this.saveData(dataToLoad);
            }
            return dataToLoad;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            const cleanInitial = CONFIG.INITIAL_DATA.map(competitor => ({
                ...competitor,
                ecommerce: competitor.ecommerce || false,
                metaAdsUrl: competitor.metaAdsUrl || '',
                googleAdsUrl: competitor.googleAdsUrl || ''
            }));
            this.saveData(cleanInitial);
            return cleanInitial;
        }
    }

    saveData(data) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            Utils.showNotification('Erro ao salvar dados no armazenamento local', 'error');
        }
    }

    updateDates() {
        const today = new Date();
        const fmt = today.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
        
        const updateElement = (selector, text) => {
            const element = Utils.$(selector);
            if (element) element.textContent = text;
        };

        updateElement('#last-updated', fmt);
        updateElement('#last-updated-side', fmt);
    }

    isDuplicate(name, location, excludeId = null) {
        return this.data.some(competitor => 
            competitor.id !== excludeId &&
            competitor.name.toLowerCase() === name.toLowerCase() && 
            competitor.location.toLowerCase() === location.toLowerCase()
        );
    }

    addCompetitor(competitor) {
        if (this.isDuplicate(competitor.name, competitor.location)) {
            return { success: false, message: 'Já existe um concorrente com este nome e cidade' };
        }

        const newCompetitor = {
            ...competitor,
            id: Utils.uid(),
            builtIn: false,
            archived: false,
        };

        this.data.unshift(newCompetitor);
        this.saveData(this.data);
        return { success: true, data: newCompetitor };
    }

    updateCompetitor(id, updates) {
        if (this.isDuplicate(updates.name, updates.location, id)) {
            return { success: false, message: 'Já existe outro concorrente com este nome e cidade' };
        }

        const index = this.data.findIndex((x) => x.id === id);
        if (index !== -1) {
            this.data[index] = {
                ...this.data[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            this.saveData(this.data);
            return { success: true };
        }
        return { success: false, message: 'Concorrente não encontrado' };
    }

    deleteCompetitor(id) {
        const index = this.data.findIndex((x) => x.id === id);
        if (index !== -1) {
            this.data.splice(index, 1);
            this.saveData(this.data);
            return true;
        }
        return false;
    }

    toggleArchive(id) {
        const index = this.data.findIndex((x) => x.id === id);
        if (index !== -1) {
            this.data[index].archived = !this.data[index].archived;
            this.saveData(this.data);
            return true;
        }
        return false;
    }

    getFilteredData() {
        let filtered = this.data.filter((d) => !d.archived);

        if (this.filters.category !== 'todos') {
            filtered = filtered.filter((d) => d.category === this.filters.category);
        }

        if (this.filters.threat === 'direto') {
            filtered = filtered.filter((d) => d.threat === 'alta');
        } else if (this.filters.threat === 'indireto') {
            filtered = filtered.filter(
                (d) => d.threat === 'media' || d.threat === 'baixa'
            );
        }

        if (this.filters.search) {
            const q = this.filters.search.toLowerCase();
            filtered = filtered.filter(
                (d) =>
                    (d.name || '').toLowerCase().includes(q) ||
                    (d.location || '').toLowerCase().includes(q) ||
                    (d.focus || '').toLowerCase().includes(q) ||
                    (d.tags || '').toLowerCase().includes(q)
            );
        }

        if (this.filters.tag) {
            const tg = this.filters.tag.toLowerCase();
            filtered = filtered.filter((d) =>
                (d.tags || '')
                    .toLowerCase()
                    .split(',')
                    .map((s) => Utils.nl(s))
                    .includes(tg)
            );
        }

        if (this.filters.ecommerce === 'sim') {
            filtered = filtered.filter((d) => d.ecommerce === true);
        } else if (this.filters.ecommerce === 'nao') {
            filtered = filtered.filter((d) => !d.ecommerce);
        }

        switch (this.filters.sort) {
            case 'az':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'za':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'cidade':
                filtered.sort((a, b) =>
                    (a.location || '').localeCompare(b.location || '')
                );
                break;
            case 'ameaca':
                filtered.sort(
                    (a, b) =>
                        (CONFIG.THREAT_ORDER[a.threat] ?? 9) -
                        (CONFIG.THREAT_ORDER[b.threat] ?? 9)
                );
                break;
        }

        return filtered;
    }
}

// ===== GERENCIAMENTO DE INTERFACE =====
class UIManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.modal = Utils.$('#competitor-modal');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDashboard();
    }

    setupEventListeners() {
        // Navegação com verificações de segurança
        Utils.safeAddEventListener('#app-nav', 'click', (e) => this.handleNavigation(e));
        Utils.safeAddEventListener('#sidebarToggle', 'click', () => this.toggleSidebar());

        // Filtros do Dashboard
        Utils.safeAddEventListener('#category-nav', 'click', (e) => this.handleCategoryFilter(e));
        Utils.safeAddEventListener('#threat-nav', 'click', (e) => this.handleThreatFilter(e));
        Utils.safeAddEventListener('#search-input', 'input', (e) => this.handleSearch(e));
        Utils.safeAddEventListener('#sort-select', 'change', (e) => this.handleSort(e));
        Utils.safeAddEventListener('#ecommerce-filter', 'change', (e) => {
            this.state.filters.ecommerce = e.target.value;
            this.renderDashboard();
        });

        // Modal
        Utils.safeAddEventListener('#modal-close-btn', 'click', () => this.closeModal());
        
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Formulários
        Utils.safeAddEventListener('#add-form', 'submit', (e) => this.handleAddSubmit(e));
        Utils.safeAddEventListener('#edit-form', 'submit', (e) => this.handleEditSubmit(e));

        // Ações de edição
        Utils.safeAddEventListener('#edit-table tbody', 'click', (e) => this.handleTableActions(e));
        Utils.safeAddEventListener('#edit-search', 'input', () => this.renderEditTable());
        Utils.safeAddEventListener('#edit-sort', 'change', () => this.renderEditTable());

        // Ações em lote
        Utils.safeAddEventListener('#bulk-all', 'change', (e) => this.toggleBulkSelectAll(e));
        Utils.safeAddEventListener('#bulk-archive', 'click', () => this.handleBulkArchive());
        Utils.safeAddEventListener('#bulk-unarchive', 'click', () => this.handleBulkUnarchive());
        Utils.safeAddEventListener('#bulk-delete', 'click', () => this.handleBulkDelete());

        // Import/Export
        Utils.safeAddEventListener('#btn-export-json', 'click', () => this.exportJSON());
        Utils.safeAddEventListener('#btn-export-csv', 'click', () => this.exportCSV());
        Utils.safeAddEventListener('#btn-export-excel', 'click', () => this.exportExcel());

        Utils.safeAddEventListener('#file-import-json', 'change', (e) => this.importJSON(e));
        Utils.safeAddEventListener('#file-import-csv', 'change', (e) => this.importCSV(e));
        Utils.safeAddEventListener('#file-import-excel', 'change', (e) => this.importExcel(e));

        // Relatórios
        Utils.safeAddEventListener('#report-refresh', 'click', () => this.buildReport());
        Utils.safeAddEventListener('#report-print', 'click', () => window.print());
        Utils.safeAddEventListener('#report-export', 'click', () => this.exportReport());
        Utils.safeAddEventListener('#report-cat', 'change', () => this.buildReport());
        Utils.safeAddEventListener('#report-threat', 'change', () => this.buildReport());
        Utils.safeAddEventListener('#report-sort', 'change', () => this.buildReport());

        // Event delegation para cards do dashboard
        const competitorsGrid = Utils.$('#competitors-grid');
        if (competitorsGrid) {
            competitorsGrid.addEventListener('click', (e) => {
                const card = e.target.closest('.competitor-card');
                const chip = e.target.closest('.chip');
                
                if (card) {
                    if (e.target.closest('.modal-link-card')) {
                        return;
                    }
                    this.openModal(card.dataset.id);
                }

                if (chip) {
                    this.state.filters.tag = chip.dataset.chip || '';
                    this.renderDashboard();
                }
            });
        }
    }

    handleNavigation(e) {
        const button = e.target.closest('button[data-view]');
        if (!button) return;

        const view = button.dataset.view;
        this.setView(view);
    }

    setView(view) {
        // Remove active class de todos os botões
        Utils.$$('#app-nav [data-view]').forEach((btn) => {
            if (btn) btn.classList.remove('active');
        });
        
        // Adiciona active class ao botão clicado
        const activeButton = Utils.$(`#app-nav [data-view="${view}"]`);
        if (activeButton) activeButton.classList.add('active');

        // Esconde todas as views
        const views = ['dashboard', 'add', 'edit', 'io', 'report'];
        views.forEach(viewName => {
            const viewElement = Utils.$(`#view-${viewName}`);
            if (viewElement) viewElement.style.display = 'none';
        });

        // Mostra a view selecionada
        const currentView = Utils.$(`#view-${view}`);
        if (currentView) currentView.style.display = 'block';

        // Fecha sidebar no mobile
        const sidebar = Utils.$('#sidebar');
        const content = Utils.$('#content');
        if (sidebar) sidebar.classList.remove('open');
        if (content) content.classList.remove('dim');

        // Ações específicas por view
        if (view === 'edit') this.renderEditTable();
        if (view === 'report') this.buildReport();
        if (view === 'io') this.refreshIOPreview();
    }

    toggleSidebar() {
        const sidebar = Utils.$('#sidebar');
        const content = Utils.$('#content');
        if (!sidebar || !content) return;

        const isOpen = !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', isOpen);
        content.classList.toggle('dim', isOpen);
    }

    // ... (mantido o restante dos métodos como handleCategoryFilter, handleThreatFilter, etc.)

    threatClass(level) {
        return level === 'alta'
            ? 'threat-high'
            : level === 'media'
            ? 'threat-medium'
            : 'threat-low';
    }

    tagsToChipsHTML(tags) {
        const arr = Utils.nl(tags)
            .split(',')
            .map((s) => Utils.nl(s))
            .filter(Boolean);
        if (!arr.length) return '';

        return `
            <div class="tag-chips">
                ${arr
                    .map(
                        (t) => `<span class="chip" data-chip="${t}">${t}</span>`
                    )
                    .join('')}
            </div>
        `;
    }

    cardHTML(competitor) {
        const preview = (competitor.analysis || competitor.focus || '').trim();
        const truncatedPreview =
            preview && preview.length > 140
                ? preview.slice(0, 140) + '...'
                : preview;

        return `
            <article class="competitor-card" data-id="${competitor.id}" data-category="${competitor.category}" data-threat="${competitor.threat}">
                <div class="card-header">
                    <span class="threat-level ${this.threatClass(competitor.threat)}"></span>
                    <div>
                        <h3>${competitor.name}</h3>
                        <div class="card-badges">
                            ${competitor.ecommerce ? '<span class="ecommerce-badge">E-commerce</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="info-item">
                        <svg><use href="#icon-location"/></svg>
                        <span>${competitor.location || '—'}</span>
                    </div>
                    ${competitor.focus ? `
                    <div class="info-item">
                        <svg><use href="#icon-focus"/></svg>
                        <span>${competitor.focus}</span>
                    </div>
                    ` : ''}
                    ${truncatedPreview ? `<p class="card-analysis-preview">${truncatedPreview}</p>` : ''}
                    ${this.tagsToChipsHTML(competitor.tags)}
                </div>
            </article>
        `;
    }

    renderDashboard() {
        const grid = Utils.$('#competitors-grid');
        if (!grid) return;

        const filteredData = this.state.getFilteredData();

        if (filteredData.length === 0) {
            grid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted)">
                    <h3>Nenhum concorrente encontrado</h3>
                    <p>Tente ajustar os filtros ou adicionar novos concorrentes.</p>
                </div>
            `;
        } else {
            grid.innerHTML = filteredData
                .map((competitor) => this.cardHTML(competitor))
                .join('');
        }
    }

    // ... (mantido o restante dos métodos: openModal, closeModal, handleAddSubmit, etc.)

    handleAddSubmit(e) {
        e.preventDefault();

        const formData = {
            name: Utils.nl(Utils.$('#f-name')?.value || ''),
            location: Utils.nl(Utils.$('#f-city')?.value || ''),
            threat: Utils.$('#f-threat')?.value || '',
            category: Utils.$('#f-category')?.value || '',
            website: Utils.nl(Utils.$('#f-website')?.value || ''),
            instagram: Utils.nl(Utils.$('#f-instagram')?.value || ''),
            phone: Utils.nl(Utils.$('#f-phone')?.value || ''),
            cnpj: Utils.nl(Utils.$('#f-cnpj')?.value || ''),
            tags: Utils.nl(Utils.$('#f-tags')?.value || ''),
            ticket: Utils.nl(Utils.$('#f-ticket')?.value || ''),
            focus: Utils.nl(Utils.$('#f-focus')?.value || ''),
            analysis: Utils.nl(Utils.$('#f-analysis')?.value || ''),
            metaAdsUrl: Utils.nl(Utils.$('#f-meta-ads')?.value || ''),
            googleAdsUrl: Utils.nl(Utils.$('#f-google-ads')?.value || ''),
            ecommerce: Utils.$('#f-ecommerce')?.checked || false,
        };

        if (!formData.name || !formData.location || !formData.threat || !formData.category) {
            Utils.showNotification('Preencha Nome, Cidade/UF, Nível de Ameaça e Categoria.', 'error');
            return;
        }

        const result = this.state.addCompetitor(formData);
        if (!result.success) {
            Utils.showNotification(result.message, 'error');
            return;
        }

        const addForm = Utils.$('#add-form');
        if (addForm) addForm.reset();
        
        Utils.showNotification('Concorrente adicionado com sucesso!');
        this.setView('dashboard');
        this.renderDashboard();
    }

    renderEditTable() {
        const tbody = Utils.$('#edit-table tbody');
        if (!tbody) return;

        const searchTerm = (Utils.$('#edit-search')?.value || '').toLowerCase();
        const sortMode = Utils.$('#edit-sort')?.value || 'az';

        let filteredData = this.state.data.filter(
            (competitor) =>
                (competitor.name || '').toLowerCase().includes(searchTerm) ||
                (competitor.location || '').toLowerCase().includes(searchTerm)
        );

        switch (sortMode) {
            case 'az':
                filteredData.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'za':
                filteredData.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'cidade':
                filteredData.sort((a, b) =>
                    (a.location || '').localeCompare(b.location || '')
                );
                break;
            case 'ameaca':
                filteredData.sort(
                    (a, b) =>
                        (CONFIG.THREAT_ORDER[a.threat] ?? 9) -
                        (CONFIG.THREAT_ORDER[b.threat] ?? 9)
                );
                break;
        }

        tbody.innerHTML = filteredData.length > 0 
            ? filteredData.map((competitor) => `
                <tr data-id="${competitor.id}">
                    <td><input type="checkbox" class="row-check" /></td>
                    <td>${competitor.name}</td>
                    <td>${competitor.location || '—'}</td>
                    <td>${competitor.threat}</td>
                    <td>${competitor.category}</td>
                    <td>${competitor.archived ? 'Arquivado' : competitor.builtIn ? 'Original' : 'Custom'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn" data-action="load">Editar</button>
                            <button class="btn" data-action="toggle-archive">
                                ${competitor.archived ? 'Desarquivar' : 'Arquivar'}
                            </button>
                            <button class="btn btn-danger" data-action="delete">Excluir</button>
                        </div>
                    </td>
                </tr>
            `).join('')
            : `<tr><td colspan="7" style="color:var(--text-muted)">Nenhum item encontrado.</td></tr>`;

        const bulkAll = Utils.$('#bulk-all');
        if (bulkAll) bulkAll.checked = false;
    }

    // ... (continue com os demais métodos, sempre verificando se elementos existem)
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
class App {
    constructor() {
        // Aguardar um pouco mais para garantir que o DOM está totalmente carregado
        setTimeout(() => {
            try {
                this.stateManager = new StateManager();
                this.uiManager = new UIManager(this.stateManager);
                console.log('🚀 Aplicação Nicopel Concorrência inicializada com sucesso!');
            } catch (error) {
                console.error('Erro ao inicializar aplicação:', error);
                Utils.showNotification('Erro ao carregar a aplicação', 'error');
            }
        }, 100);
    }
}

// Inicializar a aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}
