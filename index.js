const SCHEDULE = Object.fromEntries(Object.entries(GRADE).map(([d, aulas]) => [d, aulas.map(a => ({ start: a.start, end: a.end, label: SUBJECTS[a.code].name }))]));
    const DAYS_PT   = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    const MONTHS_PT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

    function tickClock() {
      const n = new Date();
      document.getElementById('clock-hm').textContent = pad(n.getHours()) + ':' + pad(n.getMinutes());
      document.getElementById('clock-ss').textContent = pad(n.getSeconds());
      document.getElementById('clock-weekday').textContent = DAYS_PT[n.getDay()].toUpperCase();
      document.getElementById('clock-date').textContent = pad(n.getDate()) + '/' + pad(n.getMonth() + 1) + '/' + n.getFullYear();
    }

    function getEffectiveDow(now) {
      return now.getDay();
    }

    function findNextSchoolDay(fromDate) {
      const d = new Date(fromDate);
      for (let i = 1; i <= 7; i++) {
        d.setDate(d.getDate() + 1);
        const dow = d.getDay();
        if (SCHEDULE[dow] && SCHEDULE[dow].length > 0) return { dow: dow, date: new Date(d) };
      }
      return null;
    }

    function renderSchedule() {
      const n    = new Date();
      const mins = n.getHours() * 60 + n.getMinutes();
      const dow  = n.getDay();

      let displayDow, dayClasses, isFutureDay;

      // 1. Verificar se hoje ainda tem aulas
      const todayClasses = SCHEDULE[dow] || [];
      const todayDone = todayClasses.length > 0 && mins >= toMins(todayClasses[todayClasses.length - 1].end);

      if (todayClasses.length > 0 && !todayDone) {
        // Ainda há aulas hoje
        displayDow = dow;
        dayClasses = todayClasses;
        isFutureDay = false;
      } else {
        // Hoje não tem aula ou já acabaram. Procurar o próximo dia letivo.
        const next = findNextSchoolDay(n);
        if (next) {
          displayDow = next.dow;
          dayClasses = SCHEDULE[displayDow];
          isFutureDay = true;
        } else {
          displayDow = dow;
          dayClasses = [];
          isFutureDay = false;
        }
      }

      const badgeText = isFutureDay 
        ? (displayDow === 1 ? 'Segunda-feira' : DAYS_PT[displayDow])
        : DAYS_PT[dow];

      document.getElementById('schedule-day-badge').textContent = badgeText;

      const remaining = isFutureDay ? dayClasses.length : dayClasses.filter(c => toMins(c.end) > mins).length;
      document.getElementById('schedule-count').textContent = remaining + (isFutureDay ? ' aulas programadas' : ' restante(s) hoje');

      let markedNext = false;
      document.getElementById('today-schedule').innerHTML = dayClasses.map(c => {
        const startM = toMins(c.start), endM = toMins(c.end);
        let rowClass = '', pillClass = '', pillText = '', progressHtml = '';

        let dataAttrs = '';
        if (!isFutureDay && mins >= startM && mins < endM) {
          rowClass = 'live'; pillClass = 'pill-live';
          const pct = ((mins - startM) / (endM - startM)) * 100;
          pillText = `<span class="live-dot"></span>Em aula agora<span class="class-progress-label" id="live-progress-label">${pct.toFixed(0)}%</span>`;
          progressHtml = `<div class="class-progress-bar" id="live-progress-bar" style="width:${pct.toFixed(1)}%"></div>`;
          dataAttrs = ` data-start="${startM}" data-end="${endM}"`;
        } else if (!isFutureDay && mins >= endM) {
          rowClass = 'done'; pillClass = 'pill-done'; pillText = 'Concluída';
        } else {
          rowClass = 'upcoming';
          if (!markedNext) { rowClass += ' next-up'; markedNext = true; }
          pillClass = 'pill-next'; pillText = `Inicia às ${c.start}`;
        }

        return `<div class="sched-row ${rowClass}"${dataAttrs}>${progressHtml}<div class="sched-time">${c.start} — ${c.end}</div><div class="sched-name">${c.label}</div><span class="sched-pill ${pillClass}">${pillText}</span></div>`;
      }).join('');
    }

    // Atualiza a porcentagem/barra da aula em andamento a cada segundo,
    // sem precisar re-renderizar toda a lista (evita "piscar" a tela).
    function tickLiveProgress() {
      const liveRow = document.querySelector('.sched-row.live');
      const bar   = document.getElementById('live-progress-bar');
      const label = document.getElementById('live-progress-label');
      if (!liveRow || !bar || !label) return;

      const startM = Number(liveRow.dataset.start);
      const endM   = Number(liveRow.dataset.end);
      const n = new Date();
      const mins = n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60;

      if (mins >= endM) { renderSchedule(); return; } // aula acabou, força re-render completo

      const pct = Math.min(100, Math.max(0, ((mins - startM) / (endM - startM)) * 100));
      bar.style.width = pct.toFixed(1) + '%';
      label.textContent = Math.round(pct) + '%';
    }

    // ── PRÓXIMOS ÔNIBUS (resumo na home) ──────────────────────────
    const BUSES = {
      go:  [{t:'05:34',tag:'JL'},{t:'05:59',tag:'JL'},{t:'06:24',tag:'FC VOLVO'},{t:'06:49',tag:'JL'},{t:'07:14',tag:'JL'},{t:'07:44',tag:'JL'},{t:'08:19',tag:'JL'},{t:'08:39',tag:'JL'},{t:'08:59',tag:null},{t:'09:31',tag:null},{t:'10:03',tag:null},{t:'10:34',tag:null},{t:'11:06',tag:null},{t:'11:38',tag:null},{t:'12:10',tag:null},{t:'12:42',tag:null},{t:'13:14',tag:null},{t:'13:46',tag:null},{t:'14:18',tag:null},{t:'14:50',tag:null},{t:'15:22',tag:null},{t:'15:54',tag:null},{t:'16:27',tag:null},{t:'17:17',tag:null},{t:'17:42',tag:null},{t:'18:07',tag:null},{t:'18:37',tag:null},{t:'19:02',tag:null},{t:'19:37',tag:null},{t:'20:12',tag:null},{t:'20:47',tag:null},{t:'21:22',tag:null},{t:'21:57',tag:null},{t:'22:34',tag:null},{t:'23:14',tag:'FC'}],
      ret: [{t:'05:34',tag:null},{t:'05:59',tag:null},{t:'06:24',tag:null},{t:'06:49',tag:'FC VOLVO'},{t:'07:14',tag:null},{t:'07:39',tag:null},{t:'08:09',tag:null},{t:'08:44',tag:null},{t:'09:04',tag:null},{t:'09:24',tag:null},{t:'09:56',tag:null},{t:'10:28',tag:null},{t:'10:57',tag:null},{t:'11:29',tag:null},{t:'12:01',tag:null},{t:'12:33',tag:null},{t:'13:05',tag:null},{t:'13:37',tag:null},{t:'14:09',tag:null},{t:'14:41',tag:null},{t:'15:13',tag:null},{t:'15:33',tag:null},{t:'16:03',tag:null},{t:'16:28',tag:null},{t:'16:52',tag:null},{t:'17:42',tag:null},{t:'18:12',tag:null},{t:'18:47',tag:null},{t:'19:27',tag:null},{t:'20:02',tag:null},{t:'20:37',tag:null},{t:'21:12',tag:null},{t:'21:47',tag:null},{t:'22:22',tag:null},{t:'22:54',tag:null},{t:'23:34',tag:'FC'}],
    };
    for (const dir in BUSES) BUSES[dir].forEach(b => b.m = toMins(b.t));
    const BUS_LABELS = { go: 'Terminal → Shopping', ret: 'Shopping → Terminal' };

    function fmtBusCountdown(mins) {
      if (mins < 1) return 'agora';
      if (mins < 60) return `em ${mins} min`;
      const h = Math.floor(mins / 60), m = mins % 60;
      return m === 0 ? `em ${h}h` : `em ${h}h ${m}min`;
    }

    function renderBusQuick() {
      const n = new Date();
      const nowMins = n.getHours() * 60 + n.getMinutes();
      const dow = n.getDay();
      const isWeekend = (dow === 0 || dow === 6);

      const rowsHtml = ['go', 'ret'].map(dir => {
        const next = isWeekend ? null : (BUSES[dir].find(b => b.m >= nowMins) || null);
        let pillClass, pillText, timeText;

        if (!next) {
          pillClass = 'pill-done';
          pillText  = isWeekend ? 'Indisponível hoje' : 'Encerrado';
          timeText  = isWeekend ? '--:--' : (BUSES[dir][0] ? BUSES[dir][0].t + ' (amanhã)' : '--:--');
        } else {
          pillClass = 'pill-next';
          pillText  = fmtBusCountdown(next.m - nowMins);
          timeText  = next.t;
        }

        return `<div class="sched-row"><div class="sched-time">${timeText}</div><div class="sched-name">${BUS_LABELS[dir]}</div><span class="sched-pill ${pillClass}">${pillText}</span></div>`;
      }).join('');

      document.getElementById('bus-quick-rows').innerHTML = rowsHtml;
    }

    // ── PRÓXIMO ÔNIBUS · OUTRAS LINHAS (Selmi Dei / Imperador / Valle Verde) ──
    // Mesma fonte de dados usada em onibus.html. Os horários variam por
    // tipo de dia (dias úteis / sábado / domingo e feriado), então o tipo
    // de dia é sempre recalculado a partir da data atual antes de comparar.
    function parseLineTimes(str) {
      const tokens = str.trim().split(/\s+/);
      const out = [];
      for (const tok of tokens) {
        if (/^\d{2}:\d{2}$/.test(tok)) {
          out.push({ t: tok, tags: [] });
        } else if (out.length) {
          out[out.length - 1].tags.push(tok);
        }
      }
      out.forEach(b => { b.m = toMins(b.t); b.tag = b.tags.length ? b.tags.join(' ') : null; });
      return out;
    }

    const OTHER_LINES = {
      selmidei: {
        name: 'Selmi Dei',
        labels: { go: 'Selmi Dei → Terminal', ret: 'Terminal → Selmi Dei' },
        schedules: {
          weekday: {
            go: parseLineTimes("04:55 05:30 05:40 05:50 06:00 06:10 06:20 06:30 BV 06:40 06:50 07:00 07:10 07:20 07:30 BV 07:40 07:50 08:00 08:10 08:25 08:45 09:05 09:25 09:45 10:05 10:25 10:45 11:05 11:25 11:45 12:05 12:25 12:45 13:05 13:25 13:45 14:05 14:25 14:45 15:05 15:25 15:46 16:08 16:30 16:52 17:14 17:36 17:55 18:13 18:24 18:35 18:46 18:57 19:37 20:17 20:57 21:37 22:17 22:57"),
            ret: parseLineTimes("05:15 05:37 06:10 06:30 06:50 07:10 07:35 08:00 08:25 08:45 09:05 09:25 09:45 10:05 10:25 10:45 11:05 11:25 11:45 12:05 12:25 12:45 13:05 13:25 13:45 14:05 14:25 14:45 15:05 15:25 15:45 15:56 16:07 16:18 16:29 16:40 16:50 17:00 17:10 17:20 17:30 17:40 17:50 18:00 18:10 BV 18:20 18:30 BV IB 18:55 IB 19:20 IB 19:45 IB 20:15 IB 20:55 IB 21:35 IB 22:15 IB 23:10 BV IB")
          },
          saturday: {
            go: parseLineTimes("04:55 05:15 05:40 IB 05:55 06:15 06:40 06:55 07:15 07:40 07:55 08:15 08:40 08:55 09:15 09:40 09:55 10:15 10:40 10:55 11:15 11:40 11:55 12:15 12:40 12:55 13:15 13:40 13:55 14:15 14:40 14:55 15:15 15:40 15:55 16:15 16:40 17:05 17:35 18:10 18:45 19:30 20:05 20:50 21:45 22:40 VV"),
            ret: parseLineTimes("05:35 05:55 IB 06:15 06:35 06:55 IB 07:15 07:35 07:55 IB 08:15 08:35 08:55 IB 09:15 09:35 09:55 IB 10:15 10:35 10:55 IB 11:15 11:35 11:55 IB 12:15 12:35 12:55 IB 13:15 13:35 13:55 IB 14:15 14:35 14:55 IB 15:15 15:35 15:55 IB 16:15 16:45 17:25 IB 18:05 18:45 IB 19:25 20:05 IB 21:05 22:00 IB")
          },
          sunday: {
            go: parseLineTimes("04:55 05:35 IB 06:20 07:20 08:20 09:20 10:20 11:20 12:20 13:20 14:20 15:20 16:20 17:20 19:15 20:55 22:35"),
            ret: parseLineTimes("05:35 IB 06:35 IB 07:35 IB 08:35 IB 09:35 IB 10:35 IB 11:35 IB 12:35 IB 13:35 IB 14:35 IB 15:35 IB 16:55 IB 18:35 IB 20:15 IB 22:00 IB")
          }
        }
      },
      imperador: {
        name: 'Imperador',
        labels: { go: 'Imperador → Terminal', ret: 'Terminal → Imperador' },
        schedules: {
          weekday: {
            go: parseLineTimes("06:00 07:50 09:40 11:30 13:20 15:10 17:00 18:50 23:15 IND"),
            ret: parseLineTimes("05:30 07:20 09:10 11:00 12:55 14:40 16:30 18:20 22:50 IND")
          },
          saturday: {
            go: parseLineTimes("06:00 07:50 09:40 11:30 13:20 15:10 17:00 18:50"),
            ret: parseLineTimes("05:30 07:20 09:10 11:00 12:50 14:40 16:30 18:20")
          },
          sunday: {
            go: parseLineTimes("06:00 07:50 11:30 13:20 17:00 18:50"),
            ret: parseLineTimes("05:30 07:20 11:00 12:50 16:30 18:20")
          }
        }
      },
      valleverde: {
        name: 'Valle Verde',
        labels: { go: 'Valle Verde → Terminal', ret: 'Terminal → Valle Verde' },
        schedules: {
          weekday: {
            go: parseLineTimes("05:00 05:20 VH 05:35 05:45 05:55 06:05 06:15 06:25 06:35 06:45 06:55 07:05 07:15 07:25 07:35 07:45 07:55 08:05 08:15 08:35 08:55 09:15 09:35 09:55 10:15 10:35 10:55 11:15 11:35 11:55 12:15 12:35 12:55 13:15 13:35 14:15 14:35 14:56 15:18 15:40 BV 16:02 BV 16:24 16:46 TP 17:08 BV 17:30 BV 17:50 18:10 18:20 18:30 18:40 18:50 19:20 20:00 20:40 21:20 22:00 22:40"),
            ret: parseLineTimes("05:40 05:56 06:21 TP 06:41 BV 07:01 07:25 TP 07:50 08:15 08:35 08:55 09:15 09:35 09:55 10:15 10:35 10:55 11:15 11:35 11:55 12:15 12:35 12:55 13:15 13:35 13:55 14:15 14:35 14:55 15:15 15:35 15:50 16:01 16:12 16:23 16:34 16:45 16:55 17:05 17:15 17:25 17:35 17:45 17:55 18:05 18:15 18:25 18:40 19:05 19:30 20:00 20:35 21:15 21:55 23:05")
          },
          saturday: {
            go: parseLineTimes("05:00 05:25 05:45 06:05 06:25 06:45 07:05 07:25 07:45 08:05 08:25 08:45 09:05 09:25 09:45 10:05 10:25 10:45 11:05 11:25 11:45 12:05 12:25 12:45 13:05 13:25 13:45 14:05 14:25 14:45 15:05 15:25 15:45 16:05 16:25 16:45 TP 17:15 BV 17:45 BV 18:25 TP 19:05 19:45 20:25 21:15"),
            ret: parseLineTimes("05:40 06:05 06:25 TP 06:45 BV 07:05 BV 07:25 TP 07:45 08:05 08:25 08:45 09:05 09:25 09:45 10:05 10:25 10:45 11:05 11:25 11:45 12:05 12:25 12:45 13:05 13:25 13:45 14:05 14:25 14:45 15:05 15:25 15:45 16:05 16:25 17:05 17:45 18:25 19:05 19:45 20:35 21:35")
          },
          sunday: {
            go: parseLineTimes("05:00 05:55 06:45 07:30 08:30 09:30 10:30 11:50 12:50 13:50 14:50 15:50 17:10 18:50 20:30"),
            ret: parseLineTimes("05:40 06:40 07:50 08:50 09:50 11:10 12:10 13:10 14:10 15:10 16:30 18:10 19:50 21:35")
          }
        }
      }
    };

    // Tipo de dia (dias úteis / sábado / domingo e feriado) a partir de uma data.
    // Obs.: feriados não são detectados automaticamente (não há calendário de
    // feriados embutido), então feriados usam o horário de "dias úteis" aqui,
    // assim como acontece na aba Ônibus quando nenhum dia é escolhido manualmente.
    function getLineDaytype(date) {
      const dow = date.getDay();
      if (dow === 0) return 'sunday';
      if (dow === 6) return 'saturday';
      return 'weekday';
    }

    // Junta os horários de uma direção (go = bairro → terminal, ret = terminal
    // → bairro) das 3 linhas em uma única lista, ordenada por horário.
    function mergeOtherLinesByDir(daytype, dir) {
      const merged = [];
      for (const id in OTHER_LINES) {
        const line = OTHER_LINES[id];
        for (const b of line.schedules[daytype][dir]) {
          merged.push({ lineName: line.name, label: line.labels[dir], t: b.t, m: b.m });
        }
      }
      merged.sort((a, b) => a.m - b.m);
      return merged;
    }

    // Retorna as próximas `count` partidas de uma direção, a partir de agora.
    // Se não sobrarem `count` horários hoje, completa com os primeiros horários
    // de amanhã (recalculando o tipo de dia de amanhã corretamente).
    function getNextDepartures(dir, count) {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const daytype = getLineDaytype(now);

      const todayList = mergeOtherLinesByDir(daytype, dir).filter(b => b.m >= nowMins);
      let results = todayList.slice(0, count).map(b => ({ ...b, isTomorrow: false }));

      if (results.length < count) {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowDaytype = getLineDaytype(tomorrow);
        const tomorrowList = mergeOtherLinesByDir(tomorrowDaytype, dir);
        const need = count - results.length;
        results = results.concat(tomorrowList.slice(0, need).map(b => ({ ...b, isTomorrow: true })));
      }
      return results;
    }

    function renderOtherBusQuick() {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();

      const nextGo  = getNextDepartures('go', 2);
      const nextRet = getNextDepartures('ret', 2);

      function rowHtml(dep, dir) {
        if (!dep) {
          return `<div class="sched-row"><div class="sched-time">--:--</div><div class="sched-name"><span class="dir-dot ${dir}"></span>Sem horários</div><span class="sched-pill pill-done">Indisponível</span></div>`;
        }
        const timeText = dep.isTomorrow ? `${dep.t} (amanhã)` : dep.t;
        const pillText  = dep.isTomorrow ? 'amanhã' : fmtBusCountdown(dep.m - nowMins);
        return `<div class="sched-row"><div class="sched-time">${timeText}</div><div class="sched-name"><span class="dir-dot ${dir}"></span>${dep.label}</div><span class="sched-pill pill-next">${pillText}</span></div>`;
      }

      const rows = [
        rowHtml(nextGo[0], 'go'),  rowHtml(nextGo[1], 'go'),
        rowHtml(nextRet[0], 'ret'), rowHtml(nextRet[1], 'ret')
      ];

      document.getElementById('other-bus-quick-rows').innerHTML = rows.join('');
    }

    tickClock();
    renderSchedule();
    renderBusQuick();
    renderOtherBusQuick();
    setInterval(tickClock, 1000);
    setInterval(tickLiveProgress, 1000);
    setInterval(() => { renderSchedule(); }, 15000);
    setInterval(renderBusQuick, 30000);
    setInterval(renderOtherBusQuick, 30000);
