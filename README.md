# EmprestaAí

Aplicativo para registrar objetos emprestados, consultar com quem estão e acompanhar a devolução. O projeto reúne protótipo, front-end responsivo e back-end funcional com contas separadas e persistência SQLite.

## Entregas

- [Aula 1: documento e telas do protótipo](entrega-aula1/Alex_Aula1_EmprestaAi.pdf)
- [Aula 2: prévia do front-end](entrega-aula2/preview-desktop.png)
- [Arquitetura e decisões técnicas](docs/ARQUITETURA.md)

## Como executar

Requer **Node.js 22.13 ou superior** e npm. O banco SQLite é criado automaticamente em `data/emprestaai.sqlite` e não é versionado.

```bash
npm install
npm run build
npm start
```

Abra `http://localhost:3001`. Crie uma conta para começar; não há dados fictícios na conta nova.

Para desenvolvimento com recarregamento automático, abra dois terminais:

```bash
npm run dev:api
```

```bash
npm run dev
```

O Vite mostra o endereço do front-end (geralmente `http://localhost:5173`) e encaminha `/api` ao servidor na porta 3001. `PORT` e `DATABASE_PATH` podem ser definidos por variáveis de ambiente.

## Funcionalidades

- Cadastro, login e logout por sessão em cookie `HttpOnly`.
- Empréstimos privados por conta: criar, listar, consultar, editar e marcar devolução.
- Busca, histórico, destaque de atrasados e interface para desktop e celular.
- Validação de dados no servidor, senha derivada com `scrypt` e banco SQLite persistente.

### API

| Método | Rota | Função |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Criar conta e iniciar sessão |
| `POST` | `/api/auth/login` | Entrar |
| `POST` | `/api/auth/logout` | Encerrar sessão |
| `GET` | `/api/auth/me` | Consultar usuário atual |
| `GET` | `/api/loans` | Listar empréstimos da conta |
| `GET` | `/api/loans/:id` | Consultar um empréstimo |
| `POST` | `/api/loans` | Criar empréstimo |
| `PUT` | `/api/loans/:id` | Editar empréstimo em aberto |
| `POST` | `/api/loans/:id/return` | Registrar devolução |

O corpo de criação/edição usa `item`, `person`, `lentAt`, `dueAt` e `note`; datas seguem `AAAA-MM-DD`. Erros retornam `{ "error": "mensagem" }` com status apropriado.

## Verificação

Instale o navegador de teste uma vez:

```bash
npx playwright install chromium
```

Depois, um único comando executa a formatação e as três camadas de teste:

```bash
npm run test:all
```

| Camada | Comando individual | O que verifica |
| --- | --- | --- |
| Unitária | `npm run test:unit` | Regras de criação, datas, edição e devolução do `LoanService` isolado. |
| Integração | `npm run test:integration` | API HTTP real com autenticação, SQLite, isolamento de contas e persistência. |
| Ponta a ponta | `npm run test:e2e` | Cadastro, formulário, edição, devolução, histórico e novo login no Chromium, em desktop e celular. |

O teste ponta a ponta compila o projeto, inicia um servidor próprio na porta 3107 e usa SQLite em memória. Ele não altera o banco de uso normal. A pesquisa com usuários prevista no protótipo continua pendente; os testes automatizados verificam o software, não validam as hipóteses de produto.
