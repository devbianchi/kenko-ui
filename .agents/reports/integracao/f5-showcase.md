## F5 — Showcase com o bot real
Status: 13/13 IDs done. Blocked / not done: nenhum.

### Behavior map
| ID | Behavior | Code (path:line) | Test (path:line) | Status |
|----|----------|------------------|------------------|--------|
| B1 | Nova Conversa cria a conversa com contato `ui_*` e mostra saudação e menu vindos da API, com Sair | src/features/showcase/useShowcase.ts:203 | src/features/showcase/tests/ShowcasePage.test.tsx:79 | done |
| B2 | Cada ação usa actionId novo e a revisão do último estado; a entrada do usuário entra na transcrição | src/features/showcase/useShowcase.ts:185, :118 | src/features/showcase/tests/ShowcasePage.test.tsx:97 | done |
| B3 | Agendamento completo (horário, dados do paciente, confirmação) sem nome nem nascimento na transcrição local | src/features/showcase/components/views/ViewControls.tsx:53 | src/features/showcase/tests/ShowcasePage.test.tsx:117 | done |
| B4 | Erro de campo (INVALID_NAME/INVALID_BIRTH_DATE) aparece junto do campo, mantém a digitação e não registra a entrada | src/features/showcase/useShowcase.ts:156 | src/features/showcase/tests/ShowcasePage.test.tsx:145 | done |
| B5 | 409 SLOT_UNAVAILABLE aplica a nova oferta devolvida e avisa | src/features/showcase/useShowcase.ts:140 | src/features/showcase/tests/ShowcasePage.test.tsx:166 | done |
| B6 | Falha de rede mantém a ação pendente, bloqueia novas ações e reenvia com o mesmo actionId, conteúdo e revisão | src/features/showcase/useShowcase.ts:146, :192 | src/features/showcase/tests/ShowcasePage.test.tsx:184 | done |
| B7 | Revisão antiga (e demais recusas de estado) relê a conversa por GET e não reenvia sozinha | src/features/showcase/useShowcase.ts:139 | src/features/showcase/tests/ShowcasePage.test.tsx:209 | done |
| B8 | Criação que falha reaproveita o mesmo contato na tentativa seguinte | src/features/showcase/useShowcase.ts:203 | src/features/showcase/tests/ShowcasePage.test.tsx:228; src/features/showcase/tests/storage.test.ts:17 | done |
| B9 | Ocultar retira a conversa da lista local sem chamar a API e sem apagar a transcrição | src/features/showcase/useShowcase.ts:225 | src/features/showcase/tests/ShowcasePage.test.tsx:248 | done |
| B10 | Conversa abandonada (estado da listagem) desabilita as ações e oferece novo atendimento | src/features/showcase/useShowcase.ts:81, :243 | src/features/showcase/tests/ShowcasePage.test.tsx:266 | done |
| B11 | Reabrir a página restaura a transcrição local e relê o estado sem registrar ação | src/features/showcase/useShowcase.ts:234 | src/features/showcase/tests/ShowcasePage.test.tsx:278 | done |
| B12 | Sair encerra e oferece novo atendimento | src/features/showcase/components/ConversationPanel.tsx | src/features/showcase/tests/ShowcasePage.test.tsx:293 | done |
| B13 | Storage corrompido não quebra a tela; a transcrição não repete a mesma mensagem | src/features/showcase/storage.ts:11, :45 | src/features/showcase/tests/storage.test.ts:4, :11 | done |

### File map
| File | Role | Change |
|------|------|--------|
| src/features/showcase/types.ts | data access | novo: tipos do contrato do bot |
| src/features/showcase/api.ts | data access | novo: criar, ler, listar (lotes de 50) e interagir, com checagem do formato |
| src/features/showcase/storage.ts | shared client state | novo: localStorage versionado `kenko:showcase:v1:*` |
| src/features/showcase/format.ts | shared | novo: datas e horários no fuso de negócio; tempo desde a última interação |
| src/features/showcase/useShowcase.ts | hook | novo: estado, ações e tratamento de erros |
| src/features/showcase/components/ConversationList.tsx | component | status da conversa, tempo real e "Ocultar conversa" |
| src/features/showcase/components/ConversationPanel.tsx | component | transcrição, digitando, avisos, reenvio e fim de atendimento |
| src/features/showcase/components/views/*.tsx | component | novo: uma tela por tipo de view |
| src/features/showcase/pages/ShowcasePage.tsx | page | usa o hook |
| src/features/showcase/tests/ShowcasePage.test.tsx, storage.test.ts | test | reescrito e novo |
| README.md, AGENTS.md, .agents/context/contexto-front.md | documentation | páginas integradas |

### Estado do cliente (shared client state)
- Antes de criar: `pending-create` guarda o contato; depois do sucesso, é apagado.
- Por conversa: `transcript:{id}` (entradas `b:<msg>` e `u:<actionId>`), `state:{id}` (último estado, sem mensagens) e `pending:{id}` (ação de resultado incerto).
- Lista: `ids`, `hidden` e `selected`. Ocultar só acrescenta a `hidden`; nada é apagado.

Decisions: estado do bot em hook com useState, não TanStack Query | são ações com revisão e reenvio, não leituras | rejected: mutations do TanStack Query, que não guardam a ação pendente entre recargas
Decisions: transcrição registra rótulos neutros para os dados do paciente | evita guardar nome e nascimento no navegador | rejected: registrar o texto digitado (pede confirmação do time)
Decisions: "Apagar conversa" virou "Ocultar conversa" | regra do contexto (§4, Showcase; VAL-14) | rejected: manter o rótulo do protótipo
Decisions: saudação e textos do bot vêm da API | regra do contexto (textos do roteiro no banco) | rejected: manter a saudação longa escrita no JSX
Obstacles: nenhum
Checks: spec src/features/showcase -> 15 passed. Sonda temporária com a API real (VITE_API_URL=http://localhost:8090/api, banco com a demonstração): criou a conversa, agendou, confirmou, cancelou e saiu pela interface -> 1 passed; arquivo apagado, fora do commit. Final: tsc -b -> ok; full suite -> 171 passed (18 files); lint -> not run: não configurado
Outside scope (not fixed): o navegador não foi aberto; CORS é coberto pelos testes do backend. Testes rodados com NODE_OPTIONS=--no-experimental-webstorage.
Open: revisão da redação dos rótulos neutros da transcrição pelo time
