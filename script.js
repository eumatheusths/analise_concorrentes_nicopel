document.addEventListener('DOMContentLoaded', () => {
  /* ===== UTIL ===== */
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
  const uid = () => Math.random().toString(36).slice(2, 10);

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
  };
  function setView(view) {
    $$('#app-nav [data-view]').forEach(b=>b.classList.remove('active'));
    const btn = $(`#app-nav [data-view="${view}"]`);
    if (btn) btn.classList.add('active');
    Object.entries(views).forEach(([k,sec]) => sec.style.display = (k===view?'':'none'));
    sidebar.classList.remove('open'); content.classList.remove('dim');
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
  const STORAGE_KEY = 'nicopel_concorrentes_v2';

  /** shape:
   * { id, name, location, threat, category, website, instagram,
   *   phone, cnpj, tags, ticket, focus, analysis, builtIn:boolean, archived:boolean }
   */
  const THREAT_ORDER = { alta: 0, media: 1, baixa: 2 }; // para ordenar por ameaça

  function readStore(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw): null; }catch{ return null; }
  }
  function writeStore(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  function migrateIfNeeded() {
    let data = readStore();
    if (data) return data;
    // Sem v2: migrar do HTML original
    const seed = $$('#competitors-grid .competitor-card').map(card => ({
      id: uid(),
      name: card.dataset.name || '',
      location: card.dataset.location || '',
      threat: card.dataset.threat || 'media',
      category: (card.dataset.category || '').trim(),
      website: card.dataset.website || '',
      instagram: card.dataset.instagram || '',
      phone: '', cnpj: '', tags: '', ticket: '',
      focus: card.dataset.focus || '',
      analysis: card.dataset.analysis || '',
      builtIn: true, archived: false,
    }));
    writeStore(seed);
    return seed;
  }
  let DATA = migrateIfNeeded();

  /* ===== Render ===== */
  const grid = $('#competitors-grid');

  function threatClass(level){ return level==='alta'?'threat-high': level==='media'?'threat-medium':'threat-low'; }

  function cardHTML(d){
    const preview = (d.analysis || d.focus || '').trim();
    const prev = preview? (preview.length>140? preview.slice(0,140)+'...': preview): '';
    return `
      <article class="competitor-card" data-id="${d.id}" data-category="${d.category}" data-threat="${d.threat}">
        <div class="card-header"><span class="threat-level ${threatClass(d.threat)}"></span><h3>${d.name}</h3></div>
        <div class="card-body">
          <div class="info-item"><svg><use href="#icon-location"/></svg><span>${d.location}</span></div>
          ${prev? `<p class="card-analysis-preview">${prev}</p>`:''}
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
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(d =>
        (d.name||'').toLowerCase().includes(q) ||
        (d.location||'').toLowerCase().includes(q)
      );
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
    btn.classList.add('active'); activeCategory = btn.dataset.category; applyFilters();
  });
  threatNav.addEventListener('click', (e)=>{
    const btn = e.target.closest('.tab-btn'); if(!btn) return;
    threatNav.querySelector('.active').classList.remove('active');
    btn.classList.add('active'); activeThreat = btn.dataset.threat; applyFilters();
  });
  searchInput.addEventListener('input', (e)=>{ searchTerm = e.target.value; applyFilters(); });
  sortSelect.addEventListener('change', (e)=>{ sortMode = e.target.value; applyFilters(); });

  /* ===== Modal (detalhes) ===== */
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

  /* ===== Inicialização: render após migração ===== */
  applyFilters(); // vai chamar renderGrid

  /* ===== Adicionar ===== */
  const addForm = $('#add-form');
  addForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = {
      id: uid(),
      name: $('#f-name').value.trim(),
      location: $('#f-city').value.trim(),
      threat: $('#f-threat').value,
      category: $('#f-category').value,
      website: $('#f-website').value.trim(),
      instagram: $('#f-instagram').value.trim(),
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

  /* ===== Editar / Excluir ===== */
  const editTableBody = $('#edit-table tbody');
  const editSearch = $('#edit-search');
  const editSort = $('#edit-sort');

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
    editTableBody.innerHTML = rows || `<tr><td colspan="6" style="color:#6c757d">Nenhum item encontrado.</td></tr>`;
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
    setView('edit'); // garante que estamos na tela
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
      // se estava carregado no form, limpa
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
      name: eName.value.trim(),
      location: eCity.value.trim(),
      threat: eThreat.value,
      category: eCategory.value,
      website: eWebsite.value.trim(),
      instagram: eInstagram.value.trim(),
      phone: ePhone.value.trim(),
      cnpj: eCnpj.value.trim(),
      tags: eTags.value.trim(),
      ticket: eTicket.value.trim(),
      focus: eFocus.value.trim(),
      analysis: eAnalysis.value.trim()
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

  // Ao abrir a view de edição, render tabela
  const obs = new MutationObserver(()=>{ if (views.edit.style.display!=='none') renderEditTable(); });
  obs.observe(views.edit, {attributes:true, attributeFilter:['style']});

  /* ===== Import / Export ===== */
  const ioPreview = $('#io-preview');
  const btnExport = $('#btn-export');
  const fileImport = $('#file-import');
  const btnImport = $('#btn-import');

  function refreshPreview(){ ioPreview.value = JSON.stringify(DATA, null, 2); }
  refreshPreview();

  btnExport.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(DATA,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `concorrentes_nicopel_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  btnImport.addEventListener('click', ()=>{
    const file = fileImport.files?.[0];
    if (!file) { alert('Selecione um arquivo JSON para importar.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error('Formato inválido');
        // normaliza ids e flags
        const cleaned = parsed.map(o=>({
          id: o.id || uid(),
          name: o.name||'',
          location: o.location||'',
          threat: o.threat||'media',
          category: (o.category||'').trim(),
          website: o.website||'',
          instagram: o.instagram||'',
          phone: o.phone||'',
          cnpj: o.cnpj||'',
          tags: o.tags||'',
          ticket: o.ticket||'',
          focus: o.focus||'',
          analysis: o.analysis||'',
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

  // Sempre que atualizar DATA, mantenha o preview sincronizado
  const sync = new MutationObserver(refreshPreview);
  sync.observe($('#view-io'), {attributes:true, attributeFilter:['style']});
});
