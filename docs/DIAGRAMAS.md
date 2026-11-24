# Diagramas do EmprestaAí

Os quatro diagramas abaixo representam o código atual. Eles podem ser visualizados diretamente no GitHub, que renderiza os blocos Mermaid.

## 1. Diagrama de classes

Mostra as entidades, os serviços de negócio e os contratos de persistência. `Loan`, `Note`, `FiscalDetails` e `FiscalItem` são interfaces TypeScript; as classes de serviço e os repositórios SQLite têm implementação própria. Cada repositório SQLite recebe o ID do usuário autenticado, que limita suas consultas à respectiva conta. Uma nota criada a partir da tela de um empréstimo recebe dados iniciais dele, mas não guarda uma referência permanente ao empréstimo.

```mermaid
classDiagram
    class User {
        <<interface>>
        +string id
        +string name
        +string email
    }
    class Loan {
        <<interface>>
        +string id
        +string item
        +string person
        +string lentAt
        +string dueAt
        +string note
        +string returnedAt
    }
    class Note {
        <<interface>>
        +string id
        +number number
        +string issuerName
        +string recipient
        +string description
        +number amountCents
        +string issuedAt
    }
    class FiscalDetails {
        <<interface>>
        +string natureOperation
        +string series
        +number productsCents
        +number totalCents
    }
    class FiscalItem {
        <<interface>>
        +string code
        +string description
        +string ncm
        +string cfop
        +string cst
        +number quantity
        +number unitPriceCents
    }
    class LoanRepository {
        <<interface>>
        +list() Promise
        +findById(id) Promise
        +create(loan) Promise
        +update(loan) Promise
    }
    class NoteRepository {
        <<interface>>
        +list() Promise
        +findById(id) Promise
        +create(note) Promise
    }
    class LoanService {
        +list() Promise
        +create(draft) Promise
        +update(id, draft) Promise
        +markReturned(id) Promise
    }
    class NoteService {
        +list() Promise
        +findById(id) Promise
        +issue(draft, issuerName) Promise
    }
    class AuthService {
        +register(input) Promise
        +login(input) Promise
        +createSession(userId) string
        +getUser(token) User
        +endSession(token) void
    }
    class SqliteLoanRepository {
        -string userId
    }
    class SqliteNoteRepository {
        -string userId
    }
    class AppDatabase

    User "1" --> "0..*" Loan : possui
    User "1" --> "0..*" Note : possui
    Note "1" o-- "0..1" FiscalDetails : dados fiscais
    FiscalDetails "1" o-- "1..30" FiscalItem : itens
    LoanService --> LoanRepository : depende de
    NoteService --> NoteRepository : depende de
    SqliteLoanRepository ..|> LoanRepository : implementa
    SqliteNoteRepository ..|> NoteRepository : implementa
    SqliteLoanRepository --> AppDatabase : usa
    SqliteNoteRepository --> AppDatabase : usa
    AuthService --> AppDatabase : usa
```

## 2. Diagrama de casos de uso

O visitante pode se cadastrar ou entrar. Depois do login, a conta gerencia seus empréstimos e suas notas simuladas. A impressão ocorre no navegador. A nota pode ser iniciada a partir de um empréstimo apenas para preencher destinatário e item.

```mermaid
flowchart LR
    visitante[Visitante]
    usuario[Usuário autenticado]

    subgraph sistema[EmprestaAí]
        cadastrar([Cadastrar conta])
        entrar([Entrar na conta])
        listar([Listar e buscar empréstimos])
        criar([Registrar empréstimo])
        consultar([Consultar empréstimo])
        editar([Editar empréstimo em aberto])
        devolver([Marcar devolução])
        historico([Consultar histórico])
        emitir([Emitir nota simulada])
        notas([Consultar notas emitidas])
        danfe([Visualizar DANFE simulado])
        imprimir([Imprimir DANFE simulado])
        sair([Sair da conta])
    end

    visitante --> cadastrar
    visitante --> entrar
    usuario --> listar
    usuario --> criar
    usuario --> consultar
    usuario --> editar
    usuario --> devolver
    usuario --> historico
    usuario --> emitir
    usuario --> notas
    usuario --> danfe
    usuario --> imprimir
    usuario --> sair
    entrar -. sessão válida .-> usuario
    cadastrar -. sessão criada .-> usuario
    consultar -. pode preencher dados .-> emitir
    danfe -. permite .-> imprimir
```

