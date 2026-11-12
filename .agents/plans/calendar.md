# Calendário — ledger de implementação

Objetivo: reproduzir Calender.png com o mock de calendário e seleção mensal limitada a janeiro/2024 até o mês atual em Brasília.

| ID | Comportamento observável | Origem | Verificação prevista |
|---|---|---|---|
| B1 | Grade mensal começa no domingo e termina no sábado, com datas reais adjacentes e cinco ou seis semanas conforme o mês. | Pedido; TELA-02; RF-12; VAL-38 | MonthCalendar.test.tsx: compõe Outubro/2026 com 35 dias, fevereiro com 35 e agosto/2026 com 42 |
| B2 | Dia de hoje vem do mock e recebe destaque; somente dias fora do mês ficam esmaecidos. | Pedido; TELA-02; VAL-23 | MonthCalendar.test.tsx: destaca hoje e não esmaece futuro do mês |
| B3 | Contagens vêm de countsByDate e data ausente mostra zero. | Pedido; mocks/calendar/calendario.ts | MonthCalendar.test.tsx: mostra contagem do mock e zero ausente |
| B4 | Clique em qualquer data, inclusive adjacente, navega para /calendar/:date, que permanece no placeholder Dia. | Pedido; TELA-02 | CalendarPage.test.tsx: navega datas internas e adjacentes para rota de Dia |
| B5 | Filtro mensal aceita 2024-01 até mês atual, limita URL bem formada fora dos limites, mantém fallback mock para valor malformado e preserva query restante. | Pedido; regra Home; contexto §4 | CalendarPage.test.tsx: limites, URLs inválidas, filtro e preservação |
| B6 | Layout acompanha o cabeçalho, tipografia, cores, superfícies e responsividade do guia/PNG. | Pedido; guia-estilizacao.md; Calender.png | CalendarPage.test.tsx: rótulos acessíveis e sete colunas; build |

## Decisões

- Grid própria reutilizável recebe mês, mapa de contagens, hoje e callback de seleção | uma responsabilidade visual testável sem dependência de calendário | rejeitado: gerar datas dentro da página ou adicionar biblioteca.
- Reutilizar MonthPicker, AppHeader e tokens atuais | mantém a regra de limites já aprovada na Home | rejeitado: duplicar seletor/limites ou adicionar filtro no layout global.
- Persistir mês em `?month=YYYY-MM`, como na Home | URL compartilhável e navegação preservam filtros | rejeitado: estado local que se perde em Voltar/recarregar.

## Riscos

- Fixture é esparsa e estática; datas não listadas serão zero e não representam dados reais.
- jsdom não comprova fidelidade de pixels ou layout em navegador.
