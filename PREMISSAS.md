# Premissas de Formação de Horário — APP_NOVO

Este documento registra todas as premissas acordadas para o gerador de horários escolar.  
São a base de regras do sistema. Nada de código deve ser escrito sem respeitar estas premissas.

---

## 1. Entidades de entrada

| Entidade | Descrição |
|---|---|
| **Série / Turma** | Quem terá aula (6º–9º ano, 1ª–3ª série, PROEJA, Graduação) |
| **Disciplina** | O que será ensinado (Matemática, Português, Ed. Física, etc.) |
| **Carga** | Série + Disciplina + Aulas/semana |
| **Professor** | Nome, disciplina, série, carga máxima, disponibilidade (dia + turno) |
| **Bloco / Horário** | Espaços de tempo da semana (dia + turno + hora inicial/final) |

---

## 2. Hard Constraints (não podem ser quebradas)

| # | Regra |
|---|-------|
| 1 | Professor não dá aula em dois lugares ao mesmo tempo. |
| 2 | Turma não tem duas aulas ao mesmo tempo. |
| 3 | Professor só aloca em sua disponibilidade (dia + turno). |
| 4 | Professor não excede carga máxima semanal. |
| 5 | Cada turma recebe exatamente a carga semanal definida por disciplina (nem mais, nem menos). |
| 6 | Blocos não se sobrepõem no tempo. |
| 7 | **Pareamento de tempos:** aulas alocadas em pares de 2 tempos. Carga ímpar = pares + 1 tempo solto. |
| 8 | **Contra turno (Ensino Médio):** aulas sobrantes podem ser alocadas no contra turno (manhã/tarde inverso), no mesmo dia. |
| 9 | **Sábado quinzenal:** tempos alocados no sábado contam como meia carga (ex: 2 tempos de História no sábado = 1 tempo de carga). |
| 10 | **Dias úteis:** 6º–9º ano = 5 dias (seg–sex); 1ª–3ª série = 6 dias (inclui sábado). |
| 11 | **Turnos:** apenas Manhã e Tarde. PROEJA e Graduação são registro de carga noturna do professor, sem grade gerada (bloco único). |
| 12 | **Duração da aula:** 40 minutos. |
| 13 | **Horários:**<br>• Manhã: 07:00 às 12:00, intervalo de 20 min às 09:40<br>• Almoço: 12:00 às 13:00 (sem aulas)<br>• Tarde: 13:00 às 18:00, intervalo de 20 min às 15:40 |
| 14 | **Educação Física:** no máximo 3 turmas no mesmo horário. Outras disciplinas: sem limite simultâneo. |
| 15 | **Séries sem grade (bloco único):** apenas PROEJA e Graduação. |

---

## 3. Soft Constraints (preferências, tentativas de respeito)

- Evitar muitos intervalos vazios na grade da turma (compactar as aulas).
- Distribuir aulas de uma mesma disciplina em dias diferentes (após garantir o pareamento).
- Respeitar turnos preferenciais do professor (já coberto pela Hard Constraint #3 de disponibilidade).

---

## 4. Observações importantes

- **PROEJA e Graduação:** não aparecem no quadro/grade de horários. Elas existem apenas como segmento do professor para registrar carga noturna. No cartão do professor aparecem como bloco único.
- **Sábado:** apenas para 1ª–3ª série (Ensino Médio). Conta como meia carga e é quinzenal.
- **Contra turno:** aplica-se ao Ensino Médio quando houver falta de horário na grade própria do turno.
- **Estado da aplicação:** offline, em um único computador, salvando em `localStorage`. Backup oficial via Exportar/Importar JSON.

---

*Versão: 1.0 — Definido em 06/11/2026*