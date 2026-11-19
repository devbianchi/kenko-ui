# Kenko UI

Frontend do projeto Kenko, estruturado com React, TypeScript, Vite, Tailwind CSS 4 e React Router em Data Mode. Todas as páginas consomem a [Kenko API](https://github.com/devbianchi/kenko-api): Home, Calendário, Dia e Analytics leem os indicadores por TanStack Query, e o Showcase conduz o bot real, com a transcrição guardada no navegador. O caminho seguido está no [plano de integração](.agents/plans/integracao-api.md); os mocks em `mocks/` servem de fixtures de teste.

A Home busca os indicadores do mês na API. O filtro mensal é mantido na URL (`/home?month=2026-11`); a seleção permite períodos de janeiro de 2024 até o mês atual em Brasília, e o padrão é o mês atual. Próximas consultas aparecem como a API entrega: até cinco pendentes com início futuro, pelo relógio do servidor. Cards compartilhados, responsividade e movimento reduzido estão implementados; os cards laterais permanecem estáticos. A apresentação usa utilitários Tailwind, com tokens em `src/styles.css`, dimensões fluidas no desktop e escalas suaves de 1,02 no hover e retorno a 1 ao pressionar.

Home e Calendário compartilham o filtro mensal. Mês e ano ficam em rascunho até o envio do formulário **Aplicar**. Sair do campo com Tab mantém a edição. Um período incompleto ou fora da faixa exibe um alerta e desabilita Aplicar até a correção. Escape descarta a edição e devolve o foco ao seletor. Aplicar conserva os demais parâmetros da URL, e Voltar restaura a seleção anterior.

No Calendário, a grade pede à API a contagem do intervalo visível, e o dia de hoje destacado vem da API. Cada data abre a página Dia, que busca o detalhe da data. O gráfico horário apresenta as horas de início de 07h a 17h. Completude, ocupação e manhã/tarde vêm calculadas da API e só são arredondadas ao inteiro na tela. Quando falta base para o cálculo, a página mostra “—”.

## Páginas e rotas

Analytics abre no mês atual. O filtro do cabeçalho usa `period` e `reference` na URL; semana, mês e ano buscam os cinco indicadores e os seis gráficos na API, e a série segue o agrupamento devolvido (dias, blocos do mês ou meses). Os percentuais dos cards são arredondados ao inteiro mais próximo.

O Showcase cria conversas com um contato novo, renderiza a tela que o bot devolve (opções, horários, formulário do paciente, consultas e informações da clínica) e envia cada ação com `actionId` novo e a revisão atual. Uma falha de rede mantém a ação pendente para reenvio idêntico. Os ids conhecidos, as conversas ocultas e a transcrição ficam no `localStorage` (`kenko:showcase:v1:*`), sem nome nem nascimento do paciente. "Ocultar conversa" só retira a conversa da lista local.

| Rota | Página |
| --- | --- |
| `/home` | Home |
| `/analytics` | Analytics |
| `/calendar` | Calendário |
| `/calendar/:date` | Dia |
| `/showcase` | Showcase |

A rota `/` redireciona para `/home`. A navegação principal conecta Home, Analytics, Calendário e Showcase; Dia pertence ao Calendário. A rota do Dia recebe a data como parâmetro.

## Estrutura

```text
src/
  app/                  configuração do router
  features/
    analytics/pages/
    calendar/pages/
    day/pages/
    home/pages/
    showcase/pages/
  shared/
    components/         componentes compartilhados
    layout/             layout e navegação
  main.tsx
  styles.css
mocks/                  fixtures visuais simplificados por domínio
public/assets/          referências visuais aprovadas
```


## Desenvolvimento

```sh
npm ci
cp .env.example .env
npm run dev
```

O frontend roda em `http://localhost:5173` (porta fixa: se estiver ocupada, o Vite falha em vez de trocar de porta). A URL da API vem de `VITE_API_URL` no `.env`; o padrão é `http://localhost:8080/api`. Abra o frontend por `localhost`, não por `127.0.0.1`, porque a API só libera as origens configuradas no CORS.

Para subir a API com dados de demonstração, no repositório `kenko-api`: `docker compose up -d db`, `npm run db:migrate`, `npm run db:seed` e `npm run dev`.

Para gerar a build de produção: `npm run build` (TypeScript e Vite). Para servir a build: `npm run preview`.

Os scripts disponíveis estão em [package.json](package.json). Lint ainda não está configurado. A infraestrutura de testes está disponível abaixo.

## Documentação

- [Orientação para agentes](AGENTS.md): entrada e recursos por tarefa.
- [Contexto do frontend](.agents/context/contexto-front.md): comportamentos e regras aprovadas.
- [Mocks](mocks/README.md): catálogo de fixtures visuais e suas limitações.


## Testes

Testes de UI não exigem backend, API nem banco: as chamadas de rede são substituídas por respostas montadas no próprio teste (`src/test/http.ts`), e `src/test/renderWithProviders.tsx` monta TanStack Query e roteador. Usar Node 22.12+ ou Node 24 e npm ci para instalar as versões do lockfile. No Node 25 ou mais novo, o `localStorage` experimental do Node encobre o do jsdom: rode os testes com `NODE_OPTIONS=--no-experimental-webstorage`.

| Comando | Uso |
| --- | --- |
| npm test | Executar a suíte uma vez, adequado para agentes e CI. |
| npm run test:watch | Reexecutar durante desenvolvimento interativo. |
| npm test -- src/shared/layout/tests/AppHeader.test.tsx | Executar somente o exemplo de navegação. |
| npm run test:coverage | Executar a suíte e gerar cobertura textual e coverage/index.html. |
| npm run build | Verificar TypeScript (incluindo testes) e gerar produção. |

[Ferramentas e convenções de organização](.agents/context/contexto-front.md#testes-de-ui-ferramentas-e-organização) ficam no contexto do frontend. A cobertura ainda não tem limite mínimo; o exemplo valida a infraestrutura, não constitui uma suíte completa do produto.
