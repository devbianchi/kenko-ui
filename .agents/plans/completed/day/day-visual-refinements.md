# Ajustes visuais do Dia
Objetivo: corrigir cabeçalho, popup horário e movimento da tabela conforme Dia.png e pedido atual.

- B1: cabeçalho tem fundo contínuo e quatro cantos arredondados; teste real de navegador em scripts/check-day-refinements.mjs.
- B2: hover/foco em horário mostra popup customizado com horário e contagem exata, inclusive zero; saída/blur/Escape ocultam; sem title nativo. Popup acompanha o cursor imediatamente acima dele; por teclado, aparece acima da barra. Testes em src/features/day/components/tests/BarCharts.test.tsx, incluindo série vazia já existente, e geometria/movimento em scripts/check-day-refinements.mjs.
- B3: somente linhas de dados da tabela recebem escala no hover, sem sombras (correção solicitada durante implementação); cabeçalho e card permanecem imóveis; movimento reduzido respeitado. Teste real de navegador em scripts/check-day-refinements.mjs.
- B4: popup entra e sai com fade de 150ms, desativado sob movimento reduzido; scripts/check-day-refinements.mjs verifica opacidade intermediária nas duas direções.

Decisões: recortar fundo do tr com inset arredondado preserva degradê contínuo; desativar motion do card e aplicar movimento nas linhas; popup em portal para não herdar escala do gráfico, sem biblioteca nova, também acessível pelo teclado. Preservar dados, rotas e gráficos restantes. Manter popup montado durante fade, ocultando-o da árvore acessível ao sair.
Riscos: overflow da tabela pode cortar escala nas bordas; reservar espaço interno para o efeito. Popup deve caber no gráfico nas extremidades.
