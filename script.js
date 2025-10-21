document.addEventListener('DOMContentLoaded', () => {
  /* ===== UTIL ===== */
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const nl = s => (s||'').trim();

  /* ===== Layout / Navegação ===== */
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
    if (view==='report') buildReport();
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
  $('#last-updated').textContent = fmt; $('#last-updated-side').textContent = fmt;

  /* ===== Data Model & Storage ===== */
  const STORAGE_KEY = 'nicopel_concorrentes_v3';

  /** shape:
   * { id, name, location, threat, category, website, instagram,
   *   phone, cnpj, tags, ticket, focus, analysis, builtIn:boolean, archived:boolean }
   */
  const THREAT_ORDER = { alta: 0, media: 1, baixa: 2 }; // ordenar por ameaça

  function readStore(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw): null; }catch{ return null; }
  }
  function writeStore(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

  // Correções conhecidas: instagram + cidade
  const KNOWN_PATCH = {
    'Soluplex Brasil': { instagram:'https://www.instagram.com/soluplex.brasil/', location:'Cajamar - SP' },
    'Soller Embalagens': { instagram:'https://www.instagram.com/sollerembalagens/', location:'Morro da Fumaça - SC' },
    'BoxBe': { instagram:'https://www.instagram.com/boxbeecoembalagens/' },
    'Nazapack': { instagram:'https://www.instagram.com/nazapack/', location:'São Paulo - SP' },
    'Gráfica Tambosi': { instagram:'https://www.instagram.com/tambosiindustriagrafica/', location:'Taió - SC' },
    'Biopapers': { instagram:'https://www.instagram.com/biopapersbrasil/' },
    'Castagna': { instagram:'https://www.instagram.com/castagna_comercio/', location:'Canoas - RS' },
    'BelloCopo': { instagram:'https://www.instagram.com/bellocopo/' },
    'MultiCaixasNet': { instagram:'https://www.instagram.com/multicaixasnet/', location:'Atibaia - SP' },
    'Perpacks': { instagram:'https://www.instagram.com/perpacksembalagens/' },
    'Pixpel': { instagram:'https://www.instagram.com/pixpel_sustentavel/', location:'Itupeva - SP' },
    'DCX Embalagens': { location:'Carapicuíba - SP' },
    'Altacoppo': { location:'Carapicuíba - SP' },
    'Brazil Copos': { instagram:'https://www.instagram.com/brazilcopos/' },
    'Natucopos': { instagram:'https://www.instagram.com/natucopos/' },
    'Apolo Embalagens': { instagram:'https://www.instagram.com/apoloembalagens/' },
    'MX Copos & Potes': { instagram:'https://www.instagram.com/mxcopos/' },
    'Copack': { instagram:'https://www.instagram.com/copackembalagens/' },
    'Ecofoodpack': { instagram:'https://www.instagram.com/ecofoodpack/' },
  };

  function migrateFromOldIfNeeded() {
    let data = readStore();
    if (data) return data;
    // tenta migrar da v2, se existir
    let v2 = null;
    try { v2 = JSON.parse(localStorage.getItem('nicopel_concorrentes_v2')||'null'); } catch {}
    if (Array.isArray(v2) && v2.length) {
      // aplica patch nos built-ins
      v2 = v2.map(o => {
        const fix = KNOWN_PATCH[o.name];
        if (o.builtIn && fix) {
          return { ...o,
            instagram: fix.instagram || o.instagram,
            location: fix.location || o.location
          };
        }
        return o;
      });
      writeStore(v2);
      return v2;
    }
    // Sem v2: migrar do HTML estático (primeiro carregamento)
    const seed = $$('#competitors-grid .competitor-card').map(card => {
      const name = nl(card.dataset.name);
      const fix = KNOWN_PATCH[name] || {};
      return {
        id: uid(),
        name,
        location: fix.location || nl(card.dataset.location),
        threat: nl(card.dataset.threat) || 'media',
        category: nl(card.dataset.category),
        website: nl(card.dataset.website),
        instagram: fix.instagram || nl(card.dataset.instagram),
        phone: '', cnpj: '', tags: '', ticket: '',
        focus: nl(card.dataset.focus),
        analysis: nl(card.dataset.analysis),
        builtIn: true, archived: false,
      };
    });
    writeStore(seed);
    return seed;
  }
  let DATA = migrateFromOldIfNeeded();

  /* ===== Render ===== */
  const grid = $('#competitors-grid');

  function threatClass(level){ return level==='alta'?'threat-high': level==='media'?'threat-medium':'threat-low'; }

  function tagsToChipsHTML(tags){
    const arr = (nl(tags).split(',').map(s=>nl(s)).filter(Boolean));
    if (!arr.length) return '';
    return `<div class="tag-chips">${arr.map(t=>`<span class="chip" data-chip="${t}">${t}</span>`).join('')}</div>`;
  }

  function cardHTML(d){
    const preview = (d.analysis || d.focus || '').trim();
    const prev = preview? (preview.length>140? preview.slice(0,140)+'...': preview): '';
    return `
      <article class="competitor-card" data-id="${d.id}" data-category="${d.category}" data-threat="${d.threat}">
        <div class="card-header"><span class="threat-level ${threatClass(d.threat)}"></span><h3>${d.name}</h3></div>
        <div class="card-body">
          <div class="info-item"><svg><use href="#icon-location"/></svg><span>${d.location||'—'}</span></div>
          ${prev? `<p class="card-analysis-preview">${prev}</p>`:''}
          ${tagsToChipsHTML(d.tags)}
        </div>
      </article>
    `;
  }

  function renderGrid(list){
    grid.innerHTML = list.filter(d=>!d.archived).map(cardHTML).join('');
  }

  /* ===== Filtros / Busca / Ordenação (Dashboard) ===== */
  const categoryNav = $('#category-nav');
  const threatNav = $('#threat-nav');
  const searchInput = $('#search-input');
  const sortSelect = $('#sort-select');

  let activeCategory = 'todos';
  let activeThreat = 'todos';
  let searchTerm = '';
  let sortMode = 'az';
  let tagFilter = ''; // novo: filtro por tag

  function applyFilters(){
    let list = DATA.slice();
    // categoria
    if (activeCategory!=='todos') {
      list = list.filter(d => (d.category || '').split(' ').includes(activeCategory));
    }
    // ameaça ('direto' = alta; 'indireto' = media/baixa)
    if (activeThreat==='direto') list = list.filter(d => d.threat==='alta');
    else if (activeThreat==='indireto') list = list.filter(d => d.threat==='media'||d.threat==='baixa');
    // busca
    if (nl(searchTerm)) {
      const q = searchTerm.toLowerCase();
      list = list.filter(d =>
        (d.name||'').toLowerCase().includes(q) ||
        (d.location||'').toLowerCase().includes(q)
      );
    }
    // tag
    if (nl(tagFilter)) {
      const tg = tagFilter.toLowerCase();
      list = list.filter(d => (d.tags||'').toLowerCase().split(',').map(s=>nl(s)).includes(tg));
    }
    // ordenação
    if (sortMode==='az') list.sort((a,b)=>a.name.localeCompare(b.name));
    else if (sortMode==='za') list.sort((a,b)=>b.name.localeCompare(a.name));
    else if (sortMode==='cidade') list.sort((a,b)=>(a.location||'').localeCompare(b.location||''));
    else if (sortMode==='ameaca') list.sort((a,b)=>(THREAT_ORDER[a.threat]??9)-(THREAT_ORDER[b.threat]??9));

    renderGrid(list);
  }

  categoryNav.addEventListener('click', (e)=>{
    const btn = e.target.closest('.tab-btn'); if(!btn) return;
    categoryNav.querySelector('.active').classList.remove('active');
    btn.classList.add('active'); activeCategory = btn.dataset.category; tagFilter=''; applyFilters();
  });
  threatNav.addEventListener('click', (e)=>{
    const btn = e.target.closest('.tab-btn'); if(!btn) return;
    threatNav.querySelector('.active').classList.remove('active');
    btn.classList.add('active'); activeThreat = btn.dataset.threat; tagFilter=''; applyFilters();
  });
  searchInput.addEventListener('input', (e)=>{ searchTerm = e.target.value; applyFilters(); });
  sortSelect.addEventListener('change', (e)=>{ sortMode = e.target.value; applyFilters(); });

  // clique em chip (tags)
  grid.addEventListener('click', (e)=>{
    const chip = e.target.closest('.chip'); 
    if (chip){ tagFilter = chip.dataset.chip||''; applyFilters(); }
  });

  /* ===== Modal (detalhes) ===== */
  const modal = $('#competitor-modal');
  const modalCloseBtn = $('#modal-close-btn');
  const modalHeaderContent = $('#modal-header-content');
  const modalLocation = $('#modal-location');
  const modalFocus = $('#modal-focus');
  const modalAnalysis = $('#modal-analysis');
  const modalActions = $('#modal-actions');
  const modalTags = $('#modal-tags');
  let firstFocusableEl = null; let lastFocusableEl = null;

  function openModalById(id){
    const d = DATA.find(x=>x.id===id); if(!d) return;
    const dot = `<span class="threat-level ${threatClass(d.threat)}"></span>`;
    modalHeaderContent.innerHTML = `${dot}<h3 style="margin:0">${d.name}</h3>`;
    modalLocation.innerHTML = `<svg><use href="#icon-location"/></svg><span>${d.location||'—'}</span>`;
    modalFocus.innerHTML = `<svg><use href="#icon-focus"/></svg><span>${d.focus||'—'}</span>`;
    modalAnalysis.textContent = d.analysis || '—';
    modalTags.innerHTML = tagsToChipsHTML(d.tags);

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
  applyFilters(); // renderiza dashboard

  /* ===== Adicionar ===== */
  const addForm = $('#add-form');
  addForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = {
      id: uid(),
      name: nl($('#f-name').value),
      location: nl($('#f-city').value),
      threat: $('#f-threat').value,
      category: $('#f-category').value,
      website: nl($('#f-website').value),
      instagram: nl($('#f-instagram').value),
      phone: nl($('#f-phone').value),
      cnpj: nl($('#f-cnpj').value),
      tags: nl($('#f-tags').value),
      ticket: nl($('#f-ticket').value),
      focus: nl($('#f-focus').value),
      analysis: nl($('#f-analysis').value),
      builtIn: false, archived: false,
    };
    if(!data.name || !data.location || !data.threat || !data.category){
      alert('Preencha Nome, Cidade/UF, Nível de Ameaça e Categoria.'); return;
    }
    DATA.unshift(data); writeStore(DATA); addForm.reset();
    alert('Concorrente adicionado com sucesso!'); setView('dashboard'); applyFilters();
  });

  /* ===== Editar / Excluir ===== */
  const editTableBody = $('#edit-table tbody');
  const editSearch = $('#edit-search');
  const editSort = $('#edit-sort');
  const bulkAll = $('#bulk-all');
  const bulkArchive = $('#bulk-archive');
  const bulkUnarchive = $('#bulk-unarchive');
  const bulkDelete = $('#bulk-delete');

  function listForEdit(){
    let list = DATA.slice();
    const term = (editSearch.value||'').toLowerCase();
    if (term) list = list.filter(d => (d.name||'').toLowerCase().includes(term) || (d.location||'').toLowerCase().includes(term));
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
        <td><input type="checkbox" class="row-check" /></td>
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
    bulkAll.checked = false;
  }
  editSearch.addEventListener('input', renderEditTable);
  editSort.addEventListener('change', renderEditTable);

  // Form Edit
  const eForm = $('#edit-form');
  const eId = $('#e-id'); const eName = $('#e-name'); const eCity = $('#e-city');
  const eThreat = $('#e-threat'); const eCategory = $('#e-category');
  const eWebsite = $('#e-website'); const eInstagram = $('#e-instagram');
  const ePhone = $('#e-phone'); const eCnpj = $('#e-cnpj'); const eTags = $('#e-tags'); const eTicket = $('#e-ticket');
  const eFocus = $('#e-focus'); const eAnalysis = $('#e-analysis');
  const btnArchive = $('#e-archive'); const btnDelete = $('#e-delete');

  function loadIntoForm(id){
    const d = DATA.find(x=>x.id===id); if(!d) return;
    eId.value = d.id; eName.value = d.name; eCity.value = d.location||'';
    eThreat.value = d.threat; eCategory.value = d.category||'';
    eWebsite.value = d.website||''; eInstagram.value = d.instagram||'';
    ePhone.value = d.phone||''; eCnpj.value = d.cnpj||''; eTags.value = d.tags||'';
    eTicket.value = d.ticket||''; eFocus.value = d.focus||''; eAnalysis.value = d.analysis||'';
    btnArchive.textContent = d.archived? 'Desarquivar':'Arquivar';
    setView('edit');
  }

  editTableBody.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-action]'); if(!btn) return;
    const tr = e.target.closest('tr'); const id = tr.dataset.id;
    const action = btn.dataset.action;
    const idx = DATA.findIndex(x=>x.id===id);
    if (idx===-1) return;

    if (action==='load'){ loadIntoForm(id); }
    else if (action==='toggle-archive'){
      DATA[idx].archived = !DATA[idx].archived; writeStore(DATA); renderEditTable(); applyFilters();
    }
    else if (action==='delete'){
      if (!confirm('Tem certeza que deseja excluir definitivamente?')) return;
      DATA.splice(idx,1); writeStore(DATA); renderEditTable(); applyFilters();
      if (eId.value===id) eForm.reset();
    }
  });

  eForm.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const id = eId.value; if(!id) return;
    const idx = DATA.findIndex(x=>x.id===id); if(idx===-1) return;
    const d = DATA[idx];
    const updated = {
      ...d,
      name: nl(eName.value),
      location: nl(eCity.value),
      threat: eThreat.value,
      category: eCategory.value,
      website: nl(eWebsite.value),
      instagram: nl(eInstagram.value),
      phone: nl(ePhone.value),
      cnpj: nl(eCnpj.value),
      tags: nl(eTags.value),
      ticket: nl(eTicket.value),
      focus: nl(eFocus.value),
      analysis: nl(eAnalysis.value)
    };
    DATA[idx] = updated; writeStore(DATA);
    alert('Alterações salvas!');
    renderEditTable(); applyFilters();
  });

  btnArchive.addEventListener('click', ()=>{
    const id = eId.value; if(!id) return;
    const idx = DATA.findIndex(x=>x.id===id); if(idx===-1) return;
    DATA[idx].archived = !DATA[idx].archived; writeStore(DATA);
    btnArchive.textContent = DATA[idx].archived? 'Desarquivar':'Arquivar';
    renderEditTable(); applyFilters();
  });
  btnDelete.addEventListener('click', ()=>{
    const id = eId.value; if(!id) return;
    if (!confirm('Excluir definitivamente este concorrente?')) return;
    const idx = DATA.findIndex(x=>x.id===id); if(idx===-1) return;
    DATA.splice(idx,1); writeStore(DATA);
    eForm.reset();
    renderEditTable(); applyFilters();
  });

  // Ações em lote
  function selectedIds(){
    return $$('.row-check', editTableBody)
      .map((c,i)=> c.checked ? c.closest('tr').dataset.id : null)
      .filter(Boolean);
  }
  bulkAll.addEventListener('change', ()=>{
    $$('.row-check', editTableBody).forEach(ch => ch.checked = bulkAll.checked);
  });
  bulkArchive.addEventListener('click', ()=>{
    const ids = selectedIds(); if (!ids.length) return alert('Selecione ao menos um item.');
    DATA = DATA.map(d => ids.includes(d.id)? {...d, archived:true}: d); writeStore(DATA);
    renderEditTable(); applyFilters();
  });
  bulkUnarchive.addEventListener('click', ()=>{
    const ids = selectedIds(); if (!ids.length) return alert('Selecione ao menos um item.');
    DATA = DATA.map(d => ids.includes(d.id)? {...d, archived:false}: d); writeStore(DATA);
    renderEditTable(); applyFilters();
  });
  bulkDelete.addEventListener('click', ()=>{
    const ids = selectedIds(); if (!ids.length) return alert('Selecione ao menos um item.');
    if (!confirm(`Excluir ${ids.length} item(ns)?`)) return;
    DATA = DATA.filter(d => !ids.includes(d.id)); writeStore(DATA);
    renderEditTable(); applyFilters();
  });

  // Observa troca de tela para atualizar edição
  const obs = new MutationObserver(()=>{ if (views.edit.style.display!=='none') renderEditTable(); });
  obs.observe(views.edit, {attributes:true, attributeFilter:['style']});

  /* ===== Import / Export ===== */
  const ioPreview = $('#io-preview');
  const btnExport = $('#btn-export');
  const fileImport = $('#file-import');
  const btnImport = $('#btn-import');

  function refreshPreview(){ if (ioPreview) ioPreview.value = JSON.stringify(DATA, null, 2); }
  refreshPreview();

  btnExport?.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(DATA,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `concorrentes_nicopel_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  btnImport?.addEventListener('click', ()=>{
    const file = fileImport.files?.[0];
    if (!file) { alert('Selecione um arquivo JSON para importar.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error('Formato inválido');
        const cleaned = parsed.map(o=>({
          id: o.id || uid(),
          name: nl(o.name),
          location: nl(o.location),
          threat: o.threat||'media',
          category: nl(o.category),
          website: nl(o.website),
          instagram: nl(o.instagram),
          phone: nl(o.phone),
          cnpj: nl(o.cnpj),
          tags: nl(o.tags),
          ticket: nl(o.ticket),
          focus: nl(o.focus),
          analysis: nl(o.analysis),
          builtIn: !!o.builtIn,
          archived: !!o.archived
        }));
        DATA = cleaned; writeStore(DATA);
        alert('Importação concluída!');
        refreshPreview(); applyFilters(); renderEditTable();
      }catch(err){
        alert('Falha ao importar: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  });

  // Sincroniza preview quando abrir a tela de IO
  const sync = new MutationObserver(refreshPreview);
  sync.observe($('#view-io'), {attributes:true, attributeFilter:['style']});

  /* ===== Relatórios / Impressão ===== */
  const reportDate = $('#report-date');
  const reportTableBody = $('#report-table tbody');
  const reportCat = $('#report-cat');
  const reportThreat = $('#report-threat');
  const reportSort = $('#report-sort');
  const reportRefresh = $('#report-refresh');
  const reportPrint = $('#report-print');

  function filteredForReport(){
    let list = DATA.filter(d=>!d.archived);
    if (reportCat.value!=='todos') list = list.filter(d => (d.category||'').split(' ').includes(reportCat.value));
    if (reportThreat.value!=='todos') list = list.filter(d => d.threat===reportThreat.value);
    if (reportSort.value==='az') list.sort((a,b)=>a.name.localeCompare(b.name));
    else if (reportSort.value==='cidade') list.sort((a,b)=>(a.location||'').localeCompare(b.location||'')); 
    else if (reportSort.value==='ameaca') list.sort((a,b)=>(THREAT_ORDER[a.threat]??9)-(THREAT_ORDER[b.threat]??9));
    return list;
  }
  function buildReport(){
    if (reportDate) reportDate.textContent = new Date().toLocaleString('pt-BR');
    const rows = filteredForReport().map(d=>`
      <tr>
        <td>${d.name}</td>
        <td>${d.location||'—'}</td>
        <td>${d.threat}</td>
        <td>${d.category}</td>
        <td>${d.focus||'—'}</td>
        <td>${d.instagram? `<a href="${d.instagram}">Instagram</a>`:''} ${d.website? (d.instagram?' • ':'')+`<a href="${d.website}">Site</a>`:''}</td>
        <td>${nl(d.tags)}</td>
      </tr>
    `).join('');
    reportTableBody.innerHTML = rows || `<tr><td colspan="7" style="color:#6c757d">Sem resultados.</td></tr>`;
  }
  reportRefresh?.addEventListener('click', buildReport);
  reportCat?.addEventListener('change', buildReport);
  reportThreat?.addEventListener('change', buildReport);
  reportSort?.addEventListener('change', buildReport);
  reportPrint?.addEventListener('click', ()=> window.print());
});
