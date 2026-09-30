const categories = window.portalCalendarCategories;
    const defaultIds = new Set((window.portalCalendarDefaults || []).map((event) => event.id));
    const dayNames = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const monthNames = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const today = new Date();
    let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDate = toDateKey(today);
    let pendingAttachments = [];
    const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let currentFilter = '';

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];

    function formatDateLong(key){const date=parseDateKey(key);return `${dayNames[date.getDay()]}, ${pad(date.getDate())} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`;}
    function formatDateShort(key){const date=parseDateKey(key);return `${pad(date.getDate())}/${pad(date.getMonth()+1)}`;}
    function eventSubject(event){
      if (event.subject) return event.subject;
      const title = `${event.title || ''} ${event.description || ''}`.toLowerCase();
      const subjects = ['Artes','Educação Física','Filosofia','Física','Geografia','Inglês','Interfaces Web','Introdução à Computação','Língua Portuguesa','Matemática','Programação'];
      return subjects.find((subject)=>title.includes(subject.toLowerCase())) || 'Geral';
    }
    function normalizeUrl(url){
      const trimmed = String(url || '').trim();
      if (!trimmed) return '';
      const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      try { return new URL(withProtocol).href; } catch { return ''; }
    }
    function getStored(){return window.readStoredCalendarEvents ? window.readStoredCalendarEvents() : [];}
    function saveStored(events){
      return window.saveStoredCalendarEvents(events) !== false;
    }
    function getEvents(){return window.getPortalCalendarEvents ? window.getPortalCalendarEvents() : [];}
    function eventsForDate(dateKey){
      return getEvents().filter((event)=>event.date===dateKey);
    }
    function categoryMeta(key){return categories[key] || categories['evento'];}

    function confirmAction(title, message) {
      return new Promise((resolve) => {
        const modal = $('#confirm-modal');
        const titleEl = $('#confirm-title');
        const msgEl = $('#confirm-message');
        const yesBtn = $('#confirm-yes');
        const noBtn = $('#confirm-no');

        titleEl.textContent = title;
        msgEl.textContent = message;
        modal.hidden = false;

        const handle = (value) => {
          modal.hidden = true;
          resolve(value);
        };

        yesBtn.onclick = () => handle(true);
        noBtn.onclick = () => handle(false);
      });
    }

    function categoryBadge(category){
      const meta = categoryMeta(category);
      return `<span class="category-badge" style="background:${meta.soft};color:${meta.color};border-color:${meta.color}22"><span class="legend-dot" style="background:${meta.color}"></span>${escapeHtml(meta.label)}</span>`;
    }
    function renderLegend(){
      $('#category-legend').innerHTML = Object.entries(categories).map(([key,meta])=>`
        <span class="legend-chip" style="background:${meta.soft};color:${meta.color};border-color:${meta.color}22">
          <span class="legend-dot" style="background:${meta.color}"></span>${escapeHtml(meta.label)}
        </span>
      `).join('');
    }
    function renderNextEvent(){
      const detailsBtn = $('#view-next-details');
      if (detailsBtn) detailsBtn.hidden = true;
      // Atualiza "Próximo evento" e habilita o botão de detalhes (se houver evento)
      // (o botão é adicionado no HTML abaixo).
      const events = getEvents();
      const filteredEvents = events; // Mantém o próximo evento global
      const now = new Date();
      const todayKey = toDateKey(now);
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const upcoming = filteredEvents.find((event)=>{
        if (!event.date) return false;
        if (event.date > todayKey) return true;
        if (event.date < todayKey) return false;
        // Como o horário é texto, consideramos qualquer evento do dia como "próximo" se ainda for hoje
        return true;
      });
      if (!upcoming) {
        $('#next-event-title').textContent = 'Nenhum evento agendado';
        $('#next-event-meta').textContent = 'Cadastre um novo compromisso';
        if (detailsBtn) detailsBtn.hidden = true;
        return;
      }
      const isSabado = upcoming.category === 'sabado-letivo';
      $('#next-event-title').textContent = isSabado ? 'Sábado Letivo' : eventSubject(upcoming);
      $('#next-event-meta').textContent = `${formatDateShort(upcoming.date)} · ${upcoming.horario || 'Horário indefinido'}${upcoming.title ? ` · ${upcoming.title}` : ''}`;
      if (detailsBtn) detailsBtn.hidden = false;
    }
    function renderCalendar(){
      renderNextEvent();
      const monthLabel = `${monthNames[currentMonth.getMonth()]} de ${currentMonth.getFullYear()}`;
      $('#month-title').textContent = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
      const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const start = new Date(first);
      start.setDate(first.getDate() - first.getDay());
      const cells = [];
      for (let i=0;i<42;i++){
        const date = new Date(start);
        date.setDate(start.getDate()+i);
        const key = toDateKey(date);
        const dayEvents = eventsForDate(key);
        const visibleEvents = dayEvents.slice(0,3);
        const classes = ['day-cell'];
        if (date.getMonth() !== currentMonth.getMonth()) classes.push('outside');
        if (key === toDateKey(today)) classes.push('today');
        if (key === selectedDate) classes.push('selected');
        cells.push(`
          <button class="${classes.join(' ')}" type="button" data-date="${key}" aria-label="${escapeHtml(formatDateLong(key))}">
            <span class="day-top">
              <span class="day-number">${date.getDate()}</span>
              ${dayEvents.length ? `<span class="day-count">${dayEvents.length}</span>` : ''}
            </span>
            <span class="event-stack">
              ${visibleEvents.map((event)=>{
                const meta = categoryMeta(event.category);
                const isSabado = event.category === 'sabado-letivo';
                return `<span class="event-pill" style="color:${meta.color};background:${meta.soft}">
                  ${isSabado ? `<span>${escapeHtml(meta.label)}</span>` : ''}
                  <strong>${escapeHtml(eventSubject(event))}</strong>
                </span>`;
              }).join('')}
              ${dayEvents.length > 3 ? `<span class="more-events">+${dayEvents.length - 3} eventos</span>` : ''}
            </span>
          </button>
        `);
      }
      $('#month-grid').innerHTML = cells.join('');
      $$('#month-grid .day-cell').forEach((cell)=>{
        cell.addEventListener('click',()=>{
          selectedDate = cell.dataset.date;
          renderCalendar();
          renderDayPanel();
          openDayPanel();
        });
      });
    }
    function showLoading(show = true) {
      $('#loading-overlay').hidden = !show;
    }
    function openDayPanel(){
      $('#day-panel').hidden = false;
      $('#day-panel .day-sheet').classList.add('scale-in');
      document.body.style.overflow = 'hidden';
      const closeButton = $('#close-day-panel');
      if (closeButton) closeButton.focus();
    }
    function closeDayPanel(){
      $('#day-panel').hidden = true;
      document.body.style.overflow = '';
      renderCalendar();
    }
    function renderDayPanel(){
      const events = eventsForDate(selectedDate);
      $('#selected-day-title').textContent = formatDateLong(selectedDate);
      $('#selected-day-sub').textContent = `${events.length} ${events.length === 1 ? 'evento' : 'eventos'}`;
      if (!events.length) {
        $('#selected-day-events').innerHTML = `
          <div class="empty">Nenhum evento cadastrado para este dia.</div>
          <button class="btn btn-primary" type="button" id="create-for-day"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Novo evento neste dia</button>
        `;
      } else {
        $('#selected-day-events').innerHTML = events.map((event)=>`
          <article class="day-event fade-in">
            <div class="day-event-head">
              <div>
                ${categoryBadge(event.category)}
                <h3>${escapeHtml(event.title)}</h3>
                <div class="event-subject">${escapeHtml(eventSubject(event))}</div>
                <div class="event-time">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ${escapeHtml(event.horario || '--:--')}
                </div>
              </div>
            </div>
            ${event.description ? `<div class="event-desc">${escapeHtml(event.description)}</div>` : ''}
            ${renderResources(event)}
          </article>
        `).join('') + `<button class="btn btn-primary" type="button" id="create-for-day"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Novo evento neste dia</button>`;
      }
      $('#create-for-day').addEventListener('click',()=>startNewEvent(selectedDate));
    }
    function renderResources(event){
      const links = Array.isArray(event.links) ? event.links : [];
      const attachments = Array.isArray(event.attachments) ? event.attachments : [];
      const linkHtml = links.map((link)=>`<a class="resource-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93"/><path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07"/></svg>${escapeHtml(link.label || link.url)}</a>`).join('');
      const fileHtml = attachments.map((file)=>`<a class="resource-link" href="${escapeHtml(file.dataUrl || '#')}" download="${escapeHtml(file.name)}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${escapeHtml(file.name)} (${formatSize(file.size)})</a>`).join('');
      return linkHtml || fileHtml ? `<div class="resource-list">${linkHtml}${fileHtml}</div>` : '';
    }
    function renderEventsList(){
      let events = getEvents();
      $('#events-list').innerHTML = events.length ? events.map((event)=>`
        <article class="event-row fade-in">
          <div class="event-row-top">
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <div class="event-checkbox-wrapper">
                <input type="checkbox" class="event-checkbox" data-bulk-id="${escapeHtml(event.id)}">
              </div>
              <div>
                ${categoryBadge(event.category)}
                <div class="event-row-title">${escapeHtml(event.title)}</div>
                <div class="event-row-meta">${escapeHtml(eventSubject(event))} · ${escapeHtml(event.date)} · ${escapeHtml(event.horario || '--:--')}</div>
              </div>
            </div>
            <div class="event-row-actions">
              <button class="mini-btn" type="button" data-edit-list="${escapeHtml(event.id)}" aria-label="Editar evento"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
            </div>
          </div>
        </article>
      `).join('') : '<div class="empty">Nenhum evento cadastrado.</div>';
      
      $$('[data-edit-list]').forEach((button)=>button.addEventListener('click',()=>editEvent(button.dataset.editList)));
      $$('.event-checkbox').forEach(cb => cb.addEventListener('change', updateBulkBar));
      updateBulkBar();
    }
    function updateBulkBar() {
      const selected = $$('.event-checkbox:checked');
      const bar = $('#bulk-actions-bar');
      bar.hidden = selected.length === 0;
      $('#bulk-count').textContent = `${selected.length} selecionado(s)`;
    }
    async function handleBulkDelete() {
      const ids = $$('.event-checkbox:checked').map(cb => cb.dataset.bulkId);
      if (!ids.length) return;
      
      const confirmed = await confirmAction('Excluir Eventos', `Deseja mesmo excluir estes ${ids.length} eventos?`);
      if (!confirmed) return;

      showLoading();
      await new Promise(r => setTimeout(r, 600));
      window.deleteCalendarEvents(ids);
      renderAll();
      showLoading(false);
      showToast('Eventos excluídos.');
    }
    function switchTab(name){
      const tabs = ['calendar', 'editor', 'manage'];
      const index = tabs.indexOf(name);
      const indicator = $('#tab-indicator');
      if (indicator) indicator.style.transform = `translateX(${index * 100}%)`;

      $$('.tab-btn').forEach((button)=>{
        const active = button.dataset.tab === name;
        button.classList.toggle('active',active);
        button.setAttribute('aria-selected',String(active));
      });
      $$('.tab-panel').forEach((panel)=>panel.classList.remove('active'));
      $(`#panel-${name}`).classList.add('active');

      // Oculta o aviso de próximo evento se não estiver na aba de calendário
      const nextCard = $('#next-event-card');
      if (nextCard) nextCard.hidden = (name !== 'calendar');

      // Oculta o título da página e a barra de pesquisa se não estiver na aba de calendário
      const titleContainer = $('#page-title-container');
      if (titleContainer) titleContainer.hidden = (name !== 'calendar');

      const searchContainer = $('#search-container');
      if (searchContainer) searchContainer.hidden = (name !== 'calendar');

      if (name !== 'calendar') {
        $('#filtered-results-view').hidden = true;
        $('#calendarSubjectFilter').value = '';
      }

      if (name === 'manage') renderEventsList();
      if (name === 'calendar') renderCalendar();
    }

    function addLinkRow(link = {label:'',url:''}){
      if (!link.url) return;
      const row = document.createElement('div');
      row.className = 'link-row';
      row.innerHTML = `
        <div class="link-input-group"><label>Nome do Link</label><input type="text" class="link-label" placeholder="Ex: Material" value="${escapeHtml(link.label || '')}"></div>
        <div class="link-input-group"><label>URL (Link)</label><input type="text" class="link-url" placeholder="https://..." value="${escapeHtml(link.url || '')}"></div>
        <button class="mini-btn" type="button" aria-label="Remover link"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      `;
      row.querySelector('button').addEventListener('click',()=>row.remove());
      $('#links-list').appendChild(row);
    }
    function collectLinks(){
      return $$('#links-list .link-row').map((row)=>{
        const label = row.querySelector('.link-label').value.trim();
        const url = normalizeUrl(row.querySelector('.link-url').value);
        if (!url) return null;
        return {label:label || url,url};
      }).filter(Boolean);
    }
    function renderAttachments(){
      $('#attachments-list').innerHTML = pendingAttachments.map((file,index)=>`
        <div class="attachment-item">
          <span>${escapeHtml(file.name)} · ${formatSize(file.size)}</span>
          <button class="mini-btn" type="button" data-remove-attachment="${index}" aria-label="Remover anexo"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </div>
      `).join('');
      $$('[data-remove-attachment]').forEach((button)=>{
        button.addEventListener('click',()=>{
          pendingAttachments.splice(Number(button.dataset.removeAttachment),1);
          renderAttachments();
        });
      });
    }
    async function readFiles(files){
      if (!files.length) return;
      const confirmed = await confirmAction(
        'Adicionar anexos', 
        `Deseja anexar estes ${files.length} arquivo(s) ao evento?`
      );
      if (!confirmed) return;
      
      const added = [];
      for (const file of files) {
        if (file.size > 2 * 1024 * 1024) {
          showToast(`${file.name} excede 2 MB`);
          continue;
        }
        const dataUrl = await new Promise((resolve,reject)=>{
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        added.push({name:file.name,size:file.size,type:file.type,dataUrl});
      }
      pendingAttachments = [...pendingAttachments, ...added];
      renderAttachments();
    }
    function showEditorView(show = true) {
      const mainView = $('#editor-main-view');
      if (mainView) mainView.hidden = !show;
    }
    function isEditorDirty() {
      const mainView = $('#editor-main-view');
      if (!mainView || mainView.hidden) return false;
      const id = $('#event-id').value;
      const title = $('#event-title').value.trim();
      const desc = $('#event-description').value.trim();
      const hasLinks = $$('#links-list .link-row').length > 0;
      const hasFiles = pendingAttachments.length > 0;
      return !!id || !!title || !!desc || hasLinks || hasFiles;
    }
    function clearEditor() {
      $('#event-id').value = '';
      $('#event-form').reset();
      $('#links-list').innerHTML = '';
      pendingAttachments = [];
      renderAttachments();
      $('#link-creator-box').hidden = true;
      $('#add-link').hidden = false;
      showEditorView(false);
    }
    function startNewEvent(dateKey = selectedDate, category = null){
      if (!category) {
        showCategorySelector(dateKey);
        return;
      }
      showEditorView(true);
      closeDayPanel();
      $('#event-form').reset();
      $('#event-id').value = '';
      $('#event-date').value = dateKey;
      $('#event-category').value = category;
      $('#event-subject').value = '';
      $('#event-horario').value = '';
      $('#form-heading').textContent = 'Novo evento';
      $('#links-list').innerHTML = '';
      pendingAttachments = [];
      renderAttachments();
      updateScheduleField();
      switchTab('editor');
      $('#event-title').focus();
    }
    function showCategorySelector(dateKey) {
      const selector = $('#category-selector');
      selector.hidden = false;
      const btns = selector.querySelectorAll('.category-opt-btn');
      btns.forEach(btn => {
        btn.onclick = () => {
          selector.hidden = true;
          startNewEvent(dateKey, btn.dataset.cat);
        };
      });
    }
    function editEvent(id){
      const event = getEvents().find((item)=>item.id === id);
      if (!event) return;
      showEditorView(true);
      closeDayPanel();
      $('#event-id').value = event.id;
      $('#event-title').value = event.title || '';
      $('#event-date').value = event.date || selectedDate;
      $('#event-category').value = event.category || 'evento';
      $('#event-subject').value = event.subject || eventSubject(event);
      $('#event-horario').value = event.horario || '';
      $('#event-description').value = event.description || '';
      $('#form-heading').textContent = 'Editar evento';
      $('#links-list').innerHTML = '';
      const links = Array.isArray(event.links) ? event.links : [];
      links.forEach(addLinkRow);
      pendingAttachments = Array.isArray(event.attachments) ? [...event.attachments] : [];
      renderAttachments();
      updateScheduleField();
      switchTab('editor');
      $('#event-title').focus();
    }
    function upsertStoredEvent(event){
      const stored = getStored().filter((item)=>item && item.id !== event.id);
      stored.push(event);
      return saveStored(stored);
    }
    function removeEvent(id){
      const stored = getStored().filter((item)=>item && item.id !== id);
      if (defaultIds.has(id)) stored.push({id, deleted:true});
      return saveStored(stored);
    }
    function updateScheduleField(){
      const category = $('#event-category').value;
      const isSabado = category === 'sabado-letivo';
      $('#event-title').closest('.field').hidden = isSabado;
      $('#event-subject').closest('.field').hidden = isSabado;
      $('#add-link').closest('.field').hidden = isSabado;
      $('#event-files').closest('.field').hidden = isSabado;
      $('#event-title').toggleAttribute('required', !isSabado);
      $('#event-subject').toggleAttribute('required', !isSabado);
    }
    async function saveEventFromForm(event){
      event.preventDefault();
      const id = $('#event-id').value || `event-${Date.now()}`;
      const isEdit = !!$('#event-id').value;

      const confirmed = await confirmAction(
        isEdit ? 'Confirmar Edição' : 'Confirmar Criação',
        `Deseja mesmo ${isEdit ? 'salvar as alterações deste' : 'criar este novo'} evento?`
      );
      if (!confirmed) return;

      const category = $('#event-category').value;
      let title = $('#event-title').value.trim();
      if (category === 'sabado-letivo' && !title) title = 'Sábado Letivo';

      const calendarEvent = {
        id,
        title,
        date: $('#event-date').value,
        horario: $('#event-horario').value.trim(),
        category,
        subject: $('#event-subject').value || 'Geral',
        description: $('#event-description').value.trim(),
        links: collectLinks(),
        attachments: pendingAttachments
      };
      
      showLoading();
      await new Promise(r => setTimeout(r, 800));

      if (!upsertStoredEvent(calendarEvent)) {
        showLoading(false);
        showToast('Não foi possível salvar. Reduza os anexos.');
        return;
      }
      selectedDate = calendarEvent.date;
      currentMonth = new Date(parseDateKey(calendarEvent.date).getFullYear(), parseDateKey(calendarEvent.date).getMonth(), 1);
      renderAll();
      showLoading(false);
      clearEditor();
      switchTab('calendar');
      showToast('Evento salvo.');
    }
    function toggleEditorSidebar() {
      const layout = $('#editor-main-view');
      const sidebar = $('#editor-sidebar');
      sidebar.hidden = !sidebar.hidden;
      layout.classList.toggle('sidebar-hidden', sidebar.hidden);
    }

    function renderAll(){
      renderCalendar();
      renderDayPanel();
      renderEventsList();
      renderNextEvent();
    }
    $('#prev-month').addEventListener('click',()=>{currentMonth.setMonth(currentMonth.getMonth()-1);renderCalendar();});
    $('#next-month').addEventListener('click',()=>{currentMonth.setMonth(currentMonth.getMonth()+1);renderCalendar();});
    
    window.jumpToDate = (dateKey) => {
      selectedDate = dateKey;
      const d = parseDateKey(dateKey);
      currentMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      renderCalendar();
      renderDayPanel();
      openDayPanel();
    };

    function renderFilteredView(subject) {
      const view = $('#filtered-results-view');
      if (!subject) {
        view.hidden = true;
        return;
      }

      const allEvents = getEvents();
      const filtered = allEvents.filter(e => eventSubject(e) === subject || e.category === subject);
      const displayLabel = subject === 'sabado-letivo' ? 'Sábados Letivos' : subject;

      view.hidden = false;
      view.innerHTML = `
        <div class="filtered-results-header">
          <div class="filtered-results-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            ${displayLabel} (${filtered.length})
          </div>
          <button class="icon-btn" onclick="clearFilter()" title="Fechar filtro"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </div>
        <div class="filtered-results-grid">
          ${filtered.length ? filtered.map(e => `
            <div class="filtered-item" onclick="jumpToDate('${e.date}')">
              ${categoryBadge(e.category)}
              <div style="font-size: 11px; font-weight: 700; color: var(--accent); margin-bottom: 4px;">${formatDateShort(e.date)}</div>
              <div style="font-weight: 800; font-size: 13px; line-height: 1.2;">${escapeHtml(e.title)}</div>
              <div style="font-size: 11px; color: var(--muted); margin-top: 6px;">${escapeHtml(e.horario || 'Horário não definido')}</div>
              <div style="margin-top: 8px; pointer-events: none;">${renderResources(e)}</div>
            </div>
          `).join('') : '<div class="empty" style="grid-column: 1/-1">Nenhum evento encontrado para esta matéria.</div>'}
        </div>
      `;
    }

    window.clearFilter = () => {
      $('#calendarSubjectFilter').value = '';
      $('#filtered-results-view').hidden = true;
    };

    $('#calendarSubjectFilter').addEventListener('change', (e) => {
      renderFilteredView(e.target.value);
    });

    $$('.tab-btn').forEach((button)=>button.addEventListener('click', async ()=>{
      const targetTab = button.dataset.tab;
      const activeBtn = $('.tab-btn.active');
      const currentTab = activeBtn ? activeBtn.dataset.tab : null;

      if (currentTab === 'editor' && targetTab !== 'editor' && isEditorDirty()) {
        const confirmed = await confirmAction('Sair sem salvar?', 'Existem alterações não salvas no evento. Deseja realmente sair?');
        if (!confirmed) return;
        clearEditor();
      }

      if (targetTab === 'editor') {
        currentFilter = '';
        $('#calendarSubjectFilter').value = '';
      }

      switchTab(targetTab);
      
      if(targetTab === 'editor' && !$('#event-id').value) {
        showCategorySelector(selectedDate);
      }
    }));
    $('#close-day-panel').addEventListener('click',closeDayPanel);
    $('#day-panel').addEventListener('click',(event)=>{
      if (event.target === $('#day-panel')) closeDayPanel();
    });
    document.addEventListener('keydown',(event)=>{
      if (event.key === 'Escape' && !$('#day-panel').hidden) closeDayPanel();
    });
    $('#add-link').addEventListener('click', () => {
      $('#link-creator-box').hidden = false;
      $('#add-link').hidden = true;
      $('#new-link-label').focus();
    });
    $('#cancel-link-btn').addEventListener('click', () => {
      $('#link-creator-box').hidden = true;
      $('#add-link').hidden = false;
      $('#new-link-label').value = '';
      $('#new-link-url').value = '';
    });
    $('#confirm-link-btn').addEventListener('click', () => {
      const label = $('#new-link-label').value.trim();
      const url = $('#new-link-url').value.trim();
      if (!url) { showToast('Por favor, insira uma URL.'); return; }
      addLinkRow({ label, url });
      $('#link-creator-box').hidden = true;
      $('#add-link').hidden = false;
      $('#new-link-label').value = '';
      $('#new-link-url').value = '';
    });
    $('#event-files').addEventListener('change',(event)=>readFiles(event.target.files).finally(()=>{event.target.value='';}));
    $('#event-form').addEventListener('submit',saveEventFromForm);

    $('#view-next-details').addEventListener('click', () => {
      const events = getEvents();
      const now = new Date();
      const todayKey = toDateKey(now);
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const upcoming = events.find((event) => {
        if (!event.date) return false;
        if (event.date > todayKey) return true;
        if (event.date < todayKey) return false;
        const end = event.end || event.start || '23:59';
        return toMins(end) >= nowMins;
      });
      if (!upcoming) return;
      selectedDate = upcoming.date;
      renderCalendar();
      renderDayPanel();
      openDayPanel();
    });

    $('#event-date').value = selectedDate;
    renderAll();
