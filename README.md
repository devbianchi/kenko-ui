# Kenko UI

Frontend do projeto Kenko, estruturado com React, TypeScript, Vite, Tailwind CSS 4 e React Router em Data Mode. Home, Calendário e Dia usam mocks locais. Analytics ainda é um placeholder. O Showcase permite criar, selecionar e apagar conversas locais. A lista mostra “1m”, a mensagem inicial mostra “16:50” e as opções do bot são demonstrativas. A integração com a API está prevista para uma etapa posterior.

A Home usa o resumo de novembro de 2026 em `mocks/home/home.ts`. O filtro mensal é mantido na URL (`/home?month=2026-11`); a seleção permite períodos de janeiro de 2024 até o mês atual em Brasília e muda apenas a apresentação do período e preserva os indicadores estáticos do mock. Próximas consultas usam o relógio real de Brasília: o exemplo de 20/11/2026 deixa de aparecer após seu início. Cards compartilhados, responsividade e movimento reduzido estão implementados; os cards laterais permanecem estáticos. A apresentação usa utilitários Tailwind, com tokens em `src/styles.css`, dimensões fluidas no desktop e escalas suaves de 1,02 no hover e retorno a 1 ao pressionar.

Home e Calendário compartilham o filtro mensal. Mês e ano ficam em rascunho até o envio do formulário **Aplicar**. Sair do campo com Tab mantém a edição. Um período incompleto ou fora da faixa exibe um alerta e desabilita Aplicar até a correção. Escape descarta a edição e devolve o foco ao seletor. Aplicar conserva os demais parâmetros da URL, e Voltar restaura a seleção anterior.

No Calendário, cada data abre a página Dia. Durante o protótipo, o título acompanha a data selecionada e o resumo usa a mesma fixture. O gráfico horário apresenta as horas de início de 07h a 17h. Completude e ocupação são arredondadas ao inteiro mais próximo. Quando falta base para o cálculo, a página mostra “—”.

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
