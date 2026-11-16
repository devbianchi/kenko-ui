# Correções de Calendário e Dia

Objetivo: resolver o retorno RV1–RV4 e conferir a implementação funcional de Dia no protótipo.

| ID | Resultado observável | Verificação |
|---|---|---|
| B1 (review RV1) | Ao interromper ou reverter a troca, o mês selecionado termina visível na Home e no Calendário. Movimento reduzido exibe a seleção imediatamente. | src/shared/components/tests/MonthTransition.test.tsx, retorno durante a transição, troca simples e movimento reduzido |
| B2 (review RV2) | Por decisão posterior do usuário, completude e ocupação do Dia exibem percentuais inteiros arredondados. Zero com base é 0% e ausência de base é —. | src/features/day/tests/DayPage.test.tsx, frações, percentuais inteiros, zero e ausência de base |
| B3 (review RV3) | Escape dispensa o popup por hover ou foco e preserva o foco atual. Um novo hover pode abri-lo novamente. | src/features/day/components/tests/BarCharts.test.tsx, Escape com foco na barra ou fora do gráfico |
| B4 (review RV4) | Home e Calendário publicam o período válido ao enviar o formulário Aplicar. Rascunho inválido bloqueia a confirmação, Escape descarta e Voltar sincroniza. | src/shared/components/tests/MonthPicker.test.tsx e specs de HomePage e CalendarPage |
| B5 (review RV4) | Dia apresenta a data da rota, status, completude, consulta por hora e período, salas, ocupação e pico conforme RF-13 e MET-D01–07. O resumo usa a mesma fixture nas datas e o gráfico exibe horas de início das 7 às 17. | src/features/day/tests/DayPage.test.tsx, BarCharts.test.tsx e CalendarPage.test.tsx |

Decisões: reaproveitar transição, portal e cards existentes. Aplicar formatação percentual somente na apresentação. Documentar o contrato compartilhado já implementado e manter os relatórios históricos como registros da etapa correspondente.

Riscos cobertos: timers cancelados durante a troca, divisão sem base, fechamento por Escape quando a barra não recebe o evento de teclado e perda de parâmetros no histórico. A alteração na transição compartilhada exige suíte completa e build.

## Integração da main
- INT-1: verificar dia e mês no título e ano e dia da semana no subtítulo após navegar pelo calendário e ao abrir o dia bissexto. Executar a suíte completa e o build antes do merge local.
