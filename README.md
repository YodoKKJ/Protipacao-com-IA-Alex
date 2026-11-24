# EmprestaAí

Aplicativo para registrar objetos emprestados, consultar com quem estão e acompanhar a devolução. O projeto reúne protótipo, front-end responsivo e back-end funcional com contas separadas e persistência SQLite.

## Entregas

- [Aula 1: documento e telas do protótipo](entrega-aula1/Alex_Aula1_EmprestaAi.pdf)
- [Aula 2: prévia do front-end](entrega-aula2/preview-desktop.png)
- [Arquitetura e decisões técnicas](docs/ARQUITETURA.md)
- [Diagramas de classes, casos de uso, atividades e sequência](docs/DIAGRAMAS.md)

## Como executar

Requer **Node.js 22.13 ou superior** e npm. O banco SQLite é criado automaticamente em `data/emprestaai.sqlite` e não é versionado.

```bash
npm install
npm run build
npm start
```

Abra `http://localhost:3001`. Para experimentar sem cadastro, use a conta local de demonstração:

| E-mail | Senha |
| --- | --- |
| `demo@emprestaai.local` | `EmprestaAi123!` |

Ela é criada automaticamente ao iniciar o servidor pela primeira vez em `localhost` e seus dados permanecem no SQLite local. Você também pode criar sua própria conta. A conta de demonstração fica bloqueada com `NODE_ENV=production` ou quando o servidor é exposto em uma interface de rede (`HOST=0.0.0.0`), mesmo que o banco local seja reaproveitado.

Para desenvolvimento com recarregamento automático, abra dois terminais:

```bash
npm run dev:api
```

```bash
npm run dev
```

O Vite mostra o endereço do front-end (geralmente `http://localhost:5173`) e encaminha `/api` ao servidor na porta 3001. `PORT`, `HOST` e `DATABASE_PATH` podem ser definidos por variáveis de ambiente. O servidor usa `127.0.0.1` como host padrão.

## Funcionalidades

- Cadastro, login e logout por sessão em cookie `HttpOnly`.
- Empréstimos privados por conta: criar, listar, consultar, editar e marcar devolução.
- Busca, histórico, destaque de atrasados e interface para desktop e celular.
- Módulo fiscal de demonstração com campos de emitente, destinatário, produtos, NCM, CFOP, CST, tributos informativos, transporte, pagamento e DANFE para imprimir. **Não gera XML, chave de acesso ou protocolo e não envia dados à SEFAZ.**
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
| `GET` | `/api/notes` | Listar notas simuladas da conta |
| `GET` | `/api/notes/:id` | Consultar uma nota simulada |
| `POST` | `/api/notes` | Emitir uma nota simulada |

O corpo de criação/edição de empréstimo usa `item`, `person`, `lentAt`, `dueAt` e `note`; datas seguem `AAAA-MM-DD`. A emissão de nota usa `recipient`, `description`, `amountCents` e o objeto `fiscal` com os campos do formulário. O servidor define número, emitente, data e total aritmético. Notas antigas sem `fiscal` continuam legíveis. Erros retornam `{ "error": "mensagem" }` com status apropriado.

O DANFE simulado segue a organização geral do [Manual de Orientação do Contribuinte da NF-e, capítulo 7](https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?AspxAutoDetectCookieSupport=1&conteudo=nebWFce4X9o%3D). Ele não representa uma NF-e autorizada, mesmo em homologação. Os campos tributários são apenas informativos; não há validação de CNPJ, NCM, CFOP, regras fiscais ou cálculo oficial de impostos.

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
| Unitária | `npm run test:unit` | Regras de empréstimos e emissão de notas isoladas. |
| Integração | `npm run test:integration` | API HTTP real com autenticação, SQLite, notas, isolamento de contas e persistência. |
| Ponta a ponta | `npm run test:e2e` | Cadastro, empréstimo, nota, devolução, histórico e novo login no Chromium, em desktop e celular. |

O teste ponta a ponta compila o projeto, inicia um servidor próprio na porta 3107 e usa SQLite em memória. Ele não altera o banco de uso normal. A pesquisa com usuários prevista no protótipo continua pendente; os testes automatizados verificam o software, não validam as hipóteses de produto.
