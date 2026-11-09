/**
 * data.js — Modelo de dados, estado inicial, localStorage, Exportar/Importar JSON
 * Chave de armazenamento: escola-horarios-v6
 */

const CHAVE_STORAGE = 'escola-horarios-v6';

const estadoInicial = () => ({
  versao: 6,
  series: [
    { id: 's1', nome: '6º ano', tipo: 'grade', diasUteis: 5 },
    { id: 's2', nome: '7º ano', tipo: 'grade', diasUteis: 5 },
    { id: 's3', nome: '8º ano', tipo: 'grade', diasUteis: 5 },
    { id: 's4', nome: '9º ano', tipo: 'grade', diasUteis: 5 },
    { id: 's5', nome: '1ª série', tipo: 'grade', diasUteis: 6 },
    { id: 's6', nome: '2ª série', tipo: 'grade', diasUteis: 6 },
    { id: 's7', nome: '3ª série', tipo: 'grade', diasUteis: 6 },
    { id: 's8', nome: 'PROEJA', tipo: 'bloco_unico', diasUteis: 5 },
    { id: 's9', nome: 'Graduação', tipo: 'bloco_unico', diasUteis: 5 }
  ],
  turmas: [
    { id: 'tm1', serieId: 's1', nome: '601', turno: 'manhã' },
    { id: 'tm2', serieId: 's1', nome: '603', turno: 'manhã' },
    { id: 'tm3', serieId: 's1', nome: '602', turno: 'tarde' },
    { id: 'tm4', serieId: 's1', nome: '604', turno: 'tarde' },
    { id: 'tm5', serieId: 's1', nome: '606', turno: 'tarde' },
    { id: 'tm6', serieId: 's2', nome: '701', turno: 'manhã' },
    { id: 'tm7', serieId: 's2', nome: '703', turno: 'manhã' },
    { id: 'tm8', serieId: 's2', nome: '702', turno: 'tarde' },
    { id: 'tm9', serieId: 's2', nome: '704', turno: 'tarde' },
    { id: 'tm10', serieId: 's3', nome: '801', turno: 'manhã' },
    { id: 'tm11', serieId: 's3', nome: '803', turno: 'manhã' },
    { id: 'tm12', serieId: 's3', nome: '805', turno: 'manhã' },
    { id: 'tm13', serieId: 's3', nome: '802', turno: 'tarde' },
    { id: 'tm14', serieId: 's3', nome: '804', turno: 'tarde' },
    { id: 'tm15', serieId: 's3', nome: '806', turno: 'tarde' },
    { id: 'tm16', serieId: 's4', nome: '901', turno: 'manhã' },
    { id: 'tm17', serieId: 's4', nome: '903', turno: 'manhã' },
    { id: 'tm18', serieId: 's4', nome: '905', turno: 'manhã' },
    { id: 'tm19', serieId: 's4', nome: '902', turno: 'tarde' },
    { id: 'tm20', serieId: 's4', nome: '904', turno: 'tarde' },
    { id: 'tm21', serieId: 's5', nome: '1101', turno: 'manhã' },
    { id: 'tm22', serieId: 's5', nome: '1103', turno: 'manhã' },
    { id: 'tm23', serieId: 's5', nome: '1105', turno: 'manhã' },
    { id: 'tm24', serieId: 's5', nome: '1107', turno: 'manhã' },
    { id: 'tm25', serieId: 's5', nome: '2102', turno: 'tarde' },
    { id: 'tm26', serieId: 's5', nome: '2104', turno: 'tarde' },
    { id: 'tm27', serieId: 's5', nome: '2106', turno: 'tarde' },
    { id: 'tm28', serieId: 's5', nome: '2108', turno: 'tarde' },
    { id: 'tm29', serieId: 's5', nome: '2110', turno: 'tarde' },
    { id: 'tm30', serieId: 's5', nome: '2112', turno: 'tarde' },
    { id: 'tm31', serieId: 's6', nome: '1201', turno: 'manhã' },
    { id: 'tm32', serieId: 's6', nome: '1203', turno: 'manhã' },
    { id: 'tm33', serieId: 's6', nome: '1205', turno: 'manhã' },
    { id: 'tm34', serieId: 's6', nome: '1207', turno: 'manhã' },
    { id: 'tm35', serieId: 's6', nome: '2202', turno: 'tarde' },
    { id: 'tm36', serieId: 's6', nome: '2204', turno: 'tarde' },
    { id: 'tm37', serieId: 's6', nome: '2206', turno: 'tarde' },
    { id: 'tm38', serieId: 's6', nome: '2208', turno: 'tarde' },
    { id: 'tm39', serieId: 's6', nome: '2210', turno: 'tarde' },
    { id: 'tm40', serieId: 's7', nome: '1301', turno: 'manhã' },
    { id: 'tm41', serieId: 's7', nome: '1303', turno: 'manhã' },
    { id: 'tm42', serieId: 's7', nome: '1305', turno: 'manhã' },
    { id: 'tm43', serieId: 's7', nome: '1307', turno: 'manhã' },
    { id: 'tm44', serieId: 's7', nome: '1309', turno: 'manhã' },
    { id: 'tm45', serieId: 's7', nome: '1311', turno: 'manhã' },
    { id: 'tm46', serieId: 's7', nome: '2302', turno: 'tarde' },
    { id: 'tm47', serieId: 's7', nome: '2304', turno: 'tarde' },
    { id: 'tm48', serieId: 's8', nome: 'PROEJA', turno: 'noite' },
    { id: 'tm49', serieId: 's9', nome: 'GRADUAÇÃO', turno: 'noite' }
  ],
  disciplinas: [
    { id: 'd1', nome: 'Português' },
    { id: 'd2', nome: 'Matemática' },
    { id: 'd3', nome: 'História' },
    { id: 'd4', nome: 'Geografia' },
    { id: 'd5', nome: 'Ciências' },
    { id: 'd6', nome: 'Artes' },
    { id: 'd7', nome: 'Desenho' },
    { id: 'd8', nome: 'Música' },
    { id: 'd9', nome: 'Ed. Física' },
    { id: 'd10', nome: 'Inglês' },
    { id: 'd11', nome: 'Francês' },
    { id: 'd12', nome: 'Espanhol' },
    { id: 'd13', nome: 'Biologia' },
    { id: 'd14', nome: 'Física' },
    { id: 'd15', nome: 'Química' },
    { id: 'd16', nome: 'Filosofia' },
    { id: 'd17', nome: 'Sociologia' },
    { id: 'd18', nome: 'Informática' }
  ],
  cargas: [],          // { id, turmaId, disciplinaId, qtd }
  professores: [],     // { id, nome, disciplinaId, serieIds, cargaMax, disponibilidade: [{dia,turno}], restricoes: [{dia,inicio,fim}] }
  blocos: [],          // preenchido por padrão (grade da escola)
  grade: [],           // { id, turmaId, disciplinaId, professorId, blocoId, turno, dia, ehContraTurno: bool }
  diasSemana: 5,
  ultimaGeracao: null
});

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- Persistência ----------

