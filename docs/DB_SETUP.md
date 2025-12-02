# Configuração do DATABASE_URL e execução de migrations

Este documento descreve passos seguros para configurar a variável `DATABASE_URL` no GitHub Actions e como executar `npm run build:all` / `npm run db:init` em um ambiente controlado.

1) Preparar um banco de staging

- Crie um banco Postgres (Neon, Railway, Heroku, etc.) para staging.
- Crie um usuário e uma database, anote a `DATABASE_URL` no formato:

```
postgres://<user>:<password>@<host>:<port>/<database>
```

2) Adicionar `DATABASE_URL` como secret no GitHub

- Vá para `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`.
- Nome: `DATABASE_URL`
- Valor: a connection string (ex.: `postgres://...`)

3) Como rodar migrations no CI (opcional)

- O workflow de CI já inclui um passo opcional que executa `npm run db:init` apenas quando `DATABASE_URL` estiver definido como secret.
- Para forçar o push de migrations localmente (não recomendável apontar para produção):

```bash
export DATABASE_URL="postgres://user:pass@host:5432/db"
npm run build:all
```

4) Boas práticas

- Nunca compartilhe `DATABASE_URL` em chats ou repositório público.
- Use um banco de staging separado do banco de produção.
- Garanta backups antes de aplicar migrations em produção.

5) Se precisar de ajuda

Posso:
- Gerar um job GitHub Actions separado para rodar apenas migrations em um ambiente `deploy`.
- Ajudar a escrever uma migration rollback (caso precise reverter).

---
Arquivo gerado automaticamente pelo agente para orientar deploys seguros.
