/**
 * engine.js — Motor de geração de horários
 */
class Gerador {
  constructor(estado) {
    this.estado = estado;
    this.blocosPorDiaTurno = {};
    this.ocupacaoTurma = {};
    this.ocupacaoProfessor = {};
    this.cargaProfessorSemana = {};
    this.alocacoes = [];
  }

  resetOcupacao() {
    this.ocupacaoTurma = {};
    this.ocupacaoProfessor = {};
    this.cargaProfessorSemana = {};
    this.alocacoes = [];
  }

  prepararBlocos() {
    this.blocosPorDiaTurno = {};
    this.estado.blocos.forEach(b => {
      if (b.turno !== 'manhã' && b.turno !== 'tarde') return;
      if (b.intervalo === true) return;
      const chave = b.dia + '|' + b.turno;
      if (!this.blocosPorDiaTurno[chave]) this.blocosPorDiaTurno[chave] = [];
      this.blocosPorDiaTurno[chave].push({ id: b.id, inicio: b.inicio, fim: b.fim });
    });
    Object.keys(this.blocosPorDiaTurno).forEach(k => {
      this.blocosPorDiaTurno[k].sort((a,b) => a.inicio.localeCompare(b.inicio));
    });
  }

  ehSerieBlocoUnico(serieId) {
    const s = this.estado.series.find(s => s.id === serieId);
    return s && s.tipo === 'bloco_unico';
  }

  diasPermitidosParaSerie(serieId) {
    const s = this.estado.series.find(s => s.id === serieId);
    const diasUteis = s ? s.diasUteis : 5;
    const todos = ['segunda','terça','quarta','quinta','sexta','sábado'];
    return todos.slice(0, diasUteis);
  }

  professorDisponivel(professor, dia, turno) {
    if (!professor) return false;
    const disp = professor.disponibilidade || [];
    return disp.some(d => d.dia === dia && d.turno === turno);
  }

  professorTemCargaDisponivel(professorId, temposNecessarios) {
    const atual = this.cargaProfessorSemana[professorId] || 0;
    const prof = this.estado.professores.find(p => p.id === professorId);
    const max = prof ? prof.cargaMax : 0;
    return atual + temposNecessarios <= max;
  }

  professorTemRestricao(professor, dia, bloco) {
    const restricoes = professor.restricoes || [];
    return restricoes.some(r => {
      if (r.dia !== dia) return false;
      return bloco.inicio < r.fim && bloco.fim > r.inicio;
    });
  }

  turmaLivre(turmaId, dia, blocoId) {
    return !this.ocupacaoTurma[turmaId + '|' + dia + '|' + blocoId];
  }

  professorLivre(professorId, dia, blocoId) {
    return !this.ocupacaoProfessor[professorId + '|' + dia + '|' + blocoId];
  }

  podeAlocarEF(dia, blocoId) {
    const chave = dia + '|' + blocoId;
    return (this.contagemEF[chave] || 0) < 3;
  }

  professorEnsinaSerie(professor, serieId) {
    const serieIds = professor.serieIds || (professor.serieId ? [professor.serieId] : []);
    return serieIds.indexOf(serieId) !== -1;
  }

  escolherProfessor(disciplinaId, serieId, dia, turno, temposNecessarios) {
    const candidatos = this.estado.professores.filter(p =>
      p.disciplinaId === disciplinaId &&
      this.professorDisponivel(p, dia, turno) &&
      this.professorTemCargaDisponivel(p.id, temposNecessarios) &&
      this.professorEnsinaSerie(p, serieId)
    );

    if (candidatos.length === 0) return null;

    candidatos.sort((a, b) => {
      const idxA = this.estado.professores.indexOf(a);
      const idxB = this.estado.professores.indexOf(b);
      if (idxA !== idxB) return idxA - idxB;
      const ca = this.cargaProfessorSemana[a.id] || 0;
      const cb = this.cargaProfessorSemana[b.id] || 0;
      return ca - cb;
    });

    return candidatos[0];
  }

  embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  marcarOcupacao(alocacao) {
    const { turmaId, professorId, blocoId, dia } = alocacao;
    this.ocupacaoTurma[turmaId + '|' + dia + '|' + blocoId] = true;
    this.ocupacaoProfessor[professorId + '|' + dia + '|' + blocoId] = true;
    this.cargaProfessorSemana[professorId] = (this.cargaProfessorSemana[professorId] || 0) + 1;
    this.alocacoes.push(alocacao);
  }

