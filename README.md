# Kenko UI

Frontend do projeto Kenko, estruturado com React, TypeScript, Vite, Tailwind CSS 4 e React Router em Data Mode. A aplicação é organizada por feature. A Home apresenta o protótipo com mocks; as demais páginas ainda são placeholders. Não há integração com API.

A Home usa o resumo de novembro de 2026 em `mocks/home/home.ts`. O filtro mensal é mantido na URL (`/home?month=2026-11`); a seleção permite períodos de janeiro de 2024 até o mês atual em Brasília e muda apenas a apresentação do período e preserva os indicadores estáticos do mock. Próximas consultas usam o relógio real de Brasília: o exemplo de 20/11/2026 deixa de aparecer após seu início. Cards compartilhados, responsividade e movimento reduzido estão implementados; os cards laterais permanecem estáticos. A apresentação usa utilitários Tailwind, com tokens em `src/styles.css`, dimensões fluidas no desktop e escalas suaves de 1,02 no hover e retorno a 1 ao pressionar.

O campo de ano permite apagar e redigitar: Tab, perda de foco ou Enter confirmam um ano válido; entradas inválidas restauram o ano anterior. Rascunhos não alteram a URL. O botão Voltar restaura o período e os demais parâmetros da URL são preservados.

## Páginas e rotas

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
npm install
npm run dev
```

Para gerar a build de produção: `npm run build` (TypeScript e Vite). Para servir a build: `npm run preview`.

Os scripts disponíveis estão em [package.json](package.json). Lint ainda não está configurado. A infraestrutura de testes está disponível abaixo.

## Documentação

- [Orientação para agentes](AGENTS.md): entrada e recursos por tarefa.
- [Contexto do frontend](.agents/context/contexto-front.md): comportamentos e regras aprovadas.
- [Mocks](mocks/README.md): catálogo de fixtures visuais e suas limitações.


## Testes

Etapa atual: protótipo funcional com dados estáticos. Testes de UI não exigem backend/API/banco. Usar Node 22.12+ ou Node 24 e npm ci para instalar as versões do lockfile.

| Comando | Uso |
| --- | --- |
| npm test | Executar a suíte uma vez, adequado para agentes e CI. |
| npm run test:watch | Reexecutar durante desenvolvimento interativo. |
| npm test -- src/shared/layout/tests/AppHeader.test.tsx | Executar somente o exemplo de navegação. |
| npm run test:coverage | Executar a suíte e gerar cobertura textual e coverage/index.html. |
| npm run build | Verificar TypeScript (incluindo testes) e gerar produção. |

[Ferramentas e convenções de organização](.agents/context/contexto-front.md#testes-de-ui-ferramentas-e-organização) ficam no contexto do frontend. A cobertura ainda não tem limite mínimo; o exemplo valida a infraestrutura, não constitui uma suíte completa do produto.
