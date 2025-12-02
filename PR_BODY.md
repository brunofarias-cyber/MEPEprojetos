# PR: chore(docs+fixes): agent docs, build & security fixes

Resumo
- Adiciona/atualiza documentação e instruções para agentes (Copilot/GPT) e operação do repositório.
- Corrige problemas de build/TypeScript e otimiza bundling (`manualChunks` já aplicado).
- Remove dependência `xlsx` do `package.json` (o servidor usa `exceljs` para parsing).
- Substitui parsing de planilhas do servidor por `exceljs` (já em uso) para reduzir superfície de risco.
- Implementa lazy-load para `SpreadsheetImport` (reduz payload inicial da página de turmas).
- Adiciona workflow `CI` em `.github/workflows/ci.yml` que roda `npm run check` e `npm run build`; migrations são executadas apenas se `DATABASE_URL` estiver presente como secret.

Testes locais recomendados

1. Atualizar dependências e lockfile:
```bash
# opcional: remover cache e instalar limpo
npm ci
# ou, se preferir garantir remoção de 'xlsx'
npm uninstall xlsx
npm install
```

2. Checar tipos e build:
```bash
npm run check
npm run build
```

3. Rodar auditoria de dependências (opcional):
```bash
npm audit
```

Observações e recomendações
- O arquivo de workflow está incluído no branch; alguém com permissão de administrador no repositório deverá revisar e mergear o PR para ativar o workflow nas branches protegidas.
- Adicione o secret `DATABASE_URL` em Settings → Secrets → Actions para permitir que o job opcional de migrations (`npm run db:init`) seja executado em ambientes controlados (não em PRs por padrão).
- Se desejar, posso aplicar lazy-load em outros componentes pesados (gráficos, analytics) para reduzir ainda mais o bundle inicial.

Comandos rápidos para criar o PR (GitHub CLI):
```bash
# empurre a branch (se ainda não estiver no remoto)
git push origin docs/copilot-instructions-and-fixes

# crie PR com título e corpo padrão
gh pr create --base main --title "chore(docs+fixes): agent docs, build & security fixes" --body-file PR_BODY.md
```

Se preferir, posso abrir o PR via API se você me fornecer as credenciais necessárias (não recomendado).