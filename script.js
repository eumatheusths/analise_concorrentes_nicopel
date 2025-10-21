document.addEventListener('DOMContentLoaded', () => {
  /* ===== Helpers ===== */
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
  const uid = () => Math.random().toString(36).slice(2, 10);

  /* ===== Layout / Views ===== */
  const sidebar = $('#sidebar');
  const content = $('#content');
  const sidebarToggle = $('#sidebarToggle');
  const appNav = $('#app-nav');
  const views = {
    dashboard: $('#view-dashboard'),
    add: $('#view-add'),
    edit: $('#view-edit'),
    io: $('#view-io'),
    report: $('#view-report'),
  };
  function setView(view) {
    $$('#app-nav [data-view]').forEach(b=>b.classList.remove('active'));
    const btn = $(`#app-nav [data-view="${view}"]`);
    if (btn) btn.classList.add('active');
    Object.entries(views).forEach(([k,sec]) => sec.style.display = (k===view?'':'none'));
    sidebar.classList.remove('open'); content.classList.remove('dim');
    if (view==='edit') renderEditTable();
    if (view==='report') refreshReport();
  }
  appNav.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-view]'); if(!b) return;
    setView(b.dataset.view);
  });
  sidebarToggle.addEventListener('click', () => {
    const open = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open);
    content.classList.toggle('dim', open);
  });

  /* ===== Datas ===== */
  const today = new Date();
  const fmt = today.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  $('#last-updated-side').textContent = fmt;
  $('#last-updated').textContent = fmt;

  /* ===== Storage Model ===== */
  const STORAGE_KEY = 'nicopel_concorrentes_v3';

  /** shape:
   * { id, name, location, threat, category, website, instagram,
   *   phone, cnpj, tags, ticket, focus, analysis, builtIn:boolean, archived:boolean }
   */
  const THREAT_ORDER = { alta: 0, media: 1, baixa: 2 };

  function readStore(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw): null; }catch{ return null; }
  }
  function writeStore(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); refreshPreview(); }
  function normalizeInstagram(url){
    if (!url) return '';
    try{
      // aceita @handle e links variados
      if (url.startsWith('@')) return `https://www.instagram.com/${url.replace('@','').trim()}/`;
      let u = new URL(url.replace('http://','https://'));
      if (!/instagram\.com$/i.test(u.hostname) && !/instagram\.com$/i.test(u.hostname.replace('www.',''))) return url;
      const parts = u.pathname.split('/').filter(Boolean);
      const handle = parts[0] || '';
      if (!handle) return '';
      return `https://www.instagram.com/${handle}/`;
    }catch{ return url; }
  }
  function normalizeLocation(v){
    if (!v) return '';
    let s = v.replace(/\s+/g,' ').trim();
    // se tiver UF no final, padroniza "Cidade - UF"
    const m = s.match(/(.+)[\s-–—]+([A-Za-z]{2})$/);
    if (m) {
      const cidade = m[1].trim().replace(/\s+-\s+$/,'');
      const uf = m[2].toUpperCase();
      return `${cidade} - ${uf}`;
    }
    // mantém "Brasil" ou regiões livres
    return s;
  }

  function migrateIfNeeded() {
    let data = readStore();
    if (data) return data;

    // Se não existe v3, tenta migrar de cards do HTML inicial (se houver) — primeira execução
    const seedCards = $$('#competitors-grid .competitor-card');
    let seed = [];
    if (seedCards.length) {
      seed = seedCards.map(card => ({
        id: uid(),
        name: card.dataset.name || '',
        location: normalizeLocation(card.dataset.location || ''),
        threat: card.dataset.threat || 'media',
        category: (card.dataset.category || '').trim(),
        website: card.dataset.website || '',
        instagram: normalizeInstagram(card.dataset.instagram || ''),
        phone: '', cnpj: '', tags: '', ticket: '',
        focus: card.dataset.focus || '',
        analysis: card.dataset.analysis || '',
        builtIn: true, archived: false,
      }));
    }
    // salva
    writeStore(seed);
    return seed;
  }
  let DATA = migrateIfNeeded();

  /* ===== Dashboard: filtros / busca / ordenação / tags ===== */
  const grid = $('#competitors-grid');
  const categoryNav = $('#category-nav');
  const threatNav = $('#threat-nav');
  const searchInput = $('#search-input');
  const sortSelect = $('#sort-select');
  const tagChipbar = $('#tag-chipbar');

  let activeCategory = 'todos';
  let activeThreat = 'todos';
  let searchTerm = '';
  let sortMode = 'az';
  let activeTag = null;

  function threatClass(level){ return level==='alta'?'threat-high': level==='media'?'threat-medium':'threat-low'; }
  function cardHTML(d){
    const preview = (d.analysis || d.focus || '').trim();
    const prev = preview? (preview.length>140? preview.slice(0,140)+'...': preview): '';
    return `
      <article class="competitor-card" data-id="${d.id}" data-category="${d.category}" data-threat="${d.threat}">
        <div class="card-header"><span class="threat-level ${threatClass(d.threat)}"></span><h3>${d.name}</h3></div>
        <div class="card-body">
          <div class="info-item"><svg><use href="#icon-location"/></svg><span>${d.location||'—'}</span></div>
          ${prev? `<p class="card-analysis-preview">${prev}</p>`:''}
        </div>
      </article>
    `;
  }
  function renderGrid(list){ grid.innerHTML = list.filter(d=>!d.archived).map(cardHTML).join(''); }

  function applyFilters(){
    let list = DATA.slice();
    if (activeCategory!=='todos') list = list.filter(d => (d.category || '').split(' ').includes(activeCategory));
    if (activeThreat==='direto') list = list.filter(d => d.threat==='alta');
    else if (activeThreat==='indireto') list = list.filter(d => d.threat==='media'||d.threat==='baixa');
    if (activeTag) list = list.filter(d => (d.tags||'').toLowerCase().split(',').map(x=>x.trim()).includes(activeTag));

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(d =>
        (d.name||'').toLowerCase().includes(q) ||
        (d.location||'').toLowerCase().includes(q) ||
        (d.tags||'').toLowerCase().includes(q)
      );
    }
    if (sortMode==='az') list.sort((a,b)=>a.name.localeCompare(b.name));
    else if (sortMode==='za') list.sort((a,b)=>b.name.localeCompare(a.name));
    else if (sortMode==='cidade') list.sort((a,b)=>(a.location||'').localeCompare(b.location||''));
    else if (sortMode==='ameaca') list.sort((a,b)=>(THREAT_ORDER[a.threat]??9)-(THREAT_ORDER[b.threat]??9));

    renderGrid(list);
    renderTagChips(DATA);
  }

  function renderTagChips(data){
    const tags = new Set();
    data.forEach(d => (d.tags||'').split(',').map(t=>t.trim()).filter(Boolean).forEach(t=>tags.add(t.toLowerCase())));
    const chips = Array.from(tags).sort().slice(0,40).map(t => `<span class="chip ${activeTag===t?'active':''}" data-tag="${t}">#${t}</span>`).join('');
    tagChipbar.innerHTML = chips;
  }
  tagChipbar.addEventListener('click', (e)=>{
    const chip = e.target.closest('.chip'); if(!chip) return;
    const t = chip.dataset.tag;
    activeTag = (activeTag===t? null : t);
    applyFilters();
  });

  categoryNav.addEventListener('click', (e)=>{
    const btn = e.target.closest('.tab-btn'); if(!btn) return;
    categoryNav.querySelector('.active').classList.remove('active');
    btn.classList.add('active'); activeCategory = btn.dataset.category; applyFilters();
  });
  threatNav.addEventListener('click', (e)=>{
    const btn = e.target.closest('.tab-btn'); if(!btn) return;
    threatNav.querySelector('.active').classList.remove('active');
    btn.classList.add('active'); activeThreat = btn.dataset.threat; applyFilters();
  });
  searchInput.addEventListener('input', (e)=>{ searchTerm = e.target.value; applyFilters(); });
  sortSelect.addEventListener('change', (e)=>{ sortMode = e.target.value; applyFilters(); });

  /* ===== Modal ===== */
  const modal = $('#competitor-modal');
  const modalCloseBtn = $('#modal-close-btn');
  const modalHeaderContent = $('#modal-header-content');
  const modalLocation = $('#modal-location');
  const modalFocus = $('#modal-focus');
  const modalAnalysis = $('#modal-analysis');
  const modalActions = $('#modal-actions');
  let firstFocusableEl = null; let lastFocusableEl = null;

  function openModalById(id){
    const d = DATA.find(x=>x.id===id); if(!d) return;
    const dot = `<span class="threat-level ${threatClass(d.threat)}"></span>`;
    modalHeaderContent.innerHTML = `${dot}<h3 style="margin:0">${d.name}</h3>`;
    modalLocation.innerHTML = `<svg><use href="#icon-location"/></svg><span>${d.location||'—'}</span>`;
    modalFocus.innerHTML = `<svg><use href="#icon-focus"/></svg><span>${d.focus||'—'}</span>`;
    modalAnalysis.textContent = d.analysis || '—';
    let actions = '';
    if (d.website) actions += `<a href="${d.website}" target="_blank" rel="noopener" class="action-btn btn-website"><svg><use href="#icon-website"/></svg>Website</a>`;
    if (d.instagram) actions += `<a href="${d.instagram}" target="_blank" rel="noopener" class="action-btn btn-instagram"><svg><use href="#icon-instagram"/></svg>Instagram</a>`;
    modalActions.innerHTML = actions || '<span style="color:#6c757d">Sem links cadastrados</span>';

    modal.classList.add('active'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    const focusable = modal.querySelectorAll('a[href],button'); firstFocusableEl = focusable[0]; lastFocusableEl = focusable[focusable.length-1]||modalCloseBtn;
    (firstFocusableEl||modalCloseBtn).focus();
  }
  function closeModal(){ modal.classList.remove('active'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

  grid.addEventListener('click', (e)=>{ const card = e.target.closest('.competitor-card'); if(card){ openModalById(card.dataset.id); }});
  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape' && modal.classList.contains('active')) closeModal();
    if(e.key==='Tab' && modal.classList.contains('active')){
      if(e.shiftKey){ if(document.activeElement===firstFocusableEl){ lastFocusableEl.focus(); e.preventDefault(); } }
      else { if(document.activeElement===lastFocusableEl){ firstFocusableEl.focus(); e.preventDefault(); } }
    }
  });

  /* ===== Inicialização: render ===== */
  applyFilters();

  /* ===== Adicionar ===== */
  const addForm = $('#add-form');
  addForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = {
      id: uid(),
      name: $('#f-name').value.trim(),
      location: normalizeLocation($('#f-city').value.trim()),
      threat: $('#f-threat').value,
      category: $('#f-category').value,
      website: $('#f-website').value.trim(),
      instagram: normalizeInstagram($('#f-instagram').value.trim()),
      phone: $('#f-phone').value.trim(),
      cnpj: $('#f-cnpj').value.trim(),
      tags: $('#f-tags').value.trim(),
      ticket: $('#f-ticket').value.trim(),
      focus: $('#f-focus').value.trim(),
      analysis: $('#f-analysis').value.trim(),
      builtIn: false, archived: false,
    };
    if(!data.name || !data.location || !data.threat || !data.category){
      alert('Preencha Nome, Cidade/UF, Nível de Ameaça e Categoria.'); return;
    }
    DATA.unshift(data); writeStore(DATA); addForm.reset();
    alert('Concorrente adicionado com sucesso!'); setView('dashboard'); applyFilters();
  });

  /* ===== Editar / Excluir / Lote ===== */
  const editTableBody = $('#edit-table tbody');
  const editSearch = $('#edit-search');
  const editSort = $('#edit-sort');
  const btnBulkArchive = $('#bulk-archive');
  const btnBulkUnarchive = $('#bulk-unarchive');
  const btnBulkDelete = $('#bulk-delete');
  const btnSanitize = $('#btn-sanitize');

  function listForEdit(){
    let list = DATA.slice();
    const term = (editSearch.value||'').toLowerCase();
    if (term) list = list.filter(d =>
      (d.name||'').toLowerCase().includes(term) ||
      (d.location||'').toLowerCase().includes(term) ||
      (d.tags||'').toLowerCase().includes(term)
    );
    const mode = editSort.value;
    if (mode==='az') list.sort((a,b)=>a.name.localeCompare(b.name));
    else if (mode==='za') list.sort((a,b)=>b.name.localeCompare(a.name));
    else if (mode==='cidade') list.sort((a,b)=>(a.location||'').localeCompare(b.location||''));
    else if (mode==='ameaca') list.sort((a,b)=>(THREAT_ORDER[a.threat]??9)-(THREAT_ORDER[b.threat]??9));
    return list;
  }
  function renderEditTable(){
    const rows = listForEdit().map(d=>`
      <tr data-id="${d.id}">
        <td><input type="checkbox" class="row-check"/></td>
        <td>${d.name}</td>
        <td>${d.location||'—'}</td>
        <td>${d.threat}</td>
        <td>${d.category}</td>
        <td>${d.archived? 'Arquivado': (d.builtIn?'Original':'Custom')}</td>
        <td>
          <div class="table-actions">
            <button class="btn" data-action="load">Editar</button>
            <button class="btn" data-action="toggle-archive">${d.archived?'Desarquivar':'Arquivar'}</button>
            <button class="btn btn-danger" data-action="delete">Excluir</button>
          </div>
        </td>
      </tr>
    `).join('');
    editTableBody.innerHTML = rows || `<tr><td colspan="7" style="color:#6c757d">Nenhum item encontrado.</td></tr>`;
  }
  editSearch.addEventListener('input', renderEditTable);
  editSort.addEventListener('change', renderEditTable);

  // Form Edit
  const eForm = $('#edit-form');
  const eId = $('#e-id'); const eName = $('#e-name'); const eCity = $('#e-city');
  const eThreat = $('#e-threat'); const eCategory = $('#e-category');
  const eWebsite =
