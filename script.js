// ===== SISTEMA DE BANCO DE DADOS =====
class CompetitorsDatabase {
    constructor() {
        this.dbName = 'nicopel_competitors_db';
        this.version = 1;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // Verifica se o browser suporta IndexedDB
            if (!window.indexedDB) {
                console.warn('IndexedDB não suportado, usando localStorage como fallback');
                this.useLocalStorage = true;
                this.migrateToLocalStorage();
            } else {
                this.useLocalStorage = false;
                await this.initIndexedDB();
            }
            this.initialized = true;
        } catch (error) {
            console.error('Erro ao inicializar banco de dados:', error);
            this.useLocalStorage = true;
            this.migrateToLocalStorage();
        }
    }

    // ===== INDEXEDDB (Banco de Dados Moderno) =====
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Cria object store para concorrentes
                if (!db.objectStoreNames.contains('competitors')) {
                    const store = db.createObjectStore('competitors', { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    
                    // Cria índices para busca rápida
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('category', 'category', { unique: false });
                    store.createIndex('threat', 'threat', { unique: false });
                    store.createIndex('location', 'location', { unique: false });
                    store.createIndex('archived', 'archived', { unique: false });
                    store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                }

                // Cria object store para configurações
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // ===== LOCALSTORAGE (Fallback) =====
    migrateToLocalStorage() {
        const existingData = localStorage.getItem('nicopel_concorrentes_v3');
        if (!existingData) {
            // Dados iniciais padrão
            const initialData = this.getInitialData();
            localStorage.setItem('nicopel_concorrentes_v3', JSON.stringify(initialData));
        }
    }

    getInitialData() {
        return [
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
                tags: 'plástico,injetora',
                ticket: '',
                focus: 'Embalagens plásticas',
                analysis: 'Concorrente direto com capacidade produtiva similar',
                builtIn: true,
                archived: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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
                tags: 'plástico,termoformagem',
                ticket: '',
                focus: 'Potes e copos plásticos',
                analysis: 'Forte atuação na região sul',
                builtIn: true,
                archived: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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
                tags: 'papelão,sustentável',
                ticket: '',
                focus: 'Embalagens sustentáveis',
                analysis: 'Diferencial ecológico, preço competitivo',
                builtIn: true,
                archived: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }

    // ===== OPERAÇÕES CRUD =====
    async getAllCompetitors() {
        if (!this.initialized) await this.waitForInit();

        if (this.useLocalStorage) {
            const data = localStorage.getItem('nicopel_concorrentes_v3');
            return data ? JSON.parse(data) : [];
        } else {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['competitors'], 'readonly');
                const store = transaction.objectStore('competitors');
                const request = store.getAll();

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            });
        }
    }

    async getCompetitor(id) {
        if (!this.initialized) await this.waitForInit();

        if (this.useLocalStorage) {
            const all = await this.getAllCompetitors();
            return all.find(item => item.id === id);
        } else {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['competitors'], 'readonly');
                const store = transaction.objectStore('competitors');
                const request = store.get(id);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            });
        }
    }

    async addCompetitor(competitor) {
        if (!this.initialized) await this.waitForInit();

        const competitorWithMeta = {
            ...competitor,
            id: competitor.id || this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const all = await this.getAllCompetitors();
            all.unshift(competitorWithMeta);
            localStorage.setItem('nicopel_concorrentes_v3', JSON.stringify(all));
            return competitorWithMeta;
        } else {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['competitors'], 'readwrite');
                const store = transaction.objectStore('competitors');
                const request = store.add(competitorWithMeta);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(competitorWithMeta);
            });
        }
    }

    async updateCompetitor(id, updates) {
        if (!this.initialized) await this.waitForInit();

        if (this.useLocalStorage) {
            const all = await this.getAllCompetitors();
            const index = all.findIndex(item => item.id === id);
            if (index !== -1) {
                all[index] = { 
                    ...all[index], 
                    ...updates, 
                    updatedAt: new Date().toISOString() 
                };
                localStorage.setItem('nicopel_concorrentes_v3', JSON.stringify(all));
                return all[index];
            }
            return null;
        } else {
            return new Promise(async (resolve, reject) => {
                const transaction = this.db.transaction(['competitors'], 'readwrite');
                const store = transaction.objectStore('competitors');
                
                // Primeiro busca o item existente
                const getRequest = store.get(id);
                getRequest.onerror = () => reject(getRequest.error);
                getRequest.onsuccess = () => {
                    const existing = getRequest.result;
                    if (!existing) {
                        resolve(null);
                        return;
                    }

                    const updated = { 
                        ...existing, 
                        ...updates, 
                        updatedAt: new Date().toISOString() 
                    };

                    const putRequest = store.put(updated);
                    putRequest.onerror = () => reject(putRequest.error);
                    putRequest.onsuccess = () => resolve(updated);
                };
            });
        }
    }

    async deleteCompetitor(id) {
        if (!this.initialized) await this.waitForInit();

        if (this.useLocalStorage) {
            const all = await this.getAllCompetitors();
            const filtered = all.filter(item => item.id !== id);
            localStorage.setItem('nicopel_concorrentes_v3', JSON.stringify(filtered));
            return true;
        } else {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['competitors'], 'readwrite');
                const store = transaction.objectStore('competitors');
                const request = store.delete(id);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(true);
            });
        }
    }

    // ===== OPERAÇÕES AVANÇADAS =====
    async searchCompetitors(filters = {}) {
        const all = await this.getAllCompetitors();
        
        return all.filter(competitor => {
            // Filtro por categoria
            if (filters.category && filters.category !== 'todos' && competitor.category !== filters.category) {
                return false;
            }

            // Filtro por nível de ameaça
            if (filters.threat) {
                if (filters.threat === 'direto' && competitor.threat !== 'alta') return false;
                if (filters.threat === 'indireto' && competitor.threat === 'alta') return false;
            }

            // Filtro por busca textual
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const searchable = [
                    competitor.name,
                    competitor.location,
                    competitor.focus,
                    competitor.tags,
                    competitor.analysis
                ].join(' ').toLowerCase();
                
                if (!searchable.includes(searchTerm)) return false;
            }

            // Filtro por tag específica
            if (filters.tag) {
                const tags = competitor.tags ? competitor.tags.split(',').map(t => t.trim().toLowerCase()) : [];
                if (!tags.includes(filters.tag.toLowerCase())) return false;
            }

            // Mostrar apenas não-arquivados (a menos que especificado)
            if (filters.includeArchived !== true && competitor.archived) {
                return false;
            }

            return true;
        });
    }

    async getCompetitorsByCategory() {
        const all = await this.getAllCompetitors();
        const byCategory = {};
        
        all.forEach(competitor => {
            if (!competitor.archived) {
                if (!byCategory[competitor.category]) {
                    byCategory[competitor.category] = [];
                }
                byCategory[competitor.category].push(competitor);
            }
        });

        return byCategory;
    }

    async getStats() {
        const all = await this.getAllCompetitors();
        const active = all.filter(c => !c.archived);
        
        return {
            total: all.length,
            active: active.length,
            archived: all.length - active.length,
            byThreat: {
                alta: active.filter(c => c.threat === 'alta').length,
                media: active.filter(c => c.threat === 'media').length,
                baixa: active.filter(c => c.threat === 'baixa').length
            },
            byCategory: await this.getCompetitorsByCategory()
        };
    }

    // ===== BACKUP E RESTAURAÇÃO =====
    async exportData() {
        const data = await this.getAllCompetitors();
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            count: data.length,
            data: data
        };
    }

    async importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (!data.data || !Array.isArray(data.data)) {
                throw new Error('Formato de dados inválido');
            }

            // Limpa todos os dados existentes
            if (this.useLocalStorage) {
                localStorage.setItem('nicopel_concorrentes_v3', JSON.stringify(data.data));
            } else {
                const transaction = this.db.transaction(['competitors'], 'readwrite');
                const store = transaction.objectStore('competitors');
                store.clear();
                
                data.data.forEach(item => {
                    store.add(item);
                });
            }

            return { success: true, imported: data.data.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===== UTILITÁRIOS =====
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    waitForInit() {
        return new Promise((resolve) => {
            const check = () => {
                if (this.initialized) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    async clearDatabase() {
        if (this.useLocalStorage) {
            localStorage.removeItem('nicopel_concorrentes_v3');
        } else {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['competitors'], 'readwrite');
                const store = transaction.objectStore('competitors');
                const request = store.clear();

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            });
        }
    }
}

// ===== INSTÂNCIA GLOBAL DO BANCO DE DADOS =====
window.CompetitorsDB = new CompetitorsDatabase();


// ===== CONFIGURAÇÕES E CONSTANTES =====
const CONFIG = {
    THREAT_ORDER: { alta: 0, media: 1, baixa: 2 },
    CATEGORIES: {
        'potes-copos': 'Potes e Copos',
        'caixas-sorvete': 'Caixas de Sorvete', 
        'caixas-pizza': 'Caixas de Pizza',
        'embalagens-industriais': 'Embalagens Industriais'
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

    async init() {
        await this.loadFromDatabase();
        this.updateDates();
    }

    async loadFromDatabase() {
        try {
            this.data = await CompetitorsDB.getAllCompetitors();
            console.log('Dados carregados do banco:', this.data.length, 'registros');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Utils.showNotification('Erro ao carregar dados do banco', 'error');
        }
    }

    updateDates() {
        const today = new Date();
        const fmt = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        Utils.$('#last-updated').textContent = fmt;
        Utils.$('#last-updated-side').textContent = fmt;
    }

    async addCompetitor(competitor) {
        try {
            const newCompetitor = await CompetitorsDB.addCompetitor(competitor);
            this.data.unshift(newCompetitor);
            Utils.showNotification('Concorrente adicionado com sucesso!');
            return newCompetitor;
        } catch (error) {
            console.error('Erro ao adicionar concorrente:', error);
            Utils.showNotification('Erro ao adicionar concorrente', 'error');
            throw error;
        }
    }

    async updateCompetitor(id, updates) {
        try {
            const updated = await CompetitorsDB.updateCompetitor(id, updates);
            if (updated) {
                const index = this.data.findIndex(x => x.id === id);
                if (index !== -1) {
                    this.data[index] = updated;
                }
                Utils.showNotification('Alterações salvas com sucesso!');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao atualizar concorrente:', error);
            Utils.showNotification('Erro ao salvar alterações', 'error');
            return false;
        }
    }

    async deleteCompetitor(id) {
        try {
            await CompetitorsDB.deleteCompetitor(id);
            this.data = this.data.filter(x => x.id !== id);
            Utils.showNotification('Concorrente excluído!');
            return true;
        } catch (error) {
            console.error('Erro ao excluir concorrente:', error);
            Utils.showNotification('Erro ao excluir concorrente', 'error');
            return false;
        }
    }

    async toggleArchive(id) {
        const competitor = this.data.find(x => x.id === id);
        if (competitor) {
            return await this.updateCompetitor(id, {
                archived: !competitor.archived
            });
        }
        return false;
    }

    async getFilteredData() {
        try {
            return await CompetitorsDB.searchCompetitors(this.filters);
        } catch (error) {
            console.error('Erro ao filtrar dados:', error);
            return [];
        }
    }

    async getStats() {
        return await CompetitorsDB.getStats();
    }
}

// ===== GERENCIAMENTO DE INTERFACE =====
class UIManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.modal = Utils.$('#competitor-modal');
        this.init();
    }

    async init() {
        await this.state.init();
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

        // Event delegation para cards
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

    // ... (os demais métodos permanecem similares, mas agora são assíncronos) ...

    async renderDashboard() {
        const grid = Utils.$('#competitors-grid');
        const filteredData = await this.state.getFilteredData();

        grid.innerHTML = filteredData.map(competitor => this.cardHTML(competitor)).join('');
    }

    async renderEditTable() {
        const tbody = Utils.$('#edit-table tbody');
        const searchTerm = (Utils.$('#edit-search').value || '').toLowerCase();
        
        let filteredData = this.state.data.filter(competitor =>
            (competitor.name || '').toLowerCase().includes(searchTerm) ||
            (competitor.location || '').toLowerCase().includes(searchTerm)
        );

        // Ordenação
        const sortMode = Utils.$('#edit-sort').value;
        filteredData = this.sortData(filteredData, sortMode);

        tbody.innerHTML = filteredData.map(competitor => this.editTableRowHTML(competitor)).join('') || 
            `<tr><td colspan="7" style="color:var(--text-muted)">Nenhum item encontrado.</td></tr>`;

        Utils.$('#bulk-all').checked = false;
    }

    cardHTML(competitor) {
        const preview = (competitor.analysis || competitor.focus || '').trim();
        const truncatedPreview = preview && preview.length > 140 ? preview.slice(0, 140) + '...' : preview;

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
                    ${competitor.focus ? `<div class="info-item">
                        <svg><use href="#icon-focus"/></svg>
                        <span>${competitor.focus}</span>
                    </div>` : ''}
                    ${truncatedPreview ? `<p class="card-analysis-preview">${truncatedPreview}</p>` : ''}
                    ${this.tagsToChipsHTML(competitor.tags)}
                </div>
            </article>
        `;
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

    // ... (implementar os demais métodos necessários) ...
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
class App {
    constructor() {
        this.stateManager = new StateManager();
        this.uiManager = new UIManager(this.stateManager);
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
