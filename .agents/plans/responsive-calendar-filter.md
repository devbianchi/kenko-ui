# Responsividade e filtro mensal — ledger

Objetivo: padronizar o cabeçalho pela escala da Home e tornar o filtro de mês/ano explícito, validado e animado na Home e no Calendário.

| ID | Comportamento observável | Origem | Verificação prevista |
|---|---|---|---|
| B1 | Home e Calendário mostram o mesmo filtro no lado direito do cabeçalho; todas as páginas usam a mesma largura/escala de cabeçalho. | Pedido; guia de estilização | AppLayout.test.tsx: estrutura comum e filtros apenas nas duas rotas |
| B2 | Título no cabeçalho do calendário fica dentro do painel da grade como “Mês | Ano”. | Pedido; Calender.png | CalendarPage.test.tsx: mês e ano dentro do calendário |
| B3 | Clicar em um dia usa a escala de pressão e hover da Home, respeitando movimento reduzido. | Pedido; DashboardCard | MonthCalendar.test.tsx: link selecionável e classes de movimento conforme componente compartilhado |
| B4 | Trocar mês/ano confirmado produz saída e entrada suaves no resumo da Home e no painel do Calendário. | Pedido | MonthTransition.test.tsx: saída, troca de conteúdo e entrada após timers |
| B5 | Seletor mantém rascunho sem alterar URL; “Aplicar” confirma data válida uma vez. Data incompleta/inválida mostra erro, desabilita Aplicar e mantém período/URL. | Pedido; Home existente | MonthPicker.test.tsx: rascunho, aplicação, inválidos, limites e confirmação |
| B6 | URL com período bem formado fora da faixa ou malformado é normalizada para data válida e preserva demais parâmetros sem novo histórico. | Pedido; contexto §4 | HomePage.test.tsx e CalendarPage.test.tsx: URLs inválidas normalizadas |
| B7 | Título do mês fica menor e com menos espaço até a faixa dos dias, preservando título dentro do painel. | Pedido de refinamento visual | CalendarPage.test.tsx: título continua dentro da região do calendário; build |
| B8 | Alerta de data inválida quebra linha dentro do popover e os controles permanecem contidos nele em larguras estreitas. | Imagem enviada na solicitação | MonthPicker.test.tsx: alerta pertence ao formulário acessível e Aplicar segue desabilitado |
| B9 | Calendário reduz dimensões conforme a altura da viewport, mantendo todas as 5/6 semanas acessíveis sem rolagem em alturas usuais de desktop e celular. | Pedido; Calender.png | MonthCalendar.test.tsx: 35/42 datas continuam na grade; build |
| B10 | Conteúdo principal usa a mesma largura máxima do cabeçalho, alinhando as bordas no desktop e ocupando a largura disponível em telas estreitas. | Pedido; Calender.png | AppLayout.test.tsx: main e header compartilham max-width |

## Decisões

- Layout comum controla cabeçalho, largura e escala; filtro aparece apenas em `/home` e `/calendar` | remove divergência estrutural e mantém filtro nos dois lugares solicitados | rejeitado: cabeçalhos duplicados nas páginas.
- `MonthPicker` mantém rascunho mês/ano e confirmação por botão | edição não publica valores parciais e o usuário decide quando aplicar | rejeitado: confirmar ao mudar cada campo.
- Período inválido mantém “Aplicar” visível e desabilitado com erro vermelho | comunica o problema e impede ação sem esconder controle | rejeitado: publicar valor parcial.
- Um componente `MonthTransition` retém o conteúdo anterior durante fade-out e troca depois pelo novo conteúdo em fade-in | transição de saída e entrada observáveis, sem dependência | rejeitado: animar apenas a entrada via keyframe.
- URL canônica usa replace e conserva parâmetros não relacionados | URL inválida se corrige sem contaminar Voltar | rejeitado: deixar endereço inválido enquanto apenas exibe fallback.
- Título usa `text-section` no mobile e `text-metric` no desktop, com margem inferior reduzida a `mb-1` | reduz altura e aproxima o início da grade sem alterar a composição do painel | rejeitado: tamanho `text-page` e margem `mb-3`.
- Popover limita largura, permite quebra de texto e mantém campos em `min-w-0` | evita que o alerta force o painel para fora da tela | rejeitado: ocultar alerta ou truncar sua mensagem.
- Painel usa altura baseada na viewport, linhas iguais e tipografia de células que escala com a altura disponível | mantém a grade completa no espaço da página | rejeitado: altura mínima fixa por célula que força rolagem.
- Conteúdo principal compartilha `max-w-dashboard-header` com o header | alinha as bordas do conteúdo ao cabeçalho da referência | rejeitado: largura principal maior que o cabeçalho.

## Riscos

- Animações e geometria são verificáveis parcialmente em jsdom; movimento reduzido precisa continuar sem animação.
- Alterar a publicação do seletor requer atualizar testes existentes da Home e Calendário que pressupõem confirmação imediata.
