        const DAYS_PT_LONG=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const now=new Date(),dow=now.getDay(),nowMins=now.getHours()*60+now.getMinutes();
    if(dow>=1&&dow<=5){document.querySelectorAll('th[data-dow]').forEach(th=>{if(Number(th.dataset.dow)===dow)th.classList.add('today-col');});document.querySelectorAll('tbody tr').forEach(row=>{const cells=row.querySelectorAll('td');if(cells[dow])cells[dow].classList.add('today-col');});}
    document.querySelectorAll('tbody tr[data-start]').forEach(row=>{const s=toMins(row.dataset.start),e=toMins(row.dataset.end);if(nowMins>=s&&nowMins<e){const tc=row.querySelector('.time-cell');tc.classList.add('live-row');const badge=document.createElement('div');badge.className='live-badge';badge.innerHTML='<div class="live-dot"></div> agora';tc.appendChild(badge);}});
    function updateBanner(){
      const n=new Date(),d=n.getDay(),m=n.getHours()*60+n.getMinutes();
      const banner=document.getElementById('today-banner');
      const label=document.getElementById('banner-label');
      const box=document.getElementById('banner-classes');
      
      let targetDow = d;
      let classes = GRADE[targetDow] || [];
      const allDone = classes.length > 0 && m >= toMins(classes[classes.length-1].end);
      
      if (classes.length === 0 || allDone) {
        for (let i = 1; i <= 7; i++) {
          let next = (d + i) % 7;
          if (GRADE[next] && GRADE[next].length > 0) {
            targetDow = next;
            classes = GRADE[next];
            break;
          }
        }
      }
      const isFutureDay = targetDow !== d;
      label.textContent = isFutureDay ? `Próximas (${DAYS_PT_LONG[targetDow]}) —` : 'Próximas Aulas —';
      box.innerHTML = '';
      classes.forEach(c => {
        const sM=toMins(c.start), eM=toMins(c.end);
        const isLive = !isFutureDay && m >= sM && m < eM;
        const isPast = !isFutureDay && m >= eM;
        const chip = document.createElement('div');
        chip.className = 'today-chip' + (isLive ? ' live' : '');
        const status = isLive ? 'Em aula agora' : (isPast ? 'Concluída' : `Inicia às ${c.start}`);
        const name = SUBJECTS[c.code] ? SUBJECTS[c.code].name : c.code;
        chip.innerHTML = `<span class="today-chip-status">${status}</span><span>${name}</span>`;
        box.appendChild(chip);
      });
      banner.classList.add('visible');
    }
    updateBanner(); setInterval(updateBanner, 30000);
    const legend=document.getElementById('legend'),seen=new Set();
    document.querySelectorAll('.subj-pill[data-code]').forEach(el=>{const code=el.dataset.code;if(!seen.has(code)&&SUBJECTS[code]){seen.add(code);const meta=SUBJECTS[code];const chip=document.createElement('div');chip.className='legend-chip '+meta.cls;chip.innerHTML=`<span class="legend-dot" style="background:${meta.dot}"></span>${meta.name}`;legend.appendChild(chip);}});

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') updateBanner();
    });
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) updateBanner();
    });
