# Kenko — Guia de estilização

## Escopo visual atual

Desenvolver **somente o modo claro (light mode)** neste momento, seguindo os mocks do frontend em `Kenko Design`. Os valores de **dark mode serão fornecidos posteriormente, após a conclusão do design básico com os mocks**. Não deduzir uma paleta escura nem implementar alternância de tema nesta etapa.

## Cores — Light mode

Os valores abaixo vêm da imagem de variáveis fornecida. A aplicação foi conferida visualmente e por amostragem/contagem de pixels nos cinco PNGs claros da raiz de `public/assets`: Home, Calender, Dia, Analytics e Simulação Bot. 

| Estilo / variável CSS | Valor | Uso | 
| --- | --- | --- | --- |
| Foreground Clean — `--color-foreground` | `#293632` | Títulos e texto principal do painel; fundo da navegação; botão Nova Conversa; cartão Total em Dia e Conclusão do Bot em Analytics. |
| Background Clean — `--color-background` | `#F5F8F6` | Fundo das páginas, cartões claros e balão do bot; também texto/ícones claros sobre alguns preenchimentos escuros.  |
| Borda Clean — `--color-border` | `#C9D8D2` | Contorno do calendário, linhas/contornos da tabela por sala e painéis do Showcase. Não generalizar para todos os cartões ou campos. |
| Cinza — `--color-gray` | `#A9BAB2` | Datas e contagens esmaecidas no calendário; fundo do cartão de duração em Analytics. |
| Texto Mutado Clean — `--color-text-muted` | `rgba(41, 54, 50, 0.60)` | Texto mutado nos exemplos. | 
| Cor Primária — `--color-primary` | `#568DAB` | Bloco de mês da Home; Taxa de Completude e barras por horário em Dia; Buscas sem Horário, funil e barra destacada da mediana em Analytics. |
| Cor Secundária — `--color-secondary` | `#28627E` | Barras de buscas por especialidade e linha de média móvel em Analytics; referência azul escura do resumo Tarde em Dia, que apresenta variações de preenchimento. |
| Cor Terciária — `--color-tertiary` | `#8FC5D8` | Série Desistiu, barras claras do histograma e células claras do heatmap em Analytics; referência clara do resumo Manhã em Dia. | 
| Cor Terciária 2 — `--color-tertiary-2` | `#244C61` | Série Abandonou e barra destacada de P90 em Analytics. | 

O texto mutado usa `#293632` com **60% de opacidade na própria cor**, sem reduzir a opacidade do contêiner. Sobre `#F5F8F6`, produz aproximadamente `#7B8480`, observado no remetente do bot. Isso não transforma esse hexadecimal composto em uma nova variável.

## Usos não confirmados e diferenças encontradas

| Elemento | Evidência nos PNGs | Orientação |
| --- | --- | --- |
| Cartão Canceladas — Dia | Fundo sólido amostrado em `#ABBAAC`, diferente de Cinza `#A9BAB2`. | Não afirmar que usa a variável Cinza. Valor observado, sem variável correspondente fornecida; confirmar a intenção antes de padronizar. |
| Painel de chat — Showcase | Preenchimento predominante `#EBEFEF`; balão do bot em `#F5F8F6`. | Não aplicar `#BAE5F4` a ambos por causa do nome Chatbot. O preenchimento do painel não tem variável fornecida confirmada. |
| Cabeçalho, faixa dos dias, dia destacado e balão do paciente | Preenchimentos azulados com variação/degradê; balão do paciente tem, por exemplo, pixel `#A0BECD`. | Aparência observada, mas cores de parada, opacidade e receita do degradê não confirmadas. Um pixel isolado não define um token. |
| Avatar do bot | Azul `#3E517A` observado no símbolo circular. | Cor fora da lista; tratar como parte do asset de marca, sem substituir automaticamente por uma cor de gráfico. |
| Campos, hover, focus, disabled, sombras e degradês | Os mocks não fornecem uma especificação completa desses estados/efeitos. Muitos cartões são delimitados por sombra, não por borda visível. | Aplicações e valores adicionais não confirmados; não apresentar sugestões como tokens extraídos do design. |

As outras oito cores sólidas fornecidas foram localizadas por valor exato em pelo menos um dos mocks claros. Texto Mutado foi avaliado pela composição de opacidade. Pixels isolados de uma cor em outros componentes podem resultar de suavização de bordas: não comprovam uso intencional da variável ali.

## Tipografia

| Estilo | Família | Onde utilizar |
| --- | --- | --- |
| Títulos | **Plus Jakarta Sans** | Títulos de páginas, seções e cartões. |
| Texto comum | **42dot Sans** | Parágrafos, rótulos, botões, tabelas, legendas, mensagens e dados da interface. |
| Logo — Kenko | **Rhodium Libre** | Texto latino da marca: KENKO. |
| Logo — Japonês | **Zen Maru Gothic** | Texto japonês da marca: ケンコ. |

Tamanhos, pesos, espaçamentos, arredondamentos e sombras devem acompanhar os mocks; não há valores adicionais definidos neste guia. As fontes da marca ficam restritas ao logotipo.

## Aplicação

- Centralizar cores e famílias tipográficas em variáveis reutilizáveis; manter os tokens fornecidos separados das cores apenas amostradas nos PNGs.
- Preservar hierarquia visual e consistência entre Home, Calendário, Dia, Analytics e Showcase.
- Usar os mocks como referência de composição; a aparência escura do painel de variáveis da imagem não representa o tema da aplicação.
- Preservar cores por componente/série, sem transformar a paleta em regras globais não demonstradas: Canceladas não usa o mesmo fundo em Home e Dia, e o botão Nova Conversa usa Foreground, não Cor Primária.
- As fontes são as declaradas pelo usuário; os PNGs não comprovam nomes de famílias, pesos ou tamanhos. Não inferir que uma cor encontrada resolve também a tipografia.
- Manter o dark mode fora da implementação atual até o fornecimento de sua paleta.
