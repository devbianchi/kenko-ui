# Kenko UI — orientação para agentes

## O projeto

Este repositório contém o frontend do Kenko, um projeto acadêmico de atendimento e agendamento de consultas para uma clínica. O visitante interage com um bot por menus no Showcase; Home, Calendário, Dia e Analytics apresentam a agenda e os indicadores do sistema.

O bot previsto no escopo é determinístico e executado no backend, sem IA ou interpretação livre de mensagens. A demonstração é aberta, sem login, e o painel é de leitura. Regras funcionais, fluxos e limites estão no documento de contexto do frontend.

A base utiliza React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7 em Data Mode e Lucide React. O código está organizado por feature. A estrutura inicial possui páginas placeholder; a existência de uma rota ou de um mock não significa que o comportamento de negócio ou a integração com a API já estejam implementados.

## Contexto e arquivos importantes

Os caminhos abaixo são relativos à raiz do repositório.

| Caminho | Para que serve |
| --- | --- |
| [README.md](README.md) | Apresentação técnica, estrutura inicial, rotas e comandos para executar o projeto. |
| [.agents/context/](.agents/context/) | Base de conhecimento do projeto: contexto funcional e orientações visuais. |
| [.agents/context/contexto-front.md](.agents/context/contexto-front.md) | Principal referência para o desenvolvimento do frontend. Consolida propósito, páginas, fluxos, regras de negócio, métricas, integração e critérios de aceitação, sem ser um plano de implementação. |
| [.agents/context/guia-estilizacao.md](.agents/context/guia-estilizacao.md) | Guia visual: cores, tipografia, usos por componente e limites das referências. O escopo visual atual contempla somente modo claro. |
| [.agents/context/completo/](.agents/context/completo/) | Documentação original completa, para rastrear decisões e consultar detalhes complementares. |
| [.agents/context/completo/escopo-kenko-v2.md](.agents/context/completo/escopo-kenko-v2.md) | Escopo original: autoridade sobre funcionalidades, regras, métricas e limites do sistema. |
| [.agents/context/completo/kenko-backend-api.md](.agents/context/completo/kenko-backend-api.md) | Complemento técnico da API: endpoints, parâmetros e convenções de comunicação. Consultar o necessário à integração do frontend. |
| [.agents/context/completo/kenko-bot-api.md](.agents/context/completo/kenko-bot-api.md) | Complemento do bot: estado conversacional, ações, validação, repetição de requisições e recuperação de conflitos. |
| [.agents/plans/](.agents/plans/) | Local destinado aos planos de implementação: recorte de tarefas, etapas e verificações previstas. |
| [.agents/reports/](.agents/reports/) | Local destinado aos relatórios de implementação e revisão: mudanças, verificações, resultados e pendências. |
| [.agents/skills/](.agents/skills/) | Instruções dos fluxos específicos de trabalho. Cada skill possui seu próprio `SKILL.md`. |
| [mocks/](mocks/) | Exemplos de dados e formatos de resposta em TypeScript, organizados por domínio. Consultar os arquivos existentes em vez de duplicar payloads no escopo. |
| [mocks/README.md](mocks/README.md) | Explica a organização, a origem e as simplificações aplicadas aos mocks. |
| [public/assets/](public/assets/) | Referências visuais aprovadas das páginas: `Home.png`, `Analytics.png`, `Calender.png`, `Dia.png` e `Simulação Bot.png`. |
| [package.json](package.json) | Dependências e scripts disponíveis. |

### Como consultar as referências

Comece pelo contexto do frontend e pelas seções pertinentes à tarefa. Para trabalho visual, consulte também o guia de estilização e o PNG da página. Para os dados de exemplo, consulte os mocks do domínio e seu README. Use os documentos completos quando precisar rastrear uma regra ou aprofundar a integração.

Regras funcionais prevalecem sobre comportamentos apenas ilustrados nos designs. Valores dos mocks não são resultados fixos de aceitação. Alguns campos foram removidos dos mocks para reproduzir os designs; essa ausência não revoga regras de negócio ou de integração. Na aplicação integrada, dados de negócio e indicadores vêm da API, não de contadores locais ou valores inventados.

As skills locais são: `implementer`, para trabalho solicitado como Implementer; `reviewer`, para revisão independente solicitada como Reviewer; e `git-workflow`, para tarefas de branch, commit, push ou merge. Consulte o `SKILL.md` correspondente quando o fluxo se aplicar.

## Código, páginas e mocks

| Caminho | Responsabilidade |
| --- | --- |
| [src/app/router.tsx](src/app/router.tsx) | Configuração das rotas. |
| [src/features/](src/features/) | Páginas organizadas por funcionalidade: `home`, `analytics`, `calendar`, `day` e `showcase`. |
| [src/shared/components/](src/shared/components/) | Componentes compartilhados entre funcionalidades. |
| [src/shared/layout/](src/shared/layout/) | Estrutura comum das páginas e navegação. |
| [src/main.tsx](src/main.tsx) | Entrada da aplicação. |
| [src/styles.css](src/styles.css) | Estilos globais e configuração visual compartilhada. |

| Rota | Papel da página | Mocks |
| --- | --- | --- |
| `/home` | Resumo mensal e próximas consultas. | `mocks/home/` |
| `/analytics` | Indicadores e gráficos com filtros de semana, mês e ano. | `mocks/analytics/` |
| `/calendar` | Agenda mensal; selecionar uma data abre Dia. | `mocks/calendar/` |
| `/calendar/:date` | Totais, distribuição de consultas e informações por sala da data selecionada. | `mocks/day/` |
| `/showcase` | Demonstração do bot, criação/lista de conversas e chat. | `mocks/showcase/` e seus cenários em `extras/` |

A rota `/` redireciona para `/home`. Dia pertence à área Calendário. `mocks/shared/` reúne exemplos reutilizados, como identificação da clínica e lista de conversas.

## Comandos básicos

- `npm install`: instalar dependências.
- `npm run dev`: iniciar o servidor de desenvolvimento.
- `npm run build`: verificar TypeScript e gerar a build de produção.
- `npm run preview`: servir localmente a build gerada.

Os scripts disponíveis são os declarados em `package.json`; atualmente não há script de testes ou lint configurado.
