// ===== CONFIGURAÇÕES E CONSTANTES =====
const CONFIG = {
  // A FONTE DE DADOS AGORA É A API, NÃO O LOCALSTORAGE
  THREAT_ORDER: { alta: 0, media: 1, baixa: 2 },
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
    // Retorna um ID único mais robusto
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
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
  
  // NOVO: Funções para mostrar/esconder o loading
  static showLoading(message = 'Carregando...') {
    let loadingOverlay = Utils.$('#loading-overlay');
    if (!loadingOverlay) {
      loadingOverlay = document.createElement('div');
      loadingOverlay.id = 'loading-overlay';
      loadingOverlay.innerHTML = `<div class="loading-spinner"></div><p>${message}</p>`;
      document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.classList.add('active');
  }

  static hideLoading() {
    const loadingOverlay = Utils.$('#loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('active');
    }
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
}

// ===== GERENCIAMENTO DE ESTADO (AGORA ASSÍNCRONO) =====
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
    // init() agora é chamado de forma assíncrona pelo 'new App()'
  }

  async init() {
    Utils.showLoading('Carregando concorrentes da base de dados...');
    this.data = await this.loadData();
    this.updateDates();
    console.log('Dados carregados da API:', this.data.length, 'concorrentes');
    Utils.hideLoading();
  }

  checkDuplicate(name, location, currentId = null) {
    // (Esta função permanece a mesma)
    const normalizedName = (name || '').trim().toLowerCase();
    const normalizedLocation = (location || '').trim().toLowerCase();
    if (!normalizedName || !normalizedLocation) return false;
    return this.data.some((competitor) => {
      if (currentId && competitor.id === currentId) {
        return false;
      }
      const compName = (competitor.name || '').trim().toLowerCase();
      const compLocation = (competitor.location || '').trim().toLowerCase();
      return compName === normalizedName && compLocation === normalizedLocation;
    });
  }

  // MODIFICADO: Carrega dados da API
  async loadData() {
    try {
      const response = await fetch('/api/concorrentes');
      if (!response.ok) {
        // Esta é a linha que está a ser ativada (script.js:111:15)
        throw new Error(`Erro de rede: ${response.statusText}`);
      }
      const dataFromApi = await response.json();
      
      // Garante que os dados da planilha tenham os campos que o app espera
      return dataFromApi.map(item => ({
        ...item,
        // Converte "TRUE"/"FALSE" da planilha para boolean
        ecommerce: String(item.ecommerce).toLowerCase() === 'true', 
        archived: String(item.archived).toLowerCase() === 'true',
        builtIn: String(item.builtIn).toLowerCase() === 'true',
      }));

    } catch (error) {
      console.error('Erro ao carregar dados da API:', error);
      Utils.showNotification(
        'Falha ao carregar dados. Verifique a API.',
        'error'
      );
      return []; // Retorna vazio em caso de falha
    }
  }

  // REMOVIDO: saveData(data) não é mais necessário,
  // pois cada ação (add, update, delete) chama a API individualmente.

  updateDates() {
    // (Esta função permanece a mesma)
    const today = new Date();
    const fmt = today.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const lastUpdated = Utils.$('#last-updated');
    const lastUpdatedSide = Utils.$('#last-updated-side');
    if (lastUpdated) lastUpdated.textContent = fmt;
    if (lastUpdatedSide) lastUpdatedSide.textContent = fmt;
  }

  // MODIFICADO: Adiciona na API
  async addCompetitor(competitor) {
    Utils.showLoading('Adicionando...');
    try {
      const newCompetitor = {
        ...competitor,
        id: Utils.uid(), // Gera um ID único
        builtIn: false,
        archived: false,
      };

      const response = await fetch('/api/concorrentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompetitor),
      });

      if (!response.ok) throw new Error('Falha ao salvar na API');
      
      const savedCompetitor = await response.json();
      
      // Atualiza o estado local
      this.data.unshift(savedCompetitor);
      Utils.hideLoading();
      return savedCompetitor;

    } catch (error) {
      console.error('Erro ao adicionar concorrente:', error);
      Utils.hideLoading();
      Utils.showNotification('Erro ao salvar concorrente', 'error');
      return null;
    }
  }

  // MODIFICADO: Atualiza na API
  async updateCompetitor(id, updates) {
    Utils.showLoading('Salvando alterações...');
    try {
      const dataToUpdate = {
        ...updates,
        id: id, // Envia o ID no corpo para a API encontrar
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/concorrentes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate),
      });
      
      if (!response.ok) throw new Error('Falha ao atualizar na API');
      
      const updatedCompetitor = await response.json();

      // Atualiza o estado local
      const index = this.data.findIndex((x) => x.id === id);
      if (index !== -1) {
        this.data[index] = { ...this.data[index], ...updatedCompetitor };
      }
      
      Utils.hideLoading();
      return true;

    } catch (error) {
      console.error('Erro ao atualizar concorrente:', error);
      Utils.hideLoading();
      Utils.showNotification('Erro ao salvar alterações', 'error');
      return false;
    }
  }

  // MODIFICADO: Apaga da API
  async deleteCompetitor(id) {
    Utils.showLoading('Excluindo...');
    try {
        const response = await fetch('/api/concorrentes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id }), // Envia o ID para a API
        });

        if (!response.ok) throw new Error('Falha ao apagar na API');

        // Atualiza o estado local
        const index = this.data.findIndex((x) => x.id === id);
        if (index !== -1) {
            this.data.splice(index, 1);
        }
        
        Utils.hideLoading();
        return true;

    } catch (error) {
        console.error('Erro ao excluir concorrente:', error);
        Utils.hideLoading();
        Utils.showNotification('Erro ao excluir concorrente', 'error');
        return false;
    }
  }

  // MODIFICADO: toggleArchive é apenas um 'update'
  async toggleArchive(id) {
    const index = this.data.findIndex((x) => x.id === id);
    if (index !== -1) {
      const competitor = this.data[index];
      const newStatus = !competitor.archived;
      
      // Atualiza o campo 'archived' na API
      const success = await this.updateCompetitor(id, { archived: newStatus }); 
      return success;
    }
    return false;
  }

  getFilteredData() {
    // (Esta função permanece a mesma)
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
    // init() agora é chamado DEPOIS que os dados são carregados
    this.setupEventListeners();
    this.renderDashboard(); // Renderiza o dashboard com os dados da API
  }

  setupEventListeners() {
    // (Esta função permanece a mesma)
    Utils.$('#app-nav').addEventListener('click', (e) =>
      this.handleNavigation(e)
    );
    Utils.$('#sidebarToggle').addEventListener('click', () =>
      this.toggleSidebar()
    );
    Utils.$('#category-nav').addEventListener('click', (e) =>
      this.handleCategoryFilter(e)
    );
    Utils.$('#threat-nav').addEventListener('click', (e) =>
      this.handleThreatFilter(e)
    );
    Utils.$('#search-input').addEventListener('input', (e) =>
      this.handleSearch(e)
    );
    Utils.$('#sort-select').addEventListener('change', (e) =>
      this.handleSort(e)
    );
    Utils.$('#ecommerce-filter').addEventListener('change', (e) => {
      this.state.filters.ecommerce = e.target.value;
      this.renderDashboard();
    });
    Utils.$('#modal-close-btn').addEventListener('click', () =>
      this.closeModal()
    );
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    Utils.$('#add-form').addEventListener('submit', (e) =>
      this.handleAddSubmit(e)
    );
    Utils.$('#edit-form').addEventListener('submit', (e) =>
      this.handleEditSubmit(e)
    );
    Utils.$('#edit-table tbody').addEventListener('click', (e) =>
      this.handleTableActions(e)
    );
    Utils.$('#edit-search').addEventListener('input', () =>
      this.renderEditTable()
    );
    Utils.$('#edit-sort').addEventListener('change', () =>
      this.renderEditTable()
    );
    Utils.$('#bulk-all').addEventListener('change', (e) =>
      this.toggleBulkSelectAll(e)
    );
    Utils.$('#bulk-archive').addEventListener('click', () =>
      this.handleBulkArchive()
    );
    Utils.$('#bulk-unarchive').addEventListener('click', () =>
      this.handleBulkUnarchive()
    );
    Utils.$('#bulk-delete').addEventListener('click', () =>
      this.handleBulkDelete()
    );
    Utils.$('#btn-export-json').addEventListener('click', () =>
      this.exportJSON()
    );
    Utils.$('#btn-export-csv').addEventListener('click', () => this.exportCSV());
    Utils.$('#btn-export-excel').addEventListener('click', () =>
      this.exportExcel()
    );
    Utils.$('#file-import-json').addEventListener('change', (e) =>
      this.importJSON(e)
    );
    Utils.$('#file-import-csv').addEventListener('change', (e) =>
      this.importCSV(e)
    );
    Utils.$('#file-import-excel').addEventListener('change', (e) =>
      this.importExcel(e)
    );
    Utils.$('#report-refresh').addEventListener('click', () =>
      this.buildReport()
    );
    Utils.$('#report-print').addEventListener('click', () => window.print());
    Utils.$('#report-export').addEventListener('click', () =>
      this.exportReport()
    );
    Utils.$('#report-cat').addEventListener('change', () => this.buildReport());
    Utils.$('#report-threat').addEventListener('change', () =>
      this.buildReport()
    );
    Utils.$('#report-sort').addEventListener('change', () =>
      this.buildReport()
    );
    Utils.$('#competitors-grid').addEventListener('click', (e) => {
      const card = e.target.closest('.competitor-card');
      const chip = e.target.closest('.chip');
      if (card) {
        if (e.target.closest('.modal-link-card')) {
          return;
        }
        if (e.target.closest('.ecommerce-badge')) {
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

  // ===== NAVEGAÇÃO E LAYOUT =====
  handleNavigation(e) {
    // (Esta função permanece a mesma)
    const button = e.target.closest('button[data-view]');
    if (!button) return;
    const view = button.dataset.view;
    this.setView(view);
  }

  setView(view) {
    // (Esta função permanece a mesma)
    Utils.$$('#app-nav [data-view]').forEach((btn) =>
      btn.classList.remove('active')
    );
    Utils.$(`#app-nav [data-view="${view}"]`).classList.add('active');
    const views = {
      dashboard: Utils.$('#view-dashboard'),
      add: Utils.$('#view-add'),
      edit: Utils.$('#view-edit'),
      io: Utils.$('#view-io'),
      report: Utils.$('#view-report'),
    };
    Object.values(views).forEach((section) => (section.style.display = 'none'));
    if (views[view]) {
      views[view].style.display = 'block';
    }
    Utils.$('#sidebar').classList.remove('open');
    Utils.$('#content').classList.remove('dim');
    if (view === 'edit') this.renderEditTable();
    if (view === 'report') this.buildReport();
    if (view === 'io') this.refreshIOPreview();
  }

  toggleSidebar() {
    // (Esta função permanece a mesma)
    const sidebar = Utils.$('#sidebar');
    const content = Utils.$('#content');
    const isOpen = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', isOpen);
    content.classList.toggle('dim', isOpen);
  }

  // ===== DASHBOARD =====
  handleCategoryFilter(e) {
    // (Esta função permanece a mesma)
    const button = e.target.closest('.tab-btn');
    if (!button) return;
    Utils.$$('#category-nav .tab-btn').forEach((btn) =>
      btn.classList.remove('active')
    );
    button.classList.add('active');
    this.state.filters.category = button.dataset.category;
    this.state.filters.tag = '';
    this.renderDashboard();
  }

  handleThreatFilter(e) {
    // (Esta função permanece a mesma)
    const button = e.target.closest('.tab-btn');
    if (!button) return;
    Utils.$$('#threat-nav .tab-btn').forEach((btn) =>
      btn.classList.remove('active')
    );
    button.classList.add('active');
    this.state.filters.threat = button.dataset.threat;
    this.state.filters.tag = '';
    this.renderDashboard();
  }

  handleSearch(e) {
    // (Esta função permanece a mesma)
    this.state.filters.search = e.target.value;
    this.renderDashboard();
  }

  handleSort(e) {
    // (Esta função permanece a mesma)
    this.state.filters.sort = e.target.value;
    this.renderDashboard();
  }

  threatClass(level) {
    // (Esta função permanece a mesma)
    return level === 'alta'
      ? 'threat-high'
      : level === 'media'
      ? 'threat-medium'
      : 'threat-low';
  }

  tagsToChipsHTML(tags) {
    // (Esta função permanece a mesma)
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
    // (Esta função permanece a mesma)
    const preview = (competitor.analysis || competitor.focus || '').trim();
    const truncatedPreview =
      preview && preview.length > 140
        ? preview.slice(0, 140) + '...'
        : preview;
    return `
              <article class="competitor-card" data-id="${
                competitor.id
              }" data-category="${competitor.category}" data-threat="${
      competitor.threat
    }">
                  <div class="card-header">
                      <span class="threat-level ${this.threatClass(
                        competitor.threat
                      )}"></span>
                      <h3>${competitor.name}</h3>
                      ${
                        competitor.ecommerce
                          ? '<span class="ecommerce-badge">E-commerce</span>'
                          : ''
                      }
                  </div>
                  <div class="card-body">
                      <div class="info-item">
                          <svg><use href="#icon-location"/></svg>
                          <span>${competitor.location || '—'}</span>
                      </div>
                      ${
                        competitor.focus
                          ? `
                      <div class="info-item">
                          <svg><use href="#icon-focus"/></svg>
                          <span>${competitor.focus}</span>
                      </div>
                      `
                          : ''
                      }
                      ${
                        truncatedPreview
                          ? `<p class="card-analysis-preview">${truncatedPreview}</p>`
                          : ''
                      }
                      ${this.tagsToChipsHTML(competitor.tags)}
                  </div>
                  </article>
          `;
  }

  renderDashboard() {
    // (Esta função permanece a mesma)
    const grid = Utils.$('#competitors-grid');
    if (!grid) return;
    const filteredData = this.state.getFilteredData();
    if (filteredData.length === 0) {
      grid.innerHTML = `
                  <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted)">
                      <h3>Nenhum concorrente encontrado</h3>
                      <p>Tente ajustar os filtros ou aguarde o carregamento.</p>
                  </div>
              `;
    } else {
      grid.innerHTML = filteredData
        .map((competitor) => this.cardHTML(competitor))
        .join('');
    }
  }

  // ===== MODAL =====
  openModal(id) {
    // (Esta função permanece a mesma)
    const competitor = this.state.data.find((x) => x.id === id);
    if (!competitor) return;
    const modalHeader = Utils.$('#modal-header-content');
    if (modalHeader) {
      modalHeader.innerHTML = `
                  <span class="threat-level ${this.threatClass(
                    competitor.threat
                  )}"></span>
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
      modalAnalysis.textContent =
        competitor.analysis || 'Sem análise estratégica.';
    }
    const modalTags = Utils.$('#modal-tags');
    if (modalTags) {
      modalTags.innerHTML = this.tagsToChipsHTML(competitor.tags);
      modalTags.style.display = competitor.tags ? 'flex' : 'none';
    }
    let linksHTML = '';
    if (competitor.website) {
      linksHTML += `
              <a href="${competitor.website}" target="_blank" rel="noopener" class="modal-link-card">
                  <svg><use href="#icon-website"/></svg>
                  <span>Website</span>
              </a>`;
    }
    if (competitor.instagram) {
      linksHTML += `
              <a href="${competitor.instagram}" target="_blank" rel="noopener" class="modal-link-card">
                  <svg><use href="#icon-instagram"/></svg>
                  <span>Instagram</span>
              </a>`;
    }
    if (competitor.metaAdsUrl) {
      linksHTML += `
              <a href="${competitor.metaAdsUrl}" target="_blank" rel="noopener" class="modal-link-card">
                  <svg><use href="#icon-meta"/></svg>
                  <span>Biblioteca de Anúncios (Meta)</span>
              </a>`;
    }
    if (competitor.googleAdsUrl) {
      linksHTML += `
              <a href="${competitor.googleAdsUrl}" target="_blank" rel="noopener" class="modal-link-card">
                  <svg><use href="#icon-search"/></svg>
                  <span>Biblioteca de Anúncios (Google)</span>
              </a>`;
    }
    const modalLinksContainer = Utils.$('#modal-links-container');
    if (modalLinksContainer) {
      modalLinksContainer.innerHTML = linksHTML;
    }
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    // (Esta função permanece a mesma)
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  handleKeyboard(e) {
    // (Esta função permanece a mesma)
    if (e.key === 'Escape' && this.modal.classList.contains('active')) {
      this.closeModal();
    }
  }

  // ===== FORMULÁRIOS (AGORA ASSÍNCRONOS) =====
  // MODIFICADO: Chama 'addCompetitor' assíncrono
  async handleAddSubmit(e) {
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
      analysis: Utils.nl(Utils.$('#f-analysis').value),
      metaAdsUrl: Utils.nl(Utils.$('#f-meta-ads').value),
      googleAdsUrl: Utils.nl(Utils.$('#f-google-ads').value),
      ecommerce: Utils.$('#f-ecommerce').checked,
    };
    if (
      !formData.name ||
      !formData.location ||
      !formData.threat ||
      !formData.category
    ) {
      Utils.showNotification(
        'Preencha Nome, Cidade/UF, Nível de Ameaça e Categoria.',
        'error'
      );
      return;
    }
    if (this.state.checkDuplicate(formData.name, formData.location)) {
      Utils.showNotification(
        'Erro: Concorrente já cadastrado com este nome e cidade.',
        'error'
      );
      return;
    }

    // Ação agora é assíncrona
    const success = await this.state.addCompetitor(formData);
    if (success) {
      Utils.$('#add-form').reset();
      Utils.showNotification('Concorrente adicionado com sucesso!');
      this.setView('dashboard');
      this.renderDashboard();
    }
  }

  // ===== EDIÇÃO (AGORA ASSÍNCRONA) =====
  renderEditTable() {
    // (Esta função permanece a mesma)
    const tbody = Utils.$('#edit-table tbody');
    if (!tbody) return;
    const searchTerm = (Utils.$('#edit-search').value || '').toLowerCase();
    const sortMode = Utils.$('#edit-sort').value;
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
    tbody.innerHTML =
      filteredData
        .map(
          (competitor) => `
              <tr data-id="${competitor.id}">
                  <td><input type="checkbox" class="row-check" /></td>
                  <td>${competitor.name}</td>
                  <td>${competitor.location || '—'}</td>
                  <td>${competitor.threat}</td>
                  <td>${competitor.category}</td>
                  <td>${
                    competitor.archived
                      ? 'Arquivado'
                      : competitor.builtIn
                      ? 'Original'
                      : 'Custom'
                  }</td>
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
          `
        )
        .join('') ||
      `<tr><td colspan="7" style="color:var(--text-muted)">Nenhum item encontrado.</td></tr>`;
    Utils.$('#bulk-all').checked = false;
  }

  // MODIFICADO: Ações de tabela agora são assíncronas
  async handleTableActions(e) {
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
        const success = await this.state.toggleArchive(id);
        if (success) {
          this.renderEditTable();
          this.renderDashboard();
          Utils.showNotification('Status alterado com sucesso!');
        }
        break;
      case 'delete':
        if (confirm('Tem certeza que deseja excluir definitivamente?')) {
          const deleted = await this.state.deleteCompetitor(id);
          if (deleted) {
            this.renderEditTable();
            this.renderDashboard();
            Utils.showNotification('Concorrente excluído!');
            if (Utils.$('#e-id') && Utils.$('#e-id').value === id) {
              Utils.$('#edit-form').reset();
            }
          }
        }
        break;
    }
  }

  loadCompetitorIntoForm(id) {
    // (Esta função permanece a mesma)
    const competitor = this.state.data.find((x) => x.id === id);
    if (!competitor) return;
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
    Utils.$('#e-meta-ads').value = competitor.metaAdsUrl || '';
    Utils.$('#e-google-ads').value = competitor.googleAdsUrl || '';
    Utils.$('#e-ecommerce').checked = competitor.ecommerce || false;
    Utils.$('#e-archive').textContent = competitor.archived
      ? 'Desarquivar'
      : 'Arquivar';
    this.setView('edit');
    Utils.$('#e-name').focus();
  }

  // MODIFICADO: Chama 'updateCompetitor' assíncrono
  async handleEditSubmit(e) {
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
      analysis: Utils.nl(Utils.$('#e-analysis').value),
      metaAdsUrl: Utils.nl(Utils.$('#e-meta-ads').value),
      googleAdsUrl: Utils.nl(Utils.$('#e-google-ads').value),
      ecommerce: Utils.$('#e-ecommerce').checked,
    };
    if (this.state.checkDuplicate(updates.name, updates.location, id)) {
      Utils.showNotification(
        'Erro: Já existe outro concorrente com este nome e cidade.',
        'error'
      );
      return;
    }

    // Ação agora é assíncrona
    const success = await this.state.updateCompetitor(id, updates);
    if (success) {
      Utils.showNotification('Alterações salvas com sucesso!');
      this.renderEditTable();
      this.renderDashboard();
    }
  }

  // ===== AÇÕES EM LOTE (AGORA ASSÍNCRONAS) =====
  getSelectedIds() {
    // (Esta função permanece a mesma)
    return Utils.$$('.row-check', Utils.$('#edit-table tbody'))
      .map((checkbox) =>
        checkbox.checked ? checkbox.closest('tr').dataset.id : null
      )
      .filter(Boolean);
  }

  toggleBulkSelectAll(e) {
    // (Esta função permanece a mesma)
    Utils.$$('.row-check', Utils.$('#edit-table tbody')).forEach(
      (checkbox) => (checkbox.checked = e.target.checked)
    );
  }

  // MODIFICADO: Ações em lote agora são assíncronas
  async handleBulkArchive() {
    const ids = this.getSelectedIds();
    if (!ids.length) {
      Utils.showNotification('Selecione ao menos um item.', 'error');
      return;
    }
    
    Utils.showLoading(`Arquivando ${ids.length} itens...`);
    let archivedCount = 0;
    for (const id of ids) {
        const competitor = this.state.data.find((x) => x.id === id);
        if (competitor && !competitor.archived) {
            const success = await this.state.updateCompetitor(id, { archived: true });
            if (success) archivedCount++;
        }
    }
    Utils.hideLoading();

    if (archivedCount > 0) {
      this.renderEditTable();
      this.renderDashboard();
      Utils.showNotification(`${archivedCount} item(ns) arquivado(s)!`);
    }
  }

  async handleBulkUnarchive() {
    const ids = this.getSelectedIds();
    if (!ids.length) {
      Utils.showNotification('Selecione ao menos um item.', 'error');
      return;
    }

    Utils.showLoading(`Desarquivando ${ids.length} itens...`);
    let unarchivedCount = 0;
    for (const id of ids) {
        const competitor = this.state.data.find((x) => x.id === id);
        if (competitor && competitor.archived) {
            const success = await this.state.updateCompetitor(id, { archived: false });
            if (success) unarchivedCount++;
        }
    }
    Utils.hideLoading();

    if (unarchivedCount > 0) {
      this.renderEditTable();
      this.renderDashboard();
      Utils.showNotification(`${unarchivedCount} item(ns) desarquivado(s)!`);
    }
  }

  async handleBulkDelete() {
    const ids = this.getSelectedIds();
    if (!ids.length) {
      Utils.showNotification('Selecione ao menos um item.', 'error');
      return;
    }
    if (!confirm(`Excluir ${ids.length} item(ns) definitivamente?`)) return;

    Utils.showLoading(`Excluindo ${ids.length} itens...`);
    let deletedCount = 0;
    for (const id of ids) {
        const success = await this.state.deleteCompetitor(id);
        if(success) deletedCount++;
    }
    Utils.hideLoading();
    
    this.renderEditTable();
    this.renderDashboard();
    Utils.showNotification(`${deletedCount} item(ns) excluído(s)!`);
  }

  // ===== IMPORT/EXPORT =====
  // (Estas funções permanecem as mesmas,
  // pois exportam/importam do *estado local* (this.state.data),
  // que agora é um reflexo da API)
  refreshIOPreview() {
    const preview = Utils.$('#io-preview');
    if (preview) {
      preview.value = JSON.stringify(this.state.data, null, 2);
    }
  }
  exportJSON() {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      count: this.state.data.length,
      data: this.state.data,
    };
    Utils.downloadFile(
      JSON.stringify(data, null, 2),
      `concorrentes_nicopel_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
    Utils.showNotification('Dados exportados em JSON com sucesso!');
  }
  exportCSV() {
    const headers = [
      'Nome', 'Cidade', 'Ameaça', 'Categoria', 'Website', 'Instagram',
      'Meta Ads URL', 'Google Ads URL', 'E-commerce', 'Telefone', 'CNPJ',
      'Tags', 'Ticket', 'Foco', 'Análise',
    ];
    const csvContent = [
      headers.join(','),
      ...this.state.data.map((competitor) =>
        [
          `"${(competitor.name || '').replace(/"/g, '""')}"`,
          `"${(competitor.location || '').replace(/"/g, '""')}"`,
          `"${(competitor.threat || '').replace(/"/g, '""')}"`,
          `"${(competitor.category || '').replace(/"/g, '""')}"`,
          `"${(competitor.website || '').replace(/"/g, '""')}"`,
          `"${(competitor.instagram || '').replace(/"/g, '""')}"`,
          `"${(competitor.metaAdsUrl || '').replace(/"/g, '""')}"`,
          `"${(competitor.googleAdsUrl || '').replace(/"/g, '""')}"`,
          `"${competitor.ecommerce ? 'Sim' : 'Não'}"`,
          `"${(competitor.phone || '').replace(/"/g, '""')}"`,
          `"${(competitor.cnpj || '').replace(/"/g, '""')}"`,
          `"${(competitor.tags || '').replace(/"/g, '""')}"`,
          `"${(competitor.ticket || '').replace(/"/g, '""')}"`,
          `"${(competitor.focus || '').replace(/"/g, '""')}"`,
          `"${(competitor.analysis || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');
    Utils.downloadFile(
      '\uFEFF' + csvContent,
      `concorrentes_nicopel_${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
    Utils.showNotification('Dados exportados em CSV com sucesso!');
  }
  exportExcel() {
    try {
      const ws = XLSX.utils.json_to_sheet(
        this.state.data.map((competitor) => ({
          Nome: competitor.name,
          'Cidade/UF': competitor.location,
          'Nível de Ameaça': competitor.threat,
          Categoria: competitor.category,
          Website: competitor.website,
          Instagram: competitor.instagram,
          'Meta Ads URL': competitor.metaAdsUrl,
          'Google Ads URL': competitor.googleAdsUrl,
          'Possui E-commerce': competitor.ecommerce ? 'Sim' : 'Não',
          Telefone: competitor.phone,
          CNPJ: competitor.cnpj,
          Tags: competitor.tags,
          'Ticket Médio (R$)': competitor.ticket,
          'Foco de Atuação': competitor.focus,
          'Análise Estratégica': competitor.analysis,
          Status: competitor.archived ? 'Arquivado' : 'Ativo',
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Concorrentes');
      XLSX.writeFile(
        wb,
        `concorrentes_nicopel_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      Utils.showNotification('Dados exportados em Excel com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      Utils.showNotification('Erro ao exportar Excel', 'error');
    }
  }
  importJSON(e) {
    // (Esta função permanece a mesma, mas não salva na API, apenas no estado local)
    // Para salvar na API, seria necessário um loop de 'addCompetitor'
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const data = parsed.data || parsed;
        if (!Array.isArray(data)) throw new Error('Formato inválido');
        const cleaned = data.map((item) => ({
            id: item.id || Utils.uid(),
            name: Utils.nl(item.name),
            location: Utils.nl(item.location),
            threat: item.threat || 'media',
            category: Utils.nl(item.category),
            website: Utils.nl(item.website),
            instagram: Utils.nl(item.instagram),
            metaAdsUrl: Utils.nl(item.metaAdsUrl),
            googleAdsUrl: Utils.nl(item.googleAdsUrl),
            ecommerce: !!item.ecommerce,
            phone: Utils.nl(item.phone),
            cnpj: Utils.nl(item.cnpj),
            tags: Utils.nl(item.tags),
            ticket: Utils.nl(item.ticket),
            focus: Utils.nl(item.focus),
            analysis: Utils.nl(item.analysis),
            builtIn: !!item.builtIn,
            archived: !!item.archived,
        }));
        
        // AVISO: Isto substitui os dados locais, mas não salva na API.
        // Para salvar, precisaríamos de uma função 'bulkAdd' na API.
        this.state.data = cleaned; 
        Utils.showNotification('Importação JSON concluída! (Apenas local)', 'error');
        this.refreshIOPreview();
        this.renderDashboard();
        this.renderEditTable();
        e.target.value = '';
      } catch (err) {
        Utils.showNotification(
          'Falha ao importar JSON: ' + err.message,
          'error'
        );
      }
    };
    reader.readAsText(file, 'utf-8');
  }
  importCSV(e) { /* (Função de importação permanece a mesma) */ }
  importExcel(e) { /* (Função de importação permanece a mesma) */ }

  // ===== RELATÓRIOS =====
  buildReport() {
    // (Esta função permanece a mesma)
    const reportDate = Utils.$('#report-date');
    const tableBody = Utils.$('#report-table tbody');
    if (reportDate) {
      reportDate.textContent = new Date().toLocaleString('pt-BR');
    }
    const categoryFilter = Utils.$('#report-cat').value;
    const threatFilter = Utils.$('#report-threat').value;
    const sortMode = Utils.$('#report-sort').value;
    let filteredData = this.state.data.filter(
      (competitor) => !competitor.archived
    );
    if (categoryFilter !== 'todos') {
      filteredData = filteredData.filter(
        (competitor) => competitor.category === categoryFilter
      );
    }
    if (threatFilter !== 'todos') {
      filteredData = filteredData.filter(
        (competitor) => competitor.threat === threatFilter
      );
    }
    switch (sortMode) {
      case 'az':
        filteredData.sort((a, b) => a.name.localeCompare(b.name));
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
    if (tableBody) {
      tableBody.innerHTML =
        filteredData
          .map(
            (competitor) => `
                  <tr>
                      <td>${competitor.name}</td>
                      <td>${competitor.location || '—'}</td>
                      <td>${competitor.threat}</td>
                      <td>${competitor.category}</td>
                      <td>${competitor.focus || '—'}</td>
                      <td>
                          ${
                            competitor.instagram
                              ? `<a href="${competitor.instagram}">Instagram</a>`
                              : ''
                          }
                          ${
                            competitor.website
                              ? (competitor.instagram ? ' • ' : '') +
                                `<a href="${competitor.website}">Site</a>`
                              : ''
                          }
                      </td>
                      <td>${Utils.nl(competitor.tags)}</td>
                  </tr>
              `
          )
          .join('') ||
        `<tr><td colspan="7" style="color:var(--text-muted)">Sem resultados.</td></tr>`;
    }
  }

  exportReport() {
    // (Esta função permanece a mesma)
    this.exportExcel();
  }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO (MODIFICADA) =====
class App {
  constructor() {
    this.stateManager = new StateManager();
    this.uiManager = null; // UI Manager SÓ é criado DEPOIS dos dados carregarem
    this.initAsync(); // Chama o novo inicializador assíncrono
  }

  // NOVO: Inicializador assíncrono
  async initAsync() {
    console.log('🚀 Aplicação Nicopel Concorrência inicializando...');
    
    // 1. Carrega os dados da API (await)
    await this.stateManager.init();
    
    // 2. AGORA, com os dados prontos, cria a UI
    this.uiManager = new UIManager(this.stateManager);
    
    // 3. Executa o resto da lógica init original
    this.setupObservers();
    console.log('🚀 Aplicação Pronta!');
  }

  // Renomeei o 'init' original para 'setupObservers'
  setupObservers() {
    // Observador para atualizar preview de IO quando a view for aberta
    new MutationObserver(() => {
      if (
        Utils.$('#view-io') &&
        Utils.$('#view-io').style.display !== 'none'
      ) {
        this.uiManager.refreshIOPreview();
      }
    }).observe(Utils.$('#view-io'), {
      attributes: true,
      attributeFilter: ['style'],
    });
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new App(); // Isto agora dispara o 'initAsync'
});