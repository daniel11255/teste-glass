// ───────────────────────────────────────────────────────────────
    // LINHA PINHEIRINHO / SHOPPING (linha principal, comportamento
    // e aviso de fim de semana inalterados)
    // ───────────────────────────────────────────────────────────────
    const PINHEIRINHO_BUSES={go:[{t:'05:34',tag:'JL'},{t:'05:59',tag:'JL'},{t:'06:24',tag:'FC VOLVO'},{t:'06:49',tag:'JL'},{t:'07:14',tag:'JL'},{t:'07:44',tag:'JL'},{t:'08:19',tag:'JL'},{t:'08:39',tag:'JL'},{t:'08:59',tag:null},{t:'09:31',tag:null},{t:'10:03',tag:null},{t:'10:34',tag:null},{t:'11:06',tag:null},{t:'11:38',tag:null},{t:'12:10',tag:null},{t:'12:42',tag:null},{t:'13:14',tag:null},{t:'13:46',tag:null},{t:'14:18',tag:null},{t:'14:50',tag:null},{t:'15:22',tag:null},{t:'15:54',tag:null},{t:'16:27',tag:null},{t:'17:17',tag:null},{t:'17:42',tag:null},{t:'18:07',tag:null},{t:'18:37',tag:null},{t:'19:02',tag:null},{t:'19:37',tag:null},{t:'20:12',tag:null},{t:'20:47',tag:null},{t:'21:22',tag:null},{t:'21:57',tag:null},{t:'22:34',tag:null},{t:'23:14',tag:'FC'}],ret:[{t:'05:34',tag:null},{t:'05:59',tag:null},{t:'06:24',tag:null},{t:'06:49',tag:'FC VOLVO'},{t:'07:14',tag:null},{t:'07:39',tag:null},{t:'08:09',tag:null},{t:'08:44',tag:null},{t:'09:04',tag:null},{t:'09:24',tag:null},{t:'09:56',tag:null},{t:'10:28',tag:null},{t:'10:57',tag:null},{t:'11:29',tag:null},{t:'12:01',tag:null},{t:'12:33',tag:null},{t:'13:05',tag:null},{t:'13:37',tag:null},{t:'14:09',tag:null},{t:'14:41',tag:null},{t:'15:13',tag:null},{t:'15:33',tag:null},{t:'16:03',tag:null},{t:'16:28',tag:null},{t:'16:52',tag:null},{t:'17:42',tag:null},{t:'18:12',tag:null},{t:'18:47',tag:null},{t:'19:27',tag:null},{t:'20:02',tag:null},{t:'20:37',tag:null},{t:'21:12',tag:null},{t:'21:47',tag:null},{t:'22:22',tag:null},{t:'22:54',tag:null},{t:'23:34',tag:'FC'}]};
    for(const dir in PINHEIRINHO_BUSES)PINHEIRINHO_BUSES[dir].forEach(b=>b.m=toMins(b.t));
    const PINHEIRINHO_TAG_CLASSES={'JL':'jl','FC VOLVO':'fcv','FC':'fc'};
    const PINHEIRINHO_LEGEND=[
      {cls:'jl',code:'JL',desc:'Residencial Lupo'},
      {cls:'fc',code:'FC',desc:'Fábrica de Cueca'},
      {cls:'fcv',code:'VOLVO',desc:'FC com veículo Volvo'}
    ];

    // ───────────────────────────────────────────────────────────────
    // NOVAS LINHAS — Selmi Dei, Imperador e Valle Verde
    // Operadas pela Viação Paraty. Horários por tipo de dia
    // (dias úteis / sábado / domingo e feriado).
    // ───────────────────────────────────────────────────────────────
    function parseTimes(str){
      const tokens=str.trim().split(/\s+/);
      const out=[];
      for(const tok of tokens){
        if(/^\d{2}:\d{2}$/.test(tok)){
          out.push({t:tok,tags:[]});
        } else if(out.length){
          out[out.length-1].tags.push(tok);
        }
      }
      out.forEach(b=>{b.m=toMins(b.t);b.tag=b.tags.length?b.tags.join(' '):null;});
      return out;
    }

    const LINES={
      selmidei:{
        name:'Selmi Dei',
        labels:{go:'Selmi Dei → Terminal',ret:'Terminal → Selmi Dei'},
        legend:[
          {code:'BV',desc:'Atendimento ao Jardim Boa Vista'},
          {code:'IB',desc:'Atende a Vila dos Ibirás'},
          {code:'VV',desc:'Via Valle Verde'}
        ],
        schedules:{
          weekday:{
            go: parseTimes("04:55 05:30 05:40 05:50 06:00 06:10 06:20 06:30 BV 06:40 06:50 07:00 07:10 07:20 07:30 BV 07:40 07:50 08:00 08:10 08:25 08:45 09:05 09:25 09:45 10:05 10:25 10:45 11:05 11:25 11:45 12:05 12:25 12:45 13:05 13:25 13:45 14:05 14:25 14:45 15:05 15:25 15:46 16:08 16:30 16:52 17:14 17:36 17:55 18:13 18:24 18:35 18:46 18:57 19:37 20:17 20:57 21:37 22:17 22:57"),
            ret: parseTimes("05:15 05:37 06:10 06:30 06:50 07:10 07:35 08:00 08:25 08:45 09:05 09:25 09:45 10:05 10:25 10:45 11:05 11:25 11:45 12:05 12:25 12:45 13:05 13:25 13:45 14:05 14:25 14:45 15:05 15:25 15:45 15:56 16:07 16:18 16:29 16:40 16:50 17:00 17:10 17:20 17:30 17:40 17:50 18:00 18:10 BV 18:20 18:30 BV IB 18:55 IB 19:20 IB 19:45 IB 20:15 IB 20:55 IB 21:35 IB 22:15 IB 23:10 BV IB")
          },
          saturday:{
            go: parseTimes("04:55 05:15 05:40 IB 05:55 06:15 06:40 06:55 07:15 07:40 07:55 08:15 08:40 08:55 09:15 09:40 09:55 10:15 10:40 10:55 11:15 11:40 11:55 12:15 12:40 12:55 13:15 13:40 13:55 14:15 14:40 14:55 15:15 15:40 15:55 16:15 16:40 17:05 17:35 18:10 18:45 19:30 20:05 20:50 21:45 22:40 VV"),
            ret: parseTimes("05:35 05:55 IB 06:15 06:35 06:55 IB 07:15 07:35 07:55 IB 08:15 08:35 08:55 IB 09:15 09:35 09:55 IB 10:15 10:35 10:55 IB 11:15 11:35 11:55 IB 12:15 12:35 12:55 IB 13:15 13:35 13:55 IB 14:15 14:35 14:55 IB 15:15 15:35 15:55 IB 16:15 16:45 17:25 IB 18:05 18:45 IB 19:25 20:05 IB 21:05 22:00 IB")
          },
          sunday:{
            // Obs.: no PDF de origem, um horário entre 16:20 e 19:15 estava
            // ilegível ("17:"); foi assumido 17:20 seguindo o padrão da lista.
            go: parseTimes("04:55 05:35 IB 06:20 07:20 08:20 09:20 10:20 11:20 12:20 13:20 14:20 15:20 16:20 17:20 19:15 20:55 22:35"),
            ret: parseTimes("05:35 IB 06:35 IB 07:35 IB 08:35 IB 09:35 IB 10:35 IB 11:35 IB 12:35 IB 13:35 IB 14:35 IB 15:35 IB 16:55 IB 18:35 IB 20:15 IB 22:00 IB")
          }
        },
        corujao:{
          weekday:['00:00','01:00','03:30'],
          saturday:['23:00','00:00','03:30'],
          sunday:['23:00','00:00','03:30']
        }
      },
      imperador:{
        name:'Imperador',
        labels:{go:'Imperador → Terminal',ret:'Terminal → Imperador'},
        legend:[
          {code:'IND',desc:'Atendido pelo veículo da linha Indaiá'}
        ],
        schedules:{
          weekday:{
            go: parseTimes("06:00 07:50 09:40 11:30 13:20 15:10 17:00 18:50 23:15 IND"),
            ret: parseTimes("05:30 07:20 09:10 11:00 12:55 14:40 16:30 18:20 22:50 IND")
          },
          saturday:{
            go: parseTimes("06:00 07:50 09:40 11:30 13:20 15:10 17:00 18:50"),
            ret: parseTimes("05:30 07:20 09:10 11:00 12:50 14:40 16:30 18:20")
          },
          sunday:{
            go: parseTimes("06:00 07:50 11:30 13:20 17:00 18:50"),
            ret: parseTimes("05:30 07:20 11:00 12:50 16:30 18:20")
          }
        },
        corujao:{
          weekday:['00:00','01:00','03:30'],
          saturday:['23:00','00:00','03:30'],
          sunday:['23:00','00:00','03:30']
        }
      },
      valleverde:{
        name:'Valle Verde',
        labels:{go:'Valle Verde → Terminal',ret:'Terminal → Valle Verde'},
        legend:[
          {code:'TP',desc:'Atendimento ao Condomínio Tipuanna'},
          {code:'VH',desc:'Vista do Horto'},
          {code:'BV',desc:'Atendimento ao Condomínio Buona Vitta'}
        ],
        schedules:{
          weekday:{
            go: parseTimes("05:00 05:20 VH 05:35 05:45 05:55 06:05 06:15 06:25 06:35 06:45 06:55 07:05 07:15 07:25 07:35 07:45 07:55 08:05 08:15 08:35 08:55 09:15 09:35 09:55 10:15 10:35 10:55 11:15 11:35 11:55 12:15 12:35 12:55 13:15 13:35 14:15 14:35 14:56 15:18 15:40 BV 16:02 BV 16:24 16:46 TP 17:08 BV 17:30 BV 17:50 18:10 18:20 18:30 18:40 18:50 19:20 20:00 20:40 21:20 22:00 22:40"),
            ret: parseTimes("05:40 05:56 06:21 TP 06:41 BV 07:01 07:25 TP 07:50 08:15 08:35 08:55 09:15 09:35 09:55 10:15 10:35 10:55 11:15 11:35 11:55 12:15 12:35 12:55 13:15 13:35 13:55 14:15 14:35 14:55 15:15 15:35 15:50 16:01 16:12 16:23 16:34 16:45 16:55 17:05 17:15 17:25 17:35 17:45 17:55 18:05 18:15 18:25 18:40 19:05 19:30 20:00 20:35 21:15 21:55 23:05")
          },
          saturday:{
            go: parseTimes("05:00 05:25 05:45 06:05 06:25 06:45 07:05 07:25 07:45 08:05 08:25 08:45 09:05 09:25 09:45 10:05 10:25 10:45 11:05 11:25 11:45 12:05 12:25 12:45 13:05 13:25 13:45 14:05 14:25 14:45 15:05 15:25 15:45 16:05 16:25 16:45 TP 17:15 BV 17:45 BV 18:25 TP 19:05 19:45 20:25 21:15"),
            ret: parseTimes("05:40 06:05 06:25 TP 06:45 BV 07:05 BV 07:25 TP 07:45 08:05 08:25 08:45 09:05 09:25 09:45 10:05 10:25 10:45 11:05 11:25 11:45 12:05 12:25 12:45 13:05 13:25 13:45 14:05 14:25 14:45 15:05 15:25 15:45 16:05 16:25 17:05 17:45 18:25 19:05 19:45 20:35 21:35")
          },
          sunday:{
            go: parseTimes("05:00 05:55 06:45 07:30 08:30 09:30 10:30 11:50 12:50 13:50 14:50 15:50 17:10 18:50 20:30"),
            ret: parseTimes("05:40 06:40 07:50 08:50 09:50 11:10 12:10 13:10 14:10 15:10 16:30 18:10 19:50 21:35")
          }
        },
        corujao:{
          weekday:['00:00','01:00','03:30'],
          saturday:['23:00','00:00','03:30'],
          sunday:['23:00','00:00','03:30']
        }
      }
    };

    const LINE_ORDER=['pinheirinho','selmidei','imperador','valleverde'];
    const LINE_DISPLAY_NAME={pinheirinho:'Pinheirinho / Shopping',selmidei:'Selmi Dei',imperador:'Imperador',valleverde:'Valle Verde'};
    const DAYTYPE_NAME={weekday:'dias úteis',saturday:'sábado',sunday:'domingo e feriado'};

    const PERIODS=[{label:'Manhã',min:0,max:11*60+59},{label:'Tarde',min:12*60,max:17*60+59},{label:'Noite',min:18*60,max:24*60}];

    const DOM={
      go:{panel:document.getElementById('panel-go'),time:document.getElementById('smart-time-go'),count:document.getElementById('smart-count-go')},
      ret:{panel:document.getElementById('panel-ret'),time:document.getElementById('smart-time-ret'),count:document.getElementById('smart-count-ret')}
    };

    let currentLine='pinheirinho';
    let currentDaytype='weekday';

    function detectDaytype(){
      const dow=new Date().getDay();
      if(dow===0)return'sunday';
      if(dow===6)return'saturday';
      return'weekday';
    }

    function fmtCountdown(mins){if(mins<1)return'agora';if(mins<60)return`em ${mins} min`;const h=Math.floor(mins/60),m=mins%60;return m===0?`em ${h}h`:`em ${h}h ${m}min`;}

    function renderPanel(dir,buses,nowMins,nextBus,tagClassMap){
      let html='';
      for(const period of PERIODS){
        const inPeriod=buses.filter(b=>b.m>=period.min&&b.m<=period.max);
        if(!inPeriod.length)continue;
        html+=`<div class="time-section"><div class="period-label">${period.label}</div><div class="times-grid">`;
        inPeriod.forEach((bus,idx)=>{
          const isPast=bus.m<=nowMins,isNext=nextBus&&bus===nextBus;
          const cls=`time-pill reveal-pill ${isPast?'past':''} ${isNext?'next-'+dir:''}`;
          const tagHtml=bus.tag?`<span class="pill-tag ${(tagClassMap&&tagClassMap[bus.tag])||''}">${bus.tag}</span>`:'';
          const delay=idx*20;
          html+=`<div class="${cls}" style="animation-delay:${delay}ms">${bus.t}${tagHtml}</div>`;
        });
        html+=`</div></div>`;
      }
      DOM[dir].panel.innerHTML=html;
    }

    function updateSmartCard(dir,next,nowMins){
      const d=DOM[dir];
      if(!next){
        d.time.textContent='Encerrado';
        d.count.textContent='sem mais horários';
        d.time.style.fontSize='20px';
        d.time.style.color='var(--muted)';
      }else{
        d.time.textContent=next.t;
        d.count.textContent=fmtCountdown(next.m-nowMins);
        d.time.style.fontSize='';
        d.time.style.color='';
      }
    }

    function renderLegend(items){
      const el=document.getElementById('legend-items');
      el.innerHTML=items.map(it=>`<div class="legend-item"><div class="legend-dot ${it.cls||'plain'}">${it.code}</div>${it.desc}</div>`).join('');
    }

    function setLineButtons(){
      const wrap=document.getElementById('line-switcher');
      wrap.innerHTML=LINE_ORDER.map(id=>`<button class="line-btn${id===currentLine?' active':''}" data-line="${id}">${LINE_DISPLAY_NAME[id]}</button>`).join('');
      wrap.querySelectorAll('.line-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
          currentLine=btn.dataset.line;
          if(currentLine!=='pinheirinho')currentDaytype=detectDaytype();
          render();
        });
      });
    }

    function setDaytypeButtons(){
      document.querySelectorAll('.daytype-btn').forEach(btn=>{
        btn.classList.toggle('active',btn.dataset.daytype===currentDaytype);
        btn.onclick=()=>{currentDaytype=btn.dataset.daytype;render();};
      });
    }

    function renderPinheirinho(){
      document.getElementById('daytype-switcher').classList.add('hidden');
      document.getElementById('corujao-card').classList.add('hidden');
      document.getElementById('viewing-banner').classList.add('hidden');
      document.getElementById('smart-row').classList.remove('hidden');

      document.getElementById('smart-label-go-text').textContent='Terminal → Shopping';
      document.getElementById('smart-label-ret-text').textContent='Shopping → Terminal';
      document.getElementById('panel-title-go').textContent='Terminal → Shopping';
      document.getElementById('panel-title-ret').textContent='Shopping → Terminal';
      renderLegend(PINHEIRINHO_LEGEND);

      const existingAlert=document.getElementById('weekend-alert');
      if(existingAlert)existingAlert.remove();
      document.querySelectorAll('.bus-panel').forEach(p=>p.style.opacity='');

      const now=new Date(),nowMins=now.getHours()*60+now.getMinutes(),dow=now.getDay();
      const isWeekend=(dow===0||dow===6);

      ['go','ret'].forEach(dir=>{
        const nextBus=isWeekend?null:(PINHEIRINHO_BUSES[dir].find(b=>b.m>=nowMins)||null);
        renderPanel(dir,PINHEIRINHO_BUSES[dir],isWeekend?-1:nowMins,nextBus,PINHEIRINHO_TAG_CLASSES);
        updateSmartCard(dir,nextBus,nowMins);
        if(isWeekend)DOM[dir].count.textContent='Indisponível hoje';
      });

      if(isWeekend&&!document.getElementById('weekend-alert')){
        const alert=document.createElement('div');
        alert.id='weekend-alert';
        alert.style.cssText='background:var(--accent-lt); color:var(--accent); padding:16px; border-radius:var(--radius); margin-bottom:24px; font-weight:700; text-align:center; border:1px solid var(--border); animation: fadeUp 0.4s ease;';
        alert.innerHTML='⚠️ Atenção: Esta linha de ônibus não opera aos sábados e domingos.';
        document.querySelector('main').prepend(alert);
        document.querySelectorAll('.bus-panel').forEach(p=>p.style.opacity='0.5');
      }
    }

    function renderOtherLine(){
      const existingAlert=document.getElementById('weekend-alert');
      if(existingAlert)existingAlert.remove();
      document.querySelectorAll('.bus-panel').forEach(p=>p.style.opacity='');

      const line=LINES[currentLine];
      document.getElementById('daytype-switcher').classList.remove('hidden');
      setDaytypeButtons();

      document.getElementById('smart-label-go-text').textContent=line.labels.go;
      document.getElementById('smart-label-ret-text').textContent=line.labels.ret;
      document.getElementById('panel-title-go').textContent=line.labels.go;
      document.getElementById('panel-title-ret').textContent=line.labels.ret;
      renderLegend(line.legend.map(l=>({cls:'plain',code:l.code,desc:l.desc})));

      const data=line.schedules[currentDaytype];
      const isToday=(currentDaytype===detectDaytype());
      const banner=document.getElementById('viewing-banner');
      const smartRow=document.getElementById('smart-row');

      if(isToday){
        banner.classList.add('hidden');
        smartRow.classList.remove('hidden');
      }else{
        banner.classList.remove('hidden');
        banner.textContent=`Mostrando horários de ${DAYTYPE_NAME[currentDaytype]} (não é o tipo de dia de hoje).`;
        smartRow.classList.add('hidden');
      }

      const now=new Date(),nowMins=now.getHours()*60+now.getMinutes();

      ['go','ret'].forEach(dir=>{
        const nextBus=isToday?(data[dir].find(b=>b.m>=nowMins)||null):null;
        renderPanel(dir,data[dir],isToday?nowMins:-1,nextBus,null);
        if(isToday)updateSmartCard(dir,nextBus,nowMins);
      });

      const corujaoCard=document.getElementById('corujao-card');
      corujaoCard.classList.remove('hidden');
      document.getElementById('corujao-times').innerHTML=line.corujao[currentDaytype].map(t=>`<span class="corujao-pill">${t}</span>`).join('');
    }

    function render(){
      setLineButtons();
      if(currentLine==='pinheirinho'){
        renderPinheirinho();
      }else{
        renderOtherLine();
      }
    }

    render();
    setInterval(render,30000);

    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')render();
    });
    window.addEventListener('pageshow',(e)=>{
      if(e.persisted)render();
    });