function gerarBlocosPadrao() {
  const blocos = [];
  const add = (dia, turno, inicio, fim, intervalo = false) => blocos.push({ id: gerarId(), dia, turno, inicio, fim, duracao: 40, intervalo });
  const dias = ['segunda','terça','quarta','quinta','sexta'];
  dias.forEach(dia => {
    // Manhã: 07:00-12:00, intervalo 20min às 09:40
    add(dia,'manhã','07:00','07:40');
    add(dia,'manhã','07:40','08:20');
    add(dia,'manhã','08:20','09:00');
    add(dia,'manhã','09:00','09:40');
    add(dia,'manhã','09:40','10:00', true); // Intervalo manhã
    add(dia,'manhã','10:00','10:40');
    add(dia,'manhã','10:40','11:20');
    add(dia,'manhã','11:20','12:00');
    // Tarde: 13:00-18:00, intervalo 20min às 15:40
    add(dia,'tarde','13:00','13:40');
    add(dia,'tarde','13:40','14:20');
    add(dia,'tarde','14:20','15:00');
    add(dia,'tarde','15:00','15:40');
    add(dia,'tarde','15:40','16:00', true); // Intervalo tarde
    add(dia,'tarde','16:00','16:40');
    add(dia,'tarde','16:40','17:20');
    add(dia,'tarde','17:20','18:00');
  });
  return blocos;
}

function carregarEstado() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE);
    if (!raw) {
      const estado = estadoInicial();
      estado.blocos = gerarBlocosPadrao();
      return estado;
    }
    const estado = JSON.parse(raw);
    const base = estadoInicial();
    // Garante que séries e turmas padrão estejam sempre presentes
    if (!estado.series || estado.series.length === 0) estado.series = base.series;
    if (!estado.turmas || estado.turmas.length === 0) estado.turmas = base.turmas;
    // Garante blocos padrão se não houver
    if (!estado.blocos || estado.blocos.length === 0) estado.blocos = gerarBlocosPadrao();
    // Garante campos mínimos caso venha de versão antiga
    return { ...base, ...estado };
  } catch (e) {
    console.error('Erro ao ler localStorage:', e);
    const estado = estadoInicial();
    estado.blocos = gerarBlocosPadrao();
    return estado;
  }
}

function salvarEstado(estado) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
}

// ---------- CRUD genérico ---------;

function adicionar(estado, tipo, entidade) {
  const item = { id: gerarId(), ...entidade };
  estado[tipo].push(item);
  salvarEstado(estado);
  return item;
}

function editar(estado, tipo, id, dados) {
  const idx = estado[tipo].findIndex(x => x.id === id);
  if (idx === -1) return false;
  estado[tipo][idx] = { ...estado[tipo][idx], ...dados, id };
  salvarEstado(estado);
  return true;
}

