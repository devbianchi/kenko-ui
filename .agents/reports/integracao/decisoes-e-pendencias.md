# Integração com a API: decisões e pendências do frontend

Resumo do que foi decidido ao integrar o `kenko-ui` à Kenko API (etapas F0 a F5, PR #1) e do que ficou em aberto. O contrato autoritativo é o `docs/endpoint/README.md` do repositório `kenko-api`. Os relatórios de cada etapa estão nesta mesma pasta.

## Pendências

Itens em aberto, do mais importante para o menos importante.

| # | Pendência | Por que importa | Próximo passo sugerido |
|---|---|---|---|
| P1 | O PR #1 depende dos PRs #37 e #38 do `kenko-api`. | Sem o #37, o front não lê o `X-Request-Id` (o "Código para suporte" não aparece) e não recebe a saudação quando a criação da conversa é repetida após falha de rede. O #38 só afeta quem tem outro PostgreSQL na porta 5432. | Mesclar #37 e #38 antes do PR #1. |
| P2 | O gráfico por hora do Dia continua mostrando só 07h a 17h, decisão do protótipo. | O contexto (§4, Dia) pede o expediente efetivo da clínica. Hoje, uma consulta fora dessa faixa não aparece no gráfico, embora conte no total. | Decidir se o gráfico passa a usar o expediente de `GET /api/clinic` ou todas as horas recebidas. |
| P3 | A transcrição local registra "Dados do paciente informados", e não o nome e o nascimento digitados. | O contexto diz que o front registra as entradas do usuário. Foi uma escolha de privacidade, para não guardar dado pessoal no navegador. | O time confirma o rótulo neutro ou decide registrar o texto. |
| P4 | Testes rodando no Node 25 ou mais novo falham sem a flag `--no-experimental-webstorage`. | O `localStorage` experimental do Node encobre o do jsdom. O repositório não tem `.nvmrc`, então nada impede rodar com outra versão. | Adicionar `.nvmrc` com 24, ou colocar a flag na configuração do Vitest. |
| P5 | A tela não foi verificada no navegador, ponta a ponta, por quem implementou. | Os testes usam a API substituída, e uma sonda percorreu o bot real em jsdom, mas layout, animações e CORS real só aparecem no navegador. | Roteiro manual da seção "Como verificar", abaixo. |
| P6 | Fluxo do repositório: a skill `git-workflow` proíbe abrir pull request, mas o PR #1 foi aberto a pedido do dono. | Os seis branches estão empilhados (`feat/fundacao-api` até `feat/showcase-api`). | Decidir entre mesclar o PR #1 ou fechar o PR e fazer o merge `--no-ff` na ordem das etapas, e ajustar a skill se o fluxo com PR passar a valer. |
| P7 | Transcrição apagada (limpeza do navegador) não é avisada na tela. | O GET da conversa traz o estado e a tela atual, mas não reconstrói o texto. Hoje a conversa reaparece sem mensagens antigas, sem explicação. | Mostrar uma nota curta quando houver estado sem transcrição. |
| P8 | Duas abas com a mesma conversa não se sincronizam. | A segunda aba recebe `409 STALE_CONVERSATION_STATE` e se atualiza, então não há erro de dados, só uma tela desatualizada até a próxima ação. | Opcional: ouvir o evento `storage` para sincronizar ids e ocultas. |
| P9 | O limite de mês e dia usa o relógio do navegador (`businessToday()`). | Perto da meia-noite, o navegador pode aceitar um período que o servidor ainda considera futuro. A API responde `FUTURE_PERIOD`, e a página mostra a orientação de período inválido. | Aceito como está; revisar só se incomodar na demonstração. |
| P10 | Lint não está configurado. | A segurança de tipos vem do `tsc -b` estrito e do `switch` exaustivo das telas do bot. | Configurar ESLint quando o time decidir. |
| P11 | Os mocks foram comparados com as respostas reais uma única vez. | Hoje, a estrutura de Home, Calendário, Dia e Analytics é idêntica à da API. Se o contrato mudar, os testes continuam passando com mocks desatualizados. | Repetir a comparação quando o contrato mudar. |
| P12 | A cópia do contrato em `.agents/context/completo/` ainda difere da do backend em detalhes de redação. | O `missingDateTotal` já foi removido. Em caso de dúvida, vale o `docs/endpoint/README.md` do backend. | Trocar a cópia por um link, ou sincronizar quando houver mudança. |

## Decisões

### Comunicação com a API

| Decisão | Motivo |
|---|---|
| A URL da API vem de `VITE_API_URL` (`.env.example`), com padrão `http://localhost:8080/api`. | Funciona no `dev`, no `preview` e em hospedagem, e usa o CORS que a API já libera. Um proxy do Vite só valeria no `dev`. |
| O Vite roda fixo na porta 5173 (`strictPort`). Abra por `localhost`, não por `127.0.0.1`. | A API só libera as origens configuradas no CORS. Se a porta estiver ocupada, falhar é melhor que trocar de porta em silêncio. |
| O cliente envia `Content-Type: application/json` só quando há corpo, e não envia `X-Request-Id`. | Em GET, o cabeçalho forçaria um preflight de CORS sem necessidade. O `X-Request-Id` não está entre os cabeçalhos aceitos pela API. |
| Erros da API viram `ApiError` (status, código, mensagem, campos, `requestId`); falta de resposta vira `NetworkError`. | Separar "a API recusou" de "não houve resposta". Falha de rede não prova sucesso nem fracasso. |
| O 409 `SLOT_UNAVAILABLE` guarda a tela de recuperação em `ApiError.payload`. | A nova oferta de horários vem junto do erro e não pode ser descartada. |
| O conteúdo de `data` é confiado ao contrato, sem validação em runtime; só o envelope e o erro são conferidos. | O projeto não usa Zod. Validar cada endpoint duplicaria o contrato. |

### Leituras dos painéis

| Decisão | Motivo |
|---|---|
| Home, Calendário, Dia e Analytics usam TanStack Query. | Carregamento, erro, cache e nova tentativa prontos para as quatro telas. |
| Política de nova tentativa: não repete erro 4xx; repete falha de servidor ou de rede até duas vezes. `staleTime` de 30 s, sem refetch ao focar a janela. | Um 4xx é resposta definitiva da API. |
| Home, Calendário e Analytics mantêm os dados anteriores ao trocar de período (`keepPreviousData`). O Dia não mantém. | No Dia, manter o dia anterior durante a animação mostraria o título de uma data com os números de outra. |
| `QueryState` mostra carregamento, dados ou erro. Códigos de parâmetro recusado mostram a tela de data inválida da página; API fora do ar e 503 têm mensagem própria; o `requestId` aparece como "Código para suporte". | Um único lugar para os estados de leitura. |
| As páginas que já recebiam `data` por props (Home e Dia) continuam aceitando, para os testes; sem `data`, buscam na API. | Preservar os testes de apresentação existentes. |
| Home, Calendário e Analytics abrem no mês atual de Brasília. | Antes, o padrão era um mês fixo do mock. |
| O mínimo de janeiro de 2024 continua sendo regra só do front. | A API aceita qualquer período que não seja futuro. |
| Completude, ocupação, manhã/tarde, próximas consultas e os blocos da série vêm prontos da API; a tela só arredonda. | O servidor já calcula, com testes, e dois relógios ou duas regras podiam divergir. |
| O Calendário pede o intervalo visível: da primeira célula até o dia seguinte à última. O dia de hoje destacado vem da API. | A grade é decisão do front, e "hoje" deve ser o do servidor. |
| Em Analytics, `completionSeries.grouping` é `daily`, `month_blocks` ou `monthly`. Semana e ano passaram a ter dados. | Valores reais da API. O protótipo usava `day` e `month`. |
| Período ou data inválidos para o painel são recusados antes de chamar a API. | Evita requisição que o painel não permite. |

### Showcase

| Decisão | Motivo |
|---|---|
| O estado do bot fica num hook próprio (`useShowcase`), não no TanStack Query. | São ações com revisão e reenvio, não leituras; a ação pendente precisa sobreviver a uma recarga. |
| Tudo do Showcase no navegador fica sob `kenko:showcase:v1:*`: `ids`, `hidden`, `selected`, `transcript:{id}`, `state:{id}`, `pending:{id}` e `pending-create`. Dado corrompido é ignorado. | Prefixo versionado permite mudar o formato depois; storage com problema não derruba a tela. |
| O contato é `ui_<uuid>`, gravado antes da criação. Se a criação falhar, a próxima tentativa reaproveita o mesmo contato. | Regra do contexto: a mesma intenção usa o mesmo contato; uma nova intenção, outro. |
| Cada ação usa `actionId` novo (`act_<uuid>`) e a revisão do último estado. Só uma ação por vez em cada conversa. | Evita duas ações com ids diferentes num clique duplo. |
| Falha de rede ou de servidor mantém a ação pendente e bloqueia novas ações. "Reenviar" manda o mesmo `actionId`, conteúdo e revisão; "Atualizar estado" relê a conversa. | A API deduplica pelo `actionId`, então o reenvio não duplica reserva. |
| Revisão antiga, conversa encerrada ou abandonada, reserva não cancelável ou não encontrada e entrada fora do passo: a tela relê a conversa e não reenvia sozinha. | O estado mudou fora daqui; quem decide o próximo passo é a pessoa. |
| Erros de nome e nascimento aparecem junto do campo, e o que foi digitado continua no formulário. | O formulário só faz validação básica; a API decide. |
| A entrada do usuário só entra na transcrição quando a API aceita a ação. | Evita bolhas de ações recusadas. |
| A saudação e os textos do bot vêm do roteiro no banco. A saudação longa, o "16:50" e o "1m" escritos no protótipo saíram. | Regra do contexto: textos do roteiro ficam no banco. |
| O tempo na lista é calculado com o `evaluatedAt` da API. A lista é relida a cada 30 s, com a aba visível. | O relógio do navegador pode divergir; o GET não renova atividade e serve para mostrar abandono. |
| Conversa que a API não encontra (por exemplo, depois de recarregar a demonstração) aparece como "Indisponível". | É estado normal, não erro. |
| "Apagar conversa" virou "Ocultar conversa": retira da lista local, não chama a API e não apaga a transcrição. | Regra do contexto (§4, Showcase; VAL-14). |
| O botão Sair vem de `availableActions`, não da lista de opções. | É uma ação global do contrato. |

### Testes

| Decisão | Motivo |
|---|---|
| Rede substituída por `stubFetch`, `jsonResponse` e `envelope` (`src/test/http.ts`); providers em `renderWithProviders`. O setup desfaz a substituição após cada teste. | Regra do projeto: sem rede real, sem MSW. |
| Testes que dependem do mês atual fixam o relógio. | O padrão deixou de ser um mês fixo do mock; sem relógio fixo, os testes quebrariam na virada do mês. |
| Testes do refiltro de próximas consultas, do agrupamento manhã/tarde e do recorte de blocos de fevereiro foram trocados por testes que provam o uso dos valores da API. | Essas regras passaram a ser do servidor, que tem os próprios testes. |

## Como verificar

1. Na API (`kenko-api`): `docker compose up -d db`, `npm run db:migrate`, `npm run db:seed` e `npm run dev`. Se outro PostgreSQL usa a porta 5432, defina `KENKO_DB_PORT=5433` no `.env` e use a mesma porta na `DATABASE_URL`.
2. Aqui: `cp .env.example .env`, `npm ci` e `npm run dev`; abra `http://localhost:5173`.
3. Painéis: troque o período na Home, no Calendário e em Analytics (semana, mês e ano); abra um dia pelo Calendário.
4. Erros: pare a API e veja "Não foi possível falar com a API" com "Tentar novamente"; volte a API e tente de novo.
5. Showcase: crie uma conversa, agende até a confirmação, liste e cancele a consulta, saia; oculte uma conversa; recarregue a página e confira que a transcrição volta.
