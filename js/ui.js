/**
 * ui.js — Interface: abas, CRUD, renderização, busca, undo, modal
 */

class App {
  constructor() {
    this.data = new AppData();
    this.modalAberto = false;
    this.modalId = null;
    this.importador = window.importador || null;
    this.init();
  }

  init() {
    this.bindTabs();
    this.renderTodas();
    this.gerarBlocosPadraoSeVazio();
  }

  // ---------- Abas ----------

  bindTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
        this.renderTab(btn.dataset.tab);
      });
    });
  }

  renderTodas() {
    this.renderMatriz();
    this.renderSeries();
    this.renderDisciplinas();
    this.renderCargas();
    this.renderTurmas();
    this.renderProfessores();
    this.renderPrioridade();
    this.renderBlocos();
  }

  renderTab(tab) {
    if (tab === 'matriz') this.renderMatriz();
    if (tab === 'disciplinas') this.renderDisciplinas();
    if (tab === 'cargas') this.renderCargas();
    if (tab === 'turmas') this.renderTurmas();
    if (tab === 'professores') this.renderProfessores();
    if (tab === 'prioridade') this.renderPrioridade();
    if (tab === 'blocos') this.renderBlocos();
    if (tab === 'quadro') this.renderQuadro();
    if (tab === 'cartoes') this.renderCartoes();
  }

  // ---------- Dark mode ----------

  initDarkMode() {
    const dark = localStorage.getItem('escola-horarios-dark-mode') === 'true';
    if (dark) {
      document.body.classList.add('dark-mode');
      const btn = document.getElementById('btn-dark-mode');
      if (btn) btn.textContent = '☀️';
    }
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('escola-horarios-dark-mode', isDark);
    const btn = document.getElementById('btn-dark-mode');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  }

  // ---------- Matriz ----------

  renderMatriz() {
    const e = this.data.estadoAtual;
    document.getElementById('matriz-series').textContent = e.series.length;
    document.getElementById('matriz-turmas').textContent = e.turmas.length;
    document.getElementById('matriz-disciplinas').textContent = e.disciplinas.length;
    document.getElementById('matriz-cargas').textContent = e.cargas.length;
    document.getElementById('matriz-professores').textContent = e.professores.length;
    document.getElementById('matriz-blocos').textContent = e.blocos.length;
  }

  // ---------- Séries ----------

  renderSeries() {
    const e = this.data.estadoAtual;
    const el = document.getElementById('lista-series');
    if (!el) return;
    el.innerHTML = '';
    if (e.series.length === 0) { el.innerHTML = '<div class="item"><span>Nenhuma série cadastrada.</span></div>'; return; }
    e.series.forEach(s => {
      el.innerHTML += '<div class="item"><div class="info"><strong>' + this.esc(s.nome) + '</strong><br><small>Tipo: ' + s.tipo + ' · Dias úteis: ' + s.diasUteis + '</small></div><div class="actions"><button class="btn btn-small" onclick="app.editarSerie(\'' + s.id + '\')">Editar</button><button class="btn btn-small btn-danger" onclick="app.removerSerie(\'' + s.id + '\')">Remover</button></div></div>';
    });
  }

  abrirModalSerie(id = null) {
    const s = id ? this.data.estadoAtual.series.find(x => x.id === id) : null;
    this.abrirModalHtml('serie', id,
      '<label>Nome da Série</label><input name="nome" value="' + (s ? s.nome : '') + '" type="text" required>' +
      '<label>Tipo</label><select name="tipo" required>' +
      '<option value="grade"' + (s && s.tipo === 'grade' ? ' selected' : '') + '>Grade</option>' +
      '<option value="bloco_unico"' + (s && s.tipo === 'bloco_unico' ? ' selected' : '') + '>Bloco Único</option>' +
      '</select>' +
      '<label>Dias Úteis</label><input name="diasUteis" type="number" min="1" max="6" value="' + (s ? s.diasUteis : 5) + '" required>',
      id ? 'Editar Série' : 'Nova Série',
      (fd) => { this.salvarSerie(fd); }
    );
  }

  async editarSerie(id) { this.abrirModalSerie(id); }

  async removerSerie(id) {
    if (!confirm('Remover esta série? Turmas vinculadas também serão afetadas.')) return;
    this.data.removeSerie(id);
    this.mostrarUndo('Série removida', () => this.data.desfazerRemocao());
    this.renderTodas();
  }

  salvarSerie(fd) {
    const nome = fd.get('nome');
    const tipo = fd.get('tipo');
    const diasUteis = fd.get('diasUteis');
    if (!nome || !tipo || !diasUteis) return alert('Preencha todos os campos.');
    const id = this.modalId;
    if (id) this.data.editSerie(id, { nome: nome, tipo: tipo, diasUteis: Number(diasUteis) });
    else this.data.addSerie(nome, tipo, Number(diasUteis));
    this.renderTodas();
    this.fecharModal();
  }

  // ---------- Disciplinas ----------

  renderDisciplinas() {
    const termo = document.getElementById('busca-disciplinas').value;
    const lista = this.filtrar(this.data.estadoAtual.disciplinas, termo, ['nome']);
    const el = document.getElementById('lista-disciplinas');
    el.innerHTML = '';
    if (lista.length === 0) { el.innerHTML = '<div class="item"><span>Nenhuma disciplina encontrada.</span></div>'; return; }
    lista.forEach(d => {
      el.innerHTML += '<div class="item"><div class="info"><strong>' + this.esc(d.nome) + '</strong></div><div class="actions"><button class="btn btn-small" onclick="app.editarDisciplina(\'' + d.id + '\')">Editar</button><button class="btn btn-small btn-danger" onclick="app.removerDisciplina(\'' + d.id + '\')">Remover</button></div></div>';
    });
  }

  abrirModalDisciplina(id = null) {
    const d = id ? this.data.estadoAtual.disciplinas.find(x => x.id === id) : null;
    this.abrirModalHtml('disciplina', id,
      '<label>Nome da Disciplina</label><input name="nome" value="' + (d ? d.nome : '') + '" type="text" required>',
      id ? 'Editar Disciplina' : 'Nova Disciplina',
      (fd) => { this.salvarDisciplina(fd); }
    );
  }

  async editarDisciplina(id) { this.abrirModalDisciplina(id); }

  async removerDisciplina(id) {
    if (!confirm('Remover esta disciplina? Cargas e professores vinculados também serão afetados.')) return;
    this.data.removeDisciplina(id);
    this.mostrarUndo('Disciplina removida', () => this.data.desfazerRemocao());
    this.renderTodas();
  }

  salvarDisciplina(formData) {
    const nome = formData.get('nome');
    if (!nome) return alert('Nome é obrigatório.');
    const id = this.modalId;
    if (id) this.data.editDisciplina(id, { nome });
    else this.data.addDisciplina(nome);
    this.renderTodas();
    this.fecharModal();
  }

  // ---------- Cargas ----------

  renderCargas() {
    const termo = document.getElementById('busca-cargas').value;
    const e = this.data.estadoAtual;
    const lista = this.filtrar(e.cargas, termo, ['serieId', 'disciplinaId', 'qtd'])
      .map(c => {
        const serie = e.series.find(s => s.id === c.serieId);
        const disc = e.disciplinas.find(d => d.id === c.disciplinaId);
        return { ...c, serieNome: serie ? serie.nome : '—', discNome: disc ? disc.nome : '—' };
      });
    const el = document.getElementById('lista-cargas');
    el.innerHTML = '';
    if (lista.length === 0) { el.innerHTML = '<div class="item"><span>Nenhuma carga encontrada.</span></div>'; return; }
    lista.forEach(c => {
      el.innerHTML += '<div class="item"><div class="info"><strong>' + c.serieNome + '</strong> × <strong>' + c.discNome + '</strong> — ' + c.qtd + ' aula(s)/semana</div><div class="actions"><button class="btn btn-small" onclick="app.editarCarga(\'' + c.id + '\')">Editar</button><button class="btn btn-small btn-danger" onclick="app.removerCarga(\'' + c.id + '\')">Remover</button></div></div>';
    });
  }

  abrirModalCarga(id = null) {
    const e = this.data.estadoAtual;
    const c = id ? e.cargas.find(x => x.id === id) : null;
    if (e.series.length === 0) return alert('Cadastre séries primeiro.');
    if (e.disciplinas.length === 0) return alert('Cadastre disciplinas primeiro.');
    const serieOpts = e.series.map(s => '<option value="' + s.id + '"' + (c && c.serieId === s.id ? ' selected' : '') + '>' + s.nome + '</option>').join('');
    const discOpts = e.disciplinas.map(d => '<option value="' + d.id + '"' + (c && c.disciplinaId === d.id ? ' selected' : '') + '>' + d.nome + '</option>').join('');
    this.abrirModalHtml('carga', id,
      '<label>Série</label><select name="serieId" required>' + serieOpts + '</select>' +
      '<label>Disciplina</label><select name="disciplinaId" required>' + discOpts + '</select>' +
      '<label>Aulas/semana</label><input name="qtd" type="number" min="1" max="6" value="' + (c ? c.qtd : '') + '" required>' +
      '<label style="grid-column:1/-1;display:flex;align-items:center;gap:0.5rem;"><input type="checkbox" name="duplicarSeries" style="width:1.2rem;height:1.2rem;margin:0;"><span>Duplicar esta carga para todas as outras séries (mesma disciplina e qtd)</span></label>',
      id ? 'Editar Carga' : 'Nova Carga',
      (fd) => { this.salvarCarga(fd); }
    );
  }

  async editarCarga(id) { this.abrirModalCarga(id); }

  async removerCarga(id) {
    if (!confirm('Remover esta carga?')) return;
    this.data.removeCarga(id);
    this.mostrarUndo('Carga removida', () => this.data.desfazerRemocao());
    this.renderTodas();
  }

  salvarCarga(fd) {
    const serieId = fd.get('serieId');
    const disciplinaId = fd.get('disciplinaId');
    const qtd = fd.get('qtd');
    const duplicar = fd.get('duplicarSeries') === 'on';
    if (!serieId || !disciplinaId || !qtd || qtd < 1) return alert('Preencha todos os campos corretamente.');
    const q = Number(qtd);
    const id = this.modalId;
    if (id) {
      this.data.editCarga(id, { serieId: serieId, disciplinaId: disciplinaId, qtd: q });
    } else {
      this.data.addCarga(serieId, disciplinaId, q);
      if (duplicar) {
        const e = this.data.estadoAtual;
        const series = e.series.filter(s => s.tipo === 'grade');
        const existente = new Set(e.cargas.map(c => c.serieId + '|' + c.disciplinaId));
        series.forEach(s => {
          const chave = s.id + '|' + disciplinaId;
          if (s.id !== serieId && !existente.has(chave)) {
            this.data.addCarga(s.id, disciplinaId, q);
          }
        });
      }
    }
    this.renderTodas();
    this.fecharModal();
  }

  // ---------- Turmas ----------

  renderTurmas() {
    const e = this.data.estadoAtual;
    const el = document.getElementById('lista-turmas');
    el.innerHTML = '';
    if (e.turmas.length === 0) { el.innerHTML = '<div class="item"><span>Nenhuma turma cadastrada.</span></div>'; return; }
    e.turmas.forEach(t => {
      const serie = e.series.find(s => s.id === t.serieId);
      el.innerHTML += '<div class="item"><div class="info"><strong>' + this.esc(t.nome) + '</strong><br><small>Série: ' + (serie ? serie.nome : '—') + ' · Turno: ' + t.turno + '</small></div><div class="actions"><button class="btn btn-small" onclick="app.editarTurma(\'' + t.id + '\')">Editar</button><button class="btn btn-small btn-danger" onclick="app.removerTurma(\'' + t.id + '\')">Remover</button></div></div>';
    });
  }

  abrirModalTurma(id = null) {
    const e = this.data.estadoAtual;
    const t = id ? e.turmas.find(x => x.id === id) : null;
    const serieOpts = e.series.map(s => '<option value="' + s.id + '"' + (t && t.serieId === s.id ? ' selected' : '') + '>' + s.nome + '</option>').join('');
    this.abrirModalHtml('turma', id,
      '<label>Nome da Turma</label><input name="nome" value="' + (t ? t.nome : '') + '" type="text" required>' +
      '<label>Série</label><select name="serieId" required>' + serieOpts + '</select>' +
      '<label>Turno</label><select name="turno" required><option value="manhã"' + (t && t.turno === 'manhã' ? ' selected' : '') + '>Manhã</option><option value="tarde"' + (t && t.turno === 'tarde' ? ' selected' : '') + '>Tarde</option></select>',
      id ? 'Editar Turma' : 'Nova Turma',
      (fd) => { this.salvarTurma(fd); }
    );
  }

  async editarTurma(id) { this.abrirModalTurma(id); }

  async removerTurma(id) {
    if (!confirm('Remover esta turma? Cargas vinculadas também serão afetadas.')) return;
    this.data.removeTurma(id);
    this.mostrarUndo('Turma removida', () => this.data.desfazerRemocao());
    this.renderTodas();
  }

  salvarTurma(fd) {
    const nome = fd.get('nome');
    const serieId = fd.get('serieId');
    const turno = fd.get('turno');
    if (!nome || !serieId || !turno) return alert('Preencha todos os campos.');
    const id = this.modalId;
    if (id) this.data.editTurma(id, { nome: nome, serieId: serieId, turno: turno });
    else this.data.addTurma(serieId, nome, turno);
    this.renderTodas();
    this.fecharModal();
  }

  // ---------- Professores ----------

  renderProfessores() {
    const termo = document.getElementById('busca-professores').value;
    const e = this.data.estadoAtual;
    const lista = this.filtrar(e.professores, termo, ['nome'])
      .map(p => {
        const disc = e.disciplinas.find(d => d.id === p.disciplinaId);
        const serie = e.series.find(s => s.id === p.serieId);
        return { ...p, discNome: disc ? disc.nome : '—', serieNome: serie ? serie.nome : '—' };
      });
    const el = document.getElementById('lista-professores');
    el.innerHTML = '';
    if (lista.length === 0) { el.innerHTML = '<div class="item"><span>Nenhum professor encontrado.</span></div>'; return; }
    lista.forEach(p => {
      const disp = (p.disponibilidade || []).map(d => d.dia + ' ' + d.turno).slice(0, 3).join(', ') + ((p.disponibilidade || []).length > 3 ? '...' : '') || '—';
      el.innerHTML += '<div class="item"><div class="info"><strong>' + this.esc(p.nome) + '</strong><br><small>' + p.discNome + ' · ' + p.serieNome + ' · Carga máx: ' + p.cargaMax + '</small><br><small>Disp: ' + disp + '</small></div><div class="actions"><button class="btn btn-small" onclick="app.editarProfessor(\'' + p.id + '\')">Editar</button><button class="btn btn-small btn-danger" onclick="app.removerProfessor(\'' + p.id + '\')">Remover</button></div></div>';
    });
  }

  abrirModalProfessor(id = null) {
    const e = this.data.estadoAtual;
    const p = id ? e.professores.find(x => x.id === id) : null;
    const discOpts = e.disciplinas.map(d => '<option value="' + d.id + '"' + (p && p.disciplinaId === d.id ? ' selected' : '') + '>' + d.nome + '</option>').join('');
    const serieOpts = e.series.map(s => '<option value="' + s.id + '"' + (p && p.serieId === s.id ? ' selected' : '') + '>' + s.nome + '</option>').join('');
    const dias = ['segunda','terça','quarta','quinta','sexta','sábado'];
    const turnos = ['manhã','tarde'];
    const dispHtml = (p && p.disponibilidade ? p.disponibilidade : []).map(d => '<div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.25rem;"><select name="dispDia">' + dias.map(dia => '<option value="' + dia + '"' + (d.dia === dia ? ' selected' : '') + '>' + dia + '</option>').join('') + '</select><select name="dispTurno">' + turnos.map(t => '<option value="' + t + '"' + (d.turno === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select><button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">×</button></div>').join('');
    const todosHorarios = new Set();
    e.blocos.forEach(b => { todosHorarios.add(b.inicio); todosHorarios.add(b.fim); });
    const horariosOrdenados = [...todosHorarios].sort();
    const montaHoraSelect = (nome, valorSel) => '<select name="' + nome + '">' + horariosOrdenados.map(h => '<option value="' + h + '"' + (h === valorSel ? ' selected' : '') + '>' + h + '</option>').join('') + '</select>';
    const restHtml = (p && p.restricoes ? p.restricoes : []).map(r => '<div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.25rem;"><select name="restDia">' + dias.map(dia => '<option value="' + dia + '"' + (r.dia === dia ? ' selected' : '') + '>' + dia + '</option>').join('') + '</select>' + montaHoraSelect('restInicio', r.inicio || '') + montaHoraSelect('restFim', r.fim || '') + '<button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">×</button></div>').join('');
    this.abrirModalHtml('professor', id,
      '<label>Nome</label><input name="nome" value="' + (p ? p.nome : '') + '" required>' +
      '<label>Disciplina</label><select name="disciplinaId" required>' + discOpts + '</select>' +
      '<label>Séries (máximo 3)</label><div class="checkbox-group" style="grid-column:1/-1;">' + e.series.map(s => '<label style="display:inline-block;margin-right:1rem;"><input type="checkbox" name="serieIds" value="' + s.id + '"' + ((p && (p.serieIds || [p.serieId]).indexOf(s.id) !== -1) ? ' checked' : '') + '> ' + s.nome + '</label>').join('') + '</div>' +
      '<small id="contador-series" style="grid-column:1/-1;color:#666;font-size:0.8rem;">0 selecionado(s)</small>' +
      '<label>Carga Máxima (aulas/semana)</label><input name="cargaMax" type="number" min="1" max="40" value="' + (p ? p.cargaMax : '') + '" required>' +
      '<div style="grid-column:1/-1;display:flex;flex-direction:column;gap:0.25rem;"><label style="margin-bottom:0.15rem;">Disponibilidade (dia + turno)</label><div class="full" style="grid-column:1/-1;">' + dispHtml + '</div><button type="button" class="btn btn-outline" style="grid-column:1/-1;" onclick="app.adicionarDisponibilidadeModal(this)">+ Adicionar disponibilidade</button></div>' +
      '<div style="grid-column:1/-1;display:flex;flex-direction:column;gap:0.25rem;"><label style="margin-bottom:0.15rem;">Restrições de Horário (dia + início + fim)</label><div class="full" style="grid-column:1/-1;">' + restHtml + '</div><button type="button" class="btn btn-outline" style="grid-column:1/-1;" onclick="app.adicionarRestricaoModal(this)">+ Adicionar restrição</button></div>',
      id ? 'Editar Professor' : 'Novo Professor',
      (fd) => { this.salvarProfessor(fd); },
      true
    );

    setTimeout(() => {
      const contador = document.getElementById('contador-series');
      const checkboxes = document.querySelectorAll('input[name="serieIds"]');
      const atualizarContador = () => {
        const sel = document.querySelectorAll('input[name="serieIds"]:checked').length;
        contador.textContent = sel + ' selecionado(s)';
        if (sel >= 3) { checkboxes.forEach(cb => { if (!cb.checked) cb.disabled = true; }); } else { checkboxes.forEach(cb => cb.disabled = false); }
      };
      checkboxes.forEach(cb => cb.addEventListener('change', atualizarContador));
      atualizarContador();
    }, 50);
  }

  async editarProfessor(id) { this.abrirModalProfessor(id); }

  async removerProfessor(id) {
    if (!confirm('Remover este professor?')) return;
    this.data.removeProfessor(id);
    this.mostrarUndo('Professor removido', () => this.data.desfazerRemocao());
    this.renderTodas();
  }

  salvarProfessor(fd) {
    const nome = fd.get('nome');
    const disciplinaId = fd.get('disciplinaId');
    const cargaMax = fd.get('cargaMax');
    if (!nome || !disciplinaId || !cargaMax || cargaMax < 1) return alert('Preencha todos os campos.');
    const serieIds = fd.getAll('serieIds');
    if (serieIds.length === 0) return alert('Selecione ao menos uma série.');
    if (serieIds.length > 3) return alert('Máximo de 3 séries.');
    const diasDisp = fd.getAll('dispDia');
    const turnosDisp = fd.getAll('dispTurno');
    const disponibilidade = diasDisp.map((dia, i) => ({ dia: dia, turno: turnosDisp[i] || 'manhã' })).filter(d => d.dia);
    const diasRest = fd.getAll('restDia');
    const inícios = fd.getAll('restInicio');
    const fins = fd.getAll('restFim');
    const restricoes = diasRest.map((dia, i) => ({ dia: dia, inicio: inícios[i], fim: fins[i] })).filter(r => r.dia && r.inicio && r.fim);
    const id = this.modalId;
    if (id) this.data.editProfessor(id, { nome: nome, disciplinaId: disciplinaId, serieIds: serieIds, cargaMax: Number(cargaMax), disponibilidade: disponibilidade, restricoes: restricoes });
    else this.data.addProfessor({ nome: nome, disciplinaId: disciplinaId, serieIds: serieIds, cargaMax: Number(cargaMax), disponibilidade: disponibilidade, restricoes: restricoes });
    this.renderTodas();
    this.fecharModal();
  }

  adicionarDisponibilidadeModal(btn) {
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;gap:0.5rem;align-items:center;margin-bottom:0.25rem;';
    container.innerHTML = '<select name="dispDia"><option>segunda</option><option>terça</option><option>quarta</option><option>quinta</option><option>sexta</option><option>sábado</option></select><select name="dispTurno"><option>manhã</option><option>tarde</option></select><button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">×</button>';
    const btnEl = btn || document.querySelector('button[onclick="app.adicionarDisponibilidadeModal()"]');
    if (btnEl && btnEl.parentElement) {
      btnEl.parentElement.insertBefore(container, btnEl.nextSibling);
    } else {
      document.getElementById('modal').appendChild(container);
    }
  }

  adicionarRestricaoModal(btn) {
    const e = this.data.estadoAtual;
    const todosHorarios = new Set();
    e.blocos.forEach(b => { todosHorarios.add(b.inicio); todosHorarios.add(b.fim); });
    const horariosOrdenados = [...todosHorarios].sort();
    const horaOpts = horariosOrdenados.map(h => '<option value="' + h + '">' + h + '</option>').join('');
    const dias = ['segunda','terça','quarta','quinta','sexta','sábado'];
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;gap:0.5rem;align-items:center;margin-bottom:0.25rem;';
    container.innerHTML = '<select name="restDia">' + dias.map(dia => '<option value="' + dia + '">' + dia + '</option>').join('') + '</select><select name="restInicio">' + horaOpts + '</select><select name="restFim">' + horaOpts + '</select><button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">×</button>';
    const btnEl = btn || document.querySelector('button[onclick="app.adicionarRestricaoModal()"]');
    if (btnEl && btnEl.parentElement) {
      btnEl.parentElement.insertBefore(container, btnEl.nextSibling);
    } else {
      document.getElementById('modal').appendChild(container);
    }
  }

  // ---------- Exportação XLSX ----------

  exportarDisciplinasXLSX() {
    const e = this.data.estadoAtual;
    if (!e || e.disciplinas.length === 0) { alert('Nenhuma disciplina para exportar.'); return; }
    const dados = [['Nome']];
    e.disciplinas.forEach(d => dados.push([d.nome]));
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Disciplinas');
    XLSX.writeFile(wb, 'disciplinas-export-' + new Date().toISOString().slice(0,10) + '.xlsx');
  }

  exportarCargasXLSX() {
    const e = this.data.estadoAtual;
    if (!e || e.cargas.length === 0) { alert('Nenhuma carga para exportar.'); return; }
    const dados = [['Série', 'Disciplina', 'Aulas/semana']];
    e.cargas.forEach(c => {
      const serie = e.series.find(s => s.id === c.serieId);
      const disc = e.disciplinas.find(d => d.id === c.disciplinaId);
      dados.push([serie ? serie.nome : '—', disc ? disc.nome : '—', c.qtd]);
    });
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cargas');
    XLSX.writeFile(wb, 'cargas-export-' + new Date().toISOString().slice(0,10) + '.xlsx');
  }

  exportarProfessoresXLSX() {
    const e = this.data.estadoAtual;
    if (!e || e.professores.length === 0) { alert('Nenhum professor para exportar.'); return; }
    const dados = [['Nome', 'Disciplina', 'Série', 'Carga Máxima', 'Disponibilidade', 'Restrições']];
    e.professores.forEach(p => {
      const disc = e.disciplinas.find(d => d.id === p.disciplinaId);
      const serieIds = p.serieIds || (p.serieId ? [p.serieId] : []);
      const seriesNomes = serieIds.map(id => { const s = e.series.find(sx => sx.id === id); return s ? s.nome : '—'; }).join(', ');
      const disp = (p.disponibilidade || []).map(d => d.dia + '|' + d.turno).join(',');
      const rest = (p.restricoes || []).map(r => r.dia + '|' + r.inicio + '|' + r.fim).join(',');
      dados.push([p.nome, disc ? disc.nome : '—', seriesNomes, p.cargaMax, disp, rest]);
    });
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Professores');
    XLSX.writeFile(wb, 'professores-export-' + new Date().toISOString().slice(0,10) + '.xlsx');
  }

  // ---------- Prioridade de Professores ----------

  renderPrioridade() {
    const e = this.data.estadoAtual;
    const el = document.getElementById('lista-prioridade');
    el.innerHTML = '';
    if (e.professores.length === 0) { el.innerHTML = '<div class="item"><span>Nenhum professor cadastrado.</span></div>'; return; }
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.gap = '0.5rem';
    e.professores.forEach((p, idx) => {
      const disc = e.disciplinas.find(d => d.id === p.disciplinaId);
      const item = document.createElement('div');
      item.className = 'item';
      item.draggable = true;
      item.dataset.index = idx;
      item.style.cursor = 'grab';
      item.style.background = '#fff';
      item.innerHTML = '<div class="info" style="flex:1;"><strong>' + (idx + 1) + '.</strong> ' + this.esc(p.nome) + '<br><small>' + (p.disciplinaId ? (disc ? disc.nome : '—') : '—') + ' · Carga máx: ' + p.cargaMax + '</small></div>';
      item.addEventListener('dragstart', (ev) => {
        ev.dataTransfer.setData('text/plain', idx);
        ev.dataTransfer.effectAllowed = 'move';
        item.style.opacity = '0.4';
        item.style.background = '#eef1f5';
      });
      item.addEventListener('dragover', (ev) => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'move';
        item.style.background = '#fff3cd';
      });
      item.addEventListener('dragleave', () => { item.style.background = '#fff'; });
      item.addEventListener('drop', (ev) => {
        ev.preventDefault();
        const fromIdx = parseInt(ev.dataTransfer.getData('text/plain'));
        const toIdx = idx;
        if (fromIdx === toIdx) return;
        const estado = this.data.estadoAtual;
        const professores = [...estado.professores];
        const [movido] = professores.splice(fromIdx, 1);
        professores.splice(toIdx, 0, movido);
        estado.professores = professores;
        salvarEstado(estado);
        this.renderPrioridade();
        this.renderProfessores();
      });
      item.addEventListener('dragend', () => { item.style.opacity = '1'; item.style.background = '#fff'; });
      el.appendChild(item);
    });
  }

  // ---------- Blocos ----------

  renderBlocos() {
    const e = this.data.estadoAtual;
    const el = document.getElementById('lista-blocos');
    el.innerHTML = '';
    if (e.blocos.length === 0) { el.innerHTML = '<div class="item"><span>Nenhum bloco de horário definido.</span></div>'; return; }
    const porDia = {};
    e.blocos.forEach(b => {
      if (!porDia[b.dia]) porDia[b.dia] = { manhã: [], tarde: [] };
      if (b.turno === 'manhã') porDia[b.dia].manhã.push(b);
      if (b.turno === 'tarde') porDia[b.dia].tarde.push(b);
    });
    const dias = ['segunda','terça','quarta','quinta','sexta'];
    dias.forEach(dia => {
      const manha = porDia[dia] ? porDia[dia].manhã : [];
      const tarde = porDia[dia] ? porDia[dia].tarde : [];
      el.innerHTML += '<div class="item"><div class="info"><strong>' + dia.charAt(0).toUpperCase() + dia.slice(1) + '</strong></div><div class="actions"><small>Manhã: ' + manha.length + ' blocos · Tarde: ' + tarde.length + ' blocos</small></div></div>';
    });
  }

  gerarBlocosPadraoSeVazio() {
    const e = this.data.estadoAtual;
    if (e.blocos.length > 0) return;
    const blocos = [];
    const add = (dia, turno, inicio, fim) => blocos.push({ id: 'g_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), dia: dia, turno: turno, inicio: inicio, fim: fim, duracao: 40 });
    const dias = ['segunda','terça','quarta','quinta','sexta'];
    dias.forEach(dia => {
      add(dia,'manhã','07:00','07:40'); add(dia,'manhã','07:40','08:20'); add(dia,'manhã','08:20','09:00'); add(dia,'manhã','09:00','09:40'); add(dia,'manhã','10:00','10:40'); add(dia,'manhã','10:40','11:20'); add(dia,'manhã','11:20','12:00');
      add(dia,'tarde','13:00','13:40'); add(dia,'tarde','13:40','14:20'); add(dia,'tarde','14:20','15:00'); add(dia,'tarde','15:00','15:40'); add(dia,'tarde','16:00','16:40'); add(dia,'tarde','16:40','17:20'); add(dia,'tarde','17:20','18:00');
    });
    blocos.forEach(b => this.data.addBloco(b));
    this.renderBlocos();
  }

  gerarBlocosPadrao() { /* bloqueado */ }
  abrirModalBloco() { /* bloqueado */ }
  editarBloco() { /* bloqueado */ }
  removerBloco() { /* bloqueado */ }
  salvarBloco() { /* bloqueado */ }

  // ---------- Quadro ----------

  renderQuadro() {
    const e = this.data.estadoAtual;
    const quadro = document.getElementById('quadro');
    if (!e.grade || e.grade.length === 0) { quadro.innerHTML = '<div class="card">Nenhuma grade gerada ainda. Vá em Geração e clique em Gerar Horários.</div>'; return; }

    const porTurma = {};
    e.grade.forEach(a => { if (!porTurma[a.turmaId]) porTurma[a.turmaId] = []; porTurma[a.turmaId].push(a); });

    const dias = ['segunda','terça','quarta','quinta','sexta'];
    const blocosPorTurno = {};
    ['manhã','tarde'].forEach(turno => {
      const visto = new Set();
      blocosPorTurno[turno] = e.blocos.filter(b => b.turno === turno).sort((a,b) => a.inicio.localeCompare(b.inicio)).filter(b => { const chave = b.inicio + '|' + b.fim; if (visto.has(chave)) return false; visto.add(chave); return true; });
    });

    let html = '<div class="quadro-container">';
    const turmasComAlocacao = Object.keys(porTurma).map(id => e.turmas.find(t => t.id === id)).filter(Boolean);
    turmasComAlocacao.sort((a,b) => a.nome.localeCompare(b.nome));

    turmasComAlocacao.forEach(turma => {
      const serie = e.series.find(s => s.id === turma.serieId);
      const alocacoes = porTurma[turma.id];
      const turnoTurma = turma.turno;
      const blocos = blocosPorTurno[turnoTurma] || [];
      const mapa = {};
      alocacoes.forEach(a => {
        const bloco = e.blocos.find(b => b.id === a.blocoId);
        if (!bloco) return;
        const chave = a.dia + '|' + bloco.turno + '|' + bloco.inicio + '|' + bloco.fim;
        if (!mapa[chave]) mapa[chave] = [];
        mapa[chave].push(a);
      });
      html += '<div class="quadro-turma"><div class="quadro-titulo">' + turma.nome + ' · ' + (serie ? serie.nome : '—') + ' · ' + turma.turno + '</div><table class="quadro-tabela"><thead><tr><th>Horário</th>' + dias.map(d => '<th>' + d.charAt(0).toUpperCase() + d.slice(1) + '</th>').join('') + '</tr></thead><tbody>';
      blocos.forEach(b => {
        const turno = b.turno;
        const ehIntervalo = b.intervalo === true;
        const linha = dias.map(dia => {
          if (ehIntervalo) return '<td class="quadro-celula intervalo">Intervalo</td>';
          const chave = dia + '|' + turno + '|' + b.inicio + '|' + b.fim;
          const alocs = mapa[chave];
          if (!alocs || alocs.length === 0) return '<td></td>';
          const a = alocs[0];
          const disc = e.disciplinas.find(d => d.id === a.disciplinaId);
          const prof = e.professores.find(p => p.id === a.professorId);
          return '<td class="quadro-celula alocada"><strong>' + this.esc(disc ? disc.nome : '—') + '</strong> ' + this.esc(prof ? prof.nome : '—') + '</td>';
        }).join('');
        html += '<tr><td class="quadro-horario">' + b.inicio + '–' + b.fim + '</td>' + linha + '</tr>';
      });
      html += '</tbody></table></div>';
    });
    html += '</div>';
    quadro.innerHTML = html;
  }

  // ---------- Cartões ----------

  renderCartoes() {
    const e = this.data.estadoAtual;
    const cartoes = document.getElementById('cartoes');
    if (!e.grade || e.grade.length === 0) { cartoes.innerHTML = '<div class="card">Nenhuma grade gerada ainda. Vá em Geração e clique em Gerar Horários.</div>'; return; }

    const porProfessor = {};
    e.grade.forEach(a => { if (!porProfessor[a.professorId]) porProfessor[a.professorId] = []; porProfessor[a.professorId].push(a); });

    const professores = [...e.professores];
    const blocosPorTurno = {};
    ['manhã','tarde'].forEach(turno => {
      const visto = new Set();
      blocosPorTurno[turno] = e.blocos.filter(b => b.turno === turno).sort((a,b) => a.inicio.localeCompare(b.inicio)).filter(b => { const chave = b.inicio + '|' + b.fim; if (visto.has(chave)) return false; visto.add(chave); return true; });
    });
    const dias = ['segunda','terça','quarta','quinta','sexta'];

    let html = '<div class="cartoes-grid">';
    professores.forEach(prof => {
      const alocacoes = porProfessor[prof.id] || [];

      // Quais turnos o professor tem aulas
      const turnosComAula = [...new Set(alocacoes.map(a => a.turno))];

      // Monta mapa de alocacao por chave (dia|turno|inicio|fim)
      const mapa = {};
      alocacoes.forEach(a => {
        const bloco = e.blocos.find(b => b.id === a.blocoId);
        if (!bloco) return;
        const chave = a.dia + '|' + bloco.turno + '|' + bloco.inicio + '|' + bloco.fim;
        if (!mapa[chave]) mapa[chave] = [];
        mapa[chave].push(a);
      });

      let cargaAlocada = alocacoes.length;
      const discProf = e.disciplinas.find(d => d.id === prof.disciplinaId);
      const serieIds = prof.serieIds || (prof.serieId ? [prof.serieId] : []);
      const ehSerieBlocoUnico = serieIds.some(id => { const s = e.series.find(sx => sx.id === id); return s && s.tipo === 'bloco_unico'; });
      const ehNoite = prof.disponibilidade.some(d => d.turno === 'noite') || ehSerieBlocoUnico;

      html += '<div class="cartao cartao-professor"><h4>' + this.esc(prof.nome) + '</h4><p><strong>Disciplina:</strong> ' + this.esc(discProf ? discProf.nome : '—') + ' · <strong>Carga máx:</strong> ' + prof.cargaMax + ' · <strong>Alocada:</strong> ' + cargaAlocada + '</p>';

      // Renderiza cada turno com aula
      turnosComAula.forEach(turno => {
        const blocos = blocosPorTurno[turno] || [];
        html += '<div class="cartao-quadro"><p style="margin:0.5rem 0 0.25rem 0;font-size:0.8rem;color:#666;"><strong>' + turno.charAt(0).toUpperCase() + turno.slice(1) + '</strong></p><table class="quadro-tabela"><thead><tr><th>Horário</th>' + dias.map(d => '<th>' + d.charAt(0).toUpperCase() + d.slice(1) + '</th>').join('') + '</tr></thead><tbody>';
        blocos.forEach(b => {
          const ehIntervalo = b.intervalo === true;
          const linha = dias.map(dia => {
            if (ehIntervalo) return '<td class="quadro-celula intervalo">Intervalo</td>';
            const chave = dia + '|' + turno + '|' + b.inicio + '|' + b.fim;
            const alocs = mapa[chave];
            if (!alocs || alocs.length === 0) {
              const temRestricao = (prof.restricoes || []).some(r =>
                r.dia === dia && b.inicio < r.fim && b.fim > r.inicio
              );
              return temRestricao ? '<td class="quadro-celula bloqueada">X</td>' : '<td class="quadro-celula vaga">--</td>';
            }
            const a = alocs[0];
            const turma = e.turmas.find(t => t.id === a.turmaId);
            return '<td class="quadro-celula alocada"><strong>' + this.esc(turma ? turma.nome : '—') + '</strong> ' + this.esc(e.disciplinas.find(d => d.id === a.disciplinaId) ? e.disciplinas.find(d => d.id === a.disciplinaId).nome : '—') + '</td>';
          }).join('');
          html += '<tr><td class="quadro-horario">' + b.inicio + '–' + b.fim + '</td>' + linha + '</tr>';
        });
        html += '</tbody></table></div>';
      });

      if (alocacoes.length === 0 && !ehNoite) html += '<p style="font-size:0.85rem;color:#666; margin-top:0.5rem;">Sem aulas alocadas.</p>';
      if (ehNoite) html += '<p class="bloco-unico-noturno" style="margin-top:0.5rem;">Noite: Registro de carga (PROEJA/Graduação)</p>';
      html += '</div>';
    });
    html += '</div>';
    cartoes.innerHTML = html;
  }

  // ---------- Geração ----------

  async gerarHorarios() {
    const e = this.data.estadoAtual;
    if (e.cargas.length === 0) return alert('Cadastre cargas antes de gerar.');
    if (e.blocos.length === 0) return alert('Cadastre blocos antes de gerar.');
    if (e.professores.length === 0) return alert('Cadastre professores antes de gerar.');

    const res = document.getElementById('resultado-geracao');
    res.style.display = 'block';
    res.innerHTML = '<p>Gerando... aguarde (60 tentativas).</p>';

    setTimeout(() => {
      try {
        const gerador = new Gerador(e);
        const resultado = gerador.gerar(60);

        e.grade = gerador.alocacoesMelhores || [];
        e.ultimaGeracao = { tentativas: resultado.tentativas, alocadas: resultado.alocadas, total: resultado.total, taxa: resultado.taxa, pendencias: resultado.total - resultado.alocadas };
        salvarEstado(e);

        res.innerHTML = '<p><strong>✓ Geração concluída!</strong></p><p>Tentativas: ' + resultado.tentativas + '</p><p>Alocadas: ' + resultado.alocadas + ' / ' + resultado.total + '</p><p>Taxa: ' + resultado.taxa + '</p><p>Pendências: ' + (resultado.total - resultado.alocadas) + '</p>';

        this.renderMatriz();
        const tabAtivo = document.querySelector('.tab-btn.active').dataset.tab;
        if (tabAtivo === 'quadro') this.renderQuadro();
        if (tabAtivo === 'cartoes') this.renderCartoes();
      } catch (err) {
        console.error('Erro na geração:', err);
        res.innerHTML = '<p style="color:#b3261e;"><strong>✗ Erro na geração:</strong> ' + err.message + '</p>';
      }
    }, 100);
  }

  // ---------- Exportar / Importar JSON ----------

  exportarJSON() {
    this.data.exportarJSON();
  }

  importarJSON(input) {
    const arquivo = input.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = (ev) => {
      const resultado = this.data.importarJSON(ev.target.result);
      if (resultado.sucesso) {
        this.renderTodas();
        alert('JSON importado com sucesso!');
      } else {
        alert('Erro ao importar JSON: ' + resultado.erro);
      }
      input.value = '';
    };
    leitor.readAsText(arquivo);
  }

  limparLocalStorage() {
    if (!confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) return;
    localStorage.removeItem('escola-horarios-v6');
    localStorage.removeItem('escola-horarios-dark-mode');
    location.reload();
  }

  gerarDadosTeste() {
    const e = this.data.estadoAtual;

    // Limpa dados de teste anteriores para permitir reexecução
    while (e.cargas.length > 0) this.data.removeCarga(e.cargas[0].id);
    while (e.professores.length > 0) this.data.removeProfessor(e.professores[0].id);

    const disciplinas = e.disciplinas;
    const series = e.series.filter(s => s.tipo === 'grade');
    const serieProeja = e.series.find(s => s.tipo === 'bloco_unico' && String(s.nome).toLowerCase().includes('proeja'));
    if (disciplinas.length === 0) return alert('Cadastre disciplinas primeiro.');
    if (series.length === 0) return alert('Cadastre séries de grade primeiro.');

    const dias = ['segunda','terça','quarta','quinta','sexta'];
    const turnos = ['manhã','tarde'];

    // Gera 36 cargas: 18 com 2 tempos, 18 com 3 tempos (sem duplicar série+disciplina)
    const cargasExistentes = new Set();
    for (let i = 0; i < 36; i++) {
      const qtd = i < 18 ? 2 : 3;
      const serie = series[Math.floor(Math.random() * series.length)];
      const disc = disciplinas[Math.floor(Math.random() * disciplinas.length)];
      const chave = serie.id + '|' + disc.id;
      if (cargasExistentes.has(chave)) continue;
      const turmasSerie = e.turmas.filter(t => t.serieId === serie.id);
      if (turmasSerie.length === 0) continue;
      cargasExistentes.add(chave);
      this.data.addCarga(serie.id, disc.id, qtd);
    }

    // Gera 36 professores com disciplinas iguais às das cargas
    for (let i = 0; i < 36; i++) {
      const carga = e.cargas[i];
      if (!carga) break;
      const disc = disciplinas.find(d => d.id === carga.disciplinaId);
      const serie = series.find(s => s.id === carga.serieId);
      if (!disc || !serie) continue;

      const qtdDisp = i < 18 ? 12 : 15;
      const disponibilidade = [];
      for (let j = 0; j < qtdDisp; j++) {
        disponibilidade.push({
          dia: dias[Math.floor(Math.random() * dias.length)],
          turno: turnos[Math.floor(Math.random() * turnos.length)]
        });
      }

      const serieIds = [serie.id];
      // Primeiros 3 professores também com PROEJA nas séries
      if (i < 3 && serieProeja) {
        serieIds.push(serieProeja.id);
      }

      this.data.addProfessor({
        nome: 'Prof. ' + disc.nome + ' ' + (i + 1),
        disciplinaId: disc.id,
        serieIds: serieIds,
        cargaMax: 20,
        disponibilidade: disponibilidade,
        restricoes: []
      });
    }

    this.renderTodas();
    alert('36 cargas (18 com 2 tempos, 18 com 3 tempos) e 36 professores (18 com 12 disp., 18 com 15 disp.) gerados. Agora clique em "Gerar Horários".');
  }

  // ---------- Importação XLSX ----------

  processarArquivo(tipo, input) {
    const arquivo = input.files[0];
    if (!arquivo) return;
    if (!this.importador) {
      alert('Importador não disponível.');
      input.value = '';
      return;
    }
    this.importador.lerXLSX(arquivo).then(workbook => {
      try {
        if (tipo === 'disciplinas') {
          const sheets = this.importador.extrairSheets(workbook, ['Disciplinas']);
          const linhas = sheets['Disciplinas'];
          const novas = [];
          for (let i = 1; i < linhas.length; i++) {
            const r = this.importador.linhaParaDisciplina(linhas[i]);
            if (r) novas.push(r);
          }
          const e = this.data.estadoAtual;
          e.disciplinas = novas.map((d, i) => ({ id: 'd' + (i + 1), nome: d.nome }));
          salvarEstado(e);
          this.renderTodas();
          alert(novas.length + ' disciplina(s) importada(s).');
        } else if (tipo === 'cargas') {
          const e = this.data.estadoAtual;
          const mapSeries = this.importador.buildMapSeries(e.series);
          const mapDisciplinas = this.importador.buildMapDisciplinas(e.disciplinas);
          const sheets = this.importador.extrairSheets(workbook, ['Cargas']);
          const linhas = sheets['Cargas'];
          const novas = [];
          for (let i = 1; i < linhas.length; i++) {
            const r = this.importador.linhaParaCarga(linhas[i], mapDisciplinas, mapSeries);
            if (r && !r.erro) novas.push(r);
          }
          e.cargas = novas.map((c, i) => ({ id: 'c' + (i + 1), ...c }));
          salvarEstado(e);
          this.renderTodas();
          alert(novas.length + ' carga(s) importada(s).');
        } else if (tipo === 'professores') {
          const e = this.data.estadoAtual;
          const mapSeries = this.importador.buildMapSeries(e.series);
          const mapDisciplinas = this.importador.buildMapDisciplinas(e.disciplinas);
          const sheets = this.importador.extrairSheets(workbook, ['Professores']);
          const linhas = sheets['Professores'];
          const novos = [];
          for (let i = 1; i < linhas.length; i++) {
            const r = this.importador.linhaParaProfessor(linhas[i], mapDisciplinas, mapSeries);
            if (r && !r.erro) novos.push(r);
          }
          e.professores = novos.map((p, i) => ({ id: 'p' + (i + 1), ...p }));
          salvarEstado(e);
          this.renderTodas();
          alert(novos.length + ' professor(es) importado(s).');
        }
      } catch (err) {
        alert('Erro ao importar: ' + err.message);
      }
      input.value = '';
    }).catch(err => {
      alert('Erro ao ler arquivo: ' + err.message);
      input.value = '';
    });
  }

  importarDisciplinas() { document.getElementById('file-import-disciplinas').click(); }
  importarCargas() { document.getElementById('file-import-cargas').click(); }
  importarProfessores() { document.getElementById('file-import-professores').click(); }

  // ---------- Modal ----------

  abrirModalHtml(tipo, id, conteudoHtml, titulo, onSave, permitirVarios = false) {
    this.modalId = id;
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    modal.innerHTML = '<button class="close" onclick="app.fecharModal()">&times;</button><h3>' + titulo + '</h3><form class="modal-form" id="form-modal">' + conteudoHtml + '<div class="actions"><button type="button" class="btn btn-outline" onclick="app.fecharModal()">Cancelar</button><button type="submit" class="btn btn-primary">Salvar</button></div></form>';
    const form = document.getElementById('form-modal');
    form.onsubmit = (ev) => { ev.preventDefault(); const fd = new FormData(form); onSave(fd); };
    overlay.style.display = 'block';
    modal.style.display = 'block';
    this.modalAberto = true;
  }

  fecharModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
    this.modalAberto = false;
    this.modalId = null;
  }

  // ---------- Utilitários ----------

  esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  filtrar(lista, termo, campos) {
    if (!termo) return lista;
    const t = termo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return lista.filter(item => campos.some(c => String(item[c] || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(t)));
  }

  mostrarUndo(mensagem, desfazer) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
    toast.onclick = () => { if (desfazer) desfazer(); toast.classList.remove('show'); };
  }
}