  tentarGerar() {
    this.resetOcupacao();
    this.prepararBlocos();

    const cargas = [...this.estado.cargas];

    for (const carga of cargas) {
      const serie = this.estado.series.find(s => s.id === carga.serieId);
      if (!serie || serie.tipo === 'bloco_unico') continue;

      const turmasSerie = this.estado.turmas.filter(t => t.serieId === carga.serieId);
      if (turmasSerie.length === 0) continue;

      const diasPermitidos = this.diasPermitidosParaSerie(carga.serieId);

      for (const turma of turmasSerie) {
        const turnoTurma = turma.turno;
        let temposRestantes = carga.qtd;
        const paresNecessarios = Math.floor(temposRestantes / 2);
        let alocadosNestaTurma = 0;

        const tentarAlocarTempos = (qtdTempos) => {
          if (qtdTempos <= 0) return 0;
          let alocados = 0;

          const diasEmbaralhados = [...diasPermitidos];
          this.embaralhar(diasEmbaralhados);

          for (const dia of diasEmbaralhados) {
            if (alocados >= qtdTempos) break;

            const turno = turnoTurma;
            const chave = dia + '|' + turno;
            const blocos = this.blocosPorDiaTurno[chave] || [];
            if (blocos.length === 0) continue;

            const blocosLivres = blocos.filter(b =>
              this.turmaLivre(turma.id, dia, b.id)
            );

            if (qtdTempos === 1) {
              const blocoLivre = blocosLivres.find(b => {
                const prof = this.escolherProfessor(carga.disciplinaId, carga.serieId, dia, turno, 1);
                return prof && this.professorLivre(prof.id, dia, b.id) && !this.professorTemRestricao(prof, dia, b);
              });
              if (blocoLivre) {
                const prof = this.escolherProfessor(carga.disciplinaId, carga.serieId, dia, turno, 1);
                if (prof && !this.professorTemRestricao(prof, dia, blocoLivre)) {
                  this.marcarOcupacao({
                    id: 'g_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
                    turmaId: turma.id,
                    serieId: carga.serieId,
                    disciplinaId: carga.disciplinaId,
                    professorId: prof.id,
                    blocoId: blocoLivre.id,
                    turno: turno,
                    dia: dia,
                    ehContraTurno: false
                  });
                  alocados++;
                }
              }
            } else if (qtdTempos >= 2) {
              const paresPossiveis = [];
              for (let i = 0; i < blocosLivres.length; i++) {
                for (let j = i + 1; j < blocosLivres.length; j++) {
                  const b1 = blocosLivres[i];
                  const b2 = blocosLivres[j];
                  // Só considera pares adjacentes (blocos consecutivos no horário)
                  if (b1.fim !== b2.inicio && b2.fim !== b1.inicio) continue;
                  paresPossiveis.push([b1, b2]);
                }
              }
              this.embaralhar(paresPossiveis);

              for (const pair of paresPossiveis) {
                if (alocados >= qtdTempos) break;
                const b1 = pair[0];
                const b2 = pair[1];
                const prof = this.escolherProfessor(carga.disciplinaId, carga.serieId, dia, turno, 2);
                if (!prof) continue;
                if (!this.professorLivre(prof.id, dia, b1.id) || !this.professorLivre(prof.id, dia, b2.id)) continue;
                if (this.professorTemRestricao(prof, dia, b1) || this.professorTemRestricao(prof, dia, b2)) continue;

                const disc = this.estado.disciplinas.find(d => d.id === carga.disciplinaId);
                const isEF = disc && disc.nome.toLowerCase().indexOf('educação física') !== -1;
                if (isEF && !this.podeAlocarEF(dia, b1.id)) continue;
                if (isEF && !this.podeAlocarEF(dia, b2.id)) continue;

                this.marcarOcupacao({
                  id: 'g_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
                  turmaId: turma.id,
                  serieId: carga.serieId,
                  disciplinaId: carga.disciplinaId,
                  professorId: prof.id,
                  blocoId: b1.id,
                  turno: turno,
                  dia: dia,
                  ehContraTurno: false
                });
                this.marcarOcupacao({
                  id: 'g_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
                  turmaId: turma.id,
                  serieId: carga.serieId,
                  disciplinaId: carga.disciplinaId,
                  professorId: prof.id,
                  blocoId: b2.id,
                  turno: turno,
                  dia: dia,
                  ehContraTurno: false
                });
                alocados += 2;
              }
            }
          }
          return alocados;
        };

        if (paresNecessarios > 0) {
          alocadosNestaTurma += tentarAlocarTempos(paresNecessarios * 2);
        }
      }
    }

    return this.alocacoes;
  }

  pontuar(alocacoes) {
    let score = 0;
    let totalNecessario = 0;
    for (const carga of this.estado.cargas) {
      const turmasSerie = this.estado.turmas.filter(t => t.serieId === carga.serieId).length;
      totalNecessario += carga.qtd * Math.max(1, turmasSerie);
    }
    const alocadas = alocacoes.length;
    const taxa = totalNecessario > 0 ? alocadas / totalNecessario : 0;

    score += taxa * 1000;

    const porDiaDisciplina = {};
    for (const a of alocacoes) {
      const chave = a.turmaId + '|' + a.disciplinaId + '|' + a.dia;
      porDiaDisciplina[chave] = (porDiaDisciplina[chave] || 0) + 1;
    }
    let penalizacaoConcentracao = 0;
    for (const v of Object.values(porDiaDisciplina)) {
      if (v > 2) penalizacaoConcentracao += (v - 2) * 5;
    }
    score -= penalizacaoConcentracao;

    const diasUso = new Set(alocacoes.map(a => a.turmaId + '|' + a.dia));
    score += (alocadas / Math.max(1, diasUso.size)) * 10;

    return { score: score, alocadas: alocadas, total: totalNecessario, taxa: taxa };
  }

  gerar(tentativas = 60) {
    let melhor = null;
    this.alocacoesMelhores = [];

    for (let i = 0; i < tentativas; i++) {
      const alocacoes = this.tentarGerar();
      const resultado = this.pontuar(alocacoes);

      if (!melhor || resultado.score > melhor.score) {
        melhor = resultado;
        this.alocacoesMelhores = alocacoes.slice();
      }
    }

    let totalNecessario = 0;
    for (const carga of this.estado.cargas) {
      const turmasSerie = this.estado.turmas.filter(t => t.serieId === carga.serieId).length;
      totalNecessario += carga.qtd * Math.max(1, turmasSerie);
    }

    return {
      tentativas: tentativas,
      alocadas: melhor ? melhor.alocadas : 0,
      total: totalNecessario,
      taxa: totalNecessario > 0 ? ((melhor ? melhor.alocadas : 0) / totalNecessario * 100).toFixed(1) + '%' : '0%'
    };
  }
}

window.Gerador = Gerador;