## F1 — Home com a API
Status: 7/7 IDs done. Blocked / not done: nenhum.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Sem dados por props, a Home busca `GET /dashboard?month` com o mês da URL | src/features/home/pages/HomePage.tsx:12, :18; src/features/home/api.ts:6 | src/features/home/tests/HomePage.test.tsx:232 | done |
| B2 | Mostra carregamento antes dos dados | src/shared/components/QueryState.tsx:19 | src/features/home/tests/HomePage.test.tsx:232 | done |
| B3 | Erro da API mostra o alerta, esconde os indicadores e busca de novo pelo botão | src/features/home/pages/HomePage.tsx:18 | src/features/home/tests/HomePage.test.tsx:243 | done |
| B4 | Trocar de mês mantém os dados anteriores até chegarem os novos | src/features/home/api.ts:10 | src/features/home/tests/HomePage.test.tsx:39, :98 | done |
| B5 | Mês ausente ou malformado usa o mês atual de Brasília (antes, um mês fixo do mock) | src/features/home/data/home.ts:29 | src/features/home/tests/HomePage.test.tsx:157, :170 | done |
| B6 | Próximas consultas aparecem como a API entrega, sem refiltro pelo relógio do navegador | src/features/home/components/UpcomingAppointments.tsx:8 | src/features/home/tests/HomePage.test.tsx:211 | done |
| B7 | O layout mantém cabeçalho e conteúdo com a Home buscando dados | src/features/home/pages/HomePage.tsx:12 | src/shared/layout/tests/AppLayout.test.tsx:12 | done |

### File map
| File | Role | Change |
|------|------|--------|
| src/features/home/api.ts | data access | novo: useHome |
| src/features/home/data/home.ts | data access | tipos do contrato (clinic.id); remove homeData, HOME_MOCK_MONTH e selectUpcoming; fallback do mês |
| src/features/home/pages/HomePage.tsx | page | divide em carregador e conteúdo |
| src/features/home/components/UpcomingAppointments.tsx | component | exibe a lista recebida, sem refiltrar |
| mocks/shared/clinica.ts | test | adiciona id à clínica, como no contrato |
| src/features/home/tests/HomePage.test.tsx | test | fixture vindo de mocks/; caminho com API; troca dos testes de refiltro |
| src/shared/layout/tests/AppLayout.test.tsx | test | provider de consultas e API substituída |

Decisions: remover o refiltro de próximas consultas no cliente | o servidor já aplica pendente, início estritamente futuro, ordem e limite de 5 (`dashboard.repository.ts` e `dashboard.it.test.ts` no kenko-api); dois relógios podiam divergir | rejected: manter o filtro como segunda checagem
Decisions: chave de consulta inline no hook | um uso por chave | rejected: arquivo central de chaves sem segundo consumidor
Obstacles: AppLayout.test.tsx falhou com "No QueryClient set" | a rota /home agora busca dados | provider e fetch substituído no teste | verified by: suíte completa
Checks: spec src/features/home -> 28 passed. Final: tsc -b -> ok; npm run build -> ok; full suite -> 149 passed (17 files); lint -> not run: não configurado
Outside scope (not fixed): testes rodados com NODE_OPTIONS=--no-experimental-webstorage (Node 26 nesta máquina)
Open: F2 a F5
