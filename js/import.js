/**
 * import.js — Importação de XLSX externos (Fase 4)
 *
 * Requer: SheetJS (XLSX) carregado globalmente antes deste script.
 * Ordem imposta: Disciplinas → Cargas → Professores
 * Modo: Substituir (limpa a entidade antes de importar)
 */

class Importador {
  constructor(app) {
    this.app = app;
    this.estado = app.data.estadoAtual;
  }

  // ---------- Validação de ordem ----------

  podeImportarDisciplinas() { return true; }

  podeImportarCargas() {
    const e = this.app.data.estadoAtual;
    return e.disciplinas.length > 0;
  }

  podeImportarProfessores() {
    const e = this.app.data.estadoAtual;
    return e.disciplinas.length > 0 && e.series.length > 0;
  }

  // ---------- Parsing de XLSX ----------

  lerXLSX(arquivo) {
    return new Promise((resolve, reject) => {
      if (!window.XLSX) {
        reject(new Error('SheetJS não carregado. Carregue o script xlsx.js antes de importar.'));
        return;
      }
      const leitor = new FileReader();
      leitor.onload = (ev) => {
        try {
          const dados = ev.target.result;
          const workbook = XLSX.read(dados, { type: 'array' });
          resolve(workbook);
        } catch (e) {
          reject(new Error('Erro ao ler XLSX: ' + e.message));
        }
      };
      leitor.onerror = () => reject(new Error('Erro ao ler arquivo.'));
      leitor.readAsArrayBuffer(arquivo);
    });
  }

  extrairSheets(workbook, nomesObrigatorios) {
    const sheets = {};
    for (const nome of nomesObrigatorios) {
      if (!workbook.SheetNames.includes(nome)) {
        throw new Error(`Sheet obrigatório "${nome}" não encontrado no arquivo. Sheets disponíveis: ${workbook.SheetNames.join(', ')}`);
      }
      const ws = workbook.Sheets[nome];
      sheets[nome] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    }
    return sheets;
  }

  // ---------- Mapeamento de colunas por índice ----------

  linhaParaDisciplina(linha) {
    const [nome] = linha;
    if (!nome || String(nome).trim() === '') return null;
    return { nome: String(nome).trim() };
  }

  linhaParaCarga(linha, mapDisciplinas, mapSeries) {
    const [serieNome, disciplinaNome, qtd] = linha;
    if (!serieNome || !disciplinaNome || !qtd) return null;
    const s = mapSeries.get(String(serieNome).trim());
    const d = mapDisciplinas.get(String(disciplinaNome).trim());
    if (!s) return { erro: `Série não encontrada: ${serieNome}` };
    if (!d) return { erro: `Disciplina não encontrada: ${disciplinaNome}` };
    const q = Number(qtd);
    if (isNaN(q) || q < 1 || q > 6) return { erro: `Aulas/semana inválida: ${qtd}` };
    return { serieId: s.id, disciplinaId: d.id, qtd: q };
  }

  linhaParaProfessor(linha, mapDisciplinas, mapSeries, mapTurmasPorSerie) {
    const [nome, disciplinaNome, serieNome, cargaMax, disponibilidade, restricoes] = linha;
    if (!nome || !disciplinaNome || !serieNome || !cargaMax) return null;

    const d = mapDisciplinas.get(String(disciplinaNome).trim());
    if (!d) return { erro: `Disciplina não encontrada: ${disciplinaNome}` };

    const s = mapSeries.get(String(serieNome).trim());
    if (!s) return { erro: `Série não encontrada: ${serieNome}` };

    const cm = Number(cargaMax);
    if (isNaN(cm) || cm < 1 || cm > 40) return { erro: `Carga máxima inválida: ${cargaMax}` };

    // Disponibilidade: formato "dia|turno,dia|turno"
    const disp = this.parseDisponibilidade(disponibilidade);
    // Restrições: formato "dia|inicio|fim,dia|inicio|fim"
    const rest = this.parseRestricoes(restricoes);

    const serieIds = [s.id];

    return {
      nome: String(nome).trim(),
      disciplinaId: d.id,
      serieIds,
      cargaMax: cm,
      disponibilidade: disp,
      restricoes: rest
    };
  }

  parseDisponibilidade(valor) {
    if (!valor || String(valor).trim() === '') return [];
    const partes = String(valor).split(',');
    const resultado = [];
    for (const p of partes) {
      const [dia, turno] = String(p).trim().split('|');
      if (dia && turno) {
        resultado.push({ dia: dia.trim(), turno: turno.trim() });
      }
    }
    return resultado;
  }

  parseRestricoes(valor) {
    if (!valor || String(valor).trim() === '') return [];
    const partes = String(valor).split(',');
    const resultado = [];
    for (const p of partes) {
      const [dia, inicio, fim] = String(p).trim().split('|');
      if (dia && inicio && fim) {
        resultado.push({ dia: dia.trim(), inicio: inicio.trim(), fim: fim.trim() });
      }
    }
    return resultado;
  }

  // ---------- Mapas auxiliares ----------

  buildMapSeries(series) {
    const m = new Map();
    for (const s of series) m.set(s.nome, s);
    return m;
  }

  buildMapDisciplinas(disciplinas) {
    const m = new Map();
    for (const d of disciplinas) m.set(d.nome, d);
    return m;
  }

  buildMapTurmasPorSerie(turmas, series) {
    const m = new Map();
    for (const s of series) m.set(s.id, turmas.filter(t => t.serieId === s.id));
    return m;
  }

  // ---------- Importação por entidade ----------

