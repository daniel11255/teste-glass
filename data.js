/* Dados compartilhados: grade, disciplinas, atendimento e eventos do calendário */
const SUBJECTS={'ARQART1':{name:'Artes',cls:'s-art',dot:'#F97316'},'ARQINCP':{name:'Intro. Computação',cls:'s-incp',dot:'#3B82F6'},'ARQLPR1':{name:'Língua Portuguesa',cls:'s-lpr',dot:'#10B981'},'ARQPROG':{name:'Programação',cls:'s-prog',dot:'#8B5CF6'},'ARQGEO1':{name:'Geografia',cls:'s-geo',dot:'#14B8A6'},'ARQING1':{name:'Inglês',cls:'s-ing',dot:'#F59E0B'},'ARQEFI1':{name:'Ed. Física',cls:'s-efi',dot:'#F43F5E'},'ARQIWB1':{name:'Interfaces Web',cls:'s-iwb',dot:'#6366F1'},'ARQMAT1':{name:'Matemática',cls:'s-mat',dot:'#EC4899'},'ARQFIS1':{name:'Física',cls:'s-fis',dot:'#0EA5E9'},'ARQFIL1':{name:'Filosofia',cls:'s-fil',dot:'#84CC16'}};
const GRADE={1:[{start:'12:35',end:'14:15',code:'ARQART1'},{start:'14:25',end:'16:05',code:'ARQGEO1'},{start:'16:20',end:'18:00',code:'ARQMAT1'}],2:[{start:'12:35',end:'14:15',code:'ARQINCP'},{start:'14:25',end:'16:05',code:'ARQING1'},{start:'16:20',end:'18:00',code:'ARQFIS1'}],3:[{start:'14:25',end:'16:05',code:'ARQEFI1'},{start:'16:20',end:'18:00',code:'ARQFIL1'}],4:[{start:'12:35',end:'14:15',code:'ARQLPR1'},{start:'14:25',end:'16:05',code:'ARQIWB1'}],5:[{start:'12:35',end:'16:05',code:'ARQPROG'},{start:'16:20',end:'18:00',code:'ARQMAT1'}]};

/**
 * Portal 1INFO-2 — Dados compartilhados e storage de eventos
 */

// ── HORÁRIOS DE ATENDIMENTO ───────────────────────────────────
window.horariosAtendimento = [
  { professor: 'Anderson',         materia: 'Filosofia',               horario: 'Quarta-feira 18h10 às 19h10',                             sala: 'J202',                        email: 'anderson.lima@ifsp.edu.br'    },
  { professor: 'Carina',           materia: 'Português',               horario: 'Segunda-feira das 11h35 às 12h35',                        sala: 'J214',                        email: 'carina.zanelato@ifsp.edu.br'  },
  { professor: 'Caroline Orsi',    materia: 'Geografia',               horario: 'Sexta-feira 10h40 às 11h40',                              sala: 'J202',                        email: 'caroline.orsi@ifsp.edu.br'    },
  { professor: 'Denise',           materia: 'Inglês',                  horario: 'Quarta-feira das 8h35 às 9h35',                           sala: 'J214',                        email: 'deniseemidio@ifsp.edu.br'     },
  { professor: 'Fabiana',          materia: 'Educação Física',         horario: 'Quarta-feira e Quinta-feira 18h às 19h',                  sala: 'J214',                        email: 'fabiana.freitas@ifsp.edu.br'  },
  { professor: 'Gustavo',          materia: 'Introdução à computação', horario: 'Quarta-feira das 10h35 às 12:35',                         sala: 'I105',                        email: 'gus@ifsp.edu.br'              },
  { professor: 'Helien',           materia: 'Introdução à computação', horario: 'Segunda-feira 12h00 às 12h30 e Quinta-feira 18h30 às 19h', sala: 'INFO1 (2ª feira); INFO3 (5ª feira)', email: 'helien@ifsp.edu.br'    },
  { professor: 'José Arnaldo',     materia: 'Interfaces Web',          horario: 'Quarta-feira das 16h às 17h',                             sala: 'J204',                        email: 'arnaldomh@ifsp.edu.br'        },
  { professor: 'Juliana',          materia: 'Artes',                   horario: 'Sexta-feira das 11h às 12h',                              sala: 'J202',                        email: 'juliana.leitao@ifsp.edu.br'   },
  { professor: 'Jurandyr',         materia: 'Física',                  horario: 'Quarta-feira das 11h30 às 12h30',                         sala: 'J215',                        email: 'jurandyr@ifsp.edu.br'         },
  { professor: 'Marcos Fernandes', materia: 'Matemática',              horario: 'Quarta-feira das 11h00 às 12h00',                         sala: 'J212',                        email: 'marcos.fernandes@ifsp.edu.br' },
  { professor: 'Marcos Ribeiro',   materia: 'Física',                  horario: 'Quinta-feira das 10h00 às 11h00',                         sala: 'J215',                        email: 'marcosrs@ifsp.edu.br'         },
  { professor: 'Mauro',            materia: 'Programação',             horario: 'Quarta-feira das 11h35 às 12h35',                         sala: 'J203 (ou cantina)',           email: 'mauro.lucca@ifsp.edu.br'      },
  { professor: 'Mário Popolin',    materia: 'Programação',             horario: 'Quinta-feira 11h35 às 12h35',                             sala: 'INFO1',                       email: 'mariopopolin@ifsp.edu.br'     },
  { professor: 'Ricardo',          materia: 'Interfaces Web',          horario: '----',                                                    sala: '----',                        email: 'balieiro.ricador@ifsp.edu.br' },
  { professor: 'Roberta',          materia: 'Interfaces Web',          horario: 'Terça-feira das 18h às 19h',                              sala: 'J207 ou INFO3',               email: 'roberta.sinoara@ifsp.edu.br'  }
];

