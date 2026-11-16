# Retorno de Dia e Showcase

Objetivo: atender ao plano de 16/11 e a day-showcase-review.md, mantendo os mocks aprovados.

| ID | Comportamento e origem | Verificação prevista |
|---|---|---|
| B1 | D1 (review): data malformada, impossível ou fora da janela mostra apenas o cartão do asset, com retorno ao Calendário. Data válida monta o painel. | DayPage.test.tsx, rotas inválidas, controle válido e retorno |
| B2 | D2 (review): setas bloqueadas até terminar a entrada, percentuais inteiros. | DayPage.test.tsx, avanço e retorno e percentuais |
| B3 | D3 (review): primeiro clique, repetição em outra altura e clique após Escape ancoram no ponteiro; Tab ancora na barra. | BarCharts.test.tsx e Chrome |
| B4 | N1 (review): recolher, expandir e inverter suavemente em desktop e tela estreita; links recolhidos fora do Tab, movimento reduzido imediato. | AppHeader.test.tsx e Chrome |
| B5 | S1–S3 (review): apagar inativa preserva identidade da ativa, apagar ativa escolhe outra ou mostra vazio; lista e painel mantêm apresentação estática. | ShowcasePage.test.tsx |
| B6 | Ajuste adicional do usuário. O botão Voltar ao Calendário cresce no hover, volta à escala normal enquanto pressionado e abre o calendário ao soltar. | Chrome em scripts/check-day-showcase.mjs |

Decisões: validar a rota antes da transição; preservar as durações próprias do Dia; manter estado de conversas na página. Risco: o foco disparado pelo ponteiro sobrescrever a posição do primeiro clique, verificado com eventos reais no navegador.
