# Kenko UI — orientação para agentes

Frontend acadêmico de atendimento e agendamento de consultas. O visitante usa o bot por menus no Showcase; Home, Calendário, Dia e Analytics apresentam agenda e indicadores. A base atual contém páginas placeholder, não funcionalidades já integradas.

## Comece aqui

Leia a introdução e as seções pertinentes do [contexto do frontend](.agents/context/contexto-front.md), referência principal para planejamento, implementação e revisão. Ele reúne comportamentos, limites e decisões aprovadas, com leitura progressiva por tarefa.

| Recurso | Quando consultar |
| --- | --- |
| [README](README.md) e [package.json](package.json) | Estrutura, rotas, execução, dependências e scripts disponíveis. |
| [Guia de estilização](.agents/context/guia-estilizacao.md) e [public/assets](public/assets/) | Trabalho visual: guia e PNG da página, somente modo claro. |
| [Mocks e catálogo](mocks/README.md) | Fixtures visuais e cenários disponíveis; não são contratos completos da API. |
| [Escopo completo](.agents/context/completo/escopo-kenko-v2.md) | Rastrear regras originais ou aprofundar requisito específico. |
| [API](.agents/context/completo/kenko-backend-api.md) e [bot](.agents/context/completo/kenko-bot-api.md) | Consultar somente as seções necessárias à integração, indicadas no contexto. |
| [.agents/plans/](.agents/plans/) | Planos de implementação e verificações previstas. Podem ser versionados. |
| [.agents/reports/](.agents/reports/) | Relatórios de implementação e revisão. |

Requisitos aprovados orientam o comportamento; código/configuração descrevem o estado técnico existente. Mocks e designs não revogam regras funcionais. A autoridade e a manutenção das fontes estão definidas no contexto; reporte divergências sem decisão explícita.

## Skills

- [Implementer](.agents/skills/implementer/SKILL.md): quando solicitado como Implementer.
- [Reviewer](.agents/skills/reviewer/SKILL.md): revisão independente, quando solicitado como Reviewer; não usar na sessão que escreveu o código.
- [Git workflow](.agents/skills/git-workflow/SKILL.md): quando solicitado branch, commit, push ou merge; executar apenas as operações autorizadas.

As skills definem procedimentos; as regras do produto e as [convenções de testes de UI](.agents/context/contexto-front.md#testes-de-ui-ferramentas-e-organização) ficam no contexto. A etapa atual é um protótipo com mocks; os testes não dependem de backend. Comandos estão no README.
