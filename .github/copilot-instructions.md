<!-- Copilot / AI agent instructions for the MEPEprojetos codebase -->
# Instruções rápidas para agentes AI — MEPEprojetos

Propósito: tornar um agente (Copilot/GPT) produtivo rapidamente neste repositório monolítico (client + server + shared).

- **Arquitetura principal:**
  - `server/` — API Express em TypeScript (entry dev: `server/index-dev.ts`, produção: `server/index-prod.ts`). Usa `drizzle-orm` com Neon (`server/db.ts`) e implementa a camada de armazenamento em `server/storage.ts` (interface `IStorage` e `DatabaseStorage`).
  - `client/` — SPA React (Vite). `client/src/main.tsx` monta `App` (rotas com `wouter`) e provê contexto via `contexts/AuthContext.tsx`.
  - `shared/` — esquema do banco com `drizzle-orm` e Zod (`shared/schema.ts`). Muitos tipos e `createInsertSchema` estão aqui; alterações de modelo exigem atualizações neste arquivo.

- **Fluxo de desenvolvimento (útil):**
  - Dev (integra cliente + servidor com vite middleware): `npm run dev` — roda `tsx server/index-dev.ts` que inicia Express + Vite (veja `server/index-dev.ts`).
  - Build produção: `npm run build` — roda `vite build` (client) e `esbuild` para empacotar o servidor em `dist/index.js`; em seguida executa `npm run db:init`.
  - Start produção: `npm run start` (assume `dist/index.js`).
  - Migrations / schema push: `npm run db:push` (usa `drizzle-kit`).

- **Variáveis de ambiente importantes:**
  - `DATABASE_URL` — obrigatório (Neon). Configurado em `server/db.ts`.
  - `SESSION_SECRET` — usado para sessão + JWT (fallback existe, mas NÃO usar em produção).
  - `PORT` — porta (padrão 5000).
  - `AI_INTEGRATIONS_OPENAI_API_KEY` — chave para `server/services/bnccAiService.ts` (se ausente, AI é silenciosamente ignorado).
  - `AI_INTEGRATIONS_OPENAI_BASE_URL` — opcional (cliente OpenAI personalizado).

- **Padrões e convenções do projeto:**
  - Tipagem forte com TypeScript `strict: true` (veja `tsconfig.json`). Use os aliases de caminho: `@/*` => `client/src/*` e `@shared/*` => `shared/*`.
  - Validação de entrada: rotas usam `zod` (`routes.ts`) — siga o padrão `const data = schema.parse(req.body)` e capture erros retornando `400`.
  - Respostas API: JSON consistente. Em `server/app.ts` existe middleware que captura e loga respostas JSON para rotas `/api`.
  - Autenticação: sessão (`express-session` + `memorystore`) e JWT. `server/app.ts` popula `req.session.userId` e `req.user` quando um Bearer token é apresentado — preserve esse comportamento ao modificar auth.
  - Uploads: `multer` em memória para PDFs/planilhas (veja `server/routes.ts`). Tenha cuidado com limites de tamanho e tipos MIME.

- **Camada de persistência:**
  - `shared/schema.ts` contém todas as tabelas Drizzle + `createInsertSchema`. Ao adicionar um novo modelo: atualizar `shared/schema.ts`, gerar ou escrever migration e adicionar métodos correspondentes em `server/storage.ts` (adicionar à interface `IStorage` e implementar em `DatabaseStorage`).

- **Integrações externas:**
  - Banco: Neon/Postgres via `@neondatabase/serverless` + `drizzle-orm`.
  - AI: `openai` cliente (var env acima). Serviços AI em `server/services/bnccAiService.ts` esperam JSON limpo — cuidado ao processar respostas da API (há parsing robusto no arquivo).

- **Como adicionar uma rota (exemplo):**
  - Siga o padrão em `server/routes.ts`:
    1. Validar entrada com `zod`.
    2. Chamar `storage` (importado como `storage`) para operações DB.
    3. Tratar erros com try/catch e retornar `res.status(4xx|5xx).json({ error: message })`.

- **Testes & qualidade:**
  - Não há suíte de testes explícita no repositório. Antes de mudar contratos DB/API, rode `npm run check` (tsc) e use `npm run dev` local para testes manuais.

- **Coisas para NÃO fazer sem coordenação:**
  - Alterar `SESSION_SECRET` ou formato do token sem migrar clientes (front end espera token e session cookie).
  - Mudar nomes de colunas em `shared/schema.ts` sem criar migration e atualizar `storage.ts`.

- **Locais-chave para leitura rápida:**
  - `server/app.ts` — setup Express, sessão, JWT middleware, logging
  - `server/index-dev.ts` — como Vite é integrado para dev
  - `server/routes.ts` — implementações de rota e uso de zod/multer
  - `server/storage.ts` — API para todas as operações DB (IStorage)
  - `shared/schema.ts` — modelo do DB e tipos usados por client & server
  - `server/services/bnccAiService.ts` — como chamamos OpenAI e o formato esperado

Se algo aqui estiver incompleto ou você quiser que eu detalhe exemplos de código (por exemplo um template de nova rota ou um checklist de migration), diga qual seção quer que eu expanda. Obrigado — pronto para ajustar conforme o estilo desejado.

--

## Exemplos práticos

**Template de rota (padrão do projeto)**: usar `zod` para validação, chamar métodos de `storage`, tratar erros e retornar JSON.

Exemplo simplificado (adapte tipos/imports):

```ts
// server/routes.ts (padrão)
app.post('/api/example', async (req, res) => {
  try {
    const schema = z.object({ name: z.string().min(1) });
    const data = schema.parse(req.body);

    // `storage` é a camada de persistência exportada em `server/storage.ts`
    const created = await storage.createExample({ name: data.name });

    res.status(201).json(created);
  } catch (err: any) {
    // Zod errors e outros geram status 400; falhas internas 500
    const isZod = err?.issues;
    res.status(isZod ? 400 : 500).json({ error: err.message || 'Erro interno' });
  }
});
```

**Autenticação em rotas**: use `req.session.userId` (sessão) ou `req.user` (quando Bearer token presente). Exemplo de proteção:

```ts
app.get('/api/me/teacher', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Não autenticado' });
  // ...
});
```

--

## Checklist: adicionar uma nova tabela / migration

1. Atualize `shared/schema.ts`: adicione `pgTable(...)` e os `createInsertSchema` correspondentes.
2. Atualize os tipos/relations, se necessário (no mesmo arquivo `shared/schema.ts`).
3. Rode `npm run db:push` para aplicar o schema (usa `drizzle-kit`).
4. Adicione métodos à interface `IStorage` em `server/storage.ts` (assinatura) — NÃO alterar contratos existentes.
5. Implemente os métodos em `DatabaseStorage` (mesmo arquivo). Use `randomUUID()` para IDs e `db.insert(...).returning()` conforme padrão.
6. Atualize `server/routes.ts` para expor novas rotas usando `zod` para validação e chamando `storage`.
7. Rode `npm run check` e depois `npm run dev` para testes manuais.

Observações:
- Sempre mantenha `shared/schema.ts` como fonte de verdade para tipos; front-end depende de nomes/contratos gerados a partir daqui.
- Evite renomear colunas sem migration coordenada; o projeto não tem scripts automáticos de migração com rollback.

