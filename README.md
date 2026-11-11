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
mocks/                  dados de exemplo por domínio
public/assets/          referências visuais aprovadas
```

Os diretórios `mocks/` e `public/assets/` existentes foram preservados. Os mocks ainda não são consumidos pelas páginas placeholder.

## Desenvolvimento

```sh
npm install
npm run dev
```

Para gerar a build de produção: `npm run build`.
