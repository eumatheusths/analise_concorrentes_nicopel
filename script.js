document.addEventListener('DOMContentLoaded', () => {
  // ====== Sidebar / navegação de views ======
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const appNav = document.getElementById('app-nav');

  function setView(view) {
    document.querySelectorAll('[data-view]').forEach(btn => btn.classList.remove('active'));
    const btn = appNav.querySelector(`[data-view="${view}"]`);
    if (btn) btn.classList.add('active');

    document.getElementById('view-dashboard').style.display = (view === 'dashboard' ? '' : 'none');
    document.getElementById('view-add').style.display = (view === 'add' ? '' : 'none');

    // Fechar drawer no mobile
    sidebar.classList.remove('open');
    content.classList.remove('dim');
  }

  appNav.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-view]');
    if (!btn) return;
    setView(btn.dataset.view);
  });

  sidebarToggle.addEventListener('click', () => {
    const open = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open);
    content.classList.toggle('dim', open);
  });

  // ====== Datas ======
  const today = new Date();
  const fmt = today.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  document.getElementById('last-updated').textContent = fmt;
  document.getElementById('last-updated-side').textContent = fmt;

  // ====== Filtros (categoria + ameaça) ======
  const categoryNav = document.getElementById('category-nav');
  const threatNav = document.getElementById('threat-nav');

  let activeCategory = 'todos';
  let activeThreat = 'todos';

  function filterCompetitors() {
    // NodeList dinâmico para incluir cards adicionados depois
    const cards = document.querySelectorAll('.competitor-card');
    cards.forEach(card => {
      const cardCategory = card.dataset.category || '';
      const cardThreat = card.dataset.threat || '';

      const categoryMatch = (activeCategory === 'todos' || cardCategory.split(' ').includes(activeCategory));

      let threatMatch = false;
      if (activeThreat === 'todos') {
        threatMatch = true;
      } else if (activeThreat === 'direto') {
        threatMatch = (cardThreat === 'alta');
      } else if (activeThreat === 'indireto') {
        threatMatch = (cardThreat === 'media' || cardThreat === 'baixa');
      }

      card.classList.toggle('hidden', !(categoryMatch && threatMatch));
    });
  }

  categoryNav.addEventListener('click', (event) => {
    const btn = event.target.closest('.tab-btn');
    if (!btn) return;
    categoryNav.querySelector('.active').classList.remove('active');
    btn.classList.add('active');
    activeCategory = btn.dataset.category;
    filterCompetitors();
  });

  threatNav.addEventListener('click', (event) => {
    const btn = event.target.closest('.tab-btn');
    if (!btn) return;
    threatNav.querySelector('.active').classList.remove('active');
    btn.classList.add('active');
    activeThreat = btn.dataset.threat;
    filterCompetitors();
  });

  // ====== Modal de detalhes ======
  const grid = document.getElementById('competitors-grid');
  const modal = document.getElementById('competitor-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalHeaderContent = document.getElementById('modal-header-content');
  const modalLocation = document.getElementById('modal-location');
  const modalFocus = document.getElementById('modal-focus');
  const modalAnalysis = document.getElementById('modal-analysis');
  const modalActions = document.getElementById('modal-actions');
  let firstFocusableEl = null;
  let lastFocusableEl = null;

  const openModal = (card) => {
    const name = card.dataset.name || '';
    const location = card.dataset.location || '';
    const focus = card.dataset.focus || '';
    const analysis = card.dataset.analysis || '';
    const website = card.dataset.website || '';
    const instagram = card.dataset.instagram || '';
    const threatEl = card.querySelector('.threat-level');
    const threatHTML = threatEl ? threatEl.outerHTML : '';
    modalHeaderContent.innerHTML = `${threatHTML}<h3 style="margin:0">${name}</h3>`;
    modalLocation.innerHTML = `<svg><use href="#icon-location"/></svg><span>${location}</span>`;
    modalFocus.innerHTML = `<svg><use href="#icon-focus"/></svg><span>${focus || '—'}</span>`;
    modalAnalysis.textContent = analysis || '—';
    let actions = '';
    if (website) actions += `<a href="${website}" target="_blank" rel="noopener" class="action-btn btn-website"><svg><use href="#icon-website"/></svg>Website</a>`;
    if (instagram) actions += `<a href="${instagram}" target="_blank" rel="noopener" class="action-btn btn-instagram"><svg><use href="#icon-instagram"/></svg>Instagram</a>`;
    modalActions.innerHTML = actions || '<span style="color:#6c757d">Sem links cadastrados</span>';

    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    const focusableEls = modal.querySelectorAll('a[href]:not([disabled]), button:not([disabled])');
    firstFocusableEl = focusableEls[0];
    lastFocusableEl = focusableEls[focusableEls.length - 1] || modalCloseBtn;
    (firstFocusableEl || modalCloseBtn).focus();
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  };

  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.competitor-card');
    if (card) openModal(card);
  });
  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e)=>{ 
    if(e.key==='Escape' && modal.classList.contains('active')) closeModal();
    if (e.key === 'Tab' && modal.classList.contains('active')) {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableEl) {
          lastFocusableEl.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableEl) {
          firstFocusableEl.focus();
          e.preventDefault();
        }
      }
    }
  });

  // ====== Persistência de concorrentes criados (localStorage) ======
  const STORAGE_KEY = 'nicopel_concorrentes_custom_v1';

  function readStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
  function writeStored(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function threatClass(level) {
    if (level === 'alta') return 'threat-high';
    if (level === 'media') return 'threat-medium';
    return 'threat-low';
  }

  function createCardFromData(d) {
    const article = document.createElement('article');
    article.className = 'competitor-card';
    article.dataset.category = d.category || '';
    article.dataset.threat = d.threat || '';
    article.dataset.name = d.name || '';
    article.dataset.location = d.location || '';
    article.dataset.focus = d.focus || '';
    article.dataset.analysis = d.analysis || '';
    article.dataset.website = d.website || '';
    article.dataset.instagram = d.instagram || '';

    article.innerHTML = `
      <div class="card-header">
        <span class="threat-level ${threatClass(d.threat)}"></span>
        <h3>${d.name}</h3>
      </div>
      <div class="card-body">
        <div class="info-item"><svg><use href="#icon-location"/></svg><span>${d.location}</span></div>
        <p class="card-analysis-preview">${(d.analysis || d.focus || '').slice(0,140)}${(d.analysis || d.focus || '').length>140?'...':''}</p>
      </div>
    `;
    return article;
  }

  function renderStored() {
    const list = readStored();
    list.forEach(d => grid.appendChild(createCardFromData(d)));
    filterCompetitors(); // respeitar filtros atuais
  }

  // Inicializa itens salvos
  renderStored();

  // ====== Form de Adição ======
  const form = document.getElementById('add-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('f-name').value.trim(),
      location: document.getElementById('f-city').value.trim(),
      threat: document.getElementById('f-threat').value,
      category: document.getElementById('f-category').value,
      website: document.getElementById('f-website').value.trim(),
      instagram: document.getElementById('f-instagram').value.trim(),
      focus: document.getElementById('f-focus').value.trim(),
      analysis: document.getElementById('f-analysis').value.trim()
    };

    if (!data.name || !data.location || !data.threat || !data.category) {
      alert('Preencha Nome, Cidade/UF, Nível de Ameaça e Categoria.');
      return;
    }

    const stored = readStored();
    stored.push(data);
    writeStored(stored);

    // Adiciona no grid visual
    grid.prepend(createCardFromData(data));
    filterCompetitors();

    // Feedback + limpar
    form.reset();
    alert('Concorrente adicionado com sucesso!');
    setView('dashboard');
  });
});