// ── SÁBADOS LETIVOS ────────────────────────────────────────────
// Mapa de data ISO → número do dia da semana que será seguido (1=Seg … 5=Sex)
window.sabadosLetivos = {
  '2026-05-30': 5
};

// ── CATEGORIAS DO CALENDÁRIO ──────────────────────────────────
window.portalCalendarCategories = {
  evento:         { label: 'Evento',         color: 'var(--accent)', soft: 'var(--accent-lt)' },
  'sabado-letivo':{ label: 'Sábado letivo',  color: '#10B981', soft: 'var(--green-lt)' }
};

// ── EVENTOS PADRÃO ────────────────────────────────────────────
window.portalCalendarDefaults = [
  {
    id: 'default-prova-matematica',
    title: 'Prova de Matemática',
    date: '2026-05-22',
    horario: '16:20 às 18:00',
    category: 'evento',
    subject: 'Matemática',
    description: 'Avaliação bimestral. Conferir conteúdos combinados em sala.',
    links: [],
    attachments: []
  },
  {
    id: 'default-atividade-web',
    title: 'Entrega de atividade de Interfaces Web',
    date: '2026-05-28',
    horario: '14:25 às 16:05',
    category: 'evento',
    subject: 'Interfaces Web',
    description: 'Finalizar a atividade prática e revisar responsividade antes da entrega.',
    links: [{ label: 'SUAP', url: 'https://suap.ifsp.edu.br/' }],
    attachments: []
  },
  {
    id: 'default-sabado-letivo',
    title: 'Sábado letivo',
    date: '2026-05-30',
    horario: '12:35 às 18:00',
    category: 'sabado-letivo',
    description: 'Reposição letiva seguindo a grade de sexta-feira.',
    links: [],
    attachments: []
  }
];

// ── STORAGE DE EVENTOS ────────────────────────────────────────
(function () {
  const STORAGE_KEY = 'portalCalendarEvents:v1';

  /**
   * Lê eventos salvos no localStorage.
   * @returns {Array<object>}
   */
  function readStoredCalendarEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[Portal] Erro ao ler eventos salvos.', e);
      return [];
    }
  }

  /**
   * Persiste array de eventos no localStorage.
   * @param {Array<object>} events
   * @returns {boolean}
   */
  function saveStoredCalendarEvents(events) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(events) ? events : []));
      return true;
    } catch (e) {
      console.warn('[Portal] Erro ao salvar eventos.', e);
      return false;
    }
  }

  /**
   * Retorna lista final de eventos (defaults + customizações), ordenada por data e horário.
   * @returns {Array<object>}
   */
  function getPortalCalendarEvents() {
    const byId = new Map(window.portalCalendarDefaults.map(ev => [ev.id, ev]));
    readStoredCalendarEvents().forEach(ev => {
      if (!ev || !ev.id) return;
      if (ev.deleted) byId.delete(ev.id);
      else byId.set(ev.id, ev);
    });
    return [...byId.values()].sort((a, b) => {
      const dc = String(a.date || '').localeCompare(String(b.date || ''));
      return dc !== 0 ? dc : String(a.horario || '').localeCompare(String(b.horario || ''));
    });
  }

  /**
   * Exclui múltiplos eventos por ID (marca como deletados).
   * @param {string[]} ids
   * @returns {boolean}
   */
  function deleteCalendarEvents(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return false;
    const stored = readStoredCalendarEvents();
    const map = new Map(stored.map(e => [e.id, e]));
    ids.forEach(id => map.set(id, { ...(map.get(id) || { id }), deleted: true }));
    return saveStoredCalendarEvents([...map.values()]);
  }

  window.calendarStorageKey    = STORAGE_KEY;
  window.readStoredCalendarEvents  = readStoredCalendarEvents;
  window.saveStoredCalendarEvents  = saveStoredCalendarEvents;
  window.getPortalCalendarEvents   = getPortalCalendarEvents;
  window.deleteCalendarEvents      = deleteCalendarEvents;
})();
