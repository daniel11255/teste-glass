function copyEmail(email, btn) {
      navigator.clipboard.writeText(email).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F9D6A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        
        showToast('E-mail copiado!');
        setTimeout(() => { btn.innerHTML = original; }, 2000);
      }).catch(err => console.error("Erro ao copiar: ", err));
    }

    // --- Lógica de Gerenciamento ---
    const STORAGE_KEY = 'portalHorarios:v1';
    let currentEditingIndex = null;

    function getStoredData() {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : window.horariosAtendimento;
    }

    function saveStoredData(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.horariosAtendimento = data;
      document.dispatchEvent(new CustomEvent('dataUpdated'));
    }

    function openManageModal() {
      const modal = document.getElementById('manageModal');
      modal.classList.add('active');
      renderManageList();
    }

    function closeManageModal() {
      document.getElementById('manageModal').classList.remove('active');
    }

    function confirmAction(title, message) {
      return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const msgEl = document.getElementById('confirmMessage');
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');

        titleEl.textContent = title;
        msgEl.textContent = message;
        modal.classList.add('active');
        
        // Se for exclusão, usa cor de perigo (vermelho), se for salvamento usa a cor de destaque (marrom)
        yesBtn.style.background = title.includes('Excluir') ? 'var(--danger)' : 'var(--accent)';

        yesBtn.onclick = () => { modal.classList.remove('active'); resolve(true); };
        noBtn.onclick = () => { modal.classList.remove('active'); resolve(false); };
        modal.onclick = (e) => { if(e.target === modal) { modal.classList.remove('active'); resolve(false); } };
      });
    }

    function renderManageList() {
      const data = getStoredData();
      const body = document.getElementById('modalBody');
      const footer = document.getElementById('modalFooter');
      
      document.getElementById('modalTitle').textContent = "Gerenciar Professores";
      footer.style.display = 'flex';

      let html = `<button class="btn-add-new" onclick="showTeacherForm()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Adicionar Novo Professor
      </button>`;

      html += data.map((p, i) => `
        <div class="manage-item">
          <div class="manage-info">
            <div>${p.professor}</div>
            <div>${p.materia}</div>
          </div>
          <div class="manage-actions">
            <button class="copy-btn" onclick="showTeacherForm(${i})" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="copy-btn" onclick="deleteTeacher(${i})" style="color:var(--danger)" title="Excluir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        </div>
      `).join('');

      body.innerHTML = html;
    }

    function showTeacherForm(index = null) {
      currentEditingIndex = index;
      const data = getStoredData();
      const teacher = index !== null ? data[index] : { professor: '', materia: '', horario: '', sala: '', email: '' };
      const body = document.getElementById('modalBody');
      const footer = document.getElementById('modalFooter');

      document.getElementById('modalTitle').textContent = index !== null ? "Editar Professor" : "Novo Professor";
      footer.style.display = 'none';

      body.innerHTML = `
        <form id="teacherForm" onsubmit="handleFormSubmit(event)">
          <div class="form-group"><label>Nome do Professor</label><input type="text" id="f-prof" value="${teacher.professor}" required></div>
          <div class="form-group"><label>Matéria</label><input type="text" id="f-mat" value="${teacher.materia}" required></div>
          <div class="form-group"><label>Horário</label><input type="text" id="f-hor" value="${teacher.horario}" required></div>
          <div class="form-group"><label>Sala</label><input type="text" id="f-sala" value="${teacher.sala}" required></div>
          <div class="form-group"><label>E-mail</label><input type="email" id="f-email" value="${teacher.email}" required></div>
          <div style="display:flex;gap:10px;margin-top:20px">
            <button type="submit" class="btn-manage" style="background:var(--accent);color:white;border:none;flex:1;justify-content:center">Salvar</button>
            <button type="button" class="btn-manage" onclick="renderManageList()" style="flex:1;justify-content:center">Cancelar</button>
          </div>
        </form>
      `;
    }

    async function handleFormSubmit(e) {
      e.preventDefault();
      
      const isEdit = currentEditingIndex !== null;
      const confirmed = await confirmAction(
        isEdit ? "Salvar Alterações" : "Adicionar Professor",
        isEdit ? "Deseja salvar as alterações feitas neste professor?" : "Deseja adicionar este novo professor à lista de atendimento?"
      );
      if (!confirmed) return;

      // Capturar dados antes de limpar a interface
      const newTeacher = {
        professor: document.getElementById('f-prof').value,
        materia: document.getElementById('f-mat').value,
        horario: document.getElementById('f-hor').value,
        sala: document.getElementById('f-sala').value,
        email: document.getElementById('f-email').value
      };

      const body = document.getElementById('modalBody');
      const footer = document.getElementById('modalFooter');
      
      // Animação de "Salvando"
      footer.style.display = 'none';
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:20px;animation:reveal 0.4s ease">
          <div class="status-spinner" style="width:40px;height:40px;border-width:3px"></div>
          <div style="font-weight:800;letter-spacing:-0.01em;font-size:16px">Salvando alterações...</div>
        </div>
      `;

      // Simula um delay de processamento para a animação ser percebida
      await new Promise(r => setTimeout(r, 800));

      const data = getStoredData();

      if (currentEditingIndex !== null) {
        data[currentEditingIndex] = newTeacher;
      } else {
        data.push(newTeacher);
      }

      saveStoredData(data);
      closeManageModal();
    }

    async function deleteTeacher(index) {
      const confirmed = await confirmAction("Excluir Professor", "Tem certeza que deseja excluir este professor?");
      if (!confirmed) return;
      
      const body = document.getElementById('modalBody');
      const footer = document.getElementById('modalFooter');
      
      footer.style.display = 'none';
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:20px;animation:reveal 0.4s ease">
          <div class="status-spinner" style="width:40px;height:40px;border-width:3px;border-top-color:var(--danger)"></div>
          <div style="font-weight:800;letter-spacing:-0.01em;font-size:16px">Removendo registro...</div>
        </div>
      `;

      await new Promise(r => setTimeout(r, 600));

      const data = getStoredData();
      data.splice(index, 1);
      saveStoredData(data);
      closeManageModal();
    }

    document.addEventListener('DOMContentLoaded', () => {
      const tbody = document.getElementById('lista-professores');
      const searchBar = document.getElementById('searchBar');
      const searchIndicator = document.getElementById('searchIndicator');
      const tableCard = document.getElementById('tableCard');
      const emptyOverlay = document.getElementById('emptyOverlay');
      const emptyContent = document.getElementById('emptyContent');

      window.horariosAtendimento = getStoredData();

      const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();


      const highlight = (text, term) => {
        if (!term.trim()) return text;
        const cleanTerm = term.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${cleanTerm})`, 'gi');
        return text.replace(regex, '<mark class="hl">$1</mark>');
      };

      const render = (filtro = '') => {
        const term = norm(filtro).trim();
        
        const filtered = window.horariosAtendimento.filter(p => 
          norm(p.professor).includes(term) || norm(p.materia).includes(term)
        );
        
        // Remove a bolinha de carregamento da barra
        searchIndicator.classList.remove('active');
        // Traz o bloco de informações de volta com efeito suave
        tableCard.classList.remove('searching');

        if (filtered.length === 0) {
          tbody.innerHTML = '';
          emptyContent.innerHTML = `<div style="font-size:40px;margin-bottom:12px;opacity:0.5">🔍</div><div style="font-weight:700;font-size:16px;color:var(--text);margin-bottom:6px">Nenhum resultado encontrado</div><div style="font-size:13px;color:var(--muted)">Não encontramos nada para "<span style="color:var(--accent);font-weight:600">${filtro.trim()}</span>"</div>`;
          emptyOverlay.classList.add('active');
          return;
        }

        emptyOverlay.classList.remove('active');

        tbody.innerHTML = filtered.map((p, i) => `
          <tr class="reveal" style="animation-delay:${i * 20}ms">
            <td data-label="Professor"><strong>${highlight(p.professor, filtro)}</strong></td>
            <td data-label="Matéria">${highlight(p.materia, filtro)}</td>
            <td data-label="Horário">${p.horario}</td>
            <td data-label="Sala">${p.sala}</td>
            <td data-label="E-mail">
              <div style="display:flex;align-items:center;gap:8px">
                <a href="mailto:${p.email}" class="email-link">${p.email}</a>
                <button class="copy-btn" onclick="copyEmail('${p.email}',this)" title="Copiar e-mail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      };

      let searchTimeout;
      render();

      searchBar.addEventListener('input', () => {
        const val = searchBar.value;
        if (val.trim().length > 0) {
          // Ativa o spinner na barra e Oculta o bloco de dados inteiramente
          searchIndicator.classList.add('active');
          tableCard.classList.add('searching');
          
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(() => render(val), 350); 
        } else {
          clearTimeout(searchTimeout);
          searchIndicator.classList.remove('active');
          tableCard.classList.remove('searching');
          render('');
        }
      });

      document.addEventListener('dataUpdated', () => render(searchBar.value));
      
      // Fechar modal ao clicar fora
      document.getElementById('manageModal').addEventListener('click', (e) => {
        if(e.target.id === 'manageModal') closeManageModal();
      });
    });
