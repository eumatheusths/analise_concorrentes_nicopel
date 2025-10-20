document.addEventListener('DOMContentLoaded', () => {
    const categoryNav = document.getElementById('category-nav');
    const threatNav = document.getElementById('threat-nav');
    const competitorCards = document.querySelectorAll('.competitor-card');

    let activeCategory = 'todos';
    let activeThreat = 'todos';

    function filterCompetitors() {
        competitorCards.forEach(card => {
            const cardCategory = card.dataset.category || '';
            const cardThreat = card.dataset.threat || '';

            const categoryMatch = (activeCategory === 'todos' || cardCategory.includes(activeCategory));
            
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
        modalFocus.innerHTML = `<svg><use href="#icon-focus"/></svg><span>${focus}</span>`;
        modalAnalysis.textContent = analysis;
        let actions = '';
        if (website) actions += `<a href="${website}" target="_blank" rel="noopener" class="action-btn btn-website"><svg><use href="#icon-website"/></svg>Website</a>`;
        if (instagram) actions += `<a href="${instagram}" target="_blank" rel="noopener" class="action-btn btn-instagram"><svg><use href="#icon-instagram"/></svg>Instagram</a>`;
        modalActions.innerHTML = actions;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden','false');
        document.body.style.overflow='hidden';
        const focusableEls = modal.querySelectorAll('a[href]:not([disabled]), button:not([disabled])');
        firstFocusableEl = focusableEls[0];
        lastFocusableEl = focusableEls[focusableEls.length - 1];
        modalCloseBtn.focus();
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
    const today = new Date();
    document.getElementById('last-updated').textContent =
        today.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
});
