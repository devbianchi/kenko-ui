# Kenko UI

Frontend do projeto Kenko, estruturado com React, TypeScript, Vite, Tailwind CSS 4 e React Router em Data Mode. A aplicação é organizada por feature e usa páginas placeholder nesta etapa. Não há integração com API nem comportamento de negócio implementado.

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
