// ===== CONFIGURAÇÕES E CONSTANTES =====
const CONFIG = {
    STORAGE_KEY: 'nicopel_concorrentes_v4',
    THREAT_ORDER: { alta: 0, media: 1, baixa: 2 },
    INITIAL_DATA: [
        {
            id: '1',
            name: 'Soluplex Brasil',
            location: 'Cajamar - SP',
            threat: 'alta',
            category: 'potes-copos',
            website: '',
            instagram: 'https://www.instagram.com/soluplex.brasil/',
            phone: '',
            cnpj: '',
            tags: 'plástico,injetora,embalagens',
            ticket: '',
            focus: 'Embalagens plásticas',
            analysis: 'Concorrente direto com capacidade produtiva similar à Nicopel. Foco em potes e copos plásticos.',
            builtIn: true,
            archived: false
        },
        {
            id: '2',
            name: 'Soller Embalagens',
            location: 'Morro da Fumaça - SC',
            threat: 'alta',
            category: 'potes-copos',
            website: '',
            instagram: 'https://www.instagram.com/sollerembalagens/',
            phone: '',
            cnpj: '',
            tags: 'plástico,termoformagem,copos',
            ticket: '',
            focus: 'Potes e copos plásticos',
            analysis: 'Forte atuação na região sul com preços competitivos.',
            builtIn: true,
            archived: false
        },
        {
            id: '3',
            name: 'BoxBe',
            location: 'São Paulo - SP',
            threat: 'media',
            category: 'caixas-sorvete',
            website: '',
            instagram: 'https://www.instagram.com/boxbeecoembalagens/',
            phone: '',
            cnpj: '',
            tags: 'papelão,sustentável,eco',
            ticket: '',
            focus: 'Embalagens sustentáveis',
            analysis: 'Diferencial ecológico, preço competitivo no segmento de embalagens paper.',
            builtIn: true,
            archived: false
        },
        {
            id: '4',
            name: 'Nazapack',
            location: 'São Paulo - SP',
            threat: 'media',
            category: 'embalagens-industriais',
            website: '',
            instagram: 'https://www.instagram.com/nazapack/',
            phone: '',
            cnpj: '',
            tags: 'industrial,plástico,logística',
            ticket: '',
            focus: 'Embalagens industriais',
            analysis: 'Atua no segmento industrial com foco em grandes volumes.',
            builtIn: true,
            archived: false
        },
        {
            id: '5',
            name: 'Gráfica Tambosi',
            location: 'Taió - SC',
            threat: 'baixa',
            category: 'caixas-pizza',
            website: '',
            instagram: 'https://www.instagram.com/tambosiindustriagrafica/',
            phone: '',
            cnpj: '',
            tags: 'papelão,pizza,gráfica',
            ticket: '',
            focus: 'Caixas de pizza personalizadas',
            analysis: 'Concorrente regional com foco em personalização.',
            builtIn: true,
            archived: false
        }
    ]
};

// ===== UTILITÁRIOS =====
class Utils {
    static $(sel, el = document) { return el.querySelector(sel); }
    static $$(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }
    static uid() { return Math.random().toString(36).slice(2, 10); }
    static nl(s) { return (s || '').trim(); }
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
            sort: 'az'
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
            // Tenta carregar dados existentes
            const existing = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (existing) {
                return JSON.parse(existing);
            }
            
            // Se não existir, usa dados iniciais
            console.log('Criando dados iniciais...');
            this.saveData(CONFIG.INITIAL_DATA);
            return CONFIG.INITIAL_DATA;
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return CONFIG.INITIAL_DATA;
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
        const fmt = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        const lastUpdated = Utils.$('#last-updated');
        const lastUpdatedSide = Utils.$('#last-updated-side');
        
