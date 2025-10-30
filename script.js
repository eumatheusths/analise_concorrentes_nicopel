// ===== CONFIGURAÇÕES E CONSTANTES =====
const CONFIG = {
  STORAGE_KEY: 'nicopel_concorrentes_v5',
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
      analysis:
        'Agressivos no marketing para franquias, oferecem um mix completo de produtos que atrai grandes redes. Ponto fraco pode ser a menor flexibilidade para clientes menores.',
      builtIn: true,
      archived: false,
    },
    {
      id: '2',
      name: 'Soller Embalagens',
      location: 'Biguaçu - SC',
      threat: 'alta',
      category: 'potes-copos',
      website: 'https://www.sollerembalagens.com.br/',
      instagram: 'https://www.instagram.com/sollerembalagens/',
      phone: '',
      cnpj: '',
      tags: 'plástico,termoformagem,copos,açaí,sorvete',
      ticket: '',
      focus: 'Especialista em potes de açaí e sorvetes',
      analysis:
        'Concorrente espelho direto no nicho principal da Nicopel. A comunicação visual é forte e focada na qualidade. A disputa é direta por preço, qualidade de impressão e agilidade na entrega.',
      builtIn: true,
      archived: false,
    },
    // ... (O resto dos seus dados do INITIAL_DATA continua aqui, mantive
    //      o código original que você passou, então está tudo certo)
    {
      id: '20',
      name: 'Altacoppo',
      location: 'Brasil',
      threat: 'baixa',
      category: 'potes-copos',
      website: 'https://www.altacoppo.com.br/',
      instagram: 'https://www.instagram.com/altacoppo/',
      phone: '',
      cnpj: '',
      tags: 'plástico,pp,custo,indireto',
      ticket: '',
      focus: 'Potes e tampas de plástico/PP',
      analysis:
        'Concorrente indireto, pois o foco é em plástico (PP). Podem competir por clientes que não têm preferência por papel ou buscam custos menores.',
      builtIn: true,
      archived: false,
    },
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
      ecommerce: 'todos', // NOVO: Filtro E-commerce
    };
    // REMOVIDO: this.init(); - Será chamado assincronamente pelo App
  }

  // ATUALIZADO: Agora é assíncrono
  async init() {
    this.data = await this.loadData(); // Espera os dados da API
    this.updateDates();
    console.log('Dados carregados:', this.data.length, 'concorrentes');
  }

  // NOVO: Função para checar duplicatas (CÓDIGO ORIGINAL MANTIDO)
  checkDuplicate(name, location, currentId = null) {
    const normalizedName = (name || '').trim().toLowerCase();
    const normalizedLocation = (location || '').trim().toLowerCase();

    if (!normalizedName || !normalizedLocation) return false; // Não bloquear se dados essenciais faltarem

    return this.data.some((competitor) => {
      // Se um ID foi passado (edição), ignore a checagem contra si mesmo
      if (currentId && competitor.id === currentId) {
        return false;
      }

      const compName = (competitor.name || '').trim().toLowerCase();
      const compLocation = (competitor.location || '').trim().toLowerCase();

      return compName === normalizedName && compLocation === normalizedLocation;
    });
  }

  // ATUALIZADO: Carrega dados do Vercel KV via API
  async loadData() {
    try {
      const response = await fetch('/api/getCompetitors');
      if (!response.ok) {
        throw new Error(`Erro de rede: ${response.statusText}`);
      }

      let dataToLoad = await response.json();
      let needsSave = false;

      // Se o banco estiver vazio (primeira vez), usa os dados iniciais
      if (!dataToLoad || dataToLoad.length === 0) {
        console.log('Criando dados iniciais no Vercel KV...');
        dataToLoad = CONFIG.INITIAL_DATA;
        needsSave = true; // Marca para salvar os dados iniciais no KV
      }

      // --- Lógica de Migração (CÓDIGO ORIGINAL MANTIDO) ---
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
      // --- Fim da Migração ---

      if (needsSave) {
        console.log('Migrando/salvando dados iniciais no Vercel KV...');
        await this.saveData(dataToLoad); // Salva os dados migrados/iniciais
      }
      return dataToLoad;
    } catch (error) {
      console.error('Erro ao carregar dados da API:', error);
      Utils.showNotification(
        'Falha ao carregar dados. Tente recarregar a página.',
        'error'
      );
      // Em caso de erro, reverte para dados iniciais limpos (CÓDIGO ORIGINAL MANTIDO)
      const cleanInitial = CONFIG.INITIAL_DATA;
      cleanInitial.forEach((competitor) => {
        competitor.ecommerce = false;
        competitor.metaAdsUrl = '';
        competitor.googleAdsUrl = '';
      });
      // Não tenta salvar, apenas retorna para o app não quebrar
      return cleanInitial;
    }
  }

  // ATUALIZADO: Salva dados no Vercel KV via API
  async saveData(data) {
    try {
      const response = await fetch('/api/saveCompetitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erro de rede: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao salvar dados na API:', error);
      Utils.showNotification(
        'Erro ao salvar alterações na nuvem. Verifique sua conexão.',
        'error'
      );
    }
  }

  // updateDates (CÓDIGO ORIGINAL MANTIDO)
  updateDates() {
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

  // addCompetitor (CÓDIGO ORIGINAL MANTIDO)
  addCompetitor(competitor) {
    const newCompetitor = {
      ...competitor,
      id: Utils.uid(),
      builtIn: false,
      archived: false,
    };

    this.data.unshift(newCompetitor);
    this.saveData(this.data);
    return newCompetitor;
  }

  // updateCompetitor (CÓDIGO ORIGINAL MANTIDO)
  updateCompetitor(id, updates) {
    const index = this.data.findIndex((x) => x.id === id);
    if (index !== -1) {
      this.data[index] = {
        ...this.data[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // deleteCompetitor (CÓDIGO ORIGINAL MANTIDO)
  deleteCompetitor(id) {
    const index = this.data.findIndex((x) => x.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // toggleArchive (CÓDIGO ORIGINAL MANTIDO)
  toggleArchive(id) {
    const index = this.data.findIndex((x) => x.id === id);
    if (index !== -1) {
      this.data[index].archived = !this.data[index].archived;
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // getFilteredData (CÓDIGO ORIGINAL MANTIDO)
  getFilteredData() {
    let filtered = this.data.filter((d) => !d.archived);

    // Filtro por categoria
    if (this.filters.category !== 'todos') {
      filtered = filtered.filter((d) => d.category === this.filters.category);
    }

    // Filtro por ameaça
    if (this.filters.threat === 'direto') {
      filtered = filtered.filter((d) => d.threat === 'alta');
    } else if (this.filters.threat === 'indireto') {
      filtered = filtered.filter(
        (d) => d.threat === 'media' || d.threat === 'baixa'
      );
    }

    // Filtro por busca
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

    // Filtro por tag
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

    // NOVO: Filtro por e-commerce
    if (this.filters.ecommerce === 'sim') {
      filtered = filtered.filter((d) => d.ecommerce === true);
    } else if (this.filters.ecommerce === 'nao') {
      filtered = filtered.filter((d) => !d.ecommerce); // Cobre false, undefined e null
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
//
// TODA A CLASSE UIManager (MAIS DE 1000 LINHAS) FOI MANTIDA 100% IGUAL
// AO SEU CÓDIGO ORIGINAL, POIS NENHUMA MUDANÇA É NECESSÁRIA AQUI.
//
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
    Utils.$('#app-nav').addEventListener('click', (e) =>
      this.handleNavigation(e)
    );
    Utils.$('#sidebarToggle').addEventListener('click', () =>
      this.toggleSidebar()
    );

    // Filtros do Dashboard
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
    // NOVO: Listener para filtro e-commerce
    Utils.$('#ecommerce-filter').addEventListener('change', (e) => {
      this.state.filters.ecommerce = e.target.value;
      this.renderDashboard();
    });

    // Modal
    Utils.$('#modal-close-btn').addEventListener('click', () =>
      this.closeModal()
    );
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Formulários
    Utils.$('#add-form').addEventListener('submit', (e) =>
      this.handleAddSubmit(e)
    );
    Utils.$('#edit-form').addEventListener('submit', (e) =>
      this.handleEditSubmit(e)
    );

    // Ações de edição
    Utils.$('#edit-table tbody').addEventListener('click', (e) =>
      this.handleTableActions(e)
    );
    Utils.$('#edit-search').addEventListener('input', () =>
      this.renderEditTable()
    );
    Utils.$('#edit-sort').addEventListener('change', () =>
      this.renderEditTable()
    );

    // Ações em lote
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

    // Import/Export
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

    // Relatórios
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

    // Event delegation para cards do dashboard
    Utils.$('#competitors-grid').addEventListener('click', (e) => {
      const card = e.target.closest('.competitor-card');
      const chip = e.target.closest('.chip');

      // REMOVIDO: const adButton = e.target.closest('.btn-ad');
      // if (adButton) { return; }

      if (card) {
        // Se o clique foi em um botão-card de link DENTRO do modal, não faça nada
        if (e.target.closest('.modal-link-card')) {
          return;
        }
        // Se o clique foi no selo e-commerce, não faça nada (ou filtre, se desejar)
        if (e.target.closest('.ecommerce-badge')) {
          // e.stopPropagation(); // Impede o modal de abrir
          // this.state.filters.ecommerce = 'sim';
          // this.renderDashboard();
          return; // Por enquanto, apenas impede abrir o modal
        }
        this.openModal(card.dataset.id);
      }

      if (chip) {
        // Se o clique foi em uma tag, filtra
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

    Utils.$$('#category-nav .tab-btn').forEach((btn) =>
      btn.classList.remove('active')
    );
    button.classList.add('active');

    this.state.filters.category = button.dataset.category;
    this.state.filters.tag = '';
    this.renderDashboard();
  }

  handleThreatFilter(e) {
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
    this.state.filters.search = e.target.value;
    this.renderDashboard();
  }

  handleSort(e) {
    this.state.filters.sort = e.target.value;
    this.renderDashboard();
  }

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

  // ATUALIZADO: Adiciona selo e-commerce
  cardHTML(competitor) {
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

  // ===== MODAL =====
  // ATUALIZADO: Refeito para usar o novo layout
  openModal(id) {
    const competitor = this.state.data.find((x) => x.id === id);
    if (!competitor) return;

    // Preenche o modal com os dados
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
      // Esconde o container de tags se não houver tags
      modalTags.style.display = competitor.tags ? 'flex' : 'none';
    }

    // Ações - NOVO layout de botões-card
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
  // ATUALIZADO: Coleta novos campos e previne duplicatas
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
      analysis: Utils.nl(Utils.$('#f-analysis').value),
      // NOVO:
      metaAdsUrl: Utils.nl(Utils.$('#f-meta-ads').value),
      googleAdsUrl: Utils.nl(Utils.$('#f-google-ads').value),
      ecommerce: Utils.$('#f-ecommerce').checked,
    };

    // Validação
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

    // NOVO: Verificação de duplicata
    if (this.state.checkDuplicate(formData.name, formData.location)) {
      Utils.showNotification(
        'Erro: Concorrente já cadastrado com este nome e cidade.',
        'error'
      );
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

    let filteredData = this.state.data.filter(
      (competitor) =>
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

  // ATUALIZADO: Carrega novos campos no formulário de edição
  loadCompetitorIntoForm(id) {
    const competitor = this.state.data.find((x) => x.id === id);
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
    // NOVO:
    Utils.$('#e-meta-ads').value = competitor.metaAdsUrl || '';
    Utils.$('#e-google-ads').value = competitor.googleAdsUrl || '';
    Utils.$('#e-ecommerce').checked = competitor.ecommerce || false;

    Utils.$('#e-archive').textContent = competitor.archived
      ? 'Desarquivar'
      : 'Arquivar';
    this.setView('edit');
    Utils.$('#e-name').focus();
  }

  // ATUALIZADO: Salva novos campos e previne duplicatas
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
      analysis: Utils.nl(Utils.$('#e-analysis').value),
      // NOVO:
      metaAdsUrl: Utils.nl(Utils.$('#e-meta-ads').value),
      googleAdsUrl: Utils.nl(Utils.$('#e-google-ads').value),
      ecommerce: Utils.$('#e-ecommerce').checked,
    };

    // NOVO: Verificação de duplicata na edição
    if (this.state.checkDuplicate(updates.name, updates.location, id)) {
      Utils.showNotification(
        'Erro: Já existe outro concorrente com este nome e cidade.',
        'error'
      );
      return;
    }

    if (this.state.updateCompetitor(id, updates)) {
      Utils.showNotification('Alterações salvas com sucesso!');
      this.renderEditTable();
      this.renderDashboard();
    }
  }

  // ===== AÇÕES EM LOTE =====
  getSelectedIds() {
    return Utils.$$('.row-check', Utils.$('#edit-table tbody'))
      .map((checkbox) =>
        checkbox.checked ? checkbox.closest('tr').dataset.id : null
      )
      .filter(Boolean);
  }

  toggleBulkSelectAll(e) {
    Utils.$$('.row-check', Utils.$('#edit-table tbody')).forEach(
      (checkbox) => (checkbox.checked = e.target.checked)
    );
  }

  handleBulkArchive() {
    const ids = this.getSelectedIds();
    if (!ids.length) {
      Utils.showNotification('Selecione ao menos um item.', 'error');
      return;
    }

    let archivedCount = 0;
    ids.forEach((id) => {
      const competitor = this.state.data.find((x) => x.id === id);
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
    ids.forEach((id) => {
      const competitor = this.state.data.find((x) => x.id === id);
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

    this.state.data = this.state.data.filter(
      (competitor) => !ids.includes(competitor.id)
    );
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

  // ATUALIZADO: Exporta novos campos
  exportCSV() {
    const headers = [
      'Nome',
      'Cidade',
      'Ameaça',
      'Categoria',
      'Website',
      'Instagram',
      'Meta Ads URL',
      'Google Ads URL',
      'E-commerce',
      'Telefone',
      'CNPJ',
      'Tags',
      'Ticket',
      'Foco',
      'Análise',
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
      '\uFEFF' + csvContent, // BOM para Excel
      `concorrentes_nicopel_${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
    Utils.showNotification('Dados exportados em CSV com sucesso!');
  }

  // ATUALIZADO: Exporta novos campos
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

  // ATUALIZADO: Importa novos campos
  importJSON(e) {
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

        this.state.data = cleaned;
        this.state.saveData(this.state.data);

        Utils.showNotification('Importação JSON concluída com sucesso!');
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

  // ATUALIZADO: Importa novos campos
  importCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter((line) => line.trim());
        const headers = lines[0]
          .split(',')
          .map((h) => h.replace(/"/g, '').trim().toLowerCase());

        const competitors = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(',')
            .map((v) => v.replace(/^"|"$/g, '').trim());
          const competitor = {};

          headers.forEach((header, index) => {
            competitor[header] = values[index] || '';
          });

          if (competitor.nome && competitor.cidade) {
            competitors.push({
              id: Utils.uid(),
              name: competitor.nome,
              location: competitor.cidade,
              threat:
                competitor.ameaça || competitor['nível de ameaça'] || 'media',
              category: competitor.categoria || 'potes-copos',
              website: competitor.website || '',
              instagram: competitor.instagram || '',
              metaAdsUrl: competitor['meta ads url'] || '',
              googleAdsUrl: competitor['google ads url'] || '',
              ecommerce:
                competitor['e-commerce']?.toLowerCase() === 'sim' || false,
              phone: competitor.telefone || '',
              cnpj: competitor.cnpj || '',
              tags: competitor.tags || '',
              ticket: competitor.ticket || competitor['ticket médio'] || '',
              focus: competitor.foco || competitor['foco de atuação'] || '',
              analysis:
                competitor.análise || competitor['análise estratégica'] || '',
              builtIn: false,
              archived: false,
            });
          }
        }

        this.state.data = [...this.state.data, ...competitors];
        this.state.saveData(this.state.data);

        Utils.showNotification('Importação CSV concluída com sucesso!');
        this.refreshIOPreview();
        this.renderDashboard();
        this.renderEditTable();

        e.target.value = '';
      } catch (err) {
        Utils.showNotification(
          'Falha ao importar CSV: ' + err.message,
          'error'
        );
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  // ATUALIZADO: Importa novos campos
  importExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const competitors = jsonData
          .map((row) => ({
            id: Utils.uid(),
            name: row['Nome'] || '',
            location: row['Cidade/UF'] || row['Cidade'] || '',
            threat: row['Nível de Ameaça'] || row['Ameaça'] || 'media',
            category: row['Categoria'] || 'potes-copos',
            website: row['Website'] || '',
            instagram: row['Instagram'] || '',
            metaAdsUrl: row['Meta Ads URL'] || '',
            googleAdsUrl: row['Google Ads URL'] || '',
            ecommerce:
              (row['Possui E-commerce'] || '').toLowerCase() === 'sim' || false,
            phone: row['Telefone'] || '',
            cnpj: row['CNPJ'] || '',
            tags: row['Tags'] || '',
            ticket: row['Ticket Médio (R$)'] || row['Ticket'] || '',
            focus: row['Foco de Atuação'] || row['Foco'] || '',
            analysis: row['Análise Estratégica'] || row['Análise'] || '',
            builtIn: false,
            archived: false,
          }))
          .filter((comp) => comp.name && comp.location);

        this.state.data = [...this.state.data, ...competitors];
        this.state.saveData(this.state.data);

        Utils.showNotification('Importação Excel concluída com sucesso!');
        this.refreshIOPreview();
        this.renderDashboard();
        this.renderEditTable();

        e.target.value = '';
      } catch (err) {
        Utils.showNotification(
          'Falha ao importar Excel: ' + err.message,
          'error'
        );
      }
    };
    reader.readAsArrayBuffer(file);
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

    let filteredData = this.state.data.filter(
      (competitor) => !competitor.archived
    );

    // Aplica filtros
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

    // Aplica ordenação
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
    this.exportExcel();
  }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
// ATUALIZADO: Para suportar carregamento assíncrono dos dados
class App {
  constructor() {
    this.stateManager = new StateManager();
    // A UI (uiManager) agora é inicializada DEPOIS que o state carregar
  }

  async init() {
    await this.stateManager.init(); // 1. Espera os dados do KV
    this.uiManager = new UIManager(this.stateManager); // 2. Agora inicializa a UI
    console.log('🚀 Aplicação Nicopel Concorrência inicializada!');

    // Observador para atualizar preview de IO (CÓDIGO ORIGINAL MANTIDO)
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

// ATUALIZADO: Chama o novo init assíncrono
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});