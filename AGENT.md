# AGENT Onboarding — MEPEprojetos

Rápido guia para agentes que vão trabalhar neste repositório.

1) Objetivo: acelerar tarefas de desenvolvimento no monorepo client+server+shared.

2) Comandos essenciais (zsh):
```bash
npm install
npm run check    # tsc
npm run dev      # dev server (Express + Vite)
npm run build    # build produção (vite + esbuild)
```

3) Locais prioritários para leitura (ordem recomendada):
- `server/app.ts` — sessão, JWT, logging
- `server/index-dev.ts` — integração Vite (dev)
- `shared/schema.ts` — modelo do DB e tipos (fonte de verdade)
- `server/storage.ts` — interface `IStorage` e implementação (DB acesso)
- `server/routes.ts` — rotas da API; siga padrões de validação e resposta
- `server/services/bnccAiService.ts` — integração OpenAI/AI

4) Padrões a preservar:
- Validação: sempre `zod.parse` e trate erros com 400
- Sessão + JWT: `req.session.userId` e `req.user` são usados em código
- DB: adicionar colunas/tabelas via `shared/schema.ts` e `drizzle-kit` (`npm run db:push`)

5) Se for modificar o schema:
- Atualize `shared/schema.ts` → Rode `npm run db:push` → Atualize `server/storage.ts` → Atualize rotas.

6) Quando criar PRs:
- Inclua passo a passo de como validar manualmente (ex.: endpoints testados, payloads zod).
- Não mude `SESSION_SECRET` ou contratos de autenticação sem coordenação.

7) Perguntas rápidas que o agente deve fazer antes de mudanças grandes:
- Isso altera `shared/schema.ts`? ⇒ preciso migrar DB e atualizar `storage.ts` e front-end.
- Isso muda como a autenticação funciona? ⇒ buscar aprovação humana.
