// ===== CONFIGURAÇÕES E CONSTANTES =====
const CONFIG = {
    STORAGE_KEY: 'nicopel_concorrentes_v3',
    THREAT_ORDER: { alta: 0, media: 1, baixa: 2 },
    KNOWN_PATCH: {
        'Soluplex Brasil': { instagram: 'https://www.instagram.com/soluplex.brasil/', location: 'Cajamar - SP' },
        'Soller Embalagens': { instagram: 'https://www.instagram.com/sollerembalagens/', location: 'Morro da Fumaça - SC' },
        'BoxBe': { instagram: 'https://www.instagram.com/boxbeecoembalagens/' },
        'Nazapack': { instagram: 'https://www.instagram.com/nazapack/', location: 'São Paulo - SP' },
        'Gráfica Tambosi': { instagram: 'https://www.instagram.com/tambosiindustriagrafica/', location: 'Taió - SC' },
        'Biopapers': { instagram: 'https://www.instagram.com/biopapersbrasil/' },
        'Castagna': { instagram: 'https://www.instagram.com/castagna_comercio/', location: 'Canoas - RS' },
        'BelloCopo': { instagram: 'https://www.instagram.com/bellocopo/' },
        'MultiCaixasNet': { instagram: 'https://www.instagram.com/multicaixasnet/', location: 'Atibaia - SP' },
        'Perpacks': { instagram: 'https://www.instagram.com/perpacksembalagens/' },
        'Pixpel': { instagram: 'https://www.instagram.com/pixpel_sustentavel/', location: 'Itupeva - SP' },
        'DCX Embalagens': { location: 'Carapicuíba - SP' },
        'Altacoppo': { location: 'Carapicuíba - SP' },
        'Brazil Copos': { instagram: 'https://www.instagram.com/brazilcopos/' },
        'Natucopos': { instagram: 'https://www.instagram.com/natucopos/' },
        'Apolo Embalagens': { instagram: 'https://www.instagram.com/apoloembalagens/' },
        'MX Copos & Potes': { instagram: 'https://www.instagram.com/mxcopos/' },
        'Copack': { instagram: 'https://www.instagram.com/copackembalagens/' },
        'Ecofoodpack': { instagram: 'https://www.instagram.com/ecofoodpack/' },
    }
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
    
    static extractDomain(url) {
        if (!url) return null;
        try {
            // Remove protocol and www, then extract domain
            const domain = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
            return domain;
        } catch {
            return null;
        }
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
        this.data = this.migrateFromOldIfNeeded();
        this.updateDates();
    }

    readStore() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    writeStore(list) {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(list));
    }

    migrateFromOldIfNeeded() {
        let data = this.readStore();
        if (data) return data;

        // Tenta migrar da v2
        let v2 = null;
        try {
            v2 = JSON.parse(localStorage.getItem('nicopel_concorrentes_v2') || 'null');
        } catch { }

        if (Array.isArray(v2) && v2.length) {
            v2 = v2.map(o => {
                const fix = CONFIG.KNOWN_PATCH[o.name];
                if (o.builtIn && fix) {
                    return {
                        ...o,
                        instagram: fix.instagram || o.instagram,
                        location: fix.location || o.location
                    };
                }
                return o;
            });
            this.writeStore(v2);
            return v2;
        }

        // Migra do HTML estático
        const seed = Utils.$$('#competitors-grid .competitor-card').map(card => {
            const name = Utils.nl(card.dataset.name);
            const fix = CONFIG.KNOWN_PATCH[name] || {};
            return {
                id: Utils.uid(),
                name,
                location: fix.location || Utils.nl(card.dataset.location),
                threat: Utils.nl(card.dataset.threat) || 'media',
                category: Utils.nl(card.dataset.category),
                website: Utils.nl(card.dataset.website),
                instagram: fix.instagram || Utils.nl(card.dataset.instagram),
                phone: '', cnpj: '', tags: '', ticket: '',
                focus: Utils.nl(card.dataset.focus),
                analysis: Utils.nl(card.dataset.analysis),
                builtIn: true, archived: false,
            };
        });
        this.writeStore(seed);
        return seed;
    }

    updateDates() {
        const today = new Date();
        const fmt = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        Utils.$('#last-updated').textContent = fmt;
        Utils.$('#last-updated-side').textContent = fmt;
    }

    addCompetitor(competitor) {
        this.data.unshift(competitor);
        this.writeStore(this.data);
    }

    updateCompetitor(id, updates) {
        const index = this.data.findIndex(x => x.id === id);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...updates };
            this.writeStore(this.data);
            return true;
        }
        return false;
    }

    deleteCompetitor(id) {
        const index = this.data.findIndex(x => x.id === id);
        if (index !== -1) {
            this.data.splice(index, 1);
            this.writeStore(this.data);
            return true;
        }
        return false;
    }

    toggleArchive(id) {
        const index = this.data.findIndex(x => x.id === id);
        if (index !== -1) {
            this.data[index].archived = !this.data[index].archived;
            this.writeStore(this.data);
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
                (d.location || '').toLowerCase().includes(q)
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
        views[view].style.display = 'block';

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

        Utils.$('#category-nav .active').classList.remove('active');
        button.classList.add('active');

        this.state.filters.category = button.dataset.category;
        this.state.filters.tag = '';
        this.renderDashboard();
    }

    handleThreatFilter(e) {
        const button = e.target.closest('.tab-btn');
        if (!button) return;

        Utils.$('#threat-nav .active').classList.remove('active');
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

    threatText(level) {
        const texts = {
            'alta': 'Alta (Direto)',
            'media': 'Média (Indireto)',
            'baixa': 'Baixa (Indireto)'
        };
        return texts[level] || level;
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
                    ${truncatedPreview ? `<p class="card-analysis-preview">${truncatedPreview}</p>` : ''}
                    ${this.tagsToChipsHTML(competitor.tags)}
                </div>
            </article>
        `;
    }

    renderDashboard() {
        const grid = Utils.$('#competitors-grid');
        const filteredData = this.state.getFilteredData();

        grid.innerHTML = filteredData.map(competitor => this.cardHTML(competitor)).join('');

        // Adiciona event listener para chips de tags
        grid.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (chip) {
                this.state.filters.tag = chip.dataset.chip || '';
                this.renderDashboard();
            }
        });
    }

    // ===== MODAL - NOVO DESIGN =====
    openModal(id) {
        const competitor = this.state.data.find(x => x.id === id);
        if (!competitor) return;

        // Header do modal
        Utils.$('#modal-header-content').innerHTML = `
            <span class="threat-level ${this.threatClass(competitor.threat)}"></span>
            <h3 style="margin:0">${competitor.name}</h3>
        `;

        // Informações básicas
        Utils.$('#modal-location').textContent = competitor.location || '—';
        Utils.$('#modal-focus').textContent = competitor.focus || '—';
        Utils.$('#modal-category').textContent = competitor.category || '—';
        Utils.$('#modal-threat').textContent = this.threatText(competitor.threat);

        // Análise estratégica
        Utils.$('#modal-analysis').textContent = competitor.analysis || '—';
        Utils.$('#modal-tags').innerHTML = this.tagsToChipsHTML(competitor.tags);

        // Links básicos
        const basicLinksContainer = Utils.$('#modal-basic-links');
        basicLinksContainer.innerHTML = '';
        
        if (competitor.website) {
            basicLinksContainer.innerHTML += `
                <a href="${competitor.website}" target="_blank" rel="noopener" class="basic-link">
                    <svg><use href="#icon-website"/></svg>Website
                </a>
            `;
        }
        
        if (competitor.instagram) {
            basicLinksContainer.innerHTML += `
                <a href="${competitor.instagram}" target="_blank" rel="noopener" class="basic-link">
                    <svg><use href="#icon-instagram"/></svg>Instagram
                </a>
            `;
        }
        
        if (!competitor.website && !competitor.instagram) {
            basicLinksContainer.innerHTML = '<span style="color:var(--text-muted)">Sem links cadastrados</span>';
        }

        // Botões de análise de marketing
        const domain = Utils.extractDomain(competitor.website);
        
        // Meta Ads
        Utils.$('#meta-ads-btn').href = `https://www.facebook.com/ads/library/?q=${encodeURIComponent(competitor.name)}`;
        
        // Google Ads
        Utils.$('#google-ads-btn').href = `https://adstransparency.google.com/?q=${encodeURIComponent(competitor.name)}`;
        
        // SimilarWeb
        if (domain) {
            Utils.$('#traffic-analysis-btn').href = `https://similarweb.com/website/${domain}`;
            Utils.$('#traffic-analysis-btn').style.display = 'flex';
        } else {
            Utils.$('#traffic-analysis-btn').style.display = 'none';
        }

        // Informações adicionais
        Utils.$('#modal-phone').textContent = competitor.phone || '—';
        Utils.$('#modal-cnpj').textContent = competitor.cnpj || '—';
        Utils.$('#modal-ticket').textContent = competitor.ticket ? `R$ ${parseFloat(competitor.ticket).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '—';

        // Mostra o modal
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Foco no modal para acessibilidade
        const focusable = this.modal.querySelectorAll('a[href], button');
        if (focusable.length > 0) {
            focusable[0].focus();
        }
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
            id: Utils.uid(),
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
            analysis: Utils.nl(Utils.$('#f-analysis').value),
            builtIn: false,
            archived: false
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
                    if (Utils.$('#e-id').value === id) {
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

        ids.forEach(id => {
            const competitor = this.state.data.find(x => x.id === id);
            if (competitor && !competitor.archived) {
                competitor.archived = true;
            }
        });

        this.state.writeStore(this.state.data);
        this.renderEditTable();
        this.renderDashboard();
        Utils.showNotification(`${ids.length} item(ns) arquivado(s)!`);
    }

    handleBulkUnarchive() {
        const ids = this.getSelectedIds();
        if (!ids.length) {
            Utils.showNotification('Selecione ao menos um item.', 'error');
            return;
        }

        ids.forEach(id => {
            const competitor = this.state.data.find(x => x.id === id);
            if (competitor && competitor.archived) {
                competitor.archived = false;
            }
        });

        this.state.writeStore(this.state.data);
        this.renderEditTable();
        this.renderDashboard();
        Utils.showNotification(`${ids.length} item(ns) desarquivado(s)!`);
    }

    handleBulkDelete() {
        const ids = this.getSelectedIds();
        if (!ids.length) {
            Utils.showNotification('Selecione ao menos um item.', 'error');
            return;
        }

        if (!confirm(`Excluir ${ids.length} item(ns) definitivamente?`)) return;

        this.state.data = this.state.data.filter(competitor => !ids.includes(competitor.id));
        this.state.writeStore(this.state.data);
        this.renderEditTable();
        this.renderDashboard();
        Utils.showNotification(`${ids.length} item(ns) excluído(s)!`);
    }

    // ===== IMPORT/EXPORT =====
    refreshIOPreview() {
        Utils.$('#io-preview').value = JSON.stringify(this.state.data, null, 2);
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
                this.state.writeStore(this.state.data);

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

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
class App {
    constructor() {
        this.stateManager = new StateManager();
        this.uiManager = new UIManager(this.stateManager);
        this.init();
    }

    init() {
        console.log('🚀 Aplicação Nicopel Concorrência inicializada!');
        
        // Event listener global para abrir modal via cards
        Utils.$('#competitors-grid').addEventListener('click', (e) => {
            const card = e.target.closest('.competitor-card');
            if (card) {
                this.uiManager.openModal(card.dataset.id);
            }
        });

        // Observador para atualizar preview de IO quando a view for aberta
        new MutationObserver(() => {
            if (Utils.$('#view-io').style.display !== 'none') {
                this.uiManager.refreshIOPreview();
            }
        }).observe(Utils.$('#view-io'), { attributes: true, attributeFilter: ['style'] });
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
