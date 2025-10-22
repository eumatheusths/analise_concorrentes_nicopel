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
    {
      id: '3',
      name: 'BoxBe',
      location: 'São Paulo - SP',
      threat: 'alta',
      category: 'potes-copos',
      website: 'https://boxbe.com.br/',
      instagram: 'https://www.instagram.com/boxbeembalagens/',
      phone: '',
      cnpj: '',
      tags: 'copos,papel,e-commerce,marketing-digital',
      ticket: '',
      focus: 'Foco absoluto em copos de papel',
      analysis:
        'Ameaça forte para clientes que buscam especificamente por copos na internet, com marketing digital muito agressivo para captura de leads online.',
      builtIn: true,
      archived: false,
    },
    {
      id: '4',
      name: 'Brazil Copos',
      location: 'São Paulo - SP',
      threat: 'alta',
      category: 'potes-copos',
      website: 'https://brazilcopos.com.br/',
      instagram: 'https://www.instagram.com/brazilcopos/',
      phone: '',
      cnpj: '',
      tags: 'biodegradável,papel,sustentável,personalização',
      ticket: '',
      focus: 'Copos, potes e baldes de papel biodegradável',
      analysis:
        'Focados em produtos de papel biodegradável e personalização, são concorrentes diretos no nicho de potes e copos, com forte apelo à sustentabilidade.',
      builtIn: true,
      archived: false,
    },
    {
      id: '5',
      name: 'Natucopos',
      location: 'Brasil',
      threat: 'alta',
      category: 'potes-copos',
      website: 'https://natucopos.com.br/',
      instagram: 'https://www.instagram.com/natucopos/',
      phone: '',
      cnpj: '',
      tags: 'delivery,tampas,papel,embalagens',
      ticket: '',
      focus: 'Potes, copos e tampas para delivery',
      analysis:
        'Forte presença no segmento de delivery com um portfólio completo de embalagens de papel, incluindo tampas, o que pode ser um diferencial para clientes de food service.',
      builtIn: true,
      archived: false,
    },
    {
      id: '6',
      name: 'Apolo Embalagens',
      location: 'Maringá - PR',
      threat: 'alta',
      category: 'potes-copos',
      website: 'https://www.apoloembalagens.com.br/',
      instagram: 'https://www.instagram.com/apoloembalagens/',
      phone: '',
      cnpj: '',
      tags: 'premium,copos,potes,regional',
      ticket: '',
      focus: 'Potes premium, potes e copos de papel',
      analysis:
        'Concorrente regional importante (Maringá-PR). O foco em potes premium pode ser um diferencial a ser observado, visando um mercado de maior valor agregado.',
      builtIn: true,
      archived: false,
    },
    {
      id: '7',
      name: 'MX Copos & Potes',
      location: 'Brasil',
      threat: 'alta',
      category: 'potes-copos',
      website: 'https://www.mxcopos.com.br/',
      instagram: 'https://www.instagram.com/mxcoposepotes/',
      phone: '',
      cnpj: '',
      tags: 'biodegradável,fabricante,direto',
      ticket: '',
      focus: 'Fabricante de Copos e Potes Biodegradáveis',
      analysis:
        'Concorrente direto e forte, pois são fabricantes de potes e copos biodegradáveis. O foco total neste segmento os torna uma ameaça alta e relevante.',
      builtIn: true,
      archived: false,
    },
    {
      id: '8',
      name: 'Pixpel',
      location: 'Itupeva - SP',
      threat: 'alta',
      category: 'potes-copos',
      website: 'https://www.pixpel.com.br/',
      instagram: 'https://www.instagram.com/pixpel/',
      phone: '',
      cnpj: '',
      tags: 'sustentável,personalização,midia',
      ticket: '',
      focus: 'Embalagens sustentáveis, potes e copos',
      analysis:
        'Posicionam a embalagem como sua melhor mídia. Foco forte em personalização e sustentabilidade, concorrendo diretamente no segmento de potes e copos de papel.',
      builtIn: true,
      archived: false,
    },
    {
      id: '9',
      name: 'Nazapack',
      location: 'Jaraguá do Sul - SC',
      threat: 'media',
      category: 'caixas-sorvete',
      website: 'https://nazapack.com.br/',
      instagram: 'https://www.instagram.com/nazapack/?hl=en',
      phone: '',
      cnpj: '',
      tags: 'design,papel-cartão,visual,e-commerce',
      ticket: '',
      focus: 'Caixas de papel-cartão com foco em design',
      analysis:
        'Competem forte em projetos que exigem alto apelo visual. Ameaça para clientes que veem a embalagem como principal ferramenta de marketing no ponto de venda.',
      builtIn: true,
      archived: false,
    },
    {
      id: '10',
      name: 'Papello Embalagens',
      location: 'Caxias do Sul - RS',
      threat: 'media',
      category: 'potes-copos',
      website: 'https://www.papello.com.br/',
      instagram: 'https://www.instagram.com/papelloembalagens/',
      phone: '',
      cnpj: '',
      tags: 'copos,potes,baldes,regional',
      ticket: '',
      focus: 'Copos, potes e baldes de papel',
      analysis:
        'Competem diretamente na linha de produtos. A distância pode ser um fator que a Nicopel pode explorar, oferecendo fretes mais competitivos e prazos de entrega menores.',
      builtIn: true,
      archived: false,
    },
    {
      id: '11',
      name: 'Gráfica Tambosi',
      location: 'Blumenau - SC',
      threat: 'media',
      category: 'caixas-sorvete',
      website: 'https://graficatambosi.com.br/embalagens',
      instagram: 'https://www.instagram.com/graficatambosi/',
      phone: '',
      cnpj: '',
      tags: 'gráfica,industrial,volumes,e-commerce',
      ticket: '',
      focus: 'Gráfica industrial para grandes volumes',
      analysis:
        'Ameaça para grandes volumes devido à alta capacidade produtiva, podendo oferecer preços competitivos. Menos ágil para pedidos menores e nichados.',
      builtIn: true,
      archived: false,
    },
    {
      id: '12',
      name: 'Biopapers',
      location: 'Brasil',
      threat: 'media',
      category: 'potes-copos',
      website: 'https://biopapers.com.br/',
      instagram: 'https://www.instagram.com/biopapers/',
      phone: '',
      cnpj: '',
      tags: 'biodegradável,reciclável,sustentável',
      ticket: '',
      focus: 'Copos e potes biodegradáveis',
      analysis:
        'Posicionamento forte em sustentabilidade com produtos biodegradáveis e recicláveis. Apelo para clientes com foco em marketing verde e consciência ambiental.',
      builtIn: true,
      archived: false,
    },
    {
      id: '13',
      name: 'Castagna',
      location: 'Brasil',
      threat: 'media',
      category: 'potes-copos',
      website: 'https://www.castagna.com.br/',
      instagram: 'https://www.instagram.com/castagnaembalagens/',
      phone: '',
      cnpj: '',
      tags: 'térmico,sorvete,açaí,especializado',
      ticket: '',
      focus: 'Copos de papel e potes térmicos',
      analysis:
        'O foco em potes térmicos os torna um concorrente direto para o mercado de sorvetes e açaí, oferecendo uma solução especializada para produtos que exigem isolamento térmico.',
      builtIn: true,
      archived: false,
    },
    {
      id: '14',
      name: 'BelloCopo',
      location: 'Brasil',
      threat: 'media',
      category: 'potes-copos',
      website: 'https://www.bellocopo.com.br/',
      instagram: 'https://www.instagram.com/bellocopo/',
      phone: '',
      cnpj: '',
      tags: 'plástico,papel,descartáveis,escala',
      ticket: '',
      focus: 'Descartáveis de papel e plástico',
      analysis:
        'Atuam tanto em papel quanto em plástico, o que pode diluir o foco, mas possuem grande escala de produção, podendo ser competitivos em preço para grandes volumes.',
      builtIn: true,
      archived: false,
    },
    {
      id: '15',
      name: 'MultiCaixasNet',
      location: 'Atibaia - SP',
      threat: 'media',
      category: 'embalagens-industriais',
      website: 'https://www.multicaixasnet.com.br/',
      instagram: 'https://www.instagram.com/multicaixasnet/',
      phone: '',
      cnpj: '',
      tags: 'e-commerce,variedade,food-service,delivery',
      ticket: '',
      focus: 'Maior e-commerce de embalagens do Brasil',
      analysis:
        'Grande variedade de produtos para food service e delivery. Competem em escala e variedade, sendo uma ameaça para clientes que buscam uma solução única para diversas necessidades.',
      builtIn: true,
      archived: false,
    },
    {
      id: '16',
      name: 'Perpacks',
      location: 'Brasil',
      threat: 'media',
      category: 'embalagens-industriais',
      website: 'https://www.perpacks.com.br/',
      instagram: 'https://www.instagram.com/perpacks/',
      phone: '',
      cnpj: '',
      tags: 'delivery,food-service,personalização,fabricante',
      ticket: '',
      focus: 'Embalagens para comida, caixas e delivery',
      analysis:
        'Foco em embalagens para delivery e food service em geral. Oferecem personalização e se posicionam como fabricantes, o que pode indicar preços competitivos.',
      builtIn: true,
      archived: false,
    },
    {
      id: '17',
      name: 'Copack',
      location: 'Centro-Oeste',
      threat: 'media',
      category: 'potes-copos',
      website: 'https://embalagens.copack.com.br/',
      instagram: 'https://www.instagram.com/copackembalagens/',
      phone: '',
      cnpj: '',
      tags: 'personalizado,biodegradável,regional,centro-oeste',
      ticket: '',
      focus: 'Embalagens personalizadas e biodegradáveis de papel',
      analysis:
        'Com visão de ser referência no Centro-Oeste, oferecem uma gama completa de embalagens de papel (copos, potes, bandejas). Concorrente regional importante.',
      builtIn: true,
      archived: false,
    },
    {
      id: '18',
      name: 'Ecofoodpack',
      location: 'Brasil',
      threat: 'media',
      category: 'potes-copos',
      website: 'https://www.ecofoodpack.com.br/',
      instagram: 'https://www.instagram.com/ecofoodpack/',
      phone: '',
      cnpj: '',
      tags: 'kraft,rústico,sustentável,delivery',
      ticket: '',
      focus: 'Embalagens para alimentos, linha Kraft',
      analysis:
        'Foco em embalagens para alimentos com destaque para a linha Kraft. Apelo visual rústico e sustentável. Competem em potes, copos e embalagens para delivery.',
      builtIn: true,
      archived: false,
    },
    {
      id: '19',
      name: 'DCX Embalagens',
      location: 'São Paulo - SP',
      threat: 'baixa',
      category: 'caixas-pizza',
      website: 'https://www.dcxembalagens.com.br/',
      instagram: 'https://www.instagram.com/dcxembalagens/',
      phone: '',
      cnpj: '',
      tags: 'papelão,transporte,delivery,e-commerce',
      ticket: '',
      focus: 'Caixas de papelão para e-commerce e delivery',
      analysis:
        'Competem no segmento de caixas de papelão para transporte e delivery. Ameaça indireta ao core business, mas direta para caixas de pizza mais simples.',
      builtIn: true,
      archived: false,
    },
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
    this.init();
  }

  init() {
    this.data = this.loadData();
    this.updateDates();
    console.log('Dados carregados:', this.data.length, 'concorrentes');
  }

  // ATUALIZADO: Lógica de migração para novos campos
  loadData() {
    try {
      const existing = localStorage.getItem(CONFIG.STORAGE_KEY);
      let dataToLoad = CONFIG.INITIAL_DATA; // Default

      if (existing) {
        dataToLoad = JSON.parse(existing);
      } else {
        console.log('Criando dados iniciais...');
      }

      // --- Lógica de Migração ---
      let needsSave = !existing; // Salva se forem dados novos
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
        console.log('Migrando dados para novo formato...');
        this.saveData(dataToLoad);
      }
      return dataToLoad;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Em caso de erro, reverte para dados iniciais limpos
      const cleanInitial = CONFIG.INITIAL_DATA;
      cleanInitial.forEach((competitor) => {
        competitor.ecommerce = false;
        competitor.metaAdsUrl = '';
        competitor.googleAdsUrl = '';
      });
      this.saveData(cleanInitial);
      return cleanInitial;
    }
  }

  saveData(data) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      Utils.showNotification(
        'Erro ao salvar dados no armazenamento local',
        'error'
      );
    }
  }

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
      const adButton = e.target.closest('.btn-ad');

      if (adButton) {
        // Se clicou no botão de anúncio, não faz nada (deixa o link funcionar)
        return;
      }

      if (card) {
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

  // ATUALIZADO: Adiciona card-footer com botões de anúncios
  cardHTML(competitor) {
    const preview = (competitor.analysis || competitor.focus || '').trim();
    const truncatedPreview =
      preview && preview.length > 140
        ? preview.slice(0, 140) + '...'
        : preview;

    // NOVO: Gera links de anúncios
    let adLinks = '';
    if (competitor.metaAdsUrl) {
      adLinks += `<a href="${competitor.metaAdsUrl}" target="_blank" rel="noopener" class="btn-ad" onclick="event.stopPropagation()">
            Meta Ads
        </a>`;
    }
    if (competitor.googleAdsUrl) {
      adLinks += `<a href="${competitor.googleAdsUrl}" target="_blank" rel="noopener" class="btn-ad" onclick="event.stopPropagation()">
            Google Ads
        </a>`;
    }

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
                ${
                  adLinks
                    ? `<footer class="card-footer">${adLinks}</footer>`
                    : ''
                }
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
  // ATUALIZADO: Adiciona botões de anúncios também no modal
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
    // NOVO: Adiciona botões de anúncios no modal
    if (competitor.metaAdsUrl) {
      actions += `<a href="${competitor.metaAdsUrl}" target="_blank" rel="noopener" class="btn">
            Meta Ads
        </a>`;
    }
    if (competitor.googleAdsUrl) {
      actions += `<a href="${competitor.googleAdsUrl}" target="_blank" rel="noopener" class="btn">
            Google Ads
        </a>`;
    }

    const modalActions = Utils.$('#modal-actions');
    if (modalActions) {
      modalActions.innerHTML =
        actions ||
        '<span style="color:var(--text-muted)">Sem links cadastrados</span>';
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
  // ATUALIZADO: Coleta novos campos do formulário de adição
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

  // ATUALIZADO: Salva novos campos do formulário de edição
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
  new App();
});