  async importarDisciplinas(arquivo) {
    if (!this.podeImportarDisciplinas()) {
      return { sucesso: false, erro: 'Não é possível importar disciplinas neste momento.' };
    }
    const workbook = await this.lerXLSX(arquivo);
    const sheets = this.extrairSheets(workbook, ['Disciplinas']);
    const linhas = sheets['Disciplinas'];
    if (!linhas || linhas.length < 2) {
      return { sucesso: false, erro: 'Sheet Disciplinas está vazio ou não contém dados.' };
    }

    const novas = [];
    const erros = [];
    for (let i = 1; i < linhas.length; i++) {
      const resultado = this.linhaParaDisciplina(linhas[i]);
      if (!resultado) continue;
      if (!resultado.nome) {
        erros.push(`Linha ${i + 1}: nome vazio`);
        continue;
      }
      novas.push(resultado);
    }

    if (erros.length > 0) {
      return { sucesso: false, erro: erros.join('\n') };
    }

    // Substituir
    const e = this.app.data.estadoAtual;
    e.disciplinas = novas.map((d, i) => ({ id: 'd' + (i + 1), nome: d.nome }));
    salvarEstado(e);
    this.app.renderTodas();

    return {
      sucesso: true,
      importadas: novas.length,
      mensagem: `${novas.length} disciplina(s) importada(s) com sucesso.`
    };
  }

  async importarCargas(arquivo) {
    if (!this.podeImportarCargas()) {
      return { sucesso: false, erro: 'Cadastre disciplinas antes de importar cargas.' };
    }
    const workbook = await this.lerXLSX(arquivo);
    const sheets = this.extrairSheets(workbook, ['Cargas']);
    const linhas = sheets['Cargas'];
    if (!linhas || linhas.length < 2) {
      return { sucesso: false, erro: 'Sheet Cargas está vazio ou não contém dados.' };
    }

    const e = this.app.data.estadoAtual;
    const mapSeries = this.buildMapSeries(e.series);
    const mapDisciplinas = this.buildMapDisciplinas(e.disciplinas);

    const novas = [];
    const erros = [];
    for (let i = 1; i < linhas.length; i++) {
      const resultado = this.linhaParaCarga(linhas[i], mapDisciplinas, mapSeries);
      if (!resultado) continue;
      if (resultado.erro) {
        erros.push(`Linha ${i + 1}: ${resultado.erro}`);
        continue;
      }
      novas.push(resultado);
    }

    if (erros.length > 0 && novas.length === 0) {
      return { sucesso: false, erro: erros.join('\n') };
    }

    // Substituir
    e.cargas = novas.map((c, i) => ({ id: 'c' + (i + 1), ...c }));
    salvarEstado(e);
    this.app.renderTodas();

    return {
      sucesso: true,
      importadas: novas.length,
      erros: erros.length > 0 ? erros : null,
      mensagem: `${novas.length} carga(s) importada(s)${erros.length > 0 ? ' (' + erros.length + ' erro(s) ignorado(s))' : ''} com sucesso.`
    };
  }

  async importarProfessores(arquivo) {
    if (!this.podeImportarProfessores()) {
      return { sucesso: false, erro: 'Cadastre disciplinas e séries antes de importar professores.' };
    }
    const workbook = await this.lerXLSX(arquivo);
    const sheets = this.extrairSheets(workbook, ['Professores']);
    const linhas = sheets['Professores'];
    if (!linhas || linhas.length < 2) {
      return { sucesso: false, erro: 'Sheet Professores está vazio ou não contém dados.' };
    }

    const e = this.app.data.estadoAtual;
    const mapSeries = this.buildMapSeries(e.series);
    const mapDisciplinas = this.buildMapDisciplinas(e.disciplinas);

    const novos = [];
    const erros = [];
    for (let i = 1; i < linhas.length; i++) {
      const resultado = this.linhaParaProfessor(linhas[i], mapDisciplinas, mapSeries);
      if (!resultado) continue;
      if (resultado.erro) {
        erros.push(`Linha ${i + 1}: ${resultado.erro}`);
        continue;
      }
      novos.push(resultado);
    }

    if (erros.length > 0 && novos.length === 0) {
      return { sucesso: false, erro: erros.join('\n') };
    }

    // Substituir
    e.professores = novos.map((p, i) => ({ id: 'p' + (i + 1), ...p }));
    salvarEstado(e);
    this.app.renderTodas();

    return {
      sucesso: true,
      importadas: novos.length,
      erros: erros.length > 0 ? erros : null,
      mensagem: `${novos.length} professor(es) importado(s)${erros.length > 0 ? ' (' + erros.length + ' erro(s) ignorado(s))' : ''} com sucesso.`
    };
  }

  // ---------- Exemplos de preenchimento ----------

  getExemploDisciplinas() {
    return `Nome
Matemática
Português
História
Geografia
Ciências`;
  }

  getExemploCargas() {
    return `Série,Disciplina,Aulas/semana
6º ano,Matemática,4
6º ano,Português,3
1ª série,Matemática,5
1ª série,Português,4`;
  }

  getExemploProfessores() {
    return `Nome,Disciplina,Série,Carga Máxima,Disponibilidade,Restrições
João Silva,Matemática,6º ano,20,segunda|manhã,terça|tarde,segunda|08:00|10:00
Maria Souza,Português,6º ano,18,quarta|manhã,quinta|tarde,
Pedro Santos,História,1ª série,22,terça|manhã,sexta|tarde,sexta|14:00|16:00`;
  }
}

window.Importador = Importador;