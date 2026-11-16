# Dimensões dos cards do Calendário

Objetivo: manter cards próximos à proporção 3:2 de Calender.png, independentes da altura disponível da janela.

- B1: em 1360×768 e zoom reduzido, cards não achatam nem alongam; teste de geometria em navegador `scripts/check-calendar-sizing.mjs` (assertivas de proporção e independência da altura).
- B2: cinco e seis semanas mantêm as mesmas dimensões por card; calendário cresce com o conteúdo; mesmo teste de navegador, meses novembro/agosto de 2026.
- B3: em tela estreita, sete colunas continuam acessíveis, sem sobreposição do conteúdo; mesmo teste em 390×844; testes existentes de MonthCalendar/CalendarPage preservam datas e navegação.

Decisão: proporção 3:2 e altura mínima em unidades da escala existente; remover altura vinculada ao viewport e tamanhos de fonte em vh. O limite de largura já existente no layout limita o crescimento no desktop. Rejeitado: forçar todas as semanas na altura disponível ou acrescentar uma segunda largura máxima conflitante com o layout.
Risco: haverá rolagem vertical quando necessário, especialmente com seis semanas; preservar conteúdo tem prioridade sobre caber na janela.
Escopo: somente dimensões do calendário, sem mudar dados, filtro ou outros componentes.