function remover(estado, tipo, id) {
  const idx = estado[tipo].findIndex(x => x.id === id);
  if (idx === -1) return false;
  const removido = estado[tipo].splice(idx, 1)[0];
  // Limpa referências na grade se for série, disciplina, professor ou bloco
  if (tipo === 'series' || tipo === 'disciplinas' || tipo === 'professores' || tipo === 'blocos') {
    const campoMap = { series: 'serieId', disciplinas: 'disciplinaId', professores: 'professorId', blocos: 'blocoId' };
    const campo = campoMap[tipo];
    estado.grade = estado.grade.filter(g => g[campo] !== id);
  }
  salvarEstado(estado);
  return removido;
}

// ---------- Exportar / Importar JSON ----------

function exportarJSON() {
  const estado = carregarEstado();
  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `escola-horarios-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importarJSON(texto) {
  try {
    const estado = JSON.parse(texto);
    if (!estado || typeof estado !== 'object') throw new Error('JSON inválido');
    // Valida campos mínimos
    const base = estadoInicial();
    const chaves = Object.keys(base);
    for (const k of chaves) {
      if (!(k in estado)) estado[k] = base[k];
    }
    salvarEstado(estado);
    return { sucesso: true, estado };
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

class AppData {
  constructor() {
    this.estado = carregarEstado();
    this.undo = null; // { tipo, id, entidade } para desfazer remoção
  }

  get estadoAtual() { return this.estado; }

  // Séries
  addSerie(nome, tipo, diasUteis) {
    return adicionar(this.estado, 'series', { nome, tipo, diasUteis: Number(diasUteis) });
  }
  editSerie(id, dados) { return editar(this.estado, 'series', id, dados); }
  removeSerie(id) {
    const removido = remover(this.estado, 'series', id);
    if (removido) this.undo = { tipo: 'series', id, entidade: removido };
    return removido;
  }

  // Turmas
  addTurma(serieId, nome, turno) {
    return adicionar(this.estado, 'turmas', { serieId, nome, turno });
  }
  editTurma(id, dados) { return editar(this.estado, 'turmas', id, dados); }
  removeTurma(id) {
    const removido = remover(this.estado, 'turmas', id);
    if (removido) this.undo = { tipo: 'turmas', id, entidade: removido };
    return removido;
  }

  // Disciplinas
  addDisciplina(nome) {
    return adicionar(this.estado, 'disciplinas', { nome });
  }
  editDisciplina(id, dados) { return editar(this.estado, 'disciplinas', id, dados); }
  removeDisciplina(id) {
    const removido = remover(this.estado, 'disciplinas', id);
    if (removido) this.undo = { tipo: 'disciplinas', id, entidade: removido };
    return removido;
  }

  // Cargas
  addCarga(serieId, disciplinaId, qtd) {
    return adicionar(this.estado, 'cargas', { serieId, disciplinaId, qtd: Number(qtd) });
  }
  editCarga(id, dados) { return editar(this.estado, 'cargas', id, dados); }
  removeCarga(id) {
    const removido = remover(this.estado, 'cargas', id);
    if (removido) this.undo = { tipo: 'cargas', id, entidade: removido };
    return removido;
  }

  // Professores
  addProfessor(dados) {
    return adicionar(this.estado, 'professores', {
      nome: dados.nome,
      disciplinaId: dados.disciplinaId,
      serieIds: dados.serieIds || [dados.serieId],
      cargaMax: Number(dados.cargaMax),
      disponibilidade: dados.disponibilidade || [],
      restricoes: dados.restricoes || []
    });
  }
  editProfessor(id, dados) { return editar(this.estado, 'professores', id, dados); }
  removeProfessor(id) {
    const removido = remover(this.estado, 'professores', id);
    if (removido) this.undo = { tipo: 'professores', id, entidade: removido };
    return removido;
  }

  // Blocos
  addBloco(dados) {
    return adicionar(this.estado, 'blocos', {
      dia: dados.dia,
      turno: dados.turno,
      inicio: dados.inicio,
      fim: dados.fim,
      duracao: 40
    });
  }
  editBloco(id, dados) { return editar(this.estado, 'blocos', id, dados); }
  removeBloco(id) {
    const removido = remover(this.estado, 'blocos', id);
    if (removido) this.undo = { tipo: 'blocos', id, entidade: removido };
    return removido;
  }

  // Undo
  desfazerRemocao() {
    if (!this.undo) return false;
    const { tipo, id, entidade } = this.undo;
    this.estado[tipo].push(entidade);
    salvarEstado(this.estado);
    this.undo = null;
    return true;
  }

  temUndo() { return !!this.undo; }

  // Export / Import
  exportarJSON() { exportarJSON(); }
  importarJSON(texto) {
    const resultado = importarJSON(texto);
    if (resultado.sucesso) this.estado = resultado.estado;
    return resultado;
  }
}

window.AppData = AppData;