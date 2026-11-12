# Kenko — Guia de estilização

## Escopo

Implementar somente modo claro. Referências de composição em [public/assets](../../public/assets/): Home.png, Analytics.png, Calender.png, Dia.png e Simulação Bot.png. Regras funcionais do [contexto](contexto-front.md) prevalecem sobre conteúdo ilustrativo dos PNGs. Modo escuro e alternância de tema ficam fora desta etapa.

## Cores e variáveis

Usar utilitários TailwindCSS para toda a apresentação, inclusive responsividade, foco e movimento. Manter apenas importação e configuração de tokens em src/styles.css, sem seletores CSS próprios para componentes. Centralizar os valores abaixo em variáveis reutilizáveis no @theme.

| Variável CSS | Valor | Aplicação |
| --- | --- | --- |
| --color-foreground | #293632 | Títulos/texto principal, navegação, Nova Conversa, Total em Dia e Conclusão do Bot em Analytics. |
| --color-background | #F5F8F6 | Fundo de páginas/cartões claros, balão do bot e conteúdo claro sobre fundos escuros. |
| --color-border | #C9D8D2 | Calendário, tabela por sala e painéis do Showcase; não aplicar borda a todo cartão. |
| --color-gray | #A9BAB2 | Datas/contagens esmaecidas e cartão de duração em Analytics. |
| --color-text-muted | rgba(41, 54, 50, 0.60) | Texto secundário; opacidade na cor, não no contêiner. |
| --color-primary | #568DAB | Mês da Home, completude/barras horárias em Dia, buscas sem horário, funil e mediana em Analytics. |
| --color-secondary | #28627E | Buscas por especialidade, média móvel e azul escuro do resumo Tarde. |
| --color-tertiary | #8FC5D8 | Desistiu, barras claras do histograma, heatmap e azul claro do resumo Manhã. |
| --color-tertiary-2 | #244C61 | Abandonou e destaque de P90. |
| --color-day-cancelled | #ABBAAC | Fundo do cartão Canceladas em Dia; distinto de --color-gray. |
| --color-chat-panel | #EBEFEF | Fundo do painel de chat; distinto do balão do bot. |
| --color-bot-avatar | #3E517A | Símbolo circular do avatar do bot. |
| --color-gradient-start | #A9C6D0 | Início do degradê padrão. |
| --color-gradient-end | #8EAFBC | Fim do degradê padrão. |

Preservar cores por componente/série. Canceladas não tem necessariamente o mesmo fundo em Home e Dia; Nova Conversa usa foreground, não primary. O texto mutado não exige uma cor composta adicional. Não substituir o painel de chat por #BAE5F4.

### Degradê padrão

A receita do cabeçalho atual em [src/styles.css](../../src/styles.css) é o padrão aprovado:

```css
--background-image-brand: linear-gradient(100deg, var(--color-gradient-start), var(--color-gradient-end));
```

O token gera a classe Tailwind bg-brand. Equivale a linear-gradient(100deg, #a9c6d0, #8eafbc). Usar como referência comum dos preenchimentos em degradê do cabeçalho, faixa dos dias, dia destacado e balão do paciente, preservando a composição de cada PNG. Um tom intermediário, como #A0BECD no balão, não é uma cor sólida separada.

### Estados e efeitos

Campos, hover, focus, disabled e sombras fazem parte da apresentação dos componentes, não de uma lista de usos a confirmar. Ao implementar o componente, centralizar seus valores em variáveis semânticas próprias (por exemplo --shadow-card, --color-field-background, --color-focus-ring e --opacity-disabled), reproduzindo o design e mantendo consistência entre telas. Não transformar sombra em borda nem aplicar opacidade de texto ao contêiner inteiro. Os PNGs orientam composição, dimensões e efeitos; este guia não fixa números adicionais para esses valores.

## Tipografia

Plus Jakarta Sans usa peso bold (700); 42dot Sans usa semibold (600). As fontes exclusivas da marca mantêm peso normal (400). KENKO tem sublinhado pontilhado na cor secondary em todas as páginas.

Utilizar a escala compartilhada de tipografia (label, body, section, metric, page, count, month) e as unidades de espaçamento Tailwind. Preservar valores específicos apenas quando necessários à proporção fluida, grade ou ajuste óptico da marca. Ícones são de @heroicons/react; não usar Lucide.

| Variável CSS | Família | Aplicação |
| --- | --- | --- |
| --font-heading | Plus Jakarta Sans | Títulos de páginas, seções e cartões. |
| --font-body | 42dot Sans | Parágrafos, rótulos, botões, tabelas, legendas, mensagens e dados. |
| --font-brand | Rhodium Libre | Texto latino KENKO, restrito ao logotipo. |
| --font-brand-japanese | Zen Maru Gothic | Texto japonês ケンコ, restrito ao logotipo. |

Tamanhos, pesos, espaçamentos, arredondamentos e sombras acompanham os PNGs. Centralizar valores reutilizados, preservando hierarquia e consistência entre páginas.