## 3. Diagrama de atividades

Fluxo de emissão de uma nota fiscal **demonstrativa**. Os campos fiscais são validados no servidor; os valores informados não passam por um motor tributário. O servidor calcula o total aritmético, atribui um número sequencial por conta e salva a nota em uma transação.

```mermaid
flowchart TD
    inicio([Início: usuário autenticado]) --> origem{Abrir pelo empréstimo?}
    origem -- Sim --> preencher[Preencher destinatário e item com dados do empréstimo]
    origem -- Não --> vazio[Abrir formulário vazio]
    preencher --> formulario[Completar emitente, destinatário, itens e valores]
    vazio --> formulario
    formulario --> enviar[Enviar formulário]
    enviar --> sessao{Sessão válida?}
    sessao -- Não --> login[Exibir erro de autenticação]
    login --> fimErro([Fim sem emissão])
    sessao -- Sim --> validar[Validar campos e itens no servidor]
    validar --> valido{Dados válidos?}
    valido -- Não --> erro[Exibir erro para correção]
    erro --> formulario
    valido -- Sim --> total[Calcular total aritmético]
    total --> transacao[Iniciar transação SQLite]
    transacao --> numero[Atribuir próximo número da conta]
    numero --> salvar[Salvar nota e dados fiscais]
    salvar --> commit[Confirmar transação]
    commit --> visualizar[Exibir DANFE simulado]
    visualizar --> imprimir{Imprimir?}
    imprimir -- Sim --> navegador[Usar impressão do navegador]
    imprimir -- Não --> fim([Fim])
    navegador --> fim
```

## 4. Diagrama de sequência

Detalha a chamada `POST /api/notes` usada pela tela de emissão. Em caso de erro de validação, a API responde `422`; sem sessão válida, responde `401`. A resposta de sucesso é `201` com a nota criada.

```mermaid
sequenceDiagram
    actor Usuario as Usuário
    participant Tela as NewNotePage
    participant Cliente as NoteApi
    participant API as Express
    participant Auth as AuthService
    participant Dominio as NoteService
    participant Repo as SqliteNoteRepository
    participant DB as SQLite

    Usuario->>Tela: Preenche formulário e clica em emitir
    Tela->>Cliente: issue(draft)
    Cliente->>API: POST /api/notes com cookie e JSON
    API->>Auth: getUser(cookie)
    Auth->>DB: Consulta sessão válida e usuário
    DB-->>Auth: Usuário ou ausência
    Auth-->>API: Usuário ou null
    alt Sem sessão válida
        API-->>Cliente: 401 com erro
        Cliente-->>Tela: Erro de autenticação
        Tela-->>Usuario: Exibe mensagem
    else Sessão válida
        API->>Dominio: issue(draft, user.name)
        Dominio->>Dominio: Valida dados e calcula total fiscal
        alt Dados inválidos
            Dominio-->>API: NoteValidationError
            API-->>Cliente: 422 com erro
            Cliente-->>Tela: Mensagem de validação
            Tela-->>Usuario: Exibe mensagem
        else Dados válidos
            Dominio->>Repo: create(nota sem número)
            Repo->>DB: BEGIN IMMEDIATE
            Repo->>DB: Consulta próximo número do usuário
            DB-->>Repo: Número sequencial
            Repo->>DB: Insere nota com user_id e fiscal_json
            Repo->>DB: COMMIT
            Repo-->>Dominio: Nota numerada
            Dominio-->>API: Nota criada
            API-->>Cliente: 201 com nota
            Cliente-->>Tela: Nota criada
            Tela-->>Usuario: Abre detalhe com DANFE simulado
        end
    end
```

**Limite do módulo fiscal:** o DANFE é apenas uma simulação visual. O sistema não gera XML, chave de acesso ou protocolo e não se comunica com a SEFAZ.