        if (lastUpdated) lastUpdated.textContent = fmt;
        if (lastUpdatedSide) lastUpdatedSide.textContent = fmt;
    }

    addCompetitor(competitor) {
        const newCompetitor = {
            ...competitor,
            id: Utils.uid(),
            builtIn: false,
            archived: false
        };
        
        this.data.unshift(newCompetitor);
        this.saveData(this.data);
        return newCompetitor;
    }

    updateCompetitor(id, updates) {
        const index = this.data.findIndex(x => x.id === id);
        if (index !== -1) {
            this.data[index] = { 
                ...this.data[index], 
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveData(this.data);
            return true;
        }
        return false;
    }

    deleteCompetitor(id) {
        const index = this.data.findIndex(x => x.id === id);
        if (index !== -1) {
            this.data.splice(index, 1);
            this.saveData(this.data);
            return true;
        }
        return false;
    }

    toggleArchive(id) {
        const index = this.data.findIndex(x => x.id === id);
        if (index !== -1) {
            this.data[index].archived = !this.data[index].archived;
            this.saveData(this.data);
            return true;
        }
        return false;
    }

    getFilteredData() {
        let filtered = this.data.filter(d => !d.archived);

        // Filtro por categoria
        if (this.filters.category !== 'todos') {
            filtered = filtered.filter(d => d.category === this.filters.category);
        }

        // Filtro por ameaça
        if (this.filters.threat === 'direto') {
            filtered = filtered.filter(d => d.threat === 'alta');
        } else if (this.filters.threat === 'indireto') {
            filtered = filtered.filter(d => d.threat === 'media' || d.threat === 'baixa');
        }

        // Filtro por busca
        if (this.filters.search) {
            const q = this.filters.search.toLowerCase();
            filtered = filtered.filter(d =>
                (d.name || '').toLowerCase().includes(q) ||
                (d.location || '').toLowerCase().includes(q) ||
                (d.focus || '').toLowerCase().includes(q) ||
                (d.tags || '').toLowerCase().includes(q)
            );
        }

        // Filtro por tag
        if (this.filters.tag) {
            const tg = this.filters.tag.toLowerCase();
            filtered = filtered.filter(d =>
                (d.tags || '').toLowerCase().split(',').map(s => Utils.nl(s)).includes(tg)
            );
        }

        // Ordenação
        switch (this.filters.sort) {
            case 'az':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'za':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'cidade':
                filtered.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
                break;
            case 'ameaca':
                filtered.sort((a, b) =>
                    (CONFIG.THREAT_ORDER[a.threat] ?? 9) - (CONFIG.THREAT_ORDER[b.threat] ?? 9)
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
        // Navegação
        Utils.$('#app-nav').addEventListener('click', (e) => this.handleNavigation(e));
        Utils.$('#sidebarToggle').addEventListener('click', () => this.toggleSidebar());

        // Filtros do Dashboard
        Utils.$('#category-nav').addEventListener('click', (e) => this.handleCategoryFilter(e));
        Utils.$('#threat-nav').addEventListener('click', (e) => this.handleThreatFilter(e));
        Utils.$('#search-input').addEventListener('input', (e) => this.handleSearch(e));
        Utils.$('#sort-select').addEventListener('change', (e) => this.handleSort(e));

        // Modal
        Utils.$('#modal-close-btn').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Formulários
        Utils.$('#add-form').addEventListener('submit', (e) => this.handleAddSubmit(e));
        Utils.$('#edit-form').addEventListener('submit', (e) => this.handleEditSubmit(e));

        // Ações de edição
        Utils.$('#edit-table tbody').addEventListener('click', (e) => this.handleTableActions(e));
        Utils.$('#edit-search').addEventListener('input', () => this.renderEditTable());
        Utils.$('#edit-sort').addEventListener('change', () => this.renderEditTable());

        // Ações em lote
        Utils.$('#bulk-all').addEventListener('change', (e) => this.toggleBulkSelectAll(e));
        Utils.$('#bulk-archive').addEventListener('click', () => this.handleBulkArchive());
        Utils.$('#bulk-unarchive').addEventListener('click', () => this.handleBulkUnarchive());
        Utils.$('#bulk-delete').addEventListener('click', () => this.handleBulkDelete());

        // Import/Export
        Utils.$('#btn-export').addEventListener('click', () => this.exportData());
        Utils.$('#btn-import').addEventListener('click', () => this.importData());

        // Relatórios
        Utils.$('#report-refresh').addEventListener('click', () => this.buildReport());
        Utils.$('#report-print').addEventListener('click', () => window.print());
        Utils.$('#report-cat').addEventListener('change', () => this.buildReport());
        Utils.$('#report-threat').addEventListener('change', () => this.buildReport());
        Utils.$('#report-sort').addEventListener('change', () => this.buildReport());

        // Event delegation para cards do dashboard
        Utils.$('#competitors-grid').addEventListener('click', (e) => {
            const card = e.target.closest('.competitor-card');
            if (card) {
                this.openModal(card.dataset.id);
            }
            
            const chip = e.target.closest('.chip');
            if (chip) {
                this.state.filters.tag = chip.dataset.chip || '';
                this.renderDashboard();
            }
        });
    }

    // ===== NAVEGAÇÃO E LAYOUT =====
    handleNavigation(e) {
        const button = e.target.closest('button[data-view]');
        if (!button) return;

        const view = button.dataset.view;
        this.setView(view);
    }

    setView(view) {
        // Atualiza botões de navegação
        Utils.$$('#app-nav [data-view]').forEach(btn => btn.classList.remove('active'));
        Utils.$(`#app-nav [data-view="${view}"]`).classList.add('active');

        // Mostra a view correspondente
        const views = {
            dashboard: Utils.$('#view-dashboard'),
            add: Utils.$('#view-add'),
            edit: Utils.$('#view-edit'),
            io: Utils.$('#view-io'),
            report: Utils.$('#view-report')
        };

        Object.values(views).forEach(section => section.style.display = 'none');
        if (views[view]) {
            views[view].style.display = 'block';
        }

        // Fecha sidebar no mobile
        Utils.$('#sidebar').classList.remove('open');
        Utils.$('#content').classList.remove('dim');

        // Ações específicas por view
        if (view === 'edit') this.renderEditTable();
        if (view === 'report') this.buildReport();
        if (view === 'io') this.refreshIOPreview();
    }

    toggleSidebar() {
        const sidebar = Utils.$('#sidebar');
        const content = Utils.$('#content');
        const isOpen = !sidebar.classList.contains('open');

        sidebar.classList.toggle('open', isOpen);
        content.classList.toggle('dim', isOpen);
    }

    // ===== DASHBOARD =====
    handleCategoryFilter(e) {
        const button = e.target.closest('.tab-btn');
        if (!button) return;

        Utils.$$('#category-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        this.state.filters.category = button.dataset.category;
        this.state.filters.tag = '';
        this.renderDashboard();
    }

    handleThreatFilter(e) {
        const button = e.target.closest('.tab-btn');
        if (!button) return;

        Utils.$$('#threat-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        this.state.filters.threat = button.dataset.threat;
        this.state.filters.tag = '';
        this.renderDashboard();
    }

    handleSearch(e) {
        this.state.filters.search = e.target.value;
        this.renderDashboard();
    }

    handleSort(e) {
        this.state.filters.sort = e.target.value;
        this.renderDashboard();
    }

    threatClass(level) {
        return level === 'alta' ? 'threat-high' :
            level === 'media' ? 'threat-medium' : 'threat-low';
    }

    tagsToChipsHTML(tags) {
        const arr = Utils.nl(tags).split(',').map(s => Utils.nl(s)).filter(Boolean);
        if (!arr.length) return '';

        return `
            <div class="tag-chips">
                ${arr.map(t => `<span class="chip" data-chip="${t}">${t}</span>`).join('')}
            </div>
        `;
    }

    cardHTML(competitor) {
        const preview = (competitor.analysis || competitor.focus || '').trim();
        const truncatedPreview = preview && preview.length > 140 ?
            preview.slice(0, 140) + '...' : preview;

        return `
            <article class="competitor-card" data-id="${competitor.id}" 
                     data-category="${competitor.category}" data-threat="${competitor.threat}">
                <div class="card-header">
                    <span class="threat-level ${this.threatClass(competitor.threat)}"></span>
                    <h3>${competitor.name}</h3>
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
            grid.innerHTML = filteredData.map(competitor => this.cardHTML(competitor)).join('');
        }
    }

    // ===== MODAL =====
    openModal(id) {
        const competitor = this.state.data.find(x => x.id === id);
        if (!competitor) return;

        // Preenche o modal com os dados
        const modalHeader = Utils.$('#modal-header-content');
        if (modalHeader) {
            modalHeader.innerHTML = `
                <span class="threat-level ${this.threatClass(competitor.threat)}"></span>
                <h3>${competitor.name}</h3>
            `;
        }

        const modalLocation = Utils.$('#modal-location');
        if (modalLocation) {
            modalLocation.innerHTML = `
                <svg><use href="#icon-location"/></svg>
                <span>${competitor.location || '—'}</span>
            `;
        }

        const modalFocus = Utils.$('#modal-focus');
        if (modalFocus) {
            modalFocus.innerHTML = `
                <svg><use href="#icon-focus"/></svg>
                <span>${competitor.focus || '—'}</span>
            `;
        }

        const modalAnalysis = Utils.$('#modal-analysis');
        if (modalAnalysis) {
            modalAnalysis.textContent = competitor.analysis || '—';
        }

        const modalTags = Utils.$('#modal-tags');
        if (modalTags) {
            modalTags.innerHTML = this.tagsToChipsHTML(competitor.tags);
        }

        // Ações
        let actions = '';
        if (competitor.website) {
            actions += `<a href="${competitor.website}" target="_blank" rel="noopener" class="btn">
                <svg><use href="#icon-website"/></svg>Website
            </a>`;
        }
        if (competitor.instagram) {
            actions += `<a href="${competitor.instagram}" target="_blank" rel="noopener" class="btn">
                <svg><use href="#icon-instagram"/></svg>Instagram
            </a>`;
        }

        const modalActions = Utils.$('#modal-actions');
        if (modalActions) {
            modalActions.innerHTML = actions || '<span style="color:var(--text-muted)">Sem links cadastrados</span>';
        }

        // Mostra o modal
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    handleKeyboard(e) {
        if (e.key === 'Escape' && this.modal.classList.contains('active')) {
            this.closeModal();
        }
    }

    // ===== FORMULÁRIOS =====
    handleAddSubmit(e) {
        e.preventDefault();

        const formData = {
            name: Utils.nl(Utils.$('#f-name').value),
            location: Utils.nl(Utils.$('#f-city').value),
            threat: Utils.$('#f-threat').value,
            category: Utils.$('#f-category').value,
            website: Utils.nl(Utils.$('#f-website').value),
            instagram: Utils.nl(Utils.$('#f-instagram').value),
            phone: Utils.nl(Utils.$('#f-phone').value),
            cnpj: Utils.nl(Utils.$('#f-cnpj').value),
            tags: Utils.nl(Utils.$('#f-tags').value),
            ticket: Utils.nl(Utils.$('#f-ticket').value),
            focus: Utils.nl(Utils.$('#f-focus').value),
            analysis: Utils.nl(Utils.$('#f-analysis').value)
        };

        // Validação
        if (!formData.name || !formData.location || !formData.threat || !formData.category) {
            Utils.showNotification('Preencha Nome, Cidade/UF, Nível de Ameaça e Categoria.', 'error');
            return;
        }

        this.state.addCompetitor(formData);
        Utils.$('#add-form').reset();
        Utils.showNotification('Concorrente adicionado com sucesso!');
        this.setView('dashboard');
        this.renderDashboard();
    }

    // ===== EDIÇÃO =====
    renderEditTable() {
        const tbody = Utils.$('#edit-table tbody');
        if (!tbody) return;

        const searchTerm = (Utils.$('#edit-search').value || '').toLowerCase();
        const sortMode = Utils.$('#edit-sort').value;

        let filteredData = this.state.data.filter(competitor =>
            (competitor.name || '').toLowerCase().includes(searchTerm) ||
            (competitor.location || '').toLowerCase().includes(searchTerm)
        );

        // Ordenação
        switch (sortMode) {
            case 'az':
                filteredData.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'za':
                filteredData.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'cidade':
                filteredData.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
                break;
            case 'ameaca':
                filteredData.sort((a, b) =>
                    (CONFIG.THREAT_ORDER[a.threat] ?? 9) - (CONFIG.THREAT_ORDER[b.threat] ?? 9)
                );
                break;
        }

        tbody.innerHTML = filteredData.map(competitor => `
            <tr data-id="${competitor.id}">
                <td><input type="checkbox" class="row-check" /></td>
                <td>${competitor.name}</td>
                <td>${competitor.location || '—'}</td>
                <td>${competitor.threat}</td>
                <td>${competitor.category}</td>
                <td>${competitor.archived ? 'Arquivado' : (competitor.builtIn ? 'Original' : 'Custom')}</td>
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
        `).join('') || `<tr><td colspan="7" style="color:var(--text-muted)">Nenhum item encontrado.</td></tr>`;

        Utils.$('#bulk-all').checked = false;
    }

    handleTableActions(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const row = e.target.closest('tr');
        const id = row.dataset.id;
        const action = button.dataset.action;

        switch (action) {
            case 'load':
                this.loadCompetitorIntoForm(id);
                break;
            case 'toggle-archive':
                this.state.toggleArchive(id);
                this.renderEditTable();
                this.renderDashboard();
                Utils.showNotification('Status alterado com sucesso!');
                break;
            case 'delete':
                if (confirm('Tem certeza que deseja excluir definitivamente?')) {
                    this.state.deleteCompetitor(id);
                    this.renderEditTable();
                    this.renderDashboard();
                    Utils.showNotification('Concorrente excluído!');
                    // Se estava editando este item, limpa o form
                    if (Utils.$('#e-id') && Utils.$('#e-id').value === id) {
                        Utils.$('#edit-form').reset();
                    }
                }
                break;
        }
    }

    loadCompetitorIntoForm(id) {
        const competitor = this.state.data.find(x => x.id === id);
        if (!competitor) return;

        // Preenche o formulário
        Utils.$('#e-id').value = competitor.id;
        Utils.$('#e-name').value = competitor.name;
        Utils.$('#e-city').value = competitor.location || '';
        Utils.$('#e-threat').value = competitor.threat;
        Utils.$('#e-category').value = competitor.category || '';
        Utils.$('#e-website').value = competitor.website || '';
        Utils.$('#e-instagram').value = competitor.instagram || '';
        Utils.$('#e-phone').value = competitor.phone || '';
        Utils.$('#e-cnpj').value = competitor.cnpj || '';
        Utils.$('#e-tags').value = competitor.tags || '';
        Utils.$('#e-ticket').value = competitor.ticket || '';
        Utils.$('#e-focus').value = competitor.focus || '';
        Utils.$('#e-analysis').value = competitor.analysis || '';

        Utils.$('#e-archive').textContent = competitor.archived ? 'Desarquivar' : 'Arquivar';
        this.setView('edit');
    }

    handleEditSubmit(e) {
        e.preventDefault();

        const id = Utils.$('#e-id').value;
        if (!id) return;

        const updates = {
            name: Utils.nl(Utils.$('#e-name').value),
            location: Utils.nl(Utils.$('#e-city').value),
            threat: Utils.$('#e-threat').value,
            category: Utils.$('#e-category').value,
            website: Utils.nl(Utils.$('#e-website').value),
            instagram: Utils.nl(Utils.$('#e-instagram').value),
            phone: Utils.nl(Utils.$('#e-phone').value),
            cnpj: Utils.nl(Utils.$('#e-cnpj').value),
            tags: Utils.nl(Utils.$('#e-tags').value),
            ticket: Utils.nl(Utils.$('#e-ticket').value),
            focus: Utils.nl(Utils.$('#e-focus').value),
            analysis: Utils.nl(Utils.$('#e-analysis').value)
        };

        if (this.state.updateCompetitor(id, updates)) {
            Utils.showNotification('Alterações salvas com sucesso!');
            this.renderEditTable();
            this.renderDashboard();
        }
    }

    // ===== AÇÕES EM LOTE =====
    getSelectedIds() {
        return Utils.$$('.row-check', Utils.$('#edit-table tbody'))
            .map(checkbox => checkbox.checked ? checkbox.closest('tr').dataset.id : null)
            .filter(Boolean);
    }

    toggleBulkSelectAll(e) {
        Utils.$$('.row-check', Utils.$('#edit-table tbody'))
            .forEach(checkbox => checkbox.checked = e.target.checked);
    }

    handleBulkArchive() {
        const ids = this.getSelectedIds();
        if (!ids.length) {
            Utils.showNotification('Selecione ao menos um item.', 'error');
            return;
        }

        let archivedCount = 0;
        ids.forEach(id => {
            const competitor = this.state.data.find(x => x.id === id);
            if (competitor && !competitor.archived) {
                competitor.archived = true;
                archivedCount++;
            }
        });

        if (archivedCount > 0) {
            this.state.saveData(this.state.data);
            this.renderEditTable();
            this.renderDashboard();
            Utils.showNotification(`${archivedCount} item(ns) arquivado(s)!`);
        }
    }

    handleBulkUnarchive() {
        const ids = this.getSelectedIds();
        if (!ids.length) {
            Utils.showNotification('Selecione ao menos um item.', 'error');
            return;
        }

        let unarchivedCount = 0;
        ids.forEach(id => {
            const competitor = this.state.data.find(x => x.id === id);
            if (competitor && competitor.archived) {
                competitor.archived = false;
                unarchivedCount++;
            }
        });

        if (unarchivedCount > 0) {
            this.state.saveData(this.state.data);
            this.renderEditTable();
            this.renderDashboard();
            Utils.showNotification(`${unarchivedCount} item(ns) desarquivado(s)!`);
        }
    }

    handleBulkDelete() {
        const ids = this.getSelectedIds();
        if (!ids.length) {
            Utils.showNotification('Selecione ao menos um item.', 'error');
            return;
        }

        if (!confirm(`Excluir ${ids.length} item(ns) definitivamente?`)) return;

        this.state.data = this.state.data.filter(competitor => !ids.includes(competitor.id));
        this.state.saveData(this.state.data);
        this.renderEditTable();
        this.renderDashboard();
        Utils.showNotification(`${ids.length} item(ns) excluído(s)!`);
    }

    // ===== IMPORT/EXPORT =====
    refreshIOPreview() {
        const preview = Utils.$('#io-preview');
        if (preview) {
            preview.value = JSON.stringify(this.state.data, null, 2);
        }
    }

    exportData() {
        const blob = new Blob([JSON.stringify(this.state.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `concorrentes_nicopel_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Utils.showNotification('Dados exportados com sucesso!');
    }

    importData() {
        const fileInput = Utils.$('#file-import');
        const file = fileInput.files[0];

        if (!file) {
            Utils.showNotification('Selecione um arquivo JSON para importar.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (!Array.isArray(parsed)) throw new Error('Formato inválido');

                // Limpa e valida os dados
                const cleaned = parsed.map(item => ({
                    id: item.id || Utils.uid(),
                    name: Utils.nl(item.name),
                    location: Utils.nl(item.location),
                    threat: item.threat || 'media',
                    category: Utils.nl(item.category),
                    website: Utils.nl(item.website),
                    instagram: Utils.nl(item.instagram),
                    phone: Utils.nl(item.phone),
                    cnpj: Utils.nl(item.cnpj),
                    tags: Utils.nl(item.tags),
                    ticket: Utils.nl(item.ticket),
                    focus: Utils.nl(item.focus),
                    analysis: Utils.nl(item.analysis),
                    builtIn: !!item.builtIn,
                    archived: !!item.archived
                }));

                this.state.data = cleaned;
                this.state.saveData(this.state.data);

                Utils.showNotification('Importação concluída com sucesso!');
                this.refreshIOPreview();
                this.renderDashboard();
                this.renderEditTable();

                // Limpa o input de arquivo
                fileInput.value = '';

            } catch (err) {
                Utils.showNotification('Falha ao importar: ' + err.message, 'error');
            }
        };
        reader.readAsText(file, 'utf-8');
    }

    // ===== RELATÓRIOS =====
    buildReport() {
        const reportDate = Utils.$('#report-date');
        const tableBody = Utils.$('#report-table tbody');

        if (reportDate) {
            reportDate.textContent = new Date().toLocaleString('pt-BR');
        }

        const categoryFilter = Utils.$('#report-cat').value;
        const threatFilter = Utils.$('#report-threat').value;
        const sortMode = Utils.$('#report-sort').value;

        let filteredData = this.state.data.filter(competitor => !competitor.archived);

        // Aplica filtros
        if (categoryFilter !== 'todos') {
            filteredData = filteredData.filter(competitor => competitor.category === categoryFilter);
        }

        if (threatFilter !== 'todos') {
            filteredData = filteredData.filter(competitor => competitor.threat === threatFilter);
        }

        // Aplica ordenação
        switch (sortMode) {
            case 'az':
                filteredData.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'cidade':
                filteredData.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
                break;
            case 'ameaca':
                filteredData.sort((a, b) =>
                    (CONFIG.THREAT_ORDER[a.threat] ?? 9) - (CONFIG.THREAT_ORDER[b.threat] ?? 9)
                );
                break;
        }

        if (tableBody) {
            tableBody.innerHTML = filteredData.map(competitor => `
                <tr>
                    <td>${competitor.name}</td>
                    <td>${competitor.location || '—'}</td>
                    <td>${competitor.threat}</td>
                    <td>${competitor.category}</td>
                    <td>${competitor.focus || '—'}</td>
                    <td>
                        ${competitor.instagram ? `<a href="${competitor.instagram}">Instagram</a>` : ''}
                        ${competitor.website ? (competitor.instagram ? ' • ' : '') + `<a href="${competitor.website}">Site</a>` : ''}
                    </td>
                    <td>${Utils.nl(competitor.tags)}</td>
                </tr>
            `).join('') || `<tr><td colspan="7" style="color:var(--text-muted)">Sem resultados.</td></tr>`;
        }
    }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
class App {
    constructor() {
        this.stateManager = new StateManager();
        this.uiManager = new UIManager(this.stateManager);
        this.init();
    }

    init() {
        console.log('🚀 Aplicação Nicopel Concorrência inicializada!');
        
        // Observador para atualizar preview de IO quando a view for aberta
        new MutationObserver(() => {
            if (Utils.$('#view-io') && Utils.$('#view-io').style.display !== 'none') {
                this.uiManager.refreshIOPreview();
            }
        }).observe(Utils.$('#view-io'), { attributes: true, attributeFilter: ['style'] });
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
